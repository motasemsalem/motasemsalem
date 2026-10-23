"""Prepares a recorded voiceover: loudness-normalizes it and transcribes it with word timings.

Writes public/voiceover/voiceover.mp3 and public/voiceover/whisper.json.
Needs ffmpeg and faster-whisper (pip install faster-whisper); the large-v3 model downloads on first run.
Usage: python3 scripts/transcribe.py path/to/recording.mp3
"""
import json
import os
import subprocess
import sys

import numpy as np
from faster_whisper import WhisperModel

src = sys.argv[1]
os.makedirs('public/voiceover', exist_ok=True)
out = 'public/voiceover/voiceover.mp3'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src,
                '-af', 'highpass=f=70,loudnorm=I=-15:TP=-1.5:LRA=9',
                '-ar', '44100', '-b:a', '192k', out], check=True)

raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', out, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'],
                     capture_output=True, check=True).stdout
audio = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
model = WhisperModel('large-v3', device='cpu', compute_type='int8')
segments, _ = model.transcribe(audio, language='ar', beam_size=5, word_timestamps=True)
words = [{'text': w.word.strip(), 'start': round(w.start, 3), 'end': round(w.end, 3), 'p': round(w.probability, 3)}
         for s in segments for w in s.words]
with open('public/voiceover/whisper.json', 'w', encoding='utf-8') as f:
    json.dump(words, f, ensure_ascii=False, indent=0)
print(' '.join(w['text'] for w in words))
print('low-confidence words:', [w for w in words if w['p'] < 0.5])
