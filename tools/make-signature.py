"""Draw the signature and the pen path that reveals it.

Two pieces come out of this:

  signature  the word set in Ms Madi, a monoline signature script, converted to
             outlines so no font is fetched at runtime and the shape can be
             masked.
  pen        a single smooth curve running the length of the word, roughly
             along the writing line. Stroked thick and used as a mask, it
             uncovers the signature in writing order as its dash offset
             animates, which reads as the word being written rather than
             wiped in.

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
FACES = {
    "alexbrush": "/tmp/AlexBrush-Regular.ttf",   # elegant, long flowing strokes
    "stylescript": "/tmp/StyleScript-Regular.ttf",  # brush-like, heavier
    "zeyada": "/tmp/Zeyada.ttf",                 # fast casual scrawl
    "nothingyoucoulddo": "/tmp/NothingYouCouldDo.ttf",  # ballpoint handwriting
}
FACE = "alexbrush"
SRC = FACES[FACE]
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

    # The pen path: left to right across the word, dipping and rising through the
    # letter bodies so the mask sweeps the ascenders and descenders as it passes.
    mid = height * 0.55
    amp = height * 0.16
    steps = 8
    pts = []
    for i in range(steps + 1):
        t = i / steps
        x = -MARGIN + t * (WIDTH + MARGIN * 2)
        y = mid + amp * ((-1) ** i) * (0.35 + 0.65 * t)
        pts.append((round(x, 2), round(y, 2)))

    pen = f"M{pts[0][0]} {pts[0][1]}"
    for i in range(1, len(pts)):
        px, py = pts[i - 1]
        cx, cy = pts[i]
        pen += f" C{round(px + (cx - px) * 0.5, 2)} {py} {round(px + (cx - px) * 0.5, 2)} {cy} {cx} {cy}"

    return json.dumps({
        "word": WORD,
        "face": face,
        "viewBox": f"{-MARGIN} {-MARGIN} {WIDTH + MARGIN * 2} {round(height + MARGIN * 2, 2)}",
        "height": height,
        "penWidth": round(height * 0.78, 2),
        "paths": paths,
        "pen": pen,
        }, indent=2)

for face, src in FACES.items():
    out = f"app/signature-{face}.json"
    with open(out, "w") as fh:
        fh.write(build(face, src))
    print(out)
