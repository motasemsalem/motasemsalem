"""Resize the downloaded CC0 Egypt prints to a working size for the vertical crops."""
import glob, os
from PIL import Image

RAW = os.path.join(os.path.dirname(__file__), "..", "assets", "images", "raw")
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "images")
LONG_EDGE = 3200

for src in sorted(glob.glob(os.path.join(RAW, "*.src.jpg"))):
    name = os.path.basename(src).replace(".src.jpg", "")
    im = Image.open(src).convert("RGB")
    scale = LONG_EDGE / max(im.size)
    im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    dst = os.path.join(OUT, f"{name}.jpg")
    im.save(dst, "JPEG", quality=88, optimize=True)
    print(name, im.size, os.path.getsize(dst) // 1024, "KB")
