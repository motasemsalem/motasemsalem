"""Builds the scene timeline (and caption word timings) from the voiceover, then synthesizes the music bed and sound effects.

1. Reads public/voiceover/*.mp3 durations and writes src/timeline.json (frames per scene),
   so the video and the music share the same cut points.
2. Writes public/music/score.mp3: a 120 BPM cinematic track whose drop lands on the logo
   and whose sections follow the scenes.
3. Writes the one-shot sound effects to public/sfx/.

Everything is generated from oscillators and noise, so there are no licensing concerns.
Needs numpy + scipy, and ffmpeg on PATH.  Usage: python3 scripts/generate-audio.py
"""
import json
import os
import re
import subprocess
import wave

import numpy as np
from scipy.signal import butter, sosfilt

SR = 44100
FPS = 30
TRANSITION_FRAMES = 12
rng = np.random.default_rng(11)

# Must match the order in src/narration.ts.
MIN_SECONDS = {}
src = open('src/narration.ts', encoding='utf-8').read()
for scene_id, minimum in re.findall(r'id: "(\w+)",\s*minSeconds: ([\d.]+)', src):
    MIN_SECONDS[scene_id] = float(minimum)
SCENES = list(MIN_SECONDS)


def lead(scene):
    return 0.8 if scene == 'hook' else 0.6


def tail(scene):
    return 3.0 if scene == 'closing' else 1.0


def duration(path):
    out = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path],
                         capture_output=True, text=True, check=True)
    return float(out.stdout)


def words(scene):
    """Word timings (seconds from the start of the voice clip) from the ElevenLabs character alignment."""
    a = json.load(open(f'public/voiceover/{scene}.json', encoding='utf-8'))
    out, cur = [], None
    for ch, start, end in zip(a['characters'], a['character_start_times_seconds'], a['character_end_times_seconds']):
        if ch.isspace():
            cur = None
            continue
        if cur is None:
            cur = {'text': '', 'start': round(start, 3), 'end': round(end, 3)}
            out.append(cur)
        cur['text'] += ch
        cur['end'] = round(end, 3)
    return out


def build_timeline():
    frames, starts, at = {}, {}, 0
    for scene in SCENES:
        voice = duration(f'public/voiceover/{scene}.mp3')
        n = max(round(MIN_SECONDS[scene] * FPS), int(np.ceil((lead(scene) + voice + tail(scene)) * FPS)))
        frames[scene] = n
        starts[scene] = at
        at += n - TRANSITION_FRAMES
    total = at + TRANSITION_FRAMES
    timeline = {'fps': FPS, 'transitionFrames': TRANSITION_FRAMES, 'total': total,
                'leadSeconds': {s: lead(s) for s in SCENES}, 'frames': frames, 'starts': starts,
                'words': {s: words(s) for s in SCENES}}
    with open('src/timeline.json', 'w', encoding='utf-8') as f:
        json.dump(timeline, f, ensure_ascii=False, indent=1)
    print('timeline', f'{total / FPS:.1f}s', frames)
    return timeline


# ---------- DSP helpers ----------

def t(seconds):
    return np.arange(int(SR * seconds)) / SR


def lp(x, cutoff, order=2):
    return sosfilt(butter(order, min(cutoff, SR / 2 - 100), 'low', fs=SR, output='sos'), x, axis=0)


def hp(x, cutoff, order=2):
    return sosfilt(butter(order, cutoff, 'high', fs=SR, output='sos'), x, axis=0)


def bp(x, lo, hi):
    return sosfilt(butter(2, [lo, hi], 'band', fs=SR, output='sos'), x, axis=0)


def saw(freq, tt, harmonics=24):
    out = np.zeros_like(tt)
    for k in range(1, harmonics + 1):
        if freq * k > 12000:
            break
        out += np.sin(2 * np.pi * freq * k * tt) / k
    return out


def env_adsr(n, a=0.005, d=0.1, s=0.6, r=0.2):
    e = np.ones(n) * s
    na, nd, nr = int(a * SR), int(d * SR), int(r * SR)
    na = min(na, n)
    e[:na] = np.linspace(0, 1, na)
    nd = min(nd, n - na)
    e[na:na + nd] = np.linspace(1, s, nd)
    nr = min(nr, n)
    e[n - nr:] *= np.linspace(1, 0, nr)
    return e


def note(name):
    names = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}
    pitch, octave = name[:-1], int(name[-1])
    return 440 * 2 ** ((names[pitch] + 12 * (octave + 1) - 69) / 12)


def add(buf, sig, at):
    i = int(at * SR)
    if i >= len(buf):
        return
    sig = sig[: len(buf) - i]
    buf[i:i + len(sig)] += sig if sig.ndim == buf.ndim else np.repeat(sig[:, None], 2, axis=1)


