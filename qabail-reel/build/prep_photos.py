"""Fetch Library of Congress masters, crop and give them one unified grade.

Every photo gets the same warm sepia-gold duotone so archival prints from
different decades read as one family on screen.
"""
import io
import json
import os
import sys
import time
import urllib.request

import numpy as np
from PIL import Image, ImageFilter, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
OUT = os.path.join(ROOT, "assets", "photos")
CACHE = os.environ.get("LOC_CACHE", "/tmp/loc_masters")
UA = {"User-Agent": "QabailReel/1.0 (historical video project)"}

# slug: (LOC item id, crop box as fractions (left, top, right, bottom))
PHOTOS = {
    "assouan-1856": ("2004671997", (0.01, 0.03, 0.99, 0.97)),
    "first-cataract-1856": ("2004671994", (0.02, 0.08, 0.98, 0.94)),
    "azhar-court": ("2019636353", (0.09, 0.07, 0.46, 0.78)),
    "azhar-minarets-1867": ("2004668146", (0.03, 0.03, 0.97, 0.97)),
    "bedouin-horseman": ("2019712991", (0.10, 0.10, 0.92, 0.92)),
    "bedouin-horsemen-line": ("2008676391", (0.14, 0.12, 0.86, 0.80)),
    "bedouin-of-sinai": ("2019695789", (0.03, 0.06, 0.49, 0.94)),
    "bedouins-coffee-tent": ("2019692805", (0.02, 0.04, 0.49, 0.88)),
    "bedouins-horses": ("2021671006", (0.06, 0.10, 0.95, 0.92)),
    "campfire-sinai": ("2019695801", (0.06, 0.06, 0.50, 0.94)),
    "coffee-pots-fire": ("2019706440", (0.09, 0.10, 0.94, 0.88)),
    "delta-air-view": ("2019706697", (0.05, 0.08, 0.86, 0.94)),
    "feiran-bedouin-tents": ("2019705674", (0.02, 0.04, 0.98, 0.96)),
    "feiran-palm-grove": ("2019705672", (0.04, 0.03, 0.96, 0.97)),
    "jebel-mousa": ("2019700062", (0.07, 0.12, 0.48, 0.90)),
    "jebel-musa-summit": ("2019698509", (0.03, 0.03, 0.97, 0.95)),
    "mosque-amru": ("2019639364", (0.08, 0.10, 0.45, 0.84)),
    "old-bedouin-sheikh": ("2019695790", (0.02, 0.03, 0.49, 0.97)),
    "sinai-caravan-elkaa": ("2019698567", (0.03, 0.04, 0.97, 0.96)),
    "sinai-caravan-elwad": ("2019698568", (0.03, 0.04, 0.97, 0.96)),
    "upper-egypt-village": ("2019637476", (0.09, 0.10, 0.46, 0.80)),
    "upper-nile-village": ("2019637135", (0.09, 0.10, 0.46, 0.80)),
    "village-sheik-children": ("2019637502", (0.08, 0.10, 0.45, 0.80)),
}

SHADOW = np.array([18, 11, 6], np.float32)
MID = np.array([152, 108, 62], np.float32)
LIGHT = np.array([246, 228, 190], np.float32)


def fetch(url, tries=4):
    for i in range(tries):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=300).read()
        except Exception:
            time.sleep(3 + 4 * i)
    raise RuntimeError(url)


def master(item_id):
    d = json.loads(fetch(f"https://www.loc.gov/item/{item_id}/?fo=json"))
    files = [f for g in d["resources"][0]["files"] for f in g]
    tif = [f["url"] for f in files if f.get("mimetype") == "image/tiff"]
    jpg = sorted((f for f in files if f.get("mimetype") == "image/jpeg"), key=lambda f: f.get("width") or 0)
    meta = {"title": d["item"].get("title"), "date": d["item"].get("date"),
            "url": f"https://www.loc.gov/item/{item_id}/"}
    return (tif[0] if tif else jpg[-1]["url"]), meta


def grade(im):
    """Unified duotone: shadows→deep brown, mids→bronze, highlights→warm cream."""
    lum = np.asarray(ImageOps.autocontrast(im.convert("L"), cutoff=0.5), np.float32) / 255
    lum = lum ** 1.05
    lo = np.clip(lum * 2, 0, 1)[..., None]
    hi = np.clip(lum * 2 - 1, 0, 1)[..., None]
    rgb = np.where(lum[..., None] < 0.5, SHADOW + (MID - SHADOW) * lo, MID + (LIGHT - MID) * hi)
    if im.mode == "RGB":  # colour originals keep a trace of their own colour
        orig = np.asarray(im, np.float32)
        rgb = rgb * 0.8 + orig * 0.2
    return Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8))


def main(only=None):
    os.makedirs(OUT, exist_ok=True)
    os.makedirs(CACHE, exist_ok=True)
    meta_path = os.path.join(OUT, "photos.json")
    meta_all = json.load(open(meta_path)) if os.path.exists(meta_path) else {}
    for slug, (item_id, box) in PHOTOS.items():
        if only and slug not in only:
            continue
        raw = os.path.join(CACHE, slug + ".bin")
        url, meta = master(item_id)
        if not os.path.exists(raw):
            open(raw, "wb").write(fetch(url))
        im = Image.open(raw)
        im.load()
        if im.mode not in ("RGB", "L"):
            im = im.convert("RGB")
        w, h = im.size
        im = im.crop((int(box[0] * w), int(box[1] * h), int(box[2] * w), int(box[3] * h)))
        im.thumbnail((2200, 2200), Image.LANCZOS)
        im = grade(im).filter(ImageFilter.UnsharpMask(radius=1.2, percent=40, threshold=2))
        im.save(os.path.join(OUT, slug + ".jpg"), quality=90)
        meta.update({"loc_id": item_id, "master": url, "size": im.size,
                     "rights": "No known restrictions on publication (Library of Congress)"})
        meta_all[slug] = meta
        json.dump(meta_all, open(meta_path, "w"), ensure_ascii=False, indent=1)
        print(slug, im.size, flush=True)


if __name__ == "__main__":
    main(set(sys.argv[1:]) or None)
