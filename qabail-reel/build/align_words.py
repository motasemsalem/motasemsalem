"""Word-level timings for the voiceover.

faster-whisper gives word timestamps; each script word is then matched to the
recognised words (normalised Arabic, fuzzy) so the karaoke subtitles use the
real script spelling with the voice's timing.
"""
import difflib, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
OUT = os.path.join(ROOT, "inputs", "words.json")


def norm(w):
    w = re.sub(r"[ً-ْٰـ]", "", w)            # harakat, tatweel
    w = re.sub(r"[^ء-ي0-9]", "", w)
    w = re.sub("[أإآ]", "ا", w).replace("ة", "ه").replace("ى", "ي")
    return w


def transcribe():
    from faster_whisper import WhisperModel
    model = WhisperModel("medium", device="cpu", compute_type="int8", cpu_threads=4)
    script = open(os.path.join(ROOT, "inputs", "script.txt"), encoding="utf-8").read()
    import subprocess
    import numpy as np
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(ROOT, "inputs", "voice.mp3"),
                          "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True, check=True).stdout
    audio = np.frombuffer(pcm, np.float32)
    segs, _ = model.transcribe(audio, language="ar",
                               word_timestamps=True, initial_prompt=script[:600], vad_filter=False)
    words = []
    for s in segs:
        for w in s.words:
            words.append({"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3)})
        print(f"{s.start:7.2f} {s.text}", flush=True)
    return words


def speech_onsets():
    """Times where speech resumes after a pause (end of each detected silence)."""
    import subprocess
    log = subprocess.run(["ffmpeg", "-v", "info", "-i", os.path.join(ROOT, "inputs", "voice.mp3"),
                          "-af", "silencedetect=noise=-35dB:d=0.12", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    return [float(m) for m in re.findall(r"silence_end: ([0-9.]+)", log)]


def snap_to_onsets(words):
    """Whisper starts phrases late; move a phrase's first word onto the real onset."""
    onsets = speech_onsets()
    prev = None
    for w in words:
        if w["s"] is None:
            continue
        near = [o for o in onsets if w["s"] - 0.45 <= o <= w["s"] + 0.08 and (prev is None or o > prev["s"] + 0.2)]
        if near:
            o = min(near, key=lambda o: abs(o - w["s"]))
            w["s"] = round(o, 3)
            if prev is not None:
                prev["e"] = min(prev["e"], o)
        w["e"] = max(w["e"], w["s"] + 0.05)
        prev = w


def main():
    raw_path = os.path.join(ROOT, "inputs", "whisper_words.json")
    if os.path.exists(raw_path) and "--fresh" not in sys.argv:
        heard = json.load(open(raw_path, encoding="utf-8"))
    else:
        heard = transcribe()
        json.dump(heard, open(raw_path, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    script_words = open(os.path.join(ROOT, "inputs", "script.txt"), encoding="utf-8").read().split()
    a = [norm(w) for w in script_words]
    b = [norm(w["w"]) for w in heard]
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    times = [None] * len(a)
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == "equal" or (op == "replace" and i2 - i1 == j2 - j1):
            for k in range(i2 - i1):
                times[i1 + k] = (heard[j1 + k]["s"], heard[j1 + k]["e"])
        elif op == "replace":  # unequal block: spread script words over heard span
            s, e = heard[j1]["s"], heard[j2 - 1]["e"]
            n = i2 - i1
            for k in range(n):
                times[i1 + k] = (s + (e - s) * k / n, s + (e - s) * (k + 1) / n)
    out = [{"w": w, "s": t[0] if t else None, "e": t[1] if t else None} for w, t in zip(script_words, times)]
    snap_to_onsets(out)
    json.dump(out, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    missing = [o["w"] for o in out if o["s"] is None]
    print("matched", len(out) - len(missing), "/", len(out), "unmatched:", " ".join(missing))


if __name__ == "__main__":
    main()