def pan(sig, p):
    """p in [-1, 1]."""
    return np.stack([sig * np.sqrt((1 - p) / 2), sig * np.sqrt((1 + p) / 2)], axis=1)


def reverb(x, seconds=2.2, mix=0.25):
    """Cheap stereo reverb: convolution with decaying filtered noise."""
    n = int(seconds * SR)
    ir_l = lp(rng.normal(size=n), 6000) * np.exp(-np.arange(n) / SR * 3.2)
    ir_r = lp(rng.normal(size=n), 6000) * np.exp(-np.arange(n) / SR * 3.2)
    ir_l[:int(0.012 * SR)] = 0
    ir_r[:int(0.017 * SR)] = 0
    wet = np.stack([fftconv(x[:, 0], ir_l), fftconv(x[:, 1], ir_r)], axis=1)[: len(x)]
    wet /= np.max(np.abs(wet)) + 1e-9
    dry = x / (np.max(np.abs(x)) + 1e-9)
    return dry * (1 - mix) + wet * mix


def fftconv(a, b):
    n = len(a) + len(b) - 1
    size = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(a, size) * np.fft.rfft(b, size), size)[:n]


# ---------- Instruments ----------

def kick(strength=1.0):
    tt = t(0.45)
    freq = 46 + 120 * np.exp(-tt * 30)
    body = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-tt * 7)
    click = hp(rng.normal(size=len(tt)), 3000) * np.exp(-tt * 200) * 0.25
    return np.tanh((body + click) * 1.6) * strength


def clap():
    tt = t(0.35)
    noise = bp(rng.normal(size=len(tt)), 900, 5000)
    e = np.zeros(len(tt))
    for off in (0, 0.011, 0.022):
        e += np.where(tt >= off, np.exp(-(tt - off) * 60), 0)
    e += np.exp(-tt * 14) * 0.5
    return noise * e * 0.6


def hat(open_=False):
    tt = t(0.3 if open_ else 0.06)
    return hp(rng.normal(size=len(tt)), 7000) * np.exp(-tt * (12 if open_ else 70)) * 0.35


def sub(freq, seconds):
    tt = t(seconds)
    s = np.sin(2 * np.pi * freq * tt) + 0.25 * np.sin(2 * np.pi * 2 * freq * tt)
    return np.tanh(s * 1.3) * env_adsr(len(tt), 0.01, 0.2, 0.8, 0.08)


def pad(freqs, seconds, cutoff=1800):
    tt = t(seconds)
    left = sum(saw(f * 1.003, tt, 16) + saw(f * 0.997, tt + 0.13, 16) for f in freqs)
    right = sum(saw(f * 1.004, tt + 0.07, 16) + saw(f * 0.996, tt + 0.2, 16) for f in freqs)
    e = env_adsr(len(tt), 0.6, 0.5, 0.85, 0.9)
    return np.stack([lp(left, cutoff) * e, lp(right, cutoff) * e], axis=1) / len(freqs)


def pluck(freq, seconds=0.35):
    tt = t(seconds)
    s = saw(freq, tt, 20) * np.exp(-tt * 9)
    return lp(s, 3500) * 0.9


def bell(freq, seconds=2.5):
    tt = t(seconds)
    return sum(np.sin(2 * np.pi * freq * m * tt) * np.exp(-tt * d) * g
               for m, d, g in [(1, 2.0, 1), (2.01, 3, 0.4), (3.98, 5, 0.2), (5.4, 8, 0.1)])


def riser(seconds):
    tt = t(seconds)
    p = tt / seconds
    noise = rng.normal(size=len(tt))
    s = np.zeros(len(tt))
    # Sweep the noise through a rising band, in chunks.
    chunk = 2048
    for i in range(0, len(tt), chunk):
        c = 300 + 9000 * p[i] ** 2
        s[i:i + chunk] = bp(noise[i:i + chunk + 512], c * 0.7, min(c * 1.4, 20000))[:len(s[i:i + chunk])]
    tone = np.sin(2 * np.pi * np.cumsum(110 + 770 * p ** 2) / SR) * 0.3
    return (s * 0.8 + tone) * p ** 2


def impact(seconds=3.5):
    tt = t(seconds)
    freq = 30 + 60 * np.exp(-tt * 6)
    body = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-tt * 1.4)
    crack = lp(rng.normal(size=len(tt)), 2500) * np.exp(-tt * 12) * 1.2
    tail_ = lp(rng.normal(size=len(tt)), 400) * np.exp(-tt * 2) * 0.6
    return np.tanh((body + crack + tail_) * 1.5)


def tick():
    tt = t(0.05)
    return (np.sin(2 * np.pi * 2200 * tt) + 0.5 * hp(rng.normal(size=len(tt)), 4000)) * np.exp(-tt * 120) * 0.5


