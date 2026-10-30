"""Manuscript-style test render: first 14 seconds of the reel.

Visual identity: a Mamluk manuscript page. Parchment, ink line work drawn
on in sync with the voice, gold leaf and lapis blue, rubric red for the
dramatic beats, Ruqaa for headings and Amiri (Naskh) for sentences.
Arabic is revealed right-to-left, the way it is written.
"""
import math
import os
import subprocess

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
FONTS = os.path.join(ROOT, "fonts")
VOICE = os.path.join(ROOT, "inputs", "voice.mp3")
OUT = os.path.join(HERE, "out")
W, H, FPS, LEN = 1080, 1920, 30, 14.0
SS = 2  # supersampling for anti-aliased line work

PARCH = (233, 214, 172)
INK = (46, 30, 18)
GOLD = (186, 138, 50)
GOLD_HI = (240, 206, 120)
RUBRIC = (156, 34, 26)
LAPIS = (32, 62, 112)


# ---------------------------------------------------------------- easing

def clamp(x):
    return max(0.0, min(1.0, x))


def ease(x):
    x = clamp(x)
    return 1 - (1 - x) ** 3


def ease_io(x):
    x = clamp(x)
    return x * x * (3 - 2 * x)


def window(t, a, b):
    return ease((t - a) / (b - a))


# ---------------------------------------------------------------- fonts & text

def font(name, size):
    return ImageFont.truetype(os.path.join(FONTS, name), size, layout_engine=ImageFont.Layout.RAQM)


RUQAA = "ArefRuqaa-Bold.ttf"
NASKH = "Amiri-Bold.ttf"


def text_layer(lines, fname, size, colour, gap=1.25):
    """Tight RGBA image of centred RTL lines."""
    f = font(fname, size)
    lh = int(size * gap)
    pad = size // 2
    w = int(max(f.getlength(l, direction="rtl", language="ar") for l in lines)) + 2 * pad
    h = lh * (len(lines) - 1) + size * 2
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for i, line in enumerate(lines):
        d.text((w / 2, size + i * lh), line, font=f, fill=colour + (255,), anchor="mm",
               direction="rtl", language="ar")
    return img.crop(img.getbbox())


def fade(layer, k):
    arr = np.array(layer)
    arr[..., 3] = (arr[..., 3] * clamp(k)).astype(np.uint8)
    return Image.fromarray(arr)


def write_rtl(layer, p, soft=70):
    """Reveal a layer from right to left, like a pen writing Arabic."""
    if p >= 1:
        return layer
    arr = np.array(layer)
    w = arr.shape[1]
    edge = (w + soft) * (1 - ease_io(p)) - soft
    x = np.arange(w)
    mult = np.clip((x - edge) / soft, 0, 1)
    arr[..., 3] = (arr[..., 3] * mult[None, :]).astype(np.uint8)
    return Image.fromarray(arr)


def shine(layer, p):
    """Gold-leaf highlight sweeping across a layer (p: 0→1)."""
    if p <= 0 or p >= 1:
        return layer
    arr = np.array(layer).astype(np.float32)
    h, w = arr.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    centre = -0.3 * w + p * 1.6 * w
    band = np.clip(1 - np.abs((xx + yy * 0.5) - centre) / (0.12 * w), 0, 1)[..., None]
    hi = np.array(GOLD_HI, np.float32)
    arr[..., :3] = arr[..., :3] * (1 - band * 0.8) + hi * band * 0.8
    return Image.fromarray(arr.astype(np.uint8))


def put(canvas, layer, cx, cy, scale=1.0):
    if scale != 1.0:
        layer = layer.resize((max(1, round(layer.width * scale)), max(1, round(layer.height * scale))), Image.LANCZOS)
    canvas.alpha_composite(layer, (round(cx - layer.width / 2), round(cy - layer.height / 2)))


# ---------------------------------------------------------------- parchment

