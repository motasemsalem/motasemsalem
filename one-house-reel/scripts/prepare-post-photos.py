# Photos for the finishing and structure Facebook posts (src/posts/Finishing.tsx): Pixabay ids, credited in CREDITS.md.
# Downloads Pixabay's 1280px image into public/post-photos/<name>.jpg and writes src/posts/photos.json.
# Needs a Pixabay API key: PIXABAY_KEY=... python3 scripts/prepare-post-photos.py
import json, os, time, urllib.error, urllib.request
from PIL import Image

PHOTOS = {
    "bare-room": 682484, "sign-keys": 3701777, "luxe-apartment": 6572403, "marble": 1006628, "porcelain": 1478497,
    "wood": 2857073, "swatches": 1744624, "wires-wall": 1696757, "electrician": 1080554, "hoses-plan": 7689068,
    "ac-lounge": 4148894, "tv-wall": 998265, "tiler": 1080596, "marble-bath": 1737171, "herringbone": 7437972,
    "kitchen": 10508073, "double-door": 3117027, "big-windows": 10517295, "villa-dusk": 5102547,
    # structure posts (SPOSTS)
    "s-frame": 3433296, "s-slab-aerial": 1491693, "s-foundation": 2660502, "s-column": 253498, "s-pour": 6378558,
    "s-chute": 2222450, "s-excavation": 1178241, "s-tying": 2682128, "s-formwork": 3038630, "s-slab-pour": 7226875,
    "s-columns-inside": 4839276, "s-engineers": 2762319, "s-engineer-site": 2578410,
}
RAW = os.environ.get('RAW', '/tmp/claude-0/raw'); OUT = 'public/post-photos'
os.makedirs(RAW, exist_ok=True); os.makedirs(OUT, exist_ok=True)

def get(url):
    for attempt in range(6):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=60).read()
        except urllib.error.HTTPError as e:
            if e.code != 429: raise
            time.sleep(15 * (attempt + 1))  # Pixabay rate limit
    raise SystemExit(f'rate limited: {url}')

manifest = {}
for name, pid in PHOTOS.items():
    src, dst = f'{RAW}/px-{pid}.jpg', f'{OUT}/{name}.jpg'
    if not os.path.exists(src):
        hit = json.loads(get(f"https://pixabay.com/api/?key={os.environ['PIXABAY_KEY']}&id={pid}"))['hits'][0]
        open(src + '.part', 'wb').write(get(hit['largeImageURL'])); os.replace(src + '.part', src)
    if not os.path.exists(dst):
        im = Image.open(src).convert('RGB')
        s = max(1300 / im.width, 1625 / im.height, 1)
        im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS).save(dst, quality=92)
    w, h = Image.open(dst).size
    manifest[name] = {'file': f'post-photos/{name}.jpg', 'w': w, 'h': h}
json.dump(manifest, open('src/posts/photos.json', 'w'), indent=1)
print('wrote src/posts/photos.json')
