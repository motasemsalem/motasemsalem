"""Render the full reel (or stills / a time range) and mix the soundtrack.

    python3 build/render_reel.py stills 1.0 2.6 ...     # preview PNGs
    python3 build/render_reel.py video [--from 0 --to 14] [--workers 4]
    python3 build/render_reel.py audio                  # music + sfx + voice mixes
"""
import argparse
import math
import os
import subprocess
import sys
from multiprocessing import Pool

from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from reel_lib import (FPS, GOLD, GOLD_LIGHT, H, NASKH, SANS, W, Background, Finisher, Subtitles, bezier,
                      clamp, draw_glow_lines, ease_io, orb_sprite, paste, polyline_until, sparkles, text_sprite, win)
from reel_map import MapView, bottom_shade
from reel_story import END, VOICE_END, WORDS, story, subtitle_blocks

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
OUT = os.path.join(HERE, "out")
PAN = 0.55          # camera pan between canvas shots (seconds)
XFADE = 0.5         # cross-dissolve between canvas and map
SPACING = 1250      # distance between canvas shots on the world canvas


class Reel:
    def __init__(self):
        self.shots, self.flashes, self.shakes, self.chapters, self.cues = story()
        self.subs = Subtitles(WORDS, subtitle_blocks())
        self.bg = Background()
        self.fin = Finisher()
        self.mapview = MapView()
        self.chapter_sprites = {}
        # world positions for canvas shots; a canvas run after a map starts a new thread
        k = 0
        for i, s in enumerate(self.shots):
            if s.kind == "canvas":
                s.world = (k * SPACING, (-160 if k % 2 else 120))
                prev = self.shots[i - 1] if i else None
                s.first = prev is None or prev.kind != "canvas"
                k += 1

    # -------------------------------------------------------------- helpers
    def index(self, t):
        for i, s in enumerate(self.shots):
            if s.t0 <= t < s.t1:
                return i
        return len(self.shots) - 1 if t >= self.shots[-1].t0 else 0

    def neighbours(self, i):
        prev = self.shots[i - 1] if i > 0 and self.shots[i - 1].kind == "canvas" and not self.shots[i].first else None
        nxt = self.shots[i + 1] if i + 1 < len(self.shots) and self.shots[i + 1].kind == "canvas" and not self.shots[i + 1].first else None
        return prev, nxt

    def camera(self, i, t):
        s = self.shots[i]
        _, nxt = self.neighbours(i)
        cx, cy = s.world
        drift = 18 * math.sin((t - s.t0) * 0.35)
        if nxt is not None and t >= nxt.t0 - PAN:
            k = ease_io((t - (nxt.t0 - PAN)) / PAN)
            cx, cy = cx + (nxt.world[0] - cx) * k, cy + (nxt.world[1] - cy) * k
        return cx, cy + drift

    def anchor_world(self, s):
        return s.world[0] + s.anchor[0], s.world[1] + s.anchor[1]

    def thread(self, i, t, cam):
        """Golden thread through this canvas run up to the orb's position."""
        run_start = i
        while not self.shots[run_start].first:
            run_start -= 1
        first = self.shots[run_start]
        a0 = self.anchor_world(first)
        segs = [bezier((a0[0] - 1150, a0[1] - 520), (a0[0] - 760, a0[1] - 640), (a0[0] - 300, a0[1] - 260), a0)]
        times = [(first.t0, first.t0 + 0.9)]
        j = run_start
        while j + 1 < len(self.shots) and self.shots[j + 1].kind == "canvas" and not self.shots[j + 1].first:
            p, q = self.anchor_world(self.shots[j]), self.anchor_world(self.shots[j + 1])
            segs.append(bezier(p, (p[0] + 420, p[1] - 300), (q[0] - 420, q[1] - 300), q))
            tn = self.shots[j + 1].t0
            times.append((tn - PAN - 0.05, tn + 0.05))
            j += 1
        sx, sy = W / 2 - cam[0], H / 2 - cam[1]
        lines, orb = [], None
        for pts, (ta, tb) in zip(segs, times):
            if t < ta:
                break
            k = ease_io((t - ta) / (tb - ta))
            part, end = polyline_until(pts, k)
            lines.append([(x + sx, y + sy) for x, y in part])
            orb = (end[0] + sx, end[1] + sy)
        return lines, orb

    # -------------------------------------------------------------- canvas
    def render_canvas(self, i, t):
        s = self.shots[i]
        cam = self.camera(i, t)
        img = self.bg.render(cam[0], cam[1], s.pattern)
        lines, orb = self.thread(i, t, cam)
        draw_glow_lines(img, lines, GOLD_LIGHT, 3, 12, 0.8)
        prev, nxt = self.neighbours(i)
        for shot in (prev, s, nxt):
            if shot is None:
                continue
            ox = W / 2 + shot.world[0] - cam[0]
            oy = H / 2 + shot.world[1] - cam[1]
            if -W < ox < 2 * W:
                for e in shot.elements:
                    e.draw(img, t, ox, oy)
        if orb:
            bob = 4 * math.sin(t * 2.3)
            paste(img, orb_sprite(70), orb[0], orb[1] + bob)
            sparkles(img, orb[0], orb[1], t, seed=i)
        return img

    # -------------------------------------------------------------- map
    def render_map(self, i, t):
        s = self.shots[i]
        lon, lat, span = s.camera.at(t)
        img, proj = self.mapview.render(lon, lat, span)
        for a, b, amount in s.dims:
            k = amount * win(t, a, a + 0.3) * (1 - win(t, b - 0.3, b))
            if k > 0:
                img.alpha_composite(Image.new("RGBA", (W, H), (6, 3, 1, int(255 * k))))
        if s.shade and any(a <= t <= b for a, b in s.shade):
            a, b = next((a, b) for a, b in s.shade if a <= t <= b)
            bottom_shade(img, alpha=0.85 * win(t, a, a + 0.6) * (1 - win(t, b - 0.5, b)))
        img.alpha_composite(_top_fade())
        for o in s.overlays:
            o.draw(img, t, proj)
        s.hud.draw(img, t, lon, lat)
        for e in s.screen:
            e.draw(img, t, W / 2, H / 2)
        return img

    def render_shot(self, i, t):
        s = self.shots[i]
        return self.render_canvas(i, t) if s.kind == "canvas" else self.render_map(i, t)

    # -------------------------------------------------------------- frame
    def chapter(self, img, t):
        for a, b, num, title in self.chapters:
            if a <= t < b:
                k = win(t, a + 0.2, a + 0.9) * (1 - win(t, b - 0.4, b))
                key = (num, title)
                if key not in self.chapter_sprites:
                    self.chapter_sprites[key] = (text_sprite(num, SANS, 30, "gold", 0, 0.6),
                                                 text_sprite(title, SANS, 28, "dim", 0, 0.6, 600))
                n, tt = self.chapter_sprites[key]
                paste(img, n, 1000, 140, k)
                d = ImageDraw.Draw(img, "RGBA")
                d.line([(918, 142), (970, 142)], fill=GOLD + (int(160 * k),), width=2)
                paste(img, tt, 900 - tt.width / 2, 140, k)

    def frame(self, t):
        i = self.index(t)
        img = self.render_shot(i, t)
        # dissolve across a canvas↔map cut
        for j in (i - 1, i + 1):
            if 0 <= j < len(self.shots) and self.shots[j].kind != self.shots[i].kind:
                cut = self.shots[i].t0 if j < i else self.shots[i].t1
                if abs(t - cut) < XFADE / 2:
                    other = self.render_shot(j, t)
                    k = ease_io((t - (cut - XFADE / 2)) / XFADE)
                    a, b = (other, img) if j < i else (img, other)
                    img = Image.blend(a, b, k)
        self.chapter(img, t)
        self.subs.draw(img, t)
        flash = None
        for ft, col, peak, dur in self.flashes:
            if ft <= t < ft + dur:
                flash = (col, peak * (1 - (t - ft) / dur) ** 2)
        out = self.fin.apply(img, t, flash)
        for st, amp, dur in self.shakes:
            if st <= t < st + dur:
                k = (1 - (t - st) / dur) ** 2
                dx, dy = int(amp * k * math.sin(t * 97)), int(amp * k * math.cos(t * 83))
                shifted = Image.new("RGB", (W, H), (8, 4, 2))
                shifted.paste(out, (dx, dy))
                out = shifted
        fade = win(t, 0, 0.5) * (1 - win(t, END - 0.8, END))
        if fade < 1:
            out = Image.blend(Image.new("RGB", (W, H), (0, 0, 0)), out, fade)
        return out