def make_parchment():
    rng = np.random.default_rng(11)

    def noise(scale, amp):
        small = rng.normal(0, 1, (H // scale + 2, W // scale + 2)).astype(np.float32)
        img = Image.fromarray(((small - small.min()) / np.ptp(small) * 255).astype(np.uint8))
        return (np.array(img.resize((W, H), Image.BICUBIC), np.float32) / 255 - 0.5) * amp

    lum = 1 + noise(160, 0.10) + noise(40, 0.07) + noise(6, 0.05) + noise(1, 0.035)
    yy, xx = np.mgrid[0:H, 0:W]
    r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
    burn = 1 - 0.42 * np.clip(r - 0.55, 0, None) ** 1.6
    for _ in range(6):  # faint stains
        sx, sy, rad = rng.uniform(0, W), rng.uniform(0, H), rng.uniform(80, 260)
        burn *= 1 - 0.05 * np.exp(-(((xx - sx) ** 2 + (yy - sy) ** 2) / (2 * rad ** 2)))
    base = np.array(PARCH, np.float32)[None, None, :]
    tint = np.array([1.0, 0.96, 0.88], np.float32)[None, None, :]
    rgb = base * lum[..., None] * burn[..., None] * (tint + (1 - tint) * burn[..., None])
    return Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8)).convert("RGBA")


# ---------------------------------------------------------------- vector helpers (drawn at SS×)

def S(pts):
    return [(x * SS, y * SS) for x, y in pts]


def stroke(d, pts, p, colour, width):
    """Draw the first fraction p of a polyline (by length)."""
    pts = S(pts)
    total = sum(math.dist(pts[i], pts[i + 1]) for i in range(len(pts) - 1))
    want, acc = total * clamp(p), 0.0
    out = [pts[0]]
    for i in range(len(pts) - 1):
        seg = math.dist(pts[i], pts[i + 1])
        if acc + seg >= want:
            k = (want - acc) / seg if seg else 0
            out.append((pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k))
            break
        out.append(pts[i + 1])
        acc += seg
    if len(out) > 1 and p > 0:
        d.line(out, fill=colour, width=width * SS, joint="curve")


def star8(cx, cy, r):
    """Eight-pointed star (two overlapping squares) as one polygon."""
    pts = []
    for i in range(16):
        a = math.pi / 8 * i - math.pi / 2
        rr = r if i % 2 == 0 else r * 0.62
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    return pts


def ellipse_pts(cx, cy, rx, ry, n=90, start=-math.pi / 2):
    return [(cx + rx * math.cos(start + 2 * math.pi * i / n), cy + ry * math.sin(start + 2 * math.pi * i / n))
            for i in range(n + 1)]


def rounded_rect(x0, y0, x1, y1, r, n=10):
    pts = []
    corners = [(x1 - r, y0 + r, -90), (x1 - r, y1 - r, 0), (x0 + r, y1 - r, 90), (x0 + r, y0 + r, 180)]
    for cx, cy, a0 in corners:
        for i in range(n + 1):
            a = math.radians(a0 + 90 * i / n)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts + [pts[0]]


class Vec:
    """A supersampled transparent layer for line work."""

    def __init__(self):
        self.img = Image.new("RGBA", (W * SS, H * SS), (0, 0, 0, 0))
        self.d = ImageDraw.Draw(self.img, "RGBA")

    def done(self):
        return self.img.resize((W, H), Image.LANCZOS)


# ---------------------------------------------------------------- geography

def proj(lon, lat, cx, cy, k):
    return cx + (lon - 30.9) * k * 0.89, cy - (lat - 26.8) * k


EGYPT = [(25.15, 31.6), (27.3, 31.35), (29.9, 31.2), (30.4, 31.45), (31.0, 31.6), (31.82, 31.5), (32.3, 31.27),
         (33.8, 31.15), (34.25, 31.3), (34.9, 29.5), (34.6, 28.6), (34.25, 27.73), (33.7, 28.3), (33.1, 29.0),
         (32.55, 29.95), (32.65, 29.3), (33.1, 28.35), (33.8, 27.25), (33.95, 26.75), (34.3, 26.1),
         (34.9, 25.07), (35.5, 23.9), (35.7, 23.0), (36.6, 22.2), (36.9, 22.0), (31.4, 22.0), (25.0, 22.0),
         (25.0, 29.5), (25.15, 31.6)]