# ---------- Score ----------

BEAT = 0.5  # 120 BPM
BAR = 4 * BEAT
CHORDS = [  # Am – F – C – G, voiced around A3
    ('A1', ['A3', 'C4', 'E4']), ('F1', ['F3', 'A3', 'C4']),
    ('C2', ['G3', 'C4', 'E4']), ('G1', ['G3', 'B3', 'D4']),
]


def score(tl):
    total = tl['total'] / FPS + 1.0
    sec = {s: tl['starts'][s] / FPS for s in SCENES}
    end = tl['total'] / FPS
    drop = sec['brand'] + 0.15
    buf = np.zeros((int(total * SR), 2))
    drums = np.zeros_like(buf)
    bass = np.zeros_like(buf)
    pads = np.zeros_like(buf)
    arps = np.zeros_like(buf)
    fx = np.zeros_like(buf)

    # Hook: ticking clock, low drone and heartbeat, riser into the logo.
    tt = t(drop)
    drone = (np.sin(2 * np.pi * 55 * tt) + 0.5 * np.sin(2 * np.pi * 82.4 * tt) + 0.3 * saw(110, tt, 6) * 0.3)
    drone *= np.minimum(1, tt / 1.5) * 0.35
    add(pads, pan(lp(drone, 900), 0), 0)
    for k in np.arange(0.4, drop - 0.6, BEAT):
        add(fx, pan(tick(), 0.3 if int(k / BEAT) % 2 else -0.3), k)
    for k in np.arange(1.0, drop - 2.5, BAR):
        add(drums, pan(kick(0.55), 0), k)
        add(drums, pan(kick(0.35), 0), k + 0.22)
    add(fx, pan(riser(2.6), 0), drop - 2.6)

    # Logo drop.
    add(fx, pan(impact(), 0), drop)
    add(fx, pan(bell(note('A5')), -0.2) * 0.35, drop)

    groove_from = sec['foundation']
    quiet = (sec['values'], sec['values'] + 2 * BAR)  # breathe under the values intro
    arp_from = sec['columns']
    t0 = drop
    k = 0
    while t0 < end - 0.5:
        root, chord = CHORDS[(k // 2) % 4]
        bar_t = t0
        # Pads every bar, bass + drums once the groove starts.
        add(pads, pad([note(n) for n in chord], BAR + 0.4, 1400 if bar_t < groove_from else 2400) * 0.6, bar_t)
        in_quiet = quiet[0] <= bar_t < quiet[1]
        if bar_t >= groove_from - 0.01:
            for b in range(4):
                bt = bar_t + b * BEAT
                if not in_quiet:
                    add(drums, pan(kick(), 0), bt)
                if b in (1, 3) and not in_quiet:
                    add(drums, pan(clap(), 0.05), bt)
                for h in range(2):
                    add(drums, pan(hat(open_=(h == 1 and b == 3)), 0.35) * (0.9 if h else 0.55), bt + h * BEAT / 2)
                add(bass, pan(sub(note(root), BEAT * 0.9), 0), bt + BEAT / 2 if b % 2 else bt)
        if bar_t >= arp_from - 0.01:
            pattern = [0, 1, 2, 1, 2, 0, 2, 1]
            octave = 2.0 if bar_t >= sec['process'] else 1.0
            for i, p_ in enumerate(pattern):
                f = note(chord[p_]) * 2 * octave
                add(arps, pan(pluck(f), -0.4 if i % 2 else 0.4) * 0.35, bar_t + i * BEAT / 2)
        # Small riser into every scene change after the groove starts.
        t0 += BAR
        k += 1
    for s in SCENES[3:]:
        add(fx, pan(riser(1.2), 0) * 0.45, sec[s] - 1.2)
        add(fx, pan(impact(1.5), 0) * 0.35, sec[s])

    # Closing: final chord hit, ring out.
    close = sec['closing']
    add(fx, pan(impact(4), 0) * 0.9, close)
    add(fx, pan(bell(note('E5'), 4), 0.2) * 0.3, close)
    add(fx, pan(bell(note('A4'), 4), -0.2) * 0.3, close)

    # Duck everything under the voice a bit by sidechaining pads/arps to the kick.
    side = np.ones(len(buf))
    for bt in np.arange(groove_from, end, BEAT):
        i = int(bt * SR)
        n = int(0.22 * SR)
        side[i:i + n] = np.minimum(side[i:i + n], 0.45 + 0.55 * np.linspace(0, 1, n) ** 0.6)
    side = side[:, None]

    mix = (drums * 0.9 + bass * 0.55 + pads * 0.5 * side + arps * 0.45 * side + fx * 0.7)
    mix = reverb(mix, 2.0, 0.18)
    # Fade out after the voice ends.
    fade = np.clip((end - np.arange(len(mix)) / SR) / 2.5, 0, 1)[:, None]
    mix *= fade
    mix = np.tanh(mix * 1.3)
    return mix


def save(path, x, peak=0.9):
    if x.ndim == 1:
        x = np.repeat(x[:, None], 2, axis=1)
    n = min(len(x), int(0.004 * SR))
    x = x.copy()
    x[:n] *= np.linspace(0, 1, n)[:, None]
    x[-n:] *= np.linspace(1, 0, n)[:, None]
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())
    print('wrote', path, f'{len(x) / SR:.2f}s')


# ---------- One-shot effects ----------

def whoosh(seconds=0.8):
    tt = t(seconds)
    e = np.sin(np.pi * tt / seconds) ** 3
    s = bp(rng.normal(size=len(tt)), 400, 4000) * e
    return pan(s, 0) + pan(np.roll(s, 300), 0.6) * 0.5


def swoosh_short():
    return whoosh(0.35)


def glitch():
    out = np.zeros(int(0.5 * SR))
    for i in range(10):
        start = rng.integers(0, len(out) - 3000)
        ln = rng.integers(300, 2500)
        f = rng.uniform(200, 3000)
        seg = np.sign(np.sin(2 * np.pi * f * np.arange(ln) / SR)) * 0.6 + rng.normal(size=ln) * 0.3
        out[start:start + ln] += seg
    return hp(out, 200)


def typing(seconds=1.2):
    out = np.zeros(int(seconds * SR))
    at = 0.0
    while at < seconds - 0.05:
        tt = t(0.03)
        click = hp(rng.normal(size=len(tt)), 2500) * np.exp(-tt * 250) * rng.uniform(0.5, 1)
        i = int(at * SR)
        out[i:i + len(click)] += click
        at += rng.uniform(0.045, 0.09)
    return out


def blip():
    tt = t(0.12)
    freq = 1200 + 900 * tt / 0.12
    return np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-tt * 35)