_TOP = None


def _top_fade():
    """Darken the very top of map shots so the chapter tag stays legible."""
    global _TOP
    if _TOP is None:
        g = Image.linear_gradient("L").resize((W, 420)).point(lambda v: int((255 - v) * 0.55))
        _TOP = Image.new("RGBA", (W, H), (8, 5, 2, 0))
        layer = Image.new("RGBA", (W, 420), (8, 5, 2, 0))
        layer.putalpha(g)
        _TOP.paste(layer, (0, 0))
    return _TOP


# ------------------------------------------------------------------ workers

_REEL = None


def _init():
    global _REEL
    _REEL = Reel()


def _render_chunk(args):
    n0, n1, path = args
    ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
                           "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "medium",
                           "-crf", "18", "-pix_fmt", "yuv420p", "-r", str(FPS), path], stdin=subprocess.PIPE)
    for n in range(n0, n1):
        ff.stdin.write(_REEL.frame(n / FPS).tobytes())
        if n % 150 == 0:
            print(f"frame {n} ({n / FPS:.1f}s)", flush=True)
    ff.stdin.close()
    ff.wait()
    return path


def render_video(t0, t1, workers, name):
    n0, n1 = int(round(t0 * FPS)), int(round(t1 * FPS))
    chunks = workers * 3
    step = math.ceil((n1 - n0) / chunks)
    os.makedirs(os.path.join(OUT, "chunks"), exist_ok=True)
    jobs = [(a, min(n1, a + step), os.path.join(OUT, "chunks", f"{name}_{k:03d}.mp4"))
            for k, a in enumerate(range(n0, n1, step))]
    with Pool(workers, initializer=_init) as pool:
        parts = pool.map(_render_chunk, jobs, chunksize=1)
    lst = os.path.join(OUT, "chunks", f"{name}.txt")
    with open(lst, "w") as f:
        f.writelines(f"file '{p}'\n" for p in parts)
    silent = os.path.join(OUT, f"{name}_silent.mp4")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", silent], check=True)
    return silent


