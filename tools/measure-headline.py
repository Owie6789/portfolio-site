"""Measure the exact ink box of each footer headline line.

The footer sets the headline as SVG so it fills the panel width precisely
instead of guessing with clamp(). That needs the string's real advance width
and ink extents in font units, which is what this prints. Run it with the
fontTools venv when the copy or the font changes, then paste the result into
app/headline-metrics.json.
"""
import json
import sys

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.boundsPen import BoundsPen

SRC = sys.argv[1] if len(sys.argv) > 1 else "/tmp/IS.ttf"
LINES = ["Let’s connect", "async", "Let’s talk", "talk"]

font = instancer.instantiateVariableFont(
    TTFont(SRC), {"wdth": 75, "wght": 700}, inplace=False
)
cmap = font.getBestCmap()
hmtx = font["hmtx"]
gs = font.getGlyphSet()

def measure(text):
    x = 0
    x0 = y0 = None
    x1 = y1 = None
    for ch in text:
        name = cmap.get(ord(ch)) or cmap[ord(" ")]
        pen = BoundsPen(gs)
        gs[name].draw(pen)
        if pen.bounds:
            gx0, gy0, gx1, gy1 = pen.bounds
            x0 = x + gx0 if x0 is None else min(x0, x + gx0)
            x1 = x + gx1 if x1 is None else max(x1, x + gx1)
            y0 = gy0 if y0 is None else min(y0, gy0)
            y1 = gy1 if y1 is None else max(y1, gy1)
        x += hmtx[name][0]
    return {"advance": x, "x0": x0, "y0": y0, "x1": x1, "y1": y1}

print(json.dumps({
    "upm": font["head"].unitsPerEm,
    "instance": {"wdth": 75, "wght": 700},
    "lines": {line: measure(line) for line in LINES},
}, indent=2, ensure_ascii=False))
