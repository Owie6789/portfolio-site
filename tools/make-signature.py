"""Draw the signature, one path per letter.

The word is converted to outlines so no font is fetched at runtime. Letters are
kept as separate paths on purpose: app/signature.tsx strokes each one in turn
with a dash offset, so the word draws letter by letter and continuously, rather
than being uncovered by a mask sweeping across it.

  /tmp/fv/bin/python tools/make-signature.py            # writes all four
"""
import json

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

WORD = "EMMANUEL"
SMALL = 0.68  # height of the small caps against the leading capital
TRACK = 0.05  # em of extra space between letters, as small caps want

# Four script faces, all SIL OFL. Switch by editing FACE, re-running, and
# pointing app/signature.tsx at the file it writes.
# Graflo Italic is the user's own face, from graflo-urban-graffiti-font.zip on
# main. The others are alternatives kept from an earlier round.
FACES = {
    "graflo": "/tmp/graflo/itgraflo-italic.otf",
    "alexbrush": "/tmp/AlexBrush-Regular.ttf",
    "stylescript": "/tmp/StyleScript-Regular.ttf",
    "zeyada": "/tmp/Zeyada.ttf",
    "nothingyoucoulddo": "/tmp/NothingYouCouldDo.ttf",
}
WIDTH = 1000  # viewBox units the signature is scaled to fill
MARGIN = 24  # air around the ink, so nothing clips and the pen can overshoot

def build(face, src):
    font = TTFont(src)
    cmap = font.getBestCmap()
    hmtx = font["hmtx"]
    gs = font.getGlyphSet()

    # Small caps by construction: the leading capital at full height, the rest
    # scaled down about the baseline so every letter still sits on it. The font
    # has no real small-cap glyphs, and scaling capitals is the honest way to
    # fake it when the alternative is mixing case.
    upm = font["head"].unitsPerEm
    track = TRACK * upm

    pen_x = 0
    placed = []
    box = [None, None, None, None]
    for i, ch in enumerate(WORD):
        name = cmap[ord(ch)]
        size = 1.0 if i == 0 else SMALL
        b = BoundsPen(gs)
        gs[name].draw(b)
        if b.bounds:
            gx0, gy0, gx1, gy1 = b.bounds
            lo, hi = pen_x + gx0 * size, pen_x + gx1 * size
            box[0] = lo if box[0] is None else min(box[0], lo)
            box[1] = gy0 * size if box[1] is None else min(box[1], gy0 * size)
            box[2] = hi if box[2] is None else max(box[2], hi)
            box[3] = gy1 * size if box[3] is None else max(box[3], gy1 * size)
        placed.append((name, pen_x, size))
        pen_x += hmtx[name][0] * size + track

    x0, y0, x1, y1 = box
    scale = WIDTH / (x1 - x0)
    height = round((y1 - y0) * scale, 2)

    paths = []
    for name, ox, size in placed:
        svg = SVGPathPen(gs)
        tp = TransformPen(
            svg,
            (scale * size, 0, 0, -scale * size, (ox - x0) * scale, y1 * scale),
        )
        gs[name].draw(tp)
        if svg.getCommands():
            paths.append(svg.getCommands())

    return json.dumps({
        "word": WORD,
        "face": face,
        "viewBox": f"{-MARGIN} {-MARGIN} {WIDTH + MARGIN * 2} {round(height + MARGIN * 2, 2)}",
        "height": height,
        "strokeWidth": round(height * 0.02, 2),
        "paths": paths,
    }, indent=2)

for face, src in FACES.items():
    out = f"app/signature-{face}.json"
    with open(out, "w") as fh:
        fh.write(build(face, src))
    print(out)
