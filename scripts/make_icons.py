"""Generate the Math Adventure Island desktop icons. Requires Pillow and iconutil."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import subprocess

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "build"
OUT.mkdir(exist_ok=True)
S = 1024
base = Image.new("RGBA", (S, S))
shadow = Image.new("RGBA", (S, S))
ImageDraw.Draw(shadow).rounded_rectangle((78, 83, 946, 951), radius=220, fill=(39, 27, 91, 90))
base.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(28)))
d = ImageDraw.Draw(base)
d.rounded_rectangle((62, 56, 962, 956), radius=220, fill="#6b50e4")
d.rounded_rectangle((85, 78, 939, 932), radius=196, outline="#ad9bff", width=10)
d.ellipse((190, 135, 870, 815), fill="#816af1")
d.ellipse((256, 201, 802, 747), fill="#9b8bff")

# A rounded four-point compass star, matching the game's adventure marker.
star = [(512, 178), (578, 389), (745, 452), (578, 515), (512, 733),
        (446, 515), (279, 452), (446, 389)]
d.polygon([(x + 9, y + 21) for x, y in star], fill="#4c35bf")
d.polygon(star, fill="#fff8d5")
d.ellipse((473, 413, 551, 491), fill="#ffca64")
for x, y, r in [(741, 263, 23), (238, 655, 18), (774, 677, 14)]:
    d.line((x-r, y, x+r, y), fill="#ffdf82", width=9)
    d.line((x, y-r, x, y+r), fill="#ffdf82", width=9)

base.save(OUT / "icon.png")
base.save(OUT / "icon.ico", sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
iconset = OUT / "icon.iconset"
iconset.mkdir(exist_ok=True)
for size in [16, 32, 128, 256, 512]:
    base.resize((size, size), Image.Resampling.LANCZOS).save(iconset / f"icon_{size}x{size}.png")
    base.resize((size * 2, size * 2), Image.Resampling.LANCZOS).save(iconset / f"icon_{size}x{size}@2x.png")
subprocess.run(["iconutil", "-c", "icns", str(iconset), "-o", str(OUT / "icon.icns")], check=True)
print("Generated build/icon.png, build/icon.ico and build/icon.icns")