NILE = [(32.9, 24.09), (32.95, 24.45), (32.87, 24.98), (32.64, 25.69), (32.73, 26.16), (32.25, 26.05),
        (31.7, 26.55), (31.18, 27.18), (30.75, 28.1), (31.1, 29.07), (31.24, 30.04), (31.2, 30.3)]
SAID_END = 10  # Aswan → Beni Suef: Upper Egypt
ROSETTA = [(31.2, 30.3), (30.8, 30.8), (30.4, 31.45)]
DAMIETTA = [(31.2, 30.3), (31.45, 30.9), (31.82, 31.48)]


def draw_map(v, t0, t, cx, cy, k, with_said=True, alpha=255):
    P = lambda pts: [proj(lon, lat, cx, cy, k) for lon, lat in pts]
    d = v.d
    stroke(d, P(EGYPT), window(t, t0, t0 + 1.4), INK + (alpha,), 3)
    stroke(d, P(NILE), window(t, t0 + 0.5, t0 + 1.6), LAPIS + (alpha,), 5)
    stroke(d, P(ROSETTA), window(t, t0 + 1.3, t0 + 1.7), LAPIS + (alpha,), 4)
    stroke(d, P(DAMIETTA), window(t, t0 + 1.3, t0 + 1.7), LAPIS + (alpha,), 4)
    if with_said:
        glow = window(t, t0 + 1.2, t0 + 1.9)
        if glow > 0:
            stroke(d, P(NILE[:SAID_END]), glow, GOLD_HI + (int(alpha * 0.9),), 20)
            stroke(d, P(NILE[:SAID_END]), glow, GOLD + (alpha,), 9)
            stroke(d, P(NILE[:SAID_END]), glow, LAPIS + (alpha,), 4)


def compass(v, cx, cy, r, k):
    """Idrisi-style compass rose."""
    if k <= 0:
        return
    d = v.d
    d.polygon(S(star8(cx, cy, r * k)), fill=GOLD + (230,), outline=INK + (255,))
    d.ellipse(S([(cx - r * 0.3 * k, cy - r * 0.3 * k), (cx + r * 0.3 * k, cy + r * 0.3 * k)]), fill=LAPIS + (255,))
    stroke(d, [(cx, cy - r * 1.5 * k), (cx, cy + r * 1.5 * k)], 1, INK + (255,), 2)


# ---------------------------------------------------------------- ornament

def draw_border(v, p):
    """Double gold frame drawn on, then corner stars and a diamond band."""
    m1, m2 = 46, 74
    d = v.d
    outer = [(W / 2, m1), (W - m1, m1), (W - m1, H - m1), (m1, H - m1), (m1, m1), (W / 2, m1)]
    inner = [(W / 2, m2), (W - m2, m2), (W - m2, H - m2), (m2, H - m2), (m2, m2), (W / 2, m2)]
    stroke(d, outer, window(p, 0, 0.7), GOLD + (255,), 4)
    stroke(d, inner, window(p, 0.1, 0.8), GOLD + (255,), 2)
    stroke(d, [(W / 2, 86), (W - 86, 86), (W - 86, H - 86), (86, H - 86), (86, 86), (W / 2, 86)],
           window(p, 0.2, 0.9), INK + (150,), 1)
    band = window(p, 0.6, 1.0)
    if band > 0:
        a = int(255 * band)
        mid = (m1 + m2) / 2
        step = 34
        for x in np.arange(m2 + 20, W - m2 - 10, step):
            for y in (mid, H - mid):
                d.polygon(S([(x, y - 6), (x + 6, y), (x, y + 6), (x - 6, y)]), fill=GOLD + (a,))
        for y in np.arange(m2 + 20, H - m2 - 10, step):
            for x in (mid, W - mid):
                d.polygon(S([(x, y - 6), (x + 6, y), (x, y + 6), (x - 6, y)]), fill=GOLD + (a,))
        for cx, cy in [(mid, mid), (W - mid, mid), (mid, H - mid), (W - mid, H - mid)]:
            d.polygon(S(star8(cx, cy, 30 * band)), fill=GOLD + (255,), outline=INK + (255,))
            d.ellipse(S([(cx - 8 * band, cy - 8 * band), (cx + 8 * band, cy + 8 * band)]), fill=LAPIS + (255,))


