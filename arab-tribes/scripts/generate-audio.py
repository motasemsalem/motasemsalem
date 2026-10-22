"""Synthesizes the reel's music bed and the extra sound effects into public/music and public/sfx.

Everything is generated from oscillators and noise, so there are no licensing concerns.
The other effects in public/sfx come from human-evolution/scripts/generate-sfx.py.
Usage: python3 scripts/generate-audio.py
Then compress the music, e.g.
  npx remotion ffmpeg -i public/music/beat.wav -b:a 160k public/music/beat.mp3
"""
import os
import sys
import wave
from functools import lru_cache

import numpy as np

SR = 44100
BPM = 112
BEAT = 60 / BPM
rng = np.random.default_rng(11)


def t(seconds):
    return np.arange(int(SR * seconds)) / SR


def lowpass(x, cutoff):
    """One-pole lowpass with a fixed cutoff in Hz."""
    a = 1 - np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += a * (x[i] - acc)
        y[i] = acc
    return y


def highpass(x, cutoff):
    return x - lowpass(x, cutoff)


def save(path, x, peak=0.9):
    x = np.repeat(x[:, None], 2, axis=1) if x.ndim == 1 else x.copy()
    n = min(len(x), 220)
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


# --- Sound effects -------------------------------------------------------------

def swoosh():
    """A short, bright whoosh for fast cuts."""
    tt = t(0.45)
    env = np.sin(np.pi * tt / 0.45) ** 3
    noise = highpass(rng.normal(size=len(tt)), 400)
    bright = highpass(noise, 2500) * (tt / 0.45)
    return (lowpass(noise, 2200) + bright * 0.8) * env


def pop():
    tt = t(0.14)
    freq = 380 + 900 * np.exp(-tt * 40)
    return np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-tt * 32)


def hit():
    """Cinematic impact: sub drop, noise burst and a metallic ring."""
    tt = t(2.2)
    freq = 42 + 70 * np.exp(-tt * 9)
    sub = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-tt * 2.2) * 1.4
    burst = lowpass(rng.normal(size=len(tt)), 1800) * np.exp(-tt * 14)
    ring = sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt * d) * g for f, d, g in [(220, 3, 0.25), (553, 4, 0.15), (1107, 6, 0.08)])
    return sub + burst + ring


def hit_soft():
    """Short punchy accent for each tribe card: thump, click and a bright tail."""
    tt = t(0.7)
    freq = 55 + 90 * np.exp(-tt * 30)
    thump = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-tt * 9)
    click = highpass(rng.normal(size=len(tt)), 3000) * np.exp(-tt * 120) * 0.8
    tail = sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt * 7) * g for f, g in [(1318, 0.18), (1975, 0.1)])
    return thump + click + tail


def riser():
    tt = t(1.6)
    env = (tt / 1.6) ** 2.2
    tone = np.sin(2 * np.pi * np.cumsum(200 + 900 * (tt / 1.6) ** 2) / SR) * 0.4
    noise = highpass(rng.normal(size=len(tt)), 1200) * 0.7
    return (tone + noise) * env


def typing():
    """A quick burst of soft clicks for counters."""
    out = np.zeros(int(SR * 0.6))
    click_t = t(0.02)
    click = highpass(rng.normal(size=len(click_t)), 3000) * np.exp(-click_t * 300)
    for start in np.arange(0, 0.55, 0.045):
        i = int(start * SR)
        out[i:i + len(click)] += click * rng.uniform(0.5, 1)
    return out


def camera():
    """Shutter-like snap used when a map pin lands."""
    tt = t(0.25)
    snap = highpass(rng.normal(size=len(tt)), 1500) * (np.exp(-tt * 80) + 0.6 * np.exp(-np.abs(tt - 0.07) * 120))
    return snap + np.sin(2 * np.pi * 180 * tt) * np.exp(-tt * 40) * 0.4


# --- Music ---------------------------------------------------------------------

def doum():
    tt = t(0.5)
    freq = 70 + 60 * np.exp(-tt * 25)
    return np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-tt * 7)


