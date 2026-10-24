# Contact sheet of every shot's mid frame with its 9:16 crop box, for choosing in-points and crops.
import json, subprocess, sys
from PIL import Image, ImageDraw
sys.path.insert(0, 'scripts'); from shots import SHOTS
T = json.load(open('src/timeline.json')); FPS = T['fps']
words = [w['text'] for w in T['words']]
def at(word, nth):
    k = 0
    for i, w in enumerate(T['words']):
        if w['text'] == word:
            k += 1
            if k == nth: return w['start']
    raise SystemExit(f'missing {word} {nth}')
starts = [at(*s[2]) for s in SHOTS] + [T['total'] / FPS]
W, H, cols = 384, 216, 5
sheet = Image.new('RGB', (W * cols, H * ((len(SHOTS) + cols - 1) // cols)))
d = ImageDraw.Draw(sheet)
for i, (name, clip, _, src, cx, sp) in enumerate(SHOTS):
    dur = starts[i + 1] - starts[i]
    t = src + dur * sp / 2
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(t), '-i', f'/tmp/claude-0/raw/{clip}.mp4', '-frames:v', '1', '-vf', f'scale={W}:{H}', '/tmp/claude-0/f.png'], check=True)
    im = Image.open('/tmp/claude-0/f.png').convert('RGB')
    x, y = (i % cols) * W, (i // cols) * H
    sheet.paste(im, (x, y))
    bw = H * 9 / 16; bx = x + cx * W - bw / 2
    d.rectangle([bx, y, bx + bw, y + H - 1], outline='red', width=2)
    d.rectangle([x, y, x + 150, y + 14], fill='black'); d.text((x + 2, y + 2), f'{i} {name} {dur:.2f}s', fill='yellow')
sheet.save('/tmp/claude-0/shots.jpg', quality=80)
print([round(starts[i+1]-starts[i],2) for i in range(len(SHOTS))])
