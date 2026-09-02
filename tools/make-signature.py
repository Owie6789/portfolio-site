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

WORD = "Emmanuel"

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

    # Lay out the word, then measure the ink it actually covers.
    pen_x = 0
    placed = []
    box = [None, None, None, None]
    for ch in WORD:
        name = cmap[ord(ch)]
        b = BoundsPen(gs)
        gs[name].draw(b)
        if b.bounds:
            gx0, gy0, gx1, gy1 = b.bounds
            box[0] = pen_x + gx0 if box[0] is None else min(box[0], pen_x + gx0)
            box[1] = gy0 if box[1] is None else min(box[1], gy0)
            box[2] = pen_x + gx1 if box[2] is None else max(box[2], pen_x + gx1)
            box[3] = gy1 if box[3] is None else max(box[3], gy1)
        placed.append((name, pen_x))
        pen_x += hmtx[name][0]

    x0, y0, x1, y1 = box
    scale = WIDTH / (x1 - x0)
    height = round((y1 - y0) * scale, 2)

    paths = []
    for name, ox in placed:
        svg = SVGPathPen(gs)
        tp = TransformPen(svg, (scale, 0, 0, -scale, (ox - x0) * scale, y1 * scale))
        gs[name].draw(tp)
        if svg.getCommands():
            paths.append(svg.getCommands())

    return json.dumps({
        "word": WORD,
        "face": face,
        "viewBox": f"{-MARGIN} {-MARGIN} {WIDTH + MARGIN * 2} {round(height + MARGIN * 2, 2)}",
        "height": height,
        "strokeWidth": round(height * 0.018, 2),
        "paths": paths,
    }, indent=2)

for face, src in FACES.items():
    out = f"app/signature-{face}.json"
    with open(out, "w") as fh:
        fh.write(build(face, src))
    print(out)