def cartouche(v, cx, cy, w, h, p, fill_k):
    d = v.d
    outer = rounded_rect(cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2, h / 2)
    inner = rounded_rect(cx - w / 2 + 10, cy - h / 2 + 10, cx + w / 2 - 10, cy + h / 2 - 10, h / 2 - 10)
    if fill_k > 0:
        d.polygon(S(inner[:-1]), fill=LAPIS + (int(235 * fill_k),))
    stroke(d, outer, p, GOLD + (255,), 4)
    stroke(d, inner, p, GOLD + (255,), 2)
    for sx in (-1, 1):
        ex = cx + sx * (w / 2 + 26)
        if p > 0.8:
            d.polygon(S(star8(ex, cy, 20 * window(p, 0.8, 1.0))), fill=GOLD + (255,))


def icon_route(v, cx, cy, p, colour):
    """Exile: a dashed route leaving a dot, ending in an arrow."""
    d = v.d
    pts = [(cx + 70, cy + 40), (cx + 25, cy - 10), (cx - 20, cy + 20), (cx - 70, cy - 35)]
    d.ellipse(S([(cx + 62, cy + 32), (cx + 78, cy + 48)]), fill=colour)
    n = 9
    for i in range(n):
        a, b = i / n, (i + 0.55) / n
        if a > p:
            break
        seg = sample(pts, a, min(b, p))
        stroke(d, seg, 1, colour, 5)
    if p > 0.95:
        hx, hy = pts[-1]
        d.polygon(S([(hx - 14, hy - 6), (hx + 6, hy - 8), (hx - 2, hy + 12)]), fill=colour)


def sample(pts, a, b, n=8):
    total = [0.0]
    for i in range(len(pts) - 1):
        total.append(total[-1] + math.dist(pts[i], pts[i + 1]))

    def at(s):
        s *= total[-1]
        for i in range(len(pts) - 1):
            if total[i + 1] >= s:
                k = (s - total[i]) / (total[i + 1] - total[i])
                return (pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k)
        return pts[-1]

    return [at(a + (b - a) * j / n) for j in range(n + 1)]


def icon_swords(v, cx, cy, p, colour):
    d = v.d
    for sx in (-1, 1):
        blade = [(cx - sx * 60, cy + 60), (cx + sx * 55, cy - 60)]
        stroke(d, blade, p, colour, 6)
        if p > 0.7:
            gx, gy = cx - sx * 38, cy + 38
            stroke(d, [(gx - 16, gy - 16 * sx * -1), (gx + 16, gy + 16 * sx * -1)], window(p, 0.7, 1), colour, 6)


def icon_crown(v, cx, cy, p, colour, fill_k):
    d = v.d
    pts = [(cx - 70, cy + 45), (cx - 70, cy - 25), (cx - 35, cy + 10), (cx, cy - 50), (cx + 35, cy + 10),
           (cx + 70, cy - 25), (cx + 70, cy + 45), (cx - 70, cy + 45)]
    if fill_k > 0:
        d.polygon(S(pts[:-1]), fill=GOLD + (int(255 * fill_k),))
    stroke(d, pts, p, colour, 5)
    if fill_k > 0.5:
        for x, y in [(cx - 70, cy - 25), (cx, cy - 50), (cx + 70, cy - 25)]:
            d.ellipse(S([(x - 8, y - 8), (x + 8, y + 8)]), fill=RUBRIC + (255,))


# ---------------------------------------------------------------- pages

PAPER = None
TXT = {}


