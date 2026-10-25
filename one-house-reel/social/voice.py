"""Egyptian voiceovers with ElevenLabs, spending as few credits as possible.

    python3 social/voice.py check  social/voice/<name>.txt   # cost, credits left, and lines needing diacritics. Free.
    python3 social/voice.py say    social/voice/<name>.txt   # generate the lines not generated yet, join them
    python3 social/voice.py verify social/voice/<name>.txt   # Whisper listens back and flags lines that sound wrong. Free.
    python3 social/voice.py redo   social/voice/<name>.txt <line no>   # regenerate one line after fixing its text

The script is one sentence per line, written with the diacritics that fix Egyptian pronunciation
(see the "Voiceover" section of social/README.md). Lines starting with "#" are notes.

Credits are only spent by `say` and `redo`:
- Each line is generated once and cached under social/voice/cache/ by its exact text, voice and settings.
  Fixing one line regenerates only that line.
- Neighbouring lines go along as context (previous_text / next_text), so the joined take still flows.
- Keys come from ELEVENLABS_API_KEY, ELEVENLABS_API_KEY2 … (or _2 …). When one runs out, the next one is used.
"""
import hashlib, json, os, re, subprocess, sys, urllib.error, urllib.request

# "Mostafa – Bold and Spirited", the voice of the finishing reel.
VOICE = os.environ.get("ELEVENLABS_VOICE_ID") or os.environ.get("voic_id") or "QvNF0qyyt1Tuy1YAmnzH"
MODEL = os.environ.get("ELEVENLABS_MODEL", "eleven_v4")
SETTINGS = {"stability": 0.5, "similarity_boost": 0.75, "speed": 1.0}
CACHE = os.path.join(os.path.dirname(__file__), "voice", "cache")
API = "https://api.elevenlabs.io/v1"
GAP = 0.25  # seconds of silence between lines
DIACRITICS = re.compile("[ً-ْٰ]")

# Words the model is known to get wrong without help: plain spelling -> how to write it in the script.
LEXICON = {
    "نت": "نِتّ",
    "ون هاوس": "وَن هاوْس",
    "بورديوم": "بورْدْيوم",
    "سوفت كلوز": "سوفْت كْلوز",
    "باركيه": "باركيه",
    "معاينة": "مُعايْنَة",
    "تشطيب": "تَشْطيب",
    "محارة": "مَحارة",
    "سباكة": "سِباكة",
    "سمارت هوم": "سْمارْت هوم",
}


def keys():
    found = []
    for k in sorted(os.environ, key=lambda k: (len(k), k)):
        if re.fullmatch(r"ELEVENLABS_API_KEY_?\d*", k) and os.environ[k].strip():
            found.append(os.environ[k].strip())
    if not found:
        raise SystemExit("No ELEVENLABS_API_KEY in the environment.")
    return found