# ------------------------------------------------------------------ audio

MUSIC = os.path.join(ROOT, "assets", "music")
VOICE = os.path.join(ROOT, "inputs", "voice.mp3")


def sfx(path, cues):
    """Light synthesised accents only on the big beats."""
    parts, labels = [], []

    def add(graph, at):
        lab = f"s{len(labels)}"
        parts.append(f"{graph},adelay={int(at * 1000)}|{int(at * 1000)}[{lab}]")
        labels.append(f"[{lab}]")

    boom = "sine=f=48:d=1.4,afade=t=out:st=0.05:d=1.35:curve=exp,volume=0.9"
    hit = "anoisesrc=d=0.25:c=brown:a=0.7,lowpass=f=900,afade=t=out:d=0.25,volume=0.7"
    whoosh = "anoisesrc=d=0.9:c=pink:a=0.35,bandpass=f=1400:w=1800,afade=t=in:d=0.45,afade=t=out:st=0.45:d=0.45,volume=0.6"
    chime = "sine=f=1318:d=1.6,afade=t=out:d=1.6:curve=exp,volume=0.18"
    shimmer = "sine=f=1975:d=1.2,afade=t=out:d=1.2:curve=exp,volume=0.10"
    for key in ("hook", "danger", "hawwara"):
        add(boom, cues[key])
        add(hit, cues[key])
    add(shimmer, cues["hawwara"] + 0.05)
    add(chime, cues["turn"])
    for key in ("map1", "map2", "map3", "tour", "outro"):
        add(whoosh, max(0, cues[key] - 0.45))
    graph = ";".join(parts) + ";" + "".join(labels) + f"amix=inputs={len(labels)}:normalize=0,apad=whole_dur={END}[out]"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-filter_complex", graph, "-map", "[out]",
                    "-ac", "2", "-ar", "48000", "-t", str(END), path], check=True)