def build_assets():
    global PAPER
    PAPER = make_parchment()
    TXT["hook"] = text_layer(["أشهرُ قبيلةٍ", "في صعيدِ مصر..."], NASKH, 96, INK)
    TXT["med"] = text_layer(["البحر المتوسط"], NASKH, 40, LAPIS)
    TXT["red_sea"] = text_layer(["البحر", "الأحمر"], NASKH, 40, LAPIS)
    TXT["said"] = text_layer(["الصعيد"], RUQAA, 64, GOLD)
    TXT["not_arab"] = text_layer(["ليست عربيةَ الأصل!"], RUQAA, 118, RUBRIC)
    TXT["exile"] = text_layer(["منفيّون"], RUQAA, 118, GOLD_HI)
    TXT["war"] = text_layer(["غُزاة"], RUQAA, 118, GOLD_HI)
    TXT["king"] = text_layer(["ملوك"], RUQAA, 118, GOLD_HI)
    TXT["then"] = text_layer(["ثمّ"], NASKH, 58, INK)
    TXT["title_a"] = text_layer(["حكايةُ"], RUQAA, 92, GOLD_HI)
    TXT["title_b"] = text_layer(["القبائلِ العربيةِ"], RUQAA, 112, GOLD_HI)
    TXT["title_c"] = text_layer(["في مصر"], RUQAA, 92, GOLD_HI)
    TXT["close"] = text_layer(["وستعرفُ أين تعيشُ", "قبيلتُك اليوم"], NASKH, 74, INK)


def page_hook(t):
    page = PAPER.copy()
    v = Vec()
    draw_border(v, window(t, 0.0, 1.3))
    mx, my, mk = 540, 1150, 74
    draw_map(v, 0.3, t, mx, my, mk)
    if t >= 2.53:  # rubric seal around Upper Egypt
        said = [proj(lon, lat, mx, my, mk) for lon, lat in NILE[:SAID_END]]
        cx = sum(x for x, _ in said) / len(said)
        cy = sum(y for _, y in said) / len(said)
        k = window(t, 2.53, 2.75)
        r = 1.35 - 0.35 * k
        stroke(v.d, ellipse_pts(cx, cy, 150 * r, 235 * r), window(t, 2.53, 2.95), RUBRIC + (230,), 7)
        stroke(v.d, ellipse_pts(cx, cy, 166 * r, 251 * r, start=math.pi / 2), window(t, 2.6, 3.0), RUBRIC + (170,), 2)
    compass(v, *proj(26.6, 23.4, mx, my, mk), 34, window(t, 1.3, 1.8))
    page.alpha_composite(v.done())
    sea_k = window(t, 1.3, 1.9)
    if sea_k > 0:
        put(page, fade(TXT["med"], sea_k * 0.85), *proj(29.0, 32.25, mx, my, mk))
        put(page, fade(TXT["red_sea"], sea_k * 0.85), *proj(35.9, 26.3, mx, my, mk))

    hook_k = 1 - window(t, 2.2, 2.5)
    if hook_k > 0:
        put(page, fade(write_rtl(TXT["hook"], (t - 0.1) / 1.8), hook_k), 540, 400)
    said_k = window(t, 1.5, 1.9)
    if said_k > 0:
        said_pt = proj(31.6, 26.6, mx, my, mk)
        put(page, write_rtl(TXT["said"], said_k), said_pt[0] - 200, said_pt[1] - 40)
    if t >= 2.53:
        k = window(t, 2.53, 2.72)
        shake = max(0.0, 1 - (t - 2.53) / 0.4)
        dx = math.sin(t * 95) * 9 * shake
        dy = math.cos(t * 80) * 6 * shake
        put(page, fade(TXT["not_arab"], k * 1.3), 540 + dx, 410 + dy, scale=1.3 - 0.3 * k)
    return page


BEATS = [(4.63, "exile", icon_route), (5.93, "war", icon_swords), (7.27, "king", icon_crown)]