def pop():
    tt = t(0.15)
    freq = 300 + 700 * np.exp(-tt * 40)
    return np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-tt * 30)


def hammer():
    tt = t(0.5)
    ring = sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt * d) * g for f, d, g in [(1830, 14, 0.5), (3120, 20, 0.3), (4700, 30, 0.2)])
    thud = np.sin(2 * np.pi * 120 * tt) * np.exp(-tt * 30)
    click = hp(rng.normal(size=len(tt)), 3000) * np.exp(-tt * 150)
    return ring + thud + click


def shutter():
    tt = t(0.25)
    a = hp(rng.normal(size=len(tt)), 1500) * (np.exp(-tt * 80) + np.where(tt > 0.09, np.exp(-(tt - 0.09) * 90), 0))
    return a


def stamp():
    tt = t(0.6)
    return np.tanh((np.sin(2 * np.pi * np.cumsum(80 + 200 * np.exp(-tt * 40)) / SR) * np.exp(-tt * 10)
                    + lp(rng.normal(size=len(tt)), 1500) * np.exp(-tt * 25)) * 2)


def chime():
    return bell(note('E6'), 1.6) * 0.6 + np.concatenate([np.zeros(int(0.09 * SR)), bell(note('A6'), 1.6)])[:int(1.6 * SR)] * 0.5


def keys():
    """Jingle of a key ring."""
    out = np.zeros(int(1.0 * SR))
    for _ in range(14):
        i = rng.integers(0, int(0.6 * SR))
        f = rng.uniform(3000, 7000)
        tt = t(0.25)
        s = np.sin(2 * np.pi * f * tt) * np.exp(-tt * rng.uniform(20, 40)) * rng.uniform(0.3, 1)
        out[i:i + len(s)] += s
    return hp(out, 2000)


def sub_drop():
    tt = t(1.8)
    return np.sin(2 * np.pi * np.cumsum(90 * np.exp(-tt * 1.5) + 28) / SR) * np.exp(-tt * 1.8)


EFFECTS = {
    'whoosh': whoosh, 'swoosh': swoosh_short, 'glitch': glitch, 'typing': typing, 'blip': blip, 'pop': pop,
    'hammer': hammer, 'shutter': shutter, 'stamp': stamp, 'chime': chime, 'keys': keys, 'impact': impact,
    'subdrop': sub_drop, 'riser': lambda: riser(1.6),
}

if __name__ == '__main__':
    tl = build_timeline()
    for name, make in EFFECTS.items():
        save(f'public/sfx/{name}.wav', make())
    save('public/music/score.wav', score(tl), peak=0.8)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'public/music/score.wav', '-b:a', '192k', 'public/music/score.mp3'], check=True)
    os.remove('public/music/score.wav')
    print('wrote public/music/score.mp3')
