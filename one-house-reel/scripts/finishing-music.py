"""Writes public/music/finishing-score.mp3 for the finishing reel from Mixkit "Deep Urban" (Eugenio Mininni).

The track's beat drop is placed on «الشياكة», so the quiet breakdown sits under the hidden-work section and the
full groove arrives with the finishes. It fades in after the hook line, dips under the narrator, and fades out.
Usage: python3 scripts/finishing-music.py   (needs numpy, scipy, ffmpeg; downloads the track on first run)
"""
import importlib.util, json, os, subprocess
import numpy as np

spec = importlib.util.spec_from_file_location('ga', 'scripts/generate-audio.py'); ga = importlib.util.module_from_spec(spec); spec.loader.exec_module(ga)
SR = ga.SR
SRC = os.path.join(os.environ.get('RAW', '/tmp/claude-0/raw'), 'mixkit-623.mp3')
DROP = 117.9  # seconds into the track
if not os.path.exists(SRC):
    subprocess.run(['curl', '-sf', '-o', SRC, 'https://assets.mixkit.co/music/623/623.mp3'], check=True)

tl = json.load(open('src/finishing/timeline.json'))
fps, total = tl['fps'], tl['total'] / tl['fps']
drop_at = next(w['start'] for w in tl['words'] if w['text'].startswith('الشياكة'))
offset = DROP - drop_at  # track time = video time + offset

raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(offset), '-t', str(total), '-i', SRC, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.float32).reshape(-1, 2).astype(float)
n = len(x); tt = np.arange(n) / SR
# Under the narrator: follow the voice envelope (frames) at audio rate.
voice = np.interp(tt, np.arange(len(tl['voice'])) / fps, tl['voice'])
duck = 1 - 0.5 * voice
fade_in = np.clip((tt - 2.6) / 2.0, 0, 1) * 0.85 + 0.15 * np.clip(tt / 0.5, 0, 1)
fade_out = np.clip((total - tt) / 1.6, 0, 1)
mix = x * (duck * fade_in * fade_out)[:, None] * 0.8
ga.save('public/music/finishing-score.wav', mix, peak=0.8)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'public/music/finishing-score.wav', '-b:a', '192k', 'public/music/finishing-score.mp3'], check=True)
os.remove('public/music/finishing-score.wav')
print(f'offset {offset:.2f}s; wrote public/music/finishing-score.mp3')
