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

WORD = "eMMANUEL"  # lowercase e leading a run of small caps
SMALL = 0.68  # height of the small caps against the leading letter
GAP = 0.055  # em of clear space between one letter's ink and the next

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

    upm = font["head"].unitsPerEm
    gap = GAP * upm

    def ink(name):
        b = BoundsPen(gs)
        gs[name].draw(b)
        return b.bounds  # (x0, y0, x1, y1) or None

    # The leading lowercase e is scaled so its ink is as tall as a capital,
    # which lets it lead a run of small caps without looking dropped.
    cap = ink(cmap[ord("E")])
    low = ink(cmap[ord("e")])
    lead_scale = (cap[3] - cap[1]) / (low[3] - low[1])

    # Spacing is set from ink, not from advances. Equal side bearings leave
    # visibly uneven gaps in a face like this, because the letters' own
    # sidebearings differ; holding the clear space between one letter's ink and
    # the next constant is what actually looks even.
    pen_x = 0
    placed = []
    box = [None, None, None, None]
    prev_right = None
    for i, ch in enumerate(WORD):
        name = cmap[ord(ch)]
        size = lead_scale if i == 0 else SMALL
        b = ink(name)
        gx0, gy0, gx1, gy1 = b if b else (0, 0, 0, 0)

        # place this glyph so its ink starts one gap after the previous ink
        origin = 0 if prev_right is None else prev_right + gap - gx0 * size
        lo, hi = origin + gx0 * size, origin + gx1 * size
        box[0] = lo if box[0] is None else min(box[0], lo)
        box[1] = gy0 * size if box[1] is None else min(box[1], gy0 * size)
        box[2] = hi if box[2] is None else max(box[2], hi)
        box[3] = gy1 * size if box[3] is None else max(box[3], gy1 * size)

        placed.append((name, origin, size))
        prev_right = hi
        pen_x = origin + hmtx[name][0] * size

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
