"""Times the finishing reel to its voiceover and writes src/finishing/timeline.json.

    python3 scripts/finishing-timeline.py path/to/recording.mp3   # tighten pauses, normalize, transcribe, align
    python3 scripts/finishing-timeline.py                         # re-align the existing transcription
    python3 scripts/finishing-timeline.py --estimate              # no recording yet: estimated word timings

The recording goes to public/finishing-vo/voiceover.mp3 and its Whisper word timings to
public/finishing-vo/whisper.json (same steps as scripts/transcribe.py). The script words in
src/finishing/narration.ts are aligned to them with the aligner from scripts/generate-audio.py.
Needs numpy + scipy and ffmpeg; transcribing also needs faster-whisper.
REEL=slab times the slab-pour reel the same way (public/slab-vo, src/slab/narration.ts, src/slab/timeline.json).
"""
import importlib.util
import json
import os
import re
import subprocess
import sys

import numpy as np

spec = importlib.util.spec_from_file_location('ga', 'scripts/generate-audio.py')
ga = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ga)

FPS = 30
SR = 44100
END_HOLD_SECONDS = 2.2  # the end card stays up after the last word
REEL = os.environ.get('REEL', 'finishing')
VO = f'public/{REEL}-vo'
SRC = f'src/{REEL}'
narration = open(f'{SRC}/narration.ts', encoding='utf-8').read()
WORDS = re.search(r'SCRIPT = `(.*?)`', narration, re.S).group(1).split()
SCENES = re.findall(r'\{ id: "(\w+)", from: "([^"]+)" \}', narration)


def transcribe(src):
    os.makedirs(VO, exist_ok=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src,
                    '-af', 'highpass=f=70,silenceremove=stop_periods=-1:stop_duration=0.3:stop_threshold=-40dB:stop_silence=0.2,'
                           'loudnorm=I=-15:TP=-1.5:LRA=9',
                    '-ar', '44100', '-b:a', '192k', f'{VO}/voiceover.mp3'], check=True)
    from faster_whisper import WhisperModel
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{VO}/voiceover.mp3', '-ac', '1', '-ar', '16000', '-f', 's16le', '-'],
                         capture_output=True, check=True).stdout
    audio = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
    segments, _ = WhisperModel('large-v3', device='cpu', compute_type='int8').transcribe(audio, language='ar', beam_size=5, word_timestamps=True)
    heard = [{'text': w.word.strip(), 'start': round(w.start, 3), 'end': round(w.end, 3)} for s in segments for w in s.words]
    json.dump(heard, open(f'{VO}/whisper.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(' '.join(w['text'] for w in heard))


def aligned():
    heard = json.load(open(f'{VO}/whisper.json', encoding='utf-8'))
    pairs = ga.align(WORDS, heard)
    times = [(heard[k]['start'], heard[k]['end']) if k is not None else None for k in pairs]
    for i, tm in enumerate(times):  # spread unmatched words between their matched neighbours
        if tm is None:
            prev = next((times[k][1] for k in range(i - 1, -1, -1) if times[k]), 0.0)
            j = next((k for k in range(i + 1, len(times)) if times[k]), None)
            nxt = times[j][0] if j is not None else heard[-1]['end']
            step = (nxt - prev) / ((j if j is not None else len(times)) - i + 1)
            times[i] = (prev + step, prev + 2 * step)
    print('unmatched:', [WORDS[i] for i, k in enumerate(pairs) if k is None])
    return [{'text': w, 'start': round(s, 3), 'end': round(e, 3)} for w, (s, e) in zip(WORDS, times)]


def estimated():
    """About 2.7 words a second, with a breath after punctuation."""
    out, t = [], 0.3
    for w in WORDS:
        d = 0.22 + 0.035 * len(w)
        out.append({'text': w, 'start': round(t, 3), 'end': round(t + d, 3)})
        t += d + (0.28 if w.endswith('…') else 0.18 if re.search(r'[.،,!؟]$', w) else 0.03)
    return out


def voice_activity(total):
    path = f'{VO}/voiceover.mp3'
    if not os.path.exists(path):
        return [0.0] * total
    hop = SR // FPS
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True, check=True).stdout
    voice = np.frombuffer(raw, np.int16).astype(float) / 32768
    rms = np.sqrt(np.convolve(voice ** 2, np.ones(hop) / hop, 'same'))[::hop]
    active = np.clip((20 * np.log10(rms + 1e-9) + 45) / 15, 0, 1)
    env, level, release = [], 0.0, 0.3 ** (hop / SR / 0.25)
    for a in active:
        level = a if a > level else level * release
        env.append(round(float(level), 2))
    return (env + [0.0] * total)[:total]


if __name__ == '__main__':
    args = sys.argv[1:]
    if args and args[0] != '--estimate':
        transcribe(args[0])
    words = estimated() if args == ['--estimate'] else aligned()
    total = int(np.ceil((words[-1]['end'] + END_HOLD_SECONDS) * FPS))
    sections, at = {}, 0
    for scene, phrase in SCENES:
        at = ga.find(words, phrase, at)
        sections[scene] = 0 if not sections else int(words[at]['start'] * FPS)
    timeline = {'fps': FPS, 'total': total, 'estimated': args == ['--estimate'], 'sections': sections,
                'voice': voice_activity(total), 'words': words}
    json.dump(timeline, open(f'{SRC}/timeline.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'timeline {total / FPS:.1f}s', {s: round(f / FPS, 1) for s, f in sections.items()})