def tak():
    tt = t(0.18)
    shell = highpass(rng.normal(size=len(tt)), 1800) * np.exp(-tt * 45)
    tone = np.sin(2 * np.pi * 420 * tt) * np.exp(-tt * 50) * 0.5
    return shell + tone


def ka():
    tt = t(0.1)
    return highpass(rng.normal(size=len(tt)), 3500) * np.exp(-tt * 70) * 0.45


@lru_cache(maxsize=None)
def pluck(freq, seconds=0.9):
    """Karplus-Strong string, oud-like."""
    n = int(SR * seconds)
    period = int(SR / freq)
    buf = rng.uniform(-1, 1, period)
    buf = lowpass(buf, 5000)
    out = np.empty(n)
    for i in range(n):
        out[i] = buf[i % period]
        buf[i % period] = 0.996 * 0.5 * (buf[i % period] + buf[(i + 1) % period])
    return out


def place(track, sample, at, gain=1.0):
    i = int(at * SR)
    end = min(len(track), i + len(sample))
    if i < len(track):
        track[i:end] += sample[: end - i] * gain


def beat(seconds=150.0):
    """Maqsoum darbuka groove in Hijaz on D with a drone, bass and oud riff."""
    n = int(SR * seconds)
    drums = np.zeros(n)
    music = np.zeros(n)
    bar = BEAT * 4
    # Maqsoum: D T - T D - T - (eighth notes)
    pattern = [('D', 0), ('T', 0.5), ('T', 1.5), ('D', 2), ('T', 3)]
    sample = {'D': doum(), 'T': tak()}
    bars = int(seconds / bar) + 1
    for b in range(bars):
        start = b * bar
        intro = b < 2
        for kind, beat_pos in pattern:
            if intro and kind == 'T':
                continue
            place(drums, sample[kind], start + beat_pos * BEAT, 1.0 if kind == 'D' else 0.55)
        if not intro:
            for k in range(8):
                place(drums, ka(), start + k * BEAT / 2 + BEAT / 4, 0.35 + 0.2 * (k % 2))
    # Hijaz on D: D Eb F# G A Bb C D
    d = 146.83
    hijaz = [d, d * 1.0595, d * 1.2599, d * 1.3348, d * 1.4983, d * 1.5874, d * 1.7818, d * 2]
    riff = [0, 1, 2, 1, 0, -1, 0, None, 4, 3, 2, 3, 2, 1, 0, None]
    for b in range(2, bars):
        start = b * bar
        for k, step in enumerate(riff):
            if step is None or (b // 4) % 2 == 1 and k % 2 == 1:
                continue
            f = hijaz[step] if step >= 0 else hijaz[6] / 2
            place(music, pluck(f * (1 if b % 8 < 4 else 2), 0.7), start + k * BEAT / 4, 0.32)
    for b in range(bars):
        place(music, pluck(d / 2, 2.0), b * bar, 0.6)
        place(music, pluck(d / 2, 1.0), b * bar + 2.5 * BEAT, 0.4)
    tt = t(seconds)
    drone = (np.sin(2 * np.pi * d / 2 * tt) + 0.5 * np.sin(2 * np.pi * d * 0.75 * tt) + 0.3 * np.sin(2 * np.pi * d * tt)) * 0.16
    drone *= 0.8 + 0.2 * np.sin(2 * np.pi * 0.1 * tt)
    left = drums + music * 0.85 + drone
    right = drums + music * 1.0 + drone * 0.9
    return np.stack([left, right], axis=1)


SOUNDS = {'hit-soft': hit_soft, 'swoosh': swoosh, 'pop': pop, 'hit': hit, 'riser': riser, 'typing': typing, 'camera': camera}

if __name__ == '__main__':
    # Pass sound names to regenerate only those (and "beat" for the music).
    wanted = set(sys.argv[1:]) or {*SOUNDS, 'beat'}
    for name, make in SOUNDS.items():
        if name in wanted:
            save(f'public/sfx/{name}.wav', make())
    if 'beat' in wanted:
        save('public/music/beat.wav', beat(), peak=0.8)
