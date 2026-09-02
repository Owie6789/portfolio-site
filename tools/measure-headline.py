"""Measure the footer headline words in the fonts they are actually set in.

The headline mixes two faces on one line: "Let's" in Inter, cut here to a
static display instance, and "talk" in ITC Garamond Std Light Narrow, which the
user supplied in `footer fonts.zip` on main. The SVG that draws the headline is fitted
to the panel, so it needs each word's real advance and ink bounds in font
units. Re-run this with the fontTools venv when the copy or the fonts change:

  /tmp/fv/bin/python tools/measure-headline.py > app/headline-metrics.json
"""
import json

from fontTools.pens.boundsPen import BoundsPen
from fontTools.subset import Subsetter
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

# Inter is variable; pin it to the display optical size. Weight 400 with the
# 6.8-unit stroke in footer.tsx gives an apparent stem of 89.8/1000em.
CUTS = [("/tmp/Inter.ttf", {"opsz": 32, "wght": 400},
         "public/live/font/Inter-Display.woff2")]

FACES = [
    ("public/live/font/Inter-Display.woff2", ["Let’s"]),
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


for src, axes, dest in CUTS:
    cut = instancer.instantiateVariableFont(TTFont(src), axes, inplace=False)
    cut.flavor = "woff2"
    cut.save(dest)


def subset(path, words):
    """Keep only the glyphs the headline actually draws."""
    font = TTFont(path)
    sub = Subsetter()
    sub.populate(text="".join(words) + " ")
    sub.subset(font)
    font.flavor = "woff2"
    font.save(path)


out = {}
for path, words in FACES:
    subset(path, words)

for path, words in FACES:
    font = TTFont(path)
    out[path.split("/")[-1]] = {
        "upm": font["head"].unitsPerEm,
        "words": {w: measure(font, w) for w in words},
    }

print(json.dumps(out, indent=2, ensure_ascii=False))