def music_bed(path, cues):
    """Five licensed tracks, each faded across its section."""
    # volumes level the tracks (their raw loudness differs by ~16 dB); suspense sits a little lower
    plan = [("lightless-dawn.mp3", 0.0, cues["map1"] + 1.0, 10.0, 3.2),
            ("desert-city.mp3", cues["map1"] - 0.8, cues["epic"] + 1.2, 0.0, 0.62),
            ("ancient-rite.mp3", cues["epic"] - 0.4, cues["suspense"] + 1.0, 0.0, 1.0),
            ("dark-times.mp3", cues["suspense"] - 0.3, cues["calm"] + 1.2, 18.0, 2.0),
            ("ibn-al-noor.mp3", cues["calm"] - 0.6, END, 0.0, 0.63)]
    inputs, chains, labs = [], [], []
    for k, (f, a, b, offset, vol) in enumerate(plan):
        inputs += ["-ss", str(offset), "-i", os.path.join(MUSIC, f)]
        dur = b - a
        chains.append(f"[{k}:a]atrim=0:{dur:.2f},asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=stereo,"
                      f"afade=t=in:d=1.0,afade=t=out:st={dur - 1.4:.2f}:d=1.4,volume={vol},"
                      f"adelay={int(a * 1000)}|{int(a * 1000)}[m{k}]")
        labs.append(f"[m{k}]")
    graph = ";".join(chains) + ";" + "".join(labs) + f"amix=inputs={len(plan)}:normalize=0,apad=whole_dur={END}[out]"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *inputs, "-filter_complex", graph, "-map", "[out]",
                    "-t", str(END), path], check=True)


def mix(cues):
    os.makedirs(OUT, exist_ok=True)
    m, s = os.path.join(OUT, "music_bed.wav"), os.path.join(OUT, "sfx.wav")
    music_bed(m, cues)
    sfx(s, cues)
    voice = (f"[0:a]aformat=sample_rates=48000:channel_layouts=stereo,apad=whole_dur={END},asplit=2[v][key]")
    full = os.path.join(OUT, "mix_full.wav")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", VOICE, "-i", m, "-i", s, "-filter_complex",
                    voice + ";[1:a][key]sidechaincompress=threshold=0.03:ratio=6:attack=25:release=450:makeup=1[duck];"
                    "[duck]volume=0.42[mus];[2:a]volume=0.55[fx];"
                    "[v][mus][fx]amix=inputs=3:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,"
                    f"afade=t=out:st={END - 0.8}:d=0.8[a]", "-map", "[a]", "-ar", "48000", full], check=True)
    dry = os.path.join(OUT, "mix_nomusic.wav")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", VOICE, "-i", s, "-filter_complex",
                    f"[0:a]aformat=sample_rates=48000:channel_layouts=stereo,apad=whole_dur={END}[v];"
                    "[1:a]volume=0.55[fx];[v][fx]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,"
                    f"afade=t=out:st={END - 0.8}:d=0.8[a]", "-map", "[a]", "-ar", "48000", dry], check=True)
    return full, dry


def mux(video, audio, out, t0=0.0, t1=None):
    t1 = END if t1 is None else t1
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", video, "-ss", str(t0), "-t", str(t1 - t0), "-i", audio,
                    "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
                    "-shortest", "-movflags", "+faststart", out], check=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("mode", choices=["stills", "video", "audio"])
    ap.add_argument("times", nargs="*", type=float)
    ap.add_argument("--from", dest="t0", type=float, default=0.0)
    ap.add_argument("--to", dest="t1", type=float, default=None)
    ap.add_argument("--workers", type=int, default=4)
    ap.add_argument("--name", default="reel")
    a = ap.parse_args()
    os.makedirs(OUT, exist_ok=True)
    if a.mode == "stills":
        r = Reel()
        os.makedirs(os.path.join(OUT, "stills"), exist_ok=True)
        for t in a.times:
            r.frame(t).save(os.path.join(OUT, "stills", f"r_{t:07.2f}.png"))
        return
    cues = Reel().cues if a.mode == "audio" else None
    if a.mode == "audio":
        print(mix(cues))
        return
    t1 = END if a.t1 is None else a.t1
    silent = render_video(a.t0, t1, a.workers, a.name)
    r = Reel()
    full, dry = mix(r.cues)
    mux(silent, full, os.path.join(OUT, f"{a.name}.mp4"), a.t0, t1)
    if a.t0 == 0 and a.t1 is None:
        mux(silent, dry, os.path.join(OUT, f"{a.name}_بدون_موسيقى.mp4"), a.t0, t1)
    print("done", a.name)


if __name__ == "__main__":
    main()
