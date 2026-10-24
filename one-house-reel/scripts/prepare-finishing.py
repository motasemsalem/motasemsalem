# Downloads the finishing reel's media (scripts/finishing_media.py) into public/finishing/:
#   clips:  each Pexels video at its highest resolution, cut from its in-point and scaled so it covers a
#           1080x1920 frame (portrait) or 1920x1080 (landscape, so split panels keep the whole width); <name>.mp4.
# Also writes src/finishing/media.json with each file's size.
# Usage: python3 scripts/prepare-finishing.py [name ...]   (needs ffmpeg and curl)
import json, os, subprocess, sys
sys.path.insert(0, os.path.dirname(__file__))
from finishing_media import CLIPS

RAW = os.environ.get('RAW', '/tmp/claude-0/raw'); OUT = 'public/finishing'; FPS = 30
CLIP_SECONDS = 8  # no shot holds longer than this
os.makedirs(RAW, exist_ok=True); os.makedirs(OUT, exist_ok=True)
only = set(sys.argv[1:])

def probe(path):
    o = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:format=duration', '-of', 'csv=p=0', path], capture_output=True, text=True, check=True).stdout.split()
    w, h = map(int, o[0].split(',')); return w, h, float(o[1])

manifest = {}
for name, (pid, start) in CLIPS.items():
    dst = f'{OUT}/{name}.mp4'
    if (only and name in only) or (not only and not os.path.exists(dst)):
        src = f'{RAW}/pexels-{pid}.mp4'
        if not os.path.exists(src):
            # Pexels' download link redirects to the largest file.
            subprocess.run(['curl', '-sfL', '-A', 'Mozilla/5.0', '-o', src + '.part', f'https://www.pexels.com/download/video/{pid}/'], check=True)
            os.replace(src + '.part', src)
        w, h, dur = probe(src)
        size = (1080, 1920) if h > w else (1920, 1080)
        vf = f'scale={size[0]}:{size[1]}:force_original_aspect_ratio=increase:flags=lanczos,crop={size[0]}:{size[1]},fps={FPS}'
        length = min(CLIP_SECONDS, dur - start)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(start), '-t', str(length), '-i', src, '-vf', vf, '-an', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-pix_fmt', 'yuv420p', dst], check=True)
        print('clip', name, f'{w}x{h}', flush=True)
    w, h, _ = probe(dst)
    manifest[name] = {'file': f'finishing/{name}.mp4', 'w': w, 'h': h}

os.makedirs('src/finishing', exist_ok=True)
json.dump(manifest, open('src/finishing/media.json', 'w'), indent=1)
print('wrote src/finishing/media.json')
