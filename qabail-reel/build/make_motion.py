"""Motion-graphics style test: first 14 seconds of the reel.

Frames are drawn procedurally with PIL (eased entrances, drawn-on strokes,
map and icon explainers) and piped into ffmpeg together with the voiceover.
"""
import math
import os
import random
import subprocess
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
IMG = os.path.join(ROOT, "assets", "images")
FONT = os.path.join(ROOT, "fonts", "Cairo-Variable.ttf")
VOICE = os.path.join(ROOT, "inputs", "voice.mp3")
OUT = os.path.join(HERE, "out")
W, H, FPS, LEN = 1080, 1920, 30, 14.0

GOLD = (218, 170, 84)
CREAM = (244, 233, 207)
RED = (214, 64, 50)
NAVY_TOP = (7, 11, 22)
NAVY_BOT = (20, 14, 9)


def clamp(x):
    return max(0.0, min(1.0, x))


def ease(x):
    x = clamp(x)
    return 1 - (1 - x) ** 3


def window(t, a, b):
    """0→1 across [a, b] with cubic ease-out."""
    return ease((t - a) / (b - a))


def font(size):
    f = ImageFont.truetype(FONT, size, layout_engine=ImageFont.Layout.RAQM)
    values = [700 if ax["name"] == b"Weight" else ax["default"] for ax in f.get_variation_axes()]
    f.set_variation_by_axes(values)
    return f


