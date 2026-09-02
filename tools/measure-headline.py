"""Measure the footer headline words in the fonts they are actually set in.

The headline mixes two faces on one line: "Let's" in Helvetica Now Display
Medium and "talk" in ITC Garamond Std Light Narrow. Both are supplied by the
user in `footer fonts.zip` on main. The SVG that draws the headline is fitted
to the panel, so it needs each word's real advance and ink bounds in font
units. Re-run this with the fontTools venv when the copy or the fonts change:

  /tmp/fv/bin/python tools/measure-headline.py > app/headline-metrics.json
"""
import json

from fontTools.pens.boundsPen import BoundsPen
from fontTools.ttLib import TTFont

FACES = [
    ("public/live/font/HelveticaNowDisplay-Medium.woff2", ["Let’s"]),
    ("public/live/font/ITCGaramondStd-LightNarrow.woff2", ["talk"]),
]


def measure(font, text):
    cmap = font.getBestCmap()
    hmtx = font["hmtx"]
    gs = font.getGlyphSet()
    x = 0
    box = [None, None, None, None]
    for ch in text:
        name = cmap.get(ord(ch)) or cmap[ord(" ")]
        pen = BoundsPen(gs)
        gs[name].draw(pen)
        if pen.bounds:
            gx0, gy0, gx1, gy1 = pen.bounds
            box[0] = x + gx0 if box[0] is None else min(box[0], x + gx0)
            box[1] = gy0 if box[1] is None else min(box[1], gy0)
            box[2] = x + gx1 if box[2] is None else max(box[2], x + gx1)
            box[3] = gy1 if box[3] is None else max(box[3], gy1)
        x += hmtx[name][0]
    return {
        "advance": round(x, 1),
        "x0": round(box[0], 1),
        "y0": round(box[1], 1),
        "x1": round(box[2], 1),
        "y1": round(box[3], 1),
    }


out = {}
for path, words in FACES:
    font = TTFont(path)
    out[path.split("/")[-1]] = {
        "upm": font["head"].unitsPerEm,
        "words": {w: measure(font, w) for w in words},
    }

print(json.dumps(out, indent=2, ensure_ascii=False))
