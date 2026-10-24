# Downloads the finishing reel's media (scripts/finishing_media.py) into public/finishing/:
#   photos: Pixabay's 1280px image, upscaled 4x with Real-ESRGAN (scripts/sr.py), then scaled so the short side
#           covers the 1080x1920 frame with room for a camera move; written as <name>.jpg.
#   clips:  Mixkit, cropped to 9:16 and scaled to 1080x1920/30fps (720p sources go through Real-ESRGAN); <name>.mp4.
# Also writes src/finishing/media.json with each photo's size.
# Needs a Pixabay API key: PIXABAY_KEY=... python3 scripts/prepare-finishing.py [name ...]
import json, os, subprocess, sys, time, urllib.error, urllib.request
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__))
from finishing_media import CLIPS, PHOTOS

RAW = os.environ.get('RAW', '/tmp/claude-0/raw'); OUT = 'public/finishing'; FPS = 30
CLIP_SECONDS = 10  # the reel uses a few seconds of each clip
# Photos are stored a little larger than the frame so the camera can push in and pan.
COVER_W, COVER_H = 1300, 2300
UA = {'User-Agent': 'Mozilla/5.0'}
os.makedirs(RAW, exist_ok=True); os.makedirs(OUT, exist_ok=True)
only = set(sys.argv[1:])
def get(url):
    for attempt in range(6):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()
        except urllib.error.HTTPError as e:
            if e.code != 429: raise
            time.sleep(15 * (attempt + 1))  # Pixabay rate limit
    raise SystemExit(f'rate limited: {url}')

model = None
manifest = {}
for name, pid in PHOTOS.items():
    dst = f'{OUT}/{name}.jpg'
    if not ((only and name not in only) or (not only and os.path.exists(dst))):
        src = f'{RAW}/px-{pid}.jpg'
        if not os.path.exists(src):
            hit = json.loads(get(f"https://pixabay.com/api/?key={os.environ['PIXABAY_KEY']}&id={pid}"))['hits'][0]
            data = get(hit['largeImageURL'])
            open(src + '.part', 'wb').write(data); os.replace(src + '.part', src)
        if model is None:
            import sr
            model = sr.load()
        big = Image.fromarray(sr.upscale(model, np.asarray(Image.open(src).convert('RGB'))))
        s = max(COVER_W / big.width, COVER_H / big.height)
        big.resize((round(big.width * s), round(big.height * s)), Image.LANCZOS).save(dst, quality=90)
        print('photo', name, flush=True)
    w, h = Image.open(dst).size
    manifest[name] = {'file': f'finishing/{name}.jpg', 'w': w, 'h': h}

for name, (clip, cx) in CLIPS.items():
    dst = f'{OUT}/{name}.mp4'
    if (only and name not in only) or (not only and os.path.exists(dst)): continue
    path = f'{RAW}/{clip}.mp4'
    if not os.path.exists(path):
        for r in (2160, 1080, 720):
            if subprocess.run(['curl', '-sf', '-o', path, f'https://assets.mixkit.co/videos/{clip}/{clip}-{r}.mp4']).returncode == 0: break
    o = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:format=duration', '-of', 'csv=p=0', path], capture_output=True, text=True).stdout.split()
    w, h = map(int, o[0].split(',')); length = min(CLIP_SECONDS, float(o[1]))
    if w > h:
        cw = round(h * 9 / 16) // 2 * 2; crop = f'{cw}:{h}:{min(max(0, round(cx * w - cw / 2)), w - cw)}:0'
    else:
        crop = f'{w}:{h}:0:0'
    if h <= 720:
        subprocess.run(['python3', 'scripts/sr.py', path, dst, '1080', '1920', '0', str(length), str(FPS), crop], check=True)
    else:
        vf = f'crop={crop},scale=1080:1920:flags=lanczos,unsharp=5:5:0.4,fps={FPS}'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-t', str(length), '-i', path, '-vf', vf, '-an', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-pix_fmt', 'yuv420p', dst], check=True)
    print('clip', name, flush=True)

os.makedirs('src/finishing', exist_ok=True)
json.dump(manifest, open('src/finishing/media.json', 'w'), indent=1)
