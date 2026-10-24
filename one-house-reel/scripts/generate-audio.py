"""Builds the scene timeline from the recorded voiceover, then synthesizes the music bed and sound effects.

1. Aligns the script in src/narration.ts to the Whisper word timings in public/voiceover/whisper.json
   (written by scripts/transcribe.py) and writes src/timeline.json: the timing of every script word
   and where each section starts, so every animation cue lands on its spoken word.
2. Writes a few synthesized one-shot sound effects to public/sfx/ (the rest are Mixkit recordings in
   public/sfx/mk). The music bed is built by scripts/music.py.
Needs numpy + scipy, and ffmpeg on PATH.  Usage: python3 scripts/generate-audio.py
"""
import difflib
import json
import os
import re
import subprocess
import wave

import numpy as np
from scipy.signal import butter, sosfilt

SR = 44100
FPS = 30
END_HOLD_SECONDS = 1.6  # end card stays up after the last word
rng = np.random.default_rng(11)

narration = open('src/narration.ts', encoding='utf-8').read()
SCRIPT_WORDS = re.search(r'SCRIPT = `(.*?)`', narration, re.S).group(1).split()
SCENE_FROM = re.findall(r'\{ id: "(\w+)", from: "([^"]+)" \}', narration)
SCENES = [scene for scene, _ in SCENE_FROM]


def norm(word):
    word = re.sub(r'[\u064B-\u0652\u0640.,،:!؟?…"]', '', word)
    for a, b in ['أا', 'إا', 'آا', 'ةه', 'ىي', 'ؤو', 'ئي', 'ظض', 'زظ']:
        word = word.replace(a, b)
    return word


def align(script, heard):
    """Global alignment of script words to transcribed words; returns, per script word, the heard index or None."""
    n, m = len(script), len(heard)
    a, b = [norm(w) for w in script], [norm(w['text']) for w in heard]
    gap = -0.6
    score = np.zeros((n + 1, m + 1))
    score[:, 0] = np.arange(n + 1) * gap
    score[0, :] = np.arange(m + 1) * gap
    move = np.zeros((n + 1, m + 1), dtype=int)  # 0 diagonal, 1 skip script, 2 skip heard
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            sim = difflib.SequenceMatcher(None, a[i - 1], b[j - 1]).ratio()
            options = (score[i - 1, j - 1] + sim - 0.4, score[i - 1, j] + gap, score[i, j - 1] + gap)
            move[i, j] = int(np.argmax(options))
            score[i, j] = options[move[i, j]]
    pairs, i, j = [None] * n, n, m
    while i > 0 and j > 0:
        if move[i, j] == 0:
            pairs[i - 1] = j - 1
            i, j = i - 1, j - 1
        elif move[i, j] == 1:
            i -= 1
        else:
            j -= 1
    return pairs


def script_timings():
    heard = json.load(open('public/voiceover/whisper.json', encoding='utf-8'))
    pairs = align(SCRIPT_WORDS, heard)
    times = [(heard[k]['start'], heard[k]['end']) if k is not None else None for k in pairs]
    # Spread any unmatched script words evenly between their matched neighbours.
    for i, tm in enumerate(times):
        if tm is None:
            prev = next((times[k][1] for k in range(i - 1, -1, -1) if times[k]), 0.0)
            j = next((k for k in range(i + 1, len(times)) if times[k]), None)
            nxt = times[j][0] if j is not None else heard[-1]['end']
            span = (j if j is not None else len(times)) - i + 1
            times[i] = (prev + (nxt - prev) / span, prev + (nxt - prev) / span * 2)
    unmatched = [SCRIPT_WORDS[i] for i, k in enumerate(pairs) if k is None]
    print('aligned', len(SCRIPT_WORDS), 'script words; unmatched:', unmatched)
    return [{'text': w, 'start': round(s, 3), 'end': round(e, 3)} for w, (s, e) in zip(SCRIPT_WORDS, times)]


def find(words, phrase, after=0):
    parts = phrase.split()
    for i in range(after, len(words) - len(parts) + 1):
        if all(words[i + k]['text'].startswith(p) for k, p in enumerate(parts)):
            return i
    raise ValueError(f'"{phrase}" not found in the script')


def build_timeline():
    words = script_timings()
    total = int(np.ceil((words[-1]['end'] + END_HOLD_SECONDS) * FPS))
    sections, at = {}, 0
    for scene, phrase in SCENE_FROM:
        at = find(words, phrase, at)
        sections[scene] = 0 if not sections else int(words[at]['start'] * FPS)
    # Per-frame narrator activity; sound effects duck under it (src/components/Sound.tsx).
    activity = voice_activity(SR // FPS)
    voice = [round(float(activity[f]) if f < len(activity) else 0.0, 2) for f in range(total)]
    timeline = {'fps': FPS, 'total': total, 'sections': sections, 'voice': voice, 'words': words}
    with open('src/timeline.json', 'w', encoding='utf-8') as f:
        json.dump(timeline, f, ensure_ascii=False, indent=1)
    print('timeline', f'{total / FPS:.1f}s', {s: round(f / FPS, 1) for s, f in sections.items()})
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


def pan(sig, p):
    """p in [-1, 1]."""
    return np.stack([sig * np.sqrt((1 - p) / 2), sig * np.sqrt((1 + p) / 2)], axis=1)


# ---------- Instruments ----------


def sub(freq, seconds):
    tt = t(seconds)
    s = np.sin(2 * np.pi * freq * tt) + 0.25 * np.sin(2 * np.pi * 2 * freq * tt)
    return np.tanh(s * 1.3) * env_adsr(len(tt), 0.01, 0.2, 0.8, 0.08)


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


# ---------- Score ----------

BEAT = 0.5  # 120 BPM
BAR = 4 * BEAT


def voice_activity(hop):
    """0–1 per `hop` samples: how much the narrator is speaking (fast attack, slow release)."""
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', 'public/voiceover/voiceover.mp3', '-ac', '1', '-ar', str(SR),
                          '-f', 's16le', '-'], capture_output=True, check=True).stdout
    voice = np.frombuffer(raw, np.int16).astype(float) / 32768
    rms = np.sqrt(np.convolve(voice ** 2, np.ones(hop) / hop, 'same'))[::hop]
    active = np.clip((20 * np.log10(rms + 1e-9) + 45) / 15, 0, 1)  # 0 below -45 dB, 1 above -30 dB
    env, level = np.zeros_like(active), 0.0
    release = 0.3 ** (hop / SR / 0.25)  # falls to 30% within 250 ms of silence
    for i, a in enumerate(active):
        level = a if a > level else level * release
        env[i] = level
    return env


def voice_duck(n, depth=0.7):
    """Gain curve that dips the music while the narrator speaks, so word endings stay clear."""
    hop = int(0.01 * SR)
    env = voice_activity(hop)
    return np.interp(np.arange(n) / hop, np.arange(len(env)), 1 - depth * env, right=1.0)


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