def text_layer(lines, size, colour, gap=1.3):
    f = font(size)
    lh = int(size * gap)
    layer = Image.new("RGBA", (W, lh * len(lines) + size), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for i, line in enumerate(lines):
        d.text((W / 2, size / 2 + i * lh), line, font=f, fill=colour + (255,),
               anchor="mm", direction="rtl", language="ar",
               stroke_width=2, stroke_fill=(0, 0, 0, 170))
    return layer


def background_gradient():
    bg = Image.new("RGB", (W, H))
    px = bg.load()
    for y in range(H):
        k = y / (H - 1)
        c = tuple(int(NAVY_TOP[i] + (NAVY_BOT[i] - NAVY_TOP[i]) * k) for i in range(3))
        for x in range(W):
            px[x, y] = c
    return bg


def still(name, alpha):
    """Prepared portrait crop of a CC0 print, dimmed for use as a backdrop."""
    im = Image.open(os.path.join(IMG, name + ".jpg")).convert("RGB")
    scale = 2000 / im.height
    im = im.resize((round(im.width * scale), 2000), Image.LANCZOS)
    x0 = (im.width - 1080) // 2
    im = im.crop((x0, 0, x0 + 1080, 1920)).filter(ImageFilter.GaussianBlur(1.2))
    dark = Image.new("RGB", (W, H), NAVY_TOP)
    return Image.blend(dark, im, alpha)


BG = background_gradient()
RNG = random.Random(7)
DUST = [(RNG.random() * W, RNG.random() * H, 0.5 + RNG.random() * 2.2, RNG.random()) for _ in range(70)]
STILL_DESERT = still("desert-simoom-gizeh", 0.42)
STILL_MOSQUE = still("mosque-cairo-interior", 0.36)
GLOW = Image.radial_gradient("L").resize((1400, 1400))

LAYERS = {
    "hook_a": text_layer(["أشهرُ قبيلةٍ في صعيدِ"], 92, CREAM),
    "hook_b": text_layer(["مصر..."], 92, GOLD),
    "red": text_layer(["ليست عربيةَ الأصل!"], 116, RED),
    "exile": text_layer(["منفيّون..."], 150, GOLD),
    "war": text_layer(["ثم غُزاة..."], 150, GOLD),
    "king": text_layer(["ثم ملوك."], 150, GOLD),
    "title": text_layer(["هذه حكايةُ القبائلِ", "العربيةِ في مصر."], 96, GOLD),
    "close": text_layer(["لأنك ستعرفُ أين تعيشُ", "قبيلتُك اليوم."], 78, CREAM),
}


def scaled(layer, k):
    """Scale a layer's opacity by k (0..1)."""
    out = layer.copy()
    a = out.getchannel("A").point(lambda v: int(v * k))
    out.putalpha(a)
    return out


def place(canvas, layer, y, k=1.0, dx=0, dy=0, scale=1.0):
    if k <= 0.001:
        return
    lay = scaled(layer, k)
    if scale != 1.0:
        lay = lay.resize((round(lay.width * scale), round(lay.height * scale)), Image.LANCZOS)
    canvas.alpha_composite(lay, (round((W - lay.width) / 2 + dx), round(y - lay.height / 2 + dy)))


def stroke_path(draw, pts, progress, colour, width):
    """Draw the first `progress` fraction of a polyline (length-based)."""
    total = sum(math.dist(pts[i], pts[i + 1]) for i in range(len(pts) - 1))
    want = total * clamp(progress)
    acc = 0.0
    for i in range(len(pts) - 1):
        seg = math.dist(pts[i], pts[i + 1])
        if acc + seg >= want:
            t = (want - acc) / seg if seg else 0
            end = (pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t,
                   pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t)
            draw.line([pts[i], end], fill=colour, width=width, joint="curve")
            return
        draw.line([pts[i], pts[i + 1]], fill=colour, width=width, joint="curve")
        acc += seg


def icon_exile(t):
    """A route leaving the centre: dashed path with arrowhead."""
    p = window(t, 4.9, 5.5)
    pts = [(230, 1330), (380, 1220), (560, 1290), (740, 1200), (880, 1280)]
    return pts, p


def icon_crossed_swords(t):
    p = window(t, 6.1, 6.7)
    return [((360, 1150), (720, 1400)), ((720, 1150), (360, 1400))], p


def icon_crown(t):
    p = window(t, 7.4, 8.0)
    base = [(330, 1330), (330, 1180), (430, 1260), (540, 1140), (650, 1260), (750, 1180), (750, 1330)]
    return base, p


def nile_points():
    # (lon, lat) along the Nile, Aswan → Delta. Drawn north-up.
    route = [(32.9, 24.1), (32.6, 25.7), (31.2, 27.2), (30.8, 28.1), (31.25, 30.05), (31.2, 30.6)]
    pts = []
    for lon, lat in route:
        pts.append((540 + (lon - 31.2) * 170, 1000 - (lat - 27.0) * 130))
    branch = [(31.2, 30.6), (30.6, 31.0), (29.9, 31.2)]
    return pts, [(540 + (lon - 31.2) * 170, 1000 - (lat - 27.0) * 130) for lon, lat in branch]


def draw_dust(canvas, t):
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for x, y, r, ph in DUST:
        yy = (y - t * 14 * (0.5 + ph)) % H
        a = int(70 * (0.5 + 0.5 * math.sin(t * 1.3 + ph * 9)))
        d.ellipse([x - r, yy - r, x + r, yy + r], fill=GOLD + (a,))
    canvas.alpha_composite(layer)


def draw_frame(t):
    frame = BG.convert("RGBA")
    # Backdrop: hook and close use the desert print, middle section a mosque print.
    if t < 4.63:
        drift = 1.0 + 0.04 * window(t, 0, 4.6)
        backdrop = STILL_DESERT.resize((round(W * drift), round(H * drift)))
        frame.alpha_composite(backdrop.convert("RGBA"),
                              ((W - backdrop.width) // 2, (H - backdrop.height) // 2))
    elif 4.63 <= t < 8.75:
        frame.alpha_composite(STILL_MOSQUE.convert("RGBA"))
    else:
        frame.alpha_composite(STILL_DESERT.convert("RGBA"))

    # Warm glow that slowly breathes in the top-right.
    glow_k = 0.10 + 0.04 * math.sin(t * 0.8)
    glow = Image.new("RGBA", (W, H), (255, 160, 70, 0))
    glow.putalpha(Image.new("L", (W, H), 0))
    halo = GLOW.point(lambda v: int((255 - v) * glow_k))
    glow.paste(Image.new("RGBA", (1400, 1400), (255, 160, 70, 255)), (W - 1000, -500), halo)
    frame.alpha_composite(glow)
    draw_dust(frame, t)

    dx, dy = 0, 0
    if 2.53 <= t < 2.95:  # impact shake on the reveal
        s = (2.95 - t) / 0.42
        dx = round(math.sin(t * 90) * 10 * s)
        dy = round(math.cos(t * 75) * 7 * s)

    d = ImageDraw.Draw(frame)
    # Documentary corner brackets, always on.
    for cx, cy, sx, sy in [(70, 90, 1, 1), (W - 70, 90, -1, 1), (70, H - 90, 1, -1), (W - 70, H - 90, -1, -1)]:
        k = window(t, 0.2, 0.9)
        L = int(90 * k)
        d.line([(cx, cy), (cx + sx * L, cy)], fill=GOLD + (200,), width=3)
        d.line([(cx, cy), (cx, cy + sy * L)], fill=GOLD + (200,), width=3)

    # Hook 0–4.6
    if t < 4.63:
        k_a = window(t, 0.2, 0.9) * (1 - window(t, 2.2, 2.45))
        place(frame, LAYERS["hook_a"], 820, k_a, dy=(1 - window(t, 0.2, 0.9)) * 40)
        k_b = window(t, 0.7, 1.4) * (1 - window(t, 2.2, 2.45))
        place(frame, LAYERS["hook_b"], 930, k_b, dy=(1 - window(t, 0.7, 1.4)) * 40)
        # Gold light sweep across the frame.
        sweep = window(t, 1.2, 2.2)
        if 0 < sweep < 1:
            band = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            bd = ImageDraw.Draw(band)
            x = -400 + sweep * (W + 800)
            bd.polygon([(x, 0), (x + 180, 0), (x - 180, H), (x - 360, H)], fill=(255, 220, 150, 42))
            frame.alpha_composite(band)
        if t >= 2.53:
            k_r = window(t, 2.53, 2.78)
            scale = 1.25 - 0.25 * k_r
            place(frame, LAYERS["red"], 900, clamp(k_r * 1.4) * (1 - window(t, 4.0, 4.3)), dx=dx, dy=dy, scale=scale)
            underline = window(t, 2.9, 3.5)
            d.line([(270, 1000), (270 + 540 * underline, 1000)], fill=RED + (255,), width=8)

    # Icon explainers 4.6–8.75
    if 4.63 <= t < 8.75:
        if 4.63 <= t < 5.93:
            place(frame, LAYERS["exile"], 860, window(t, 4.63, 4.9) * (1 - window(t, 5.7, 5.9)),
                  dy=(1 - window(t, 4.63, 4.9)) * 30)
            pts, p = icon_exile(t)
            stroke_path(d, pts, p, GOLD + (255,), 7)
            if p > 0.95:
                head = pts[-1]
                d.polygon([(head[0] + 22, head[1]), (head[0] - 14, head[1] - 16), (head[0] - 14, head[1] + 16)], fill=GOLD + (255,))
        if 5.93 <= t < 7.27:
            place(frame, LAYERS["war"], 860, window(t, 5.93, 6.2) * (1 - window(t, 7.1, 7.27)),
                  dy=(1 - window(t, 5.93, 6.2)) * 30)
            segments, p = icon_crossed_swords(t)
            for seg in segments:
                stroke_path(d, list(seg), p, GOLD + (255,), 8)
        if 7.27 <= t < 8.75:
            place(frame, LAYERS["king"], 860, window(t, 7.27, 7.5) * (1 - window(t, 8.6, 8.75)),
                  dy=(1 - window(t, 7.27, 7.5)) * 30)
            base, p = icon_crown(t)
            stroke_path(d, base + [base[0]], p, GOLD + (255,), 8)
            if p > 0.9:
                fill_a = int(120 * window(t, 7.9, 8.2))
                d.polygon(base, fill=GOLD + (fill_a,))

    # Title 8.75–11.25
    if 8.75 <= t < 11.6:
        k_t = window(t, 8.75, 9.3) * (1 - window(t, 11.1, 11.5))
        place(frame, LAYERS["title"], 780, k_t, dy=(1 - window(t, 8.75, 9.3)) * 40)
        rule = window(t, 9.3, 10.0)
        d.line([(340, 1000), (340 + 400 * rule, 1000)], fill=GOLD + (255,), width=4)

    # Nile explainer 11.9–14
    if t >= 11.9:
        k_c = window(t, 11.9, 12.4) * (1 - window(t, 13.7, 14.0))
        place(frame, LAYERS["close"], 330, k_c, dy=(1 - window(t, 11.9, 12.4)) * 40)
        main, branch = nile_points()
        p_main = window(t, 12.0, 12.9)
        stroke_path(d, main, p_main, GOLD + (235,), 6)
        p_branch = window(t, 12.8, 13.3)
        stroke_path(d, branch, p_branch, GOLD + (235,), 5)
        for i, (x, y) in enumerate(main[:2] + [main[-1]]):
            if window(t, 12.0 + i * 0.3, 12.3 + i * 0.3) > 0.99:
                d.ellipse([x - 9, y - 9, x + 9, y + 9], fill=CREAM + (255,))
    return frame.convert("RGB")


def main():
    os.makedirs(OUT, exist_ok=True)
    out = os.path.join(OUT, "motion-14s.mp4")
    ff = subprocess.Popen(
        ["ffmpeg", "-y", "-loglevel", "error",
         "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
         "-i", VOICE,
         "-filter_complex", f"[1:a]atrim=0:{LEN},asetpts=PTS-STARTPTS,afade=t=out:st={LEN - 0.7}:d=0.7,"
         "loudnorm=I=-14:TP=-1.5:LRA=11[a]",
         "-map", "0:v", "-map", "[a]", "-t", str(LEN),
         "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out],
        stdin=subprocess.PIPE)
    for n in range(round(LEN * FPS)):
        ff.stdin.write(draw_frame(n / FPS).tobytes())
    ff.stdin.close()
    ff.wait()
    print(out)


if __name__ == "__main__":
    main()