def call(path, key, body=None):
    req = urllib.request.Request(f"{API}/{path}", data=json.dumps(body).encode() if body else None, headers={"xi-api-key": key, "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return r.read()
    except urllib.error.HTTPError as e:
        detail = e.read().decode(errors="replace")
        raise RuntimeError(f"{e.code} {detail}") from None


def credits(key):
    """Characters left on a key, or None when the key isn't allowed to read its own usage."""
    try:
        s = json.loads(call("user/subscription", key))
        return s["character_limit"] - s["character_count"]
    except RuntimeError:
        return None


def lines(path):
    out = []
    for n, raw in enumerate(open(path, encoding="utf-8").read().splitlines(), 1):
        t = raw.strip()
        if t and not t.startswith("#"):
            out.append((n, t))
    return out


def plain(text):
    return DIACRITICS.sub("", text)


def cache_file(text):
    h = hashlib.sha1(json.dumps([VOICE, MODEL, SETTINGS, text], ensure_ascii=False).encode()).hexdigest()[:16]
    return os.path.join(CACHE, f"{h}.mp3")


def check(path):
    ls = lines(path)
    todo = [t for _, t in ls if not os.path.exists(cache_file(t))]
    print(f"{len(ls)} lines · {sum(len(t) for _, t in ls)} characters · {sum(len(t) for t in todo)} to generate (the rest are cached)")
    for i, k in enumerate(keys(), 1):
        c = credits(k)
        print(f"key {i}: {'?' if c is None else c} characters left")
    for n, t in ls:
        for word, fixed in LEXICON.items():
            if re.search(rf"(^|\s){re.escape(word)}($|\s|[،.…])", plain(t)) and fixed not in t and word != fixed:
                print(f"line {n}: write «{word}» as «{fixed}»")
    if not VOICE:
        print("ELEVENLABS_VOICE_ID is not set.")


def tts(text, prev, nxt):
    body = {"text": text, "model_id": MODEL, "voice_settings": SETTINGS}
    if prev:
        body["previous_text"] = prev
    if nxt:
        body["next_text"] = nxt
    errors = []
    for i, k in enumerate(keys(), 1):
        left = credits(k)
        if left is not None and left < len(text):
            errors.append(f"key {i}: {left} characters left")
            continue
        try:
            return call(f"text-to-speech/{VOICE}?output_format=mp3_44100_192", k, body)
        except RuntimeError as e:
            msg = str(e)
            if any(s in msg for s in ("quota_exceeded", "insufficient", "credits", "401")):
                errors.append(f"key {i}: {msg[:120]}")
                continue  # out of credits or revoked: try the next key
            raise
    raise SystemExit("No key could generate this line:\n" + "\n".join(errors))


def say(path, only=None):
    if not VOICE:
        raise SystemExit("Set ELEVENLABS_VOICE_ID first.")
    os.makedirs(CACHE, exist_ok=True)
    ls = lines(path)
    for i, (n, t) in enumerate(ls):
        f = cache_file(t)
        if os.path.exists(f) and n != only:
            continue
        prev = ls[i - 1][1] if i else None
        nxt = ls[i + 1][1] if i + 1 < len(ls) else None
        open(f, "wb").write(tts(t, prev, nxt))
        print(f"line {n}: generated ({len(t)} characters)", flush=True)
    out = os.path.splitext(path)[0] + ".mp3"
    parts = []
    for _, t in ls:
        parts += ["-i", cache_file(t)]
    n = len(ls)
    graph = "".join(f"[{i}:a]apad=pad_dur={GAP}[a{i}];" for i in range(n)) + "".join(f"[a{i}]" for i in range(n)) + f"concat=n={n}:v=0:a=1,loudnorm=I=-15:TP=-1.5:LRA=9[out]"
    subprocess.run(["ffmpeg", "-v", "error", "-y", *parts, "-filter_complex", graph, "-map", "[out]", "-ar", "44100", "-b:a", "192k", out], check=True)
    print("wrote", out)


def verify(path):
    import difflib
    import numpy as np
    from faster_whisper import WhisperModel

    model = WhisperModel("large-v3", device="cpu", compute_type="int8")
    norm = lambda s: re.sub(r"[^ء-ي ]", "", plain(s)).replace("ى", "ي").replace("ة", "ه").replace("أ", "ا").replace("إ", "ا").replace("آ", "ا")
    bad = 0
    for n, t in lines(path):
        f = cache_file(t)
        if not os.path.exists(f):
            print(f"line {n}: not generated yet")
            continue
        raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True, check=True).stdout
        segs, _ = model.transcribe(np.frombuffer(raw, np.int16).astype(np.float32) / 32768, language="ar", beam_size=5, initial_prompt=plain(t))
        heard = " ".join(s.text for s in segs)
        score = difflib.SequenceMatcher(None, norm(t).split(), norm(heard).split()).ratio()
        if score < 0.85:
            bad += 1
            print(f"line {n}: {score:.0%}\n  script: {plain(t)}\n  heard:  {heard.strip()}")
    print("all lines sound right" if not bad else f"{bad} line(s) to listen to and fix")


if __name__ == "__main__":
    a = sys.argv[1:]
    if len(a) < 2:
        raise SystemExit(__doc__)
    {"check": lambda: check(a[1]), "say": lambda: say(a[1]), "verify": lambda: verify(a[1]), "redo": lambda: say(a[1], int(a[2]))}[a[0]]()
