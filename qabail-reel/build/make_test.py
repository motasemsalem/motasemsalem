"""Render the first 14 seconds of the reel as a style test.

Pipeline: Ken Burns scenes (ffmpeg zoompan) -> grade + grain -> Arabic text
cards (PIL + raqm, so letters join correctly) -> light leak / vignette /
red flash -> voiceover trimmed and loudness-normalised.
"""
import os
import subprocess
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
IMG = os.path.join(ROOT, "assets", "images")
FONT = os.path.join(ROOT, "fonts", "Cairo-Variable.ttf")
VOICE = os.path.join(ROOT, "inputs", "voice.mp3")
OUT = os.path.join(HERE, "out")
CARDS = os.path.join(OUT, "cards")
W, H, FPS = 1080, 1920, 30
TEST_LEN = 14.0

CREAM = (243, 230, 200, 255)
GOLD = (212, 162, 76, 255)
RED = (201, 58, 46, 255)

# (start, end, lines, colour, font size, centre y) — times from inputs/timings.json
CARD_LIST = [
    (0.00, 2.13, ["أشهرُ قبيلةٍ في صعيدِ", "مصر..."], CREAM, 92, 900),
    (2.53, 4.01, ["ليست عربيةَ الأصل!"], RED, 118, 900),
    (4.63, 5.46, ["منفيّون..."], GOLD, 150, 900),
    (5.93, 6.78, ["ثم غُزاة..."], GOLD, 150, 900),
    (7.27, 8.01, ["ثم ملوك."], GOLD, 150, 900),
    (8.75, 11.25, ["هذه حكايةُ القبائلِ", "العربيةِ في مصر."], GOLD, 96, 900),
    (11.90, 13.88, ["لأنك ستعرفُ أين تعيشُ", "قبيلتُك اليوم."], CREAM, 80, 1000),
]

# (start, end, image, zoom direction) — cuts follow the spoken phrases
SCENES = [
    (0.00, 4.63, "desert-simoom-gizeh", "in"),
    (4.63, 5.93, "great-sphinx-gizeh", "out"),
    (5.93, 7.27, "memnon-statues-thebes", "in"),
    (7.27, 8.75, "mosque-cairo-interior", "out"),
    (8.75, TEST_LEN, "desert-simoom-gizeh", "in"),
]


def run(cmd):
    print(" ".join(cmd)[:300], "...")
    subprocess.run(cmd, check=True)


def font(size):
    f = ImageFont.truetype(FONT, size, layout_engine=ImageFont.Layout.RAQM)
    axes = f.get_variation_axes()
    values = [700 if a["name"] == b"Weight" else a["default"] for a in axes]
    f.set_variation_by_axes(values)
    return f


def render_card(path, lines, colour, size, cy):
    """Transparent full-frame PNG with centred Arabic lines and a gold rule."""
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    f = font(size)
    line_h = int(size * 1.35)
    top = cy - line_h * (len(lines) - 1) / 2
    for i, text in enumerate(lines):
        y = top + i * line_h
        draw.text((W / 2, y), text, font=f, fill=colour, anchor="mm",
                  direction="rtl", language="ar",
                  stroke_width=3, stroke_fill=(0, 0, 0, 190))
    rule_y = top + (len(lines) - 1) * line_h + size * 0.78
    draw.line([(W / 2 - 120, rule_y), (W / 2 + 120, rule_y)], fill=GOLD, width=3)
    img.save(path)


def make_overlays():
    os.makedirs(CARDS, exist_ok=True)
    # Dark navy vignette so the text always reads.
    mask = Image.radial_gradient("L").resize((W, H))
    shade = Image.new("RGBA", (W, H), (6, 10, 20, 0))
    shade.putalpha(mask.point(lambda v: min(255, int(70 + v * 0.75))))
    shade.save(os.path.join(OUT, "shade.png"))
    # Warm light leak entering from the top-right corner.
    glow = Image.radial_gradient("L").resize((1400, 1400))
    leak = Image.new("RGBA", (1400, 1400), (255, 150, 60, 0))
    leak.putalpha(glow.point(lambda v: int((255 - v) * 0.22)))
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    layer.paste(leak, (W - 1000, -500), leak)
    layer.save(os.path.join(OUT, "leak.png"))
    paths = []
    for i, (_, _, lines, colour, size, cy) in enumerate(CARD_LIST):
        p = os.path.join(CARDS, f"card_{i:02d}.png")
        render_card(p, lines, colour, size, cy)
        paths.append(p)
    return paths


