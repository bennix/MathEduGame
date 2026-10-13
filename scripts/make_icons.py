"""Generate the MathGame icon assets. Requires Pillow on the authoring machine."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import subprocess

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "build"
OUT.mkdir(exist_ok=True)
S = 1024

shadow = Image.new("RGBA", (S, S))
d = ImageDraw.Draw(shadow)
d.rounded_rectangle((82, 82, 942, 942), radius=195, fill=(33, 30, 27, 92))
shadow = shadow.filter(ImageFilter.GaussianBlur(30))
base = Image.new("RGBA", (S, S), (0, 0, 0, 0))
base.alpha_composite(shadow)
d = ImageDraw.Draw(base)
d.rounded_rectangle((66, 54, 958, 946), radius=205, fill="#f4e9ca", outline="#d4c8a8", width=5)

grid = Image.new("RGBA", (S, S), (0, 0, 0, 0))
g = ImageDraw.Draw(grid)
for p in range(128, 956, 72):
    g.line((p, 55, p, 946), fill=(83, 132, 151, 48), width=2)
    g.line((66, p, 958, p), fill=(83, 132, 151, 48), width=2)
g.line((242, 55, 242, 946), fill=(204, 78, 65, 75), width=5)
mask = Image.new("L", (S, S))
ImageDraw.Draw(mask).rounded_rectangle((67, 55, 957, 945), radius=204, fill=255)
base.paste(grid, (0, 0), Image.composite(grid.getchannel("A"), Image.new("L", (S, S)), mask))

d = ImageDraw.Draw(base)
# Two offset strokes give the central zero a hand-drawn look.
d.arc((292, 196, 752, 814), 0, 358, fill="#282723", width=61)
d.arc((307, 208, 743, 804), 42, 350, fill=(40, 39, 35, 100), width=12)
d.line([(369, 528), (662, 501)], fill="#c44d43", width=65, joint="curve")
d.ellipse((346, 500, 411, 561), fill="#c44d43")
d.ellipse((628, 471, 695, 537), fill="#c44d43")
for x, y in [(166, 255), (811, 172), (831, 802)]:
    d.line((x - 15, y - 15, x + 15, y + 15), fill="#7d8275", width=8)
    d.line((x + 15, y - 15, x - 15, y + 15), fill="#7d8275", width=8)

base.save(OUT / "icon.png")
base.save(OUT / "icon.ico", sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
iconset = OUT / "icon.iconset"
iconset.mkdir(exist_ok=True)
for size in [16, 32, 128, 256, 512]:
    base.resize((size, size), Image.Resampling.LANCZOS).save(iconset / f"icon_{size}x{size}.png")
    base.resize((size * 2, size * 2), Image.Resampling.LANCZOS).save(iconset / f"icon_{size}x{size}@2x.png")
subprocess.run(["iconutil", "-c", "icns", str(iconset), "-o", str(OUT / "icon.icns")], check=True)
print("Generated build/icon.png, build/icon.ico and build/icon.icns")
