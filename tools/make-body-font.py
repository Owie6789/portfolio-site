"""Cut the body text face.

The original sets `Some Sans` on `*`. This cuts Geist to the two weights that
replaces, subset to the Latin range the page actually uses rather than the full
charset, and writes them next to the site's own fonts.

  /tmp/fv/bin/python tools/make-body-font.py
"""
from fontTools.subset import Subsetter
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

SRC = "/tmp/Geist.ttf"
WEIGHTS = {400: "Geist-Regular", 600: "Geist-SemiBold"}

# Latin-1 plus the punctuation this page uses: curly quotes, dashes, arrows,
# the copyright mark, the times sign in "1x/2x", the bullet.
EXTRA = "‘’“”–—↗↓↑←→©®™•·×…&"


def keep():
    chars = "".join(chr(c) for c in range(0x20, 0x7F))
    chars += "".join(chr(c) for c in range(0xA0, 0x100))
    return chars + EXTRA


for weight, name in WEIGHTS.items():
    font = instancer.instantiateVariableFont(
        TTFont(SRC), {"wght": weight}, inplace=False
    )
    sub = Subsetter()
    sub.populate(text=keep())
    sub.subset(font)
    font.flavor = "woff2"
    out = f"public/live/font/{name}.woff2"
    font.save(out)
    print(f"{out}  weight {weight}")