def make_scene(index, start, end, name, direction):
    dur = end - start
    frames = round(dur * FPS)
    e = "(1-cos(PI*on/%d))/2" % frames
    zoom = "1+0.10*%s" % e if direction == "in" else "1.10-0.10*%s" % e
    vf = (
        "scale=-2:2200,crop=1238:2200:(iw-1238)/2:0,"
        f"zoompan=z='{zoom}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':"
        f"d={frames}:s={W}x{H}:fps={FPS},"
        "eq=contrast=1.08:saturation=0.85:brightness=-0.02,"
        "colorbalance=rm=0.06:gm=0.03:bm=-0.06:rh=0.03:bh=-0.04,"
        "noise=alls=10:allf=t+u,vignette=PI/4.5,"
        "fade=t=in:st=0:d=0.2,format=yuv420p"
    )
    out = os.path.join(OUT, f"scene_{index}.mp4")
    run(["ffmpeg", "-y", "-loglevel", "error", "-i", os.path.join(IMG, name + ".jpg"),
         "-vf", vf, "-frames:v", str(frames), "-c:v", "libx264", "-preset", "medium",
         "-crf", "18", out])
    return out


def concat_scenes(paths):
    lst = os.path.join(OUT, "scenes.txt")
    with open(lst, "w") as f:
        for p in paths:
            f.write(f"file '{os.path.abspath(p)}'\n")
    out = os.path.join(OUT, "scenes.mp4")
    run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0",
         "-i", lst, "-c", "copy", out])
    return out


def composite(scenes_mp4, shade, leak, card_paths):
    inputs = ["-i", scenes_mp4,
              "-loop", "1", "-framerate", str(FPS), "-i", shade,
              "-loop", "1", "-framerate", str(FPS), "-i", leak,
              "-f", "lavfi", "-i", f"color=c=0xC93A2E:s={W}x{H}:r={FPS}",
              "-i", VOICE]
    for p in card_paths:
        inputs += ["-loop", "1", "-framerate", str(FPS), "-i", p]
    flash_idx, voice_idx, first_card = 3, 4, 5

    chain = ["[1:v]format=rgba[shade]", "[2:v]format=rgba[leak]",
             "[0:v][shade]overlay=format=auto[v0]",
             "[v0][leak]overlay=format=auto[v1]",
             f"[{flash_idx}:v]format=rgba,colorchannelmixer=aa=0.42,"
             "fade=t=in:st=2.53:d=0.08:alpha=1,fade=t=out:st=2.66:d=0.35:alpha=1[flash]",
             "[v1][flash]overlay=format=auto[v2]"]
    last = "v2"
    for i, (start, end, *_rest) in enumerate(CARD_LIST):
        k = first_card + i
        chain.append(
            f"[{k}:v]format=rgba,fade=t=in:st={start}:d=0.35:alpha=1,"
            f"fade=t=out:st={end - 0.3:.2f}:d=0.3:alpha=1[c{i}]")
        chain.append(f"[{last}][c{i}]overlay=format=auto[v{i + 3}]")
        last = f"v{i + 3}"
    chain.append(f"[{last}]format=yuv420p[vout]")
    chain.append(f"[{voice_idx}:a]atrim=0:{TEST_LEN},asetpts=PTS-STARTPTS,"
                 f"afade=t=out:st={TEST_LEN - 0.7}:d=0.7,"
                 "loudnorm=I=-14:TP=-1.5:LRA=11[aout]")

    out = os.path.join(OUT, "test-14s.mp4")
    run(["ffmpeg", "-y", "-loglevel", "error", *inputs,
         "-filter_complex", ";".join(chain),
         "-map", "[vout]", "-map", "[aout]", "-t", str(TEST_LEN),
         "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-r", str(FPS),
         "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out])
    return out


def main():
    os.makedirs(OUT, exist_ok=True)
    cards = make_overlays()
    scenes = [make_scene(i, *s) for i, s in enumerate(SCENES)]
    joined = concat_scenes(scenes)
    print(composite(joined, os.path.join(OUT, "shade.png"),
                    os.path.join(OUT, "leak.png"), cards))


if __name__ == "__main__":
    main()