def page_beats(t):
    page = PAPER.copy()
    v = Vec()
    draw_border(v, 1)
    ys = [560, 960, 1360]
    # ink arrows linking the three stages
    for i in range(2):
        start = BEATS[i + 1][0] - 0.25
        stroke(v.d, [(540, ys[i] + 120), (540, ys[i + 1] - 120)], window(t, start, start + 0.3), INK + (220,), 3)
        if t > start + 0.3:
            y = ys[i + 1] - 120
            v.d.polygon(S([(528, y - 14), (552, y - 14), (540, y + 2)]), fill=INK + (220,))
    for i, (t0, key, icon) in enumerate(BEATS):
        if t < t0:
            continue
        active = i == len(BEATS) - 1 or t < BEATS[i + 1][0]
        p = window(t, t0, t0 + 0.45)
        cartouche(v, 540, ys[i], 700, 190, p, window(t, t0 + 0.15, t0 + 0.5))
        colour = GOLD_HI + (255,) if active else GOLD + (200,)
        if key == "exile":
            icon(v, 800, ys[i], window(t, t0 + 0.2, t0 + 0.8), colour)
        elif key == "war":
            icon(v, 800, ys[i], window(t, t0 + 0.2, t0 + 0.7), colour)
        else:
            icon(v, 800, ys[i], window(t, t0 + 0.2, t0 + 0.6), colour, window(t, t0 + 0.55, t0 + 0.8))
    page.alpha_composite(v.done())
    for i, (t0, key, _) in enumerate(BEATS):
        if t < t0:
            continue
        active = i == len(BEATS) - 1 or t < BEATS[i + 1][0]
        word = write_rtl(TXT[key], (t - t0 - 0.1) / 0.45)
        put(page, fade(word, 1 if active else 0.8), 470, ys[i] + 6)
        if i > 0:
            put(page, fade(TXT["then"], window(t, t0 - 0.25, t0 + 0.1)), 610, (ys[i - 1] + ys[i]) / 2)
    return page


def page_title(t):
    page = PAPER.copy()
    v = Vec()
    draw_border(v, 1)
    # Illuminated heading panel (unwan)
    p = window(t, 8.75, 9.3)
    x0, x1, y0, y1 = 150, 930, 300, 860
    if p > 0:
        v.d.rectangle(S([(x0 + 14, y0 + 14), (x1 - 14, y1 - 14)]), fill=LAPIS + (int(245 * window(t, 8.85, 9.3)),))
        stroke(v.d, [(540, y0), (x1, y0), (x1, y1), (x0, y1), (x0, y0), (540, y0)], p, GOLD + (255,), 5)
        stroke(v.d, [(540, y0 + 14), (x1 - 14, y0 + 14), (x1 - 14, y1 - 14), (x0 + 14, y1 - 14), (x0 + 14, y0 + 14),
                     (540, y0 + 14)], p, GOLD + (255,), 2)
        for cx, cy in [(540, y0), (540, y1)]:
            v.d.polygon(S(star8(cx, cy, 34 * window(t, 9.1, 9.5))), fill=GOLD + (255,), outline=INK + (255,))
    # Map tease with tribe pins
    k_map = window(t, 11.9, 12.4)
    if k_map > 0:
        draw_map(v, 11.9, t, 540, 1330, 46, with_said=False, alpha=235)
        pins = [(33.8, 30.6), (31.6, 30.7), (27.2, 30.9), (32.4, 26.0), (34.4, 24.8), (30.8, 29.0)]
        for i, (lon, lat) in enumerate(pins):
            pk = window(t, 12.6 + i * 0.18, 12.9 + i * 0.18)
            if pk <= 0:
                continue
            x, y = proj(lon, lat, 540, 1330, 46)
            y -= (1 - pk) * 50
            v.d.ellipse(S([(x - 13, y - 13), (x + 13, y + 13)]), fill=GOLD + (int(255 * pk),), outline=INK + (int(255 * pk),), width=2 * SS)
            v.d.ellipse(S([(x - 4, y - 4), (x + 4, y + 4)]), fill=RUBRIC + (int(255 * pk),))
    page.alpha_composite(v.done())
    # Heading words, spoken 8.76–10.6
    for key, y, a, b in [("title_a", 430, 8.8, 9.25), ("title_b", 580, 9.25, 10.0), ("title_c", 730, 10.0, 10.5)]:
        if t >= a:
            put(page, shine(write_rtl(TXT[key], (t - a) / (b - a)), (t - 10.6) / 0.9), 540, y)
    if t >= 11.9:
        put(page, write_rtl(TXT["close"], (t - 11.95) / 1.6), 540, 1000)
    return page


# ---------------------------------------------------------------- timeline

PAGES = [(0.0, page_hook), (4.63, page_beats), (8.75, page_title)]
TURN = 0.4  # page-turn wipe length, centred on the cut


