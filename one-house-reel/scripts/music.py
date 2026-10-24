"""Writes public/music/score.mp3 from the licensed track in public/music/ (Mixkit "Epical Drums 01").

The track is placed so its final hit lands on the last word of the narration. During the hook it is
low-passed (muffled, "behind the wall") and opens up on the logo; it dips under the narrator throughout.
Usage: python3 scripts/music.py   (needs numpy, scipy, ffmpeg)
"""
import importlib.util, json, subprocess
import numpy as np
from scipy.signal import butter, sosfilt

spec = importlib.util.spec_from_file_location('ga', 'scripts/generate-audio.py'); ga = importlib.util.module_from_spec(spec); spec.loader.exec_module(ga)
SR = ga.SR
SRC = 'public/music/epical-drums-01.mp3'
FINAL_HIT = 94.2  # seconds into the track

tl = json.load(open('src/timeline.json'))
words = tl['words']
total = tl['total'] / tl['fps']
brand = tl['sections']['brand'] / tl['fps']
offset = FINAL_HIT - words[-1]['start']  # track time = video time + offset

raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(offset), '-t', str(total), '-i', SRC, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.float32).reshape(-1, 2).astype(float)
n = len(x); tt = np.arange(n) / SR
# Muffled until the logo: blend a low-passed copy that crossfades to the full track over 0.25 s.
muffled = sosfilt(butter(4, 380, 'low', fs=SR, output='sos'), x, axis=0) * 1.4
open_ = np.clip((tt - (brand - 0.1)) / 0.25, 0, 1)[:, None]
mix = muffled * (1 - open_) + x * open_
mix *= np.clip(0.55 + 0.45 * open_, 0, 1)
mix *= ga.voice_duck(n, depth=0.55)[:, None]
mix *= np.clip(tt / 0.3, 0, 1)[:, None] * np.clip((total - tt) / 1.5, 0, 1)[:, None]
ga.save('public/music/score.wav', mix, peak=0.9)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'public/music/score.wav', '-b:a', '192k', 'public/music/score.mp3'], check=True)
import os; os.remove('public/music/score.wav')
print(f'offset {offset:.2f}s; wrote public/music/score.mp3')
