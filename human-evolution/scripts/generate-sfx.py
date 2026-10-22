"""Synthesizes the sound effects and ambient music bed into public/sfx and public/music.

Everything is generated from oscillators and noise, so there are no licensing concerns.
Usage: python3 scripts/generate-sfx.py
Long files (music, crackle, wind, gears) are then compressed to mono MP3 and the WAVs removed, e.g.
  npx remotion ffmpeg -i public/music/ambient.wav -ac 1 -b:a 128k public/music/ambient.mp3
"""
import os
import wave

import numpy as np

SR = 44100
rng = np.random.default_rng(7)


def t(seconds):
    return np.arange(int(SR * seconds)) / SR


def lowpass(x, cutoff):
    """One-pole lowpass; `cutoff` may be a scalar or a per-sample array in Hz."""
    cutoff = np.broadcast_to(np.asarray(cutoff, dtype=float), x.shape)
    a = 1 - np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y


def highpass(x, cutoff):
    return x - lowpass(x, cutoff)


def fade(x, fade_in=0.005, fade_out=0.02):
    n_in, n_out = int(SR * fade_in), int(SR * fade_out)
    x = x.copy()
    if n_in:
        x[:n_in] *= np.linspace(0, 1, n_in)
    if n_out:
        x[-n_out:] *= np.linspace(1, 0, n_out)
    return x


def save(path, x, peak=0.9):
    x = fade(x)
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    os.makedirs(os.path.dirname(path), exist_ok=True)
    stereo = np.repeat((x * 32767).astype(np.int16)[:, None], 2, axis=1)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(stereo.tobytes())
    print('wrote', path, f'{len(x) / SR:.2f}s')


def whoosh(seconds=1.0):
    tt = t(seconds)
    env = np.sin(np.pi * tt / seconds) ** 2
    sweep = 300 + 2500 * np.sin(np.pi * tt / seconds) ** 3
    return lowpass(highpass(rng.normal(size=len(tt)), 150), sweep) * env


def boom(seconds=3.0):
    tt = t(seconds)
    freq = 34 + 26 * np.exp(-tt * 3)
    body = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-tt * 1.6)
    thump = lowpass(rng.normal(size=len(tt)), 180) * np.exp(-tt * 9) * 3
    return body + thump


def step():
    tt = t(0.22)
    thud = np.sin(2 * np.pi * 85 * tt) * np.exp(-tt * 28)
    grit = lowpass(rng.normal(size=len(tt)), 900) * np.exp(-tt * 40) * 0.8
    return thud + grit


def knock():
    tt = t(0.35)
    click = highpass(rng.normal(size=len(tt)), 2000) * np.exp(-tt * 90)
    ring = sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt * d) * g for f, d, g in [(1180, 30, 0.6), (2370, 45, 0.35), (3900, 70, 0.2)])
    return click * 1.5 + ring


def crackle(seconds=8.0):
    n = int(SR * seconds)
    bed = lowpass(rng.normal(size=n), 400) * 0.6
    pops = np.zeros(n)
    for _ in range(int(seconds * 14)):
        i = rng.integers(0, n - 2000)
        length = rng.integers(80, 900)
        pops[i:i + length] += rng.normal(size=length) * np.exp(-np.arange(length) / (length / 5)) * rng.uniform(0.5, 2.5)
    return bed + highpass(pops, 800)


def tick():
    tt = t(0.08)
    return np.sin(2 * np.pi * 1500 * tt) * np.exp(-tt * 60)


def shimmer(seconds=3.0):
    tt = t(seconds)
    env = np.minimum(1, tt / 0.8) * np.exp(-np.maximum(0, tt - 1.2) * 1.5)
    tones = sum(np.sin(2 * np.pi * f * tt + p) for f, p in [(1320, 0), (1760, 1), (1980, 2), (2640, 3)])
    return tones * env * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * tt))


def ding(seconds=2.2):
    tt = t(seconds)
    return sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt * d) * g for f, d, g in [(880, 2.2, 1), (1760, 3.5, 0.5), (2640, 5, 0.25), (3520, 7, 0.12)])


def spray(seconds=0.9):
    tt = t(seconds)
    env = np.minimum(1, tt / 0.08) * np.exp(-tt * 3)
    return lowpass(highpass(rng.normal(size=len(tt)), 2500), 7000) * env


def wind(seconds=10.0):
    tt = t(seconds)
    gust = 0.55 + 0.45 * np.sin(2 * np.pi * 0.23 * tt) * np.sin(2 * np.pi * 0.11 * tt + 1)
    return lowpass(rng.normal(size=len(tt)), 300 + 500 * gust) * gust


def tap():
    tt = t(0.12)
    return (np.sin(2 * np.pi * 620 * tt) + 0.5 * np.sin(2 * np.pi * 1450 * tt)) * np.exp(-tt * 55)


def gears(seconds=8.0):
    n = int(SR * seconds)
    out = np.zeros(n)
    one = knock()[: int(SR * 0.12)] * 0.5
    clank = np.sin(2 * np.pi * 210 * t(0.12)) * np.exp(-t(0.12) * 35)
    for k, start in enumerate(np.arange(0, seconds - 0.2, 0.19)):
        i = int(start * SR)
        sample = one + (clank if k % 4 == 0 else 0)
        out[i:i + len(sample)] += sample
    hum = np.sin(2 * np.pi * 55 * t(seconds)) * 0.15
    return out + hum


def blip():
    tt = t(0.09)
    freq = 900 + 1400 * tt / 0.09
    return np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-tt * 30)


def swell(seconds=4.0):
    tt = t(seconds)
    env = np.minimum(1, tt / 2.5) ** 2 * np.exp(-np.maximum(0, tt - 2.8) * 3)
    return sum(np.sin(2 * np.pi * f * tt) for f in [110, 164.8, 220, 329.6]) * env


def ambient(seconds=240.0):
    """Slow pad over Am – F – C – Em, eight seconds per chord, with a soft sub."""
    tt = t(seconds)
    chords = [[110, 130.8, 164.8], [87.3, 110, 130.8], [130.8, 164.8, 196], [82.4, 123.5, 164.8]]
    chord_len = 8.0
    out = np.zeros(len(tt))
    for k in range(int(seconds / chord_len) + 1):
        start = k * chord_len
        seg = (tt >= start - 2) & (tt < start + chord_len + 2)
        local = tt[seg] - start
        env = np.clip((local + 2) / 3, 0, 1) * np.clip((chord_len + 2 - local) / 3, 0, 1)
        voice = np.zeros(seg.sum())
        for f in chords[k % len(chords)]:
            for detune in (-0.6, 0.6):
                voice += np.sin(2 * np.pi * (f + detune) * tt[seg]) + 0.3 * np.sin(2 * np.pi * 2 * (f + detune) * tt[seg])
            voice += 0.5 * np.sin(2 * np.pi * f / 2 * tt[seg])
        out[seg] += voice * env
    return out * (0.85 + 0.15 * np.sin(2 * np.pi * 0.05 * tt))


SOUNDS = {
    'whoosh': whoosh, 'boom': boom, 'step': step, 'knock': knock, 'crackle': crackle, 'tick': tick,
    'shimmer': shimmer, 'ding': ding, 'spray': spray, 'wind': wind, 'tap': tap, 'gears': gears,
    'blip': blip, 'swell': swell,
}

if __name__ == '__main__':
    for name, make in SOUNDS.items():
        save(f'public/sfx/{name}.wav', make())
    save('public/music/ambient.wav', ambient(), peak=0.7)