def page_at(t):
    current = PAGES[0][1]
    for start, fn in PAGES:
        if t >= start:
            current = fn
    return current(t)


def turn(old, new, p):
    """Right-to-left page turn with a soft shadowed edge."""
    a, b = np.array(old, np.float32), np.array(new, np.float32)
    edge = W * (1 - ease_io(p))
    x = np.arange(W, dtype=np.float32)
    mask = np.clip((x - edge) / 40, 0, 1)[None, :, None]
    shadow = 1 - 0.35 * np.exp(-((x - edge) ** 2) / (2 * 30 ** 2))[None, :, None]
    out = (a * (1 - mask) + b * mask) * shadow
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))


def frame(t):
    for start, fn in PAGES[1:]:
        if start - TURN / 2 <= t < start + TURN / 2:
            idx = [s for s, _ in PAGES].index(start)
            old = PAGES[idx - 1][1](t)
            new = fn(max(t, start))
            img = turn(old, new, (t - (start - TURN / 2)) / TURN)
            break
    else:
        img = page_at(t)
    # slow push-in on every page
    start = max(s for s, _ in PAGES if s <= t)
    z = 1 + 0.025 * ease_io((t - start) / 5)
    if z > 1.0005:
        big = img.resize((round(W * z), round(H * z)), Image.BICUBIC)
        ox, oy = (big.width - W) // 2, (big.height - H) // 2
        img = big.crop((ox, oy, ox + W, oy + H))
    return img.convert("RGB")


# ---------------------------------------------------------------- audio

def sfx_track(path):
    """Light, synthesised accents: a low stamp thud and two paper turns."""
    graph = (
        "sine=f=55:d=0.6,afade=t=out:st=0:d=0.6:curve=exp,volume=0.55[thud];"
        "anoisesrc=d=0.08:c=brown:a=0.6,afade=t=out:st=0:d=0.08[click];"
        "[thud][click]amix=inputs=2:normalize=0,adelay=2530|2530[stamp];"
        "anoisesrc=d=0.5:c=pink:a=0.25,highpass=f=900,lowpass=f=6000,"
        "afade=t=in:d=0.15,afade=t=out:st=0.2:d=0.3,asplit=2[p1][p2];"
        "[p1]adelay=4480|4480[turn1];[p2]adelay=8600|8600[turn2];"
        f"[stamp][turn1][turn2]amix=inputs=3:normalize=0,apad=whole_dur={LEN}[out]"
    )
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-filter_complex", graph, "-map", "[out]",
                    "-ac", "2", "-ar", "44100", "-t", str(LEN), path], check=True)


def main():
    os.makedirs(OUT, exist_ok=True)
    build_assets()
    sfx = os.path.join(OUT, "sfx-14s.wav")
    sfx_track(sfx)
    out = os.path.join(OUT, "manuscript-14s.mp4")
    ff = subprocess.Popen(
        ["ffmpeg", "-y", "-loglevel", "error",
         "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
         "-i", VOICE, "-i", sfx,
         "-filter_complex",
         f"[1:a]atrim=0:{LEN},asetpts=PTS-STARTPTS,aformat=channel_layouts=stereo:sample_rates=44100[v];"
         "[2:a]volume=0.35[s];"
         f"[v][s]amix=inputs=2:normalize=0,afade=t=out:st={LEN - 0.6}:d=0.6,"
         "loudnorm=I=-14:TP=-1.5:LRA=11[a]",
         "-map", "0:v", "-map", "[a]", "-t", str(LEN),
         "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", out],
        stdin=subprocess.PIPE)
    for n in range(round(LEN * FPS)):
        ff.stdin.write(frame(n / FPS).tobytes())
    ff.stdin.close()
    if ff.wait() != 0:
        raise SystemExit("ffmpeg failed")
    print(out)


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:  # preview stills: python3 make_manuscript.py 1.5 3.2 ...
        os.makedirs(os.path.join(OUT, "stills"), exist_ok=True)
        build_assets()
        for arg in sys.argv[1:]:
            frame(float(arg)).save(os.path.join(OUT, "stills", f"ms_{arg}.png"))
    else:
        main()
