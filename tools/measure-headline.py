"""Cut the footer display fonts and measure the headline words.

The footer headline mixes two faces on one line: "Let's" in Geist and "talk"
in Instrument Sans at its most condensed width. The SVG that draws it is fitted
to the panel, so it needs each word's real advance and ink bounds in font
units. This script cuts the static instances and prints those numbers. Re-run
it with the fontTools venv when the copy or the fonts change, then paste the
output into app/headline-metrics.json.

  /tmp/fv/bin/python tools/measure-headline.py > app/headline-metrics.json
"""
import json

from fontTools.pens.boundsPen import BoundsPen
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

CUTS = [
    # source, axes to pin, output, the words measured in it
    ("/tmp/IS.ttf", {"wdth": 75, "wght": 700},
     "public/live/font/InstrumentSans-CondensedBold.woff2", ["talk"]),
    ("/tmp/Geist.ttf", {"wght": 600},
     "public/live/font/Geist-SemiBold.woff2", ["Let’s"]),
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
    return {"advance": x, "x0": box[0], "y0": box[1], "x1": box[2], "y1": box[3]}


out = {}
for src, axes, dest, words in CUTS:
    font = instancer.instantiateVariableFont(TTFont(src), axes, inplace=False)
    font.flavor = "woff2"
    font.save(dest)
    out[dest.split("/")[-1]] = {
        "axes": axes,
        "upm": font["head"].unitsPerEm,
        "capHeight": font["OS/2"].sCapHeight,
        "words": {w: measure(font, w) for w in words},
    }

print(json.dumps(out, indent=2, ensure_ascii=False))
