"""Transcribes each voiceover clip with Whisper and lists the words that differ from the script,
to catch mispronounced words before rendering. Needs `pip install faster-whisper` (downloads large-v3 once).
Usage: python3 scripts/check-voiceover.py [scene ...]
"""
import difflib
import pathlib
import re
import sys

import av
import numpy as np
from faster_whisper import WhisperModel

ROOT = pathlib.Path(__file__).resolve().parent.parent
SCRIPT = (ROOT / "src/narration.ts").read_text()
TEXTS = dict(re.findall(r'id: "(\w+)",\s*minSeconds: [\d.]+,\s*text: "([^"]+)"', SCRIPT))


def normalize(text):
    text = re.sub(r"[ً-ْـ]", "", text)
    text = re.sub(r"[إأآ]", "ا", text).replace("ة", "ه").replace("ى", "ي")
    return re.findall(r"[ء-ي0-9]+", text)


def load(path):
    out = []
    with av.open(str(path)) as c:
        resampler = av.AudioResampler(format="flt", layout="mono", rate=16000)
        for frame in c.decode(audio=0):
            for r in resampler.resample(frame):
                out.append(r.to_ndarray().reshape(-1))
    return np.concatenate(out).astype(np.float32)


model = WhisperModel("large-v3", device="cpu", compute_type="int8")
for scene in sys.argv[1:] or TEXTS:
    segments, _ = model.transcribe(load(ROOT / f"public/voiceover/{scene}.mp3"), language="ar", beam_size=5, condition_on_previous_text=False)
    heard = normalize(" ".join(s.text for s in segments))
    expected = normalize(TEXTS[scene])
    diffs = [
        f"{' '.join(expected[a1:a2]) or '∅'} → {' '.join(heard[b1:b2]) or '∅'}"
        for op, a1, a2, b1, b2 in difflib.SequenceMatcher(None, expected, heard).get_opcodes()
        if op != "equal"
    ]
    print(f"{scene}: {'OK' if not diffs else ' | '.join(diffs)}", flush=True)
