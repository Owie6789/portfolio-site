"""Draw the hero wordmark as outlines.

The original mark is seven hand-drawn paths spelling KHAGWAL inside a
160x32 viewBox. Replacing it with live <text> would break nothing visually but
would depend on the font loading before first paint, and the mark is the first
thing on the page. Outlines avoid that entirely: same shapes, no font request,
and the paths keep taking their colour from the theme variable.

  /tmp/fv/bin/python tools/make-wordmark.py > tools/wordmark.json
"""
import json

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

WORD = "OWIE"
TRACK = -0.02  # em, tightened like a wordmark rather than running text
MARGIN = 3  # viewBox units of air on every side, so nothing clips when the
            # mark is transformed on scroll
SRC = "/tmp/Inter.ttf"
AXES = {"opsz": 32, "wght": 700}

font = instancer.instantiateVariableFont(TTFont(SRC), AXES, inplace=False)
upm = font["head"].unitsPerEm
cmap = font.getBestCmap()
hmtx = font["hmtx"]
gs = font.getGlyphSet()
track = TRACK * upm

# Lay the glyphs out, collecting each one's outline and the overall ink box.
pen_x = 0
placed = []
box = [None, None, None, None]
for ch in WORD:
    name = cmap[ord(ch)]
    bounds = BoundsPen(gs)
    gs[name].draw(bounds)
    if bounds.bounds:
        gx0, gy0, gx1, gy1 = bounds.bounds
        box[0] = pen_x + gx0 if box[0] is None else min(box[0], pen_x + gx0)
        box[1] = gy0 if box[1] is None else min(box[1], gy0)
        box[2] = pen_x + gx1 if box[2] is None else max(box[2], pen_x + gx1)
        box[3] = gy1 if box[3] is None else max(box[3], gy1)
    placed.append((name, pen_x))
    pen_x += hmtx[name][0] + track

x0, y0, x1, y1 = box
width, height = x1 - x0, y1 - y0

# Scale so the ink fills a 160-unit-wide viewBox, matching the original's
# width, and flip the y axis from font space into SVG space.
scale = 160 / width
paths = []
for name, ox in placed:
    svg = SVGPathPen(gs)
    # translate ink to the origin, flip y, then scale
    tp = TransformPen(svg, (scale, 0, 0, -scale, (ox - x0) * scale, y1 * scale))
    gs[name].draw(tp)
    paths.append(svg.getCommands())

h = round(height * scale, 3)
print(json.dumps({
    "word": WORD,
    "font": f"Inter opsz {AXES['opsz']} wght {AXES['wght']}",
    "tracking_em": TRACK,
    "margin": MARGIN,
    "viewBox": f"{-MARGIN} {-MARGIN} {160 + MARGIN * 2} {round(h + MARGIN * 2, 3)}",
    "paths": paths,
}, indent=2))
