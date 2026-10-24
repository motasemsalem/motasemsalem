# Downloads the Mixkit clips in scripts/shots.py, cuts each shot (with handles for transitions), crops it to 9:16
# and writes public/footage/<shot>.mp4 at 1080x1920/30fps, plus src/shots.json for the edit.
# 720p sources go through Real-ESRGAN general-x4v3 (scripts/sr.py) instead of a plain resize.
import json, os, subprocess, sys
sys.path.insert(0, os.path.dirname(__file__)); from shots import REVERSE, SHOTS
RAW = os.environ.get('RAW', '/tmp/claude-0/raw'); OUT = 'public/footage'; PAD = 0.5; FPS = 30
os.makedirs(RAW, exist_ok=True); os.makedirs(OUT, exist_ok=True)
T = json.load(open('src/timeline.json'))
def at(word, nth):
    k = 0
    for w in T['words']:
        if w['text'] == word:
            k += 1
            if k == nth: return w['start']
    raise SystemExit(f'missing {word} {nth}')
def probe(path):
    o = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:format=duration', '-of', 'csv=p=0', path], capture_output=True, text=True).stdout.split()
    w, h = map(int, o[0].split(',')); return w, h, float(o[1])
def download(clip):
    path = f'{RAW}/{clip}.mp4'
    if not os.path.exists(path):
        for r in (2160, 1080, 720):
            if subprocess.run(['curl', '-sf', '-o', path, f'https://assets.mixkit.co/videos/{clip}/{clip}-{r}.mp4']).returncode == 0: break
    return path
starts = [round(at(*s[2]) * FPS) for s in SHOTS] + [T['total']]
manifest = []
only = set(sys.argv[1:])
for i, (name, clip, _, src, cx, speed) in enumerate(SHOTS):
    dur = (starts[i + 1] - starts[i]) / FPS
    path = download(clip); w, h, length = probe(path)
    a = max(0.0, src - PAD * speed); b = min(length, src + (dur + PAD) * speed)
    pre = (src - a) / speed
    manifest.append({'name': name, 'clip': clip, 'from': starts[i], 'frames': starts[i + 1] - starts[i], 'pre': round(pre * FPS), 'file': f'footage/{name}.mp4'})
    dst = f'{OUT}/{name}.mp4'
    if (only and name not in only) or (not only and os.path.exists(dst)): continue
    if w > h:
        cw = round(h * 9 / 16) // 2 * 2; cx_px = min(max(0, round(cx * w - cw / 2)), w - cw); crop = f'{cw}:{h}:{cx_px}:0'
    else:
        crop = f'{w}:{h}:0:0'
    speedf = (f',setpts=PTS/{speed}' if speed != 1 else '') + (',reverse' if name in REVERSE else '')
    if h <= 720:
        # Real-ESRGAN pass on the cropped source frames; speed change after.
        tmp = f'{OUT}/.{name}.sr.mp4'
        subprocess.run(['python3', 'scripts/sr.py', path, tmp, '1080', '1920', str(a), str(b - a), str(FPS * speed), crop], check=True)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-vf', f'setpts=PTS/{speed},fps={FPS}', '-an', '-c:v', 'libx264', '-crf', '17', '-pix_fmt', 'yuv420p', dst], check=True)
        os.remove(tmp)
    else:
        vf = f'crop={crop},scale=1080:1920:flags=lanczos,unsharp=5:5:0.4{speedf},fps={FPS}'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(a), '-t', str(b - a), '-i', path, '-vf', vf, '-an', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-pix_fmt', 'yuv420p', dst], check=True)
    print('ok', name, flush=True)
json.dump(manifest, open('src/shots.json', 'w'), ensure_ascii=False, indent=1)
