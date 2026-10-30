"""Drawing toolkit for the reel: dark-gold documentary look.

Everything here is pure rendering: fonts and text sprites, gold-framed photos,
star windows, medallions, the golden thread, cards, counters, karaoke
subtitles, satellite map camera, background, grain and light leaks.
"""
import json
import math
import os
from functools import lru_cache

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
FONTS = os.path.join(ROOT, "fonts")
PHOTOS = os.path.join(ROOT, "assets", "photos")
MAPDIR = os.path.join(ROOT, "assets", "map")

W, H, FPS = 1080, 1920, 30

BG_DARK = (14, 8, 5)
GOLD = (214, 166, 84)
GOLD_LIGHT = (252, 224, 158)
GOLD_DARK = (138, 92, 38)
CREAM = (246, 236, 214)
DIM = (150, 128, 100)
RED = (206, 58, 40)


# ---------------------------------------------------------------- maths

def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def ease_out(x):
    x = clamp(x)
    return 1 - (1 - x) ** 3


def ease_io(x):
    x = clamp(x)
    return x * x * x * (x * (x * 6 - 15) + 10)


def win(t, a, b):
    """Eased 0→1 over [a, b]."""
    if b <= a:
        return 1.0 if t >= a else 0.0
    return ease_out((t - a) / (b - a))


def life(t, a, b, fin=0.45, fout=0.4):
    """Opacity envelope: fade in at a, fade out ending at b."""
    return win(t, a, a + fin) * (1 - win(t, b - fout, b))


def lerp(a, b, k):
    return a + (b - a) * k


def to_arabic_digits(s):
    return str(s).translate(str.maketrans("0123456789,", "٠١٢٣٤٥٦٧٨٩٬"))


# ---------------------------------------------------------------- fonts / text

RUQAA = "ArefRuqaa-Bold.ttf"
NASKH = "Amiri-Bold.ttf"
NASKH_REG = "Amiri-Regular.ttf"
SANS = "Cairo-Variable.ttf"


@lru_cache(maxsize=None)
def font(name, size, weight=700):
    f = ImageFont.truetype(os.path.join(FONTS, name), size, layout_engine=ImageFont.Layout.RAQM)
    if name == SANS:
        f.set_variation_by_axes([weight if a["name"] == b"Weight" else a["default"] for a in f.get_variation_axes()])
    return f


def text_mask(text, fname, size, weight=700, pad=None):
    f = font(fname, size, weight)
    pad = size // 2 if pad is None else pad
    l, t, r, b = f.getbbox(text, direction="rtl", language="ar")
    w, h = r - l + 2 * pad, b - t + 2 * pad
    m = Image.new("L", (w, h), 0)
    ImageDraw.Draw(m).text((pad - l, pad - t), text, font=f, fill=255, direction="rtl", language="ar")
    return m


PALETTES = {
    "gold": [(255, 236, 178), (232, 186, 98), (176, 118, 46)],
    "silver": [(255, 252, 246), (222, 214, 200), (160, 148, 130)],
    "red": [(255, 136, 104), (214, 62, 40), (140, 26, 14)],
    "cream": [CREAM, CREAM, CREAM],
    "white": [(255, 255, 255)] * 3,
    "dim": [DIM] * 3,
}
GLOWS = {"gold": (255, 176, 80), "silver": (255, 230, 190), "red": (255, 60, 30)}


def gradient(h, stops):
    ys = np.linspace(0, 1, h)[:, None]
    a, b, c = (np.array(s, np.float32) for s in stops)
    top = a + (b - a) * np.clip(ys * 2, 0, 1)
    bot = b + (c - b) * np.clip(ys * 2 - 1, 0, 1)
    return np.where(ys < 0.5, top, bot)


@lru_cache(maxsize=None)
def text_sprite(text, fname, size, style="gold", glow=0.0, shadow=0.0, weight=700):
    """Metallic/plain text with optional glow and soft shadow, tight RGBA."""
    pad = int(size * 0.6)
    m = text_mask(text, fname, size, weight, pad)
    w, h = m.size
    grad = gradient(h, PALETTES[style])[:, None, :].repeat(w, axis=1)
    rgba = np.zeros((h, w, 4), np.float32)
    mask = np.asarray(m, np.float32) / 255
    if shadow:
        sh = np.asarray(m.filter(ImageFilter.GaussianBlur(size * 0.12)), np.float32) / 255 * shadow
        sh = np.roll(sh, (int(size * 0.06), 0), axis=(0, 1))
        rgba[..., 3] = sh
    if glow:
        g = np.asarray(m.filter(ImageFilter.GaussianBlur(size * 0.22)), np.float32) / 255 * glow
        col = np.array(GLOWS.get(style, GLOWS["gold"]), np.float32)
        a_new = g + rgba[..., 3] * (1 - g)
        rgba[..., :3] = col * g[..., None]
        rgba[..., 3] = a_new
    a_out = mask + rgba[..., 3] * (1 - mask)
    rgb = (grad * mask[..., None] + rgba[..., :3] * (rgba[..., 3] * (1 - mask))[..., None]) / np.maximum(a_out, 1e-4)[..., None]
    out = np.dstack([rgb, a_out * 255]).clip(0, 255).astype(np.uint8)
    return Image.fromarray(out, "RGBA")


def alpha_mul(img, k):
    if k >= 0.999:
        return img
    arr = np.array(img)
    arr[..., 3] = (arr[..., 3].astype(np.float32) * clamp(k)).astype(np.uint8)
    return Image.fromarray(arr, "RGBA")


def shine(img, p, strength=0.75):
    """Light sweep across a sprite (p in 0..1)."""
    if not 0 < p < 1:
        return img
    arr = np.array(img).astype(np.float32)
    h, w = arr.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    c = -0.4 * w + p * 1.8 * w
    band = np.clip(1 - np.abs(xx + yy * 0.6 - c) / (0.14 * w), 0, 1)[..., None] * strength
    arr[..., :3] = arr[..., :3] * (1 - band) + 255 * band
    return Image.fromarray(arr.clip(0, 255).astype(np.uint8), "RGBA")


def paste(canvas, sprite, cx, cy, alpha=1.0, scale=1.0, rot=0.0):
    """Composite a sprite centred at (cx, cy)."""
    if alpha <= 0.003 or sprite is None:
        return
    if scale != 1.0:
        sprite = sprite.resize((max(1, round(sprite.width * scale)), max(1, round(sprite.height * scale))), Image.BICUBIC)
    if abs(rot) > 0.05:
        sprite = sprite.rotate(rot, Image.BICUBIC, expand=True)
    sprite = alpha_mul(sprite, alpha)
    x, y = round(cx - sprite.width / 2), round(cy - sprite.height / 2)
    if x >= W or y >= H or x + sprite.width <= 0 or y + sprite.height <= 0:
        return
    canvas.alpha_composite(sprite, (max(0, x), max(0, y)), (max(0, -x), max(0, -y)))


# ---------------------------------------------------------------- photos / frames

@lru_cache(maxsize=None)
def photo(slug):
    return Image.open(os.path.join(PHOTOS, slug + ".jpg")).convert("RGB")


def cover(img, w, h, focus=(0.5, 0.5)):
    s = max(w / img.width, h / img.height)
    r = img.resize((math.ceil(img.width * s), math.ceil(img.height * s)), Image.LANCZOS)
    x = int((r.width - w) * focus[0])
    y = int((r.height - h) * focus[1])
    return r.crop((x, y, x + w, y + h))


def gold_rect_band(w, h, band):
    """Metallic gold rectangle ring as RGBA."""
    grad = gradient(h, [(250, 222, 150), (196, 146, 66), (120, 80, 30)])[:, None, :].repeat(w, axis=1)
    diag = (np.linspace(0, 1, w)[None, :] + np.linspace(0, 1, h)[:, None]) / 2
    grad = grad * (0.85 + 0.3 * np.sin(diag * 9)[..., None] * 0.5)
    a = np.zeros((h, w), np.float32)
    a[:, :] = 255
    a[band:h - band, band:w - band] = 0
    return Image.fromarray(np.dstack([grad.clip(0, 255), a]).astype(np.uint8), "RGBA")


@lru_cache(maxsize=None)
def frame_sprite(slug, w, h, focus=(0.5, 0.5)):
    """Photo in a gold frame with inner rule, corner ticks and a drop shadow."""
    band, margin = 14, 60
    pic = cover(photo(slug), w - 2 * band, h - 2 * band, focus)
    card = Image.new("RGBA", (w, h))
    card.paste(pic, (band, band))
    card.alpha_composite(gold_rect_band(w, h, band))
    d = ImageDraw.Draw(card, "RGBA")
    i = band + 14
    d.rectangle([i, i, w - i, h - i], outline=GOLD_LIGHT + (150,), width=2)
    for cx, cy, sx, sy in [(i, i, 1, 1), (w - i, i, -1, 1), (i, h - i, 1, -1), (w - i, h - i, -1, -1)]:
        d.line([(cx + sx * 8, cy + sy * 8), (cx + sx * 40, cy + sy * 8)], fill=GOLD_LIGHT + (220,), width=2)
        d.line([(cx + sx * 8, cy + sy * 8), (cx + sx * 8, cy + sy * 40)], fill=GOLD_LIGHT + (220,), width=2)
    # vignette inside the photo so it sits in the dark world
    vg = Image.radial_gradient("L").resize((w - 2 * band, h - 2 * band))
    dark = Image.new("RGBA", vg.size, (8, 4, 2, 0))
    dark.putalpha(vg.point(lambda v: int(max(0, v - 120) * 0.9)))
    card.alpha_composite(dark, (band, band))
    out = Image.new("RGBA", (w + 2 * margin, h + 2 * margin), (0, 0, 0, 0))
    sh = Image.new("L", out.size, 0)
    ImageDraw.Draw(sh).rectangle([margin + 10, margin + 24, margin + w + 10, margin + h + 24], fill=200)
    out.putalpha(sh.filter(ImageFilter.GaussianBlur(26)))
    out.alpha_composite(card, (margin, margin))
    return out


def star_points(cx, cy, r, inner=0.80, rot=0.0, n=8):
    pts = []
    for i in range(n * 2):
        a = math.pi / n * i - math.pi / 2 + rot
        rr = r if i % 2 == 0 else r * inner
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    return pts


@lru_cache(maxsize=None)
def star_window(slug, r, focus=(0.5, 0.5)):
    """Photo seen through an eight-pointed star, with gold outlines."""
    ss = 2
    size = int(r * 2.5)
    c = size / 2
    mask = Image.new("L", (size * ss, size * ss), 0)
    ImageDraw.Draw(mask).polygon([(x * ss, y * ss) for x, y in star_points(c, c, r, 0.78)], fill=255)
    mask = mask.resize((size, size), Image.LANCZOS)
    pic = cover(photo(slug), size, size, focus).convert("RGBA")
    pic.putalpha(mask)
    shade = Image.radial_gradient("L").resize((size, size))
    dark = Image.new("RGBA", (size, size), (10, 5, 2, 0))
    dark.putalpha(Image.eval(shade, lambda v: int(max(0, v - 60) * 0.85)))
    dark.putalpha(Image.fromarray(np.minimum(np.asarray(dark.getchannel("A")), np.asarray(mask))))
    pic.alpha_composite(dark)
    lines = Image.new("RGBA", (size * ss, size * ss))
    d = ImageDraw.Draw(lines)
    for rr, wd, a in [(r, 3, 255), (r * 1.1, 2, 150)]:
        pts = [(x * ss, y * ss) for x, y in star_points(c, c, rr, 0.78)]
        d.line(pts + [pts[0]], fill=GOLD + (a,), width=wd * ss, joint="curve")
    pts = [(x * ss, y * ss) for x, y in star_points(c, c, r * 1.22, 0.70, rot=math.pi / 8)]
    d.line(pts + [pts[0]], fill=GOLD + (70,), width=2 * ss, joint="curve")
    pic.alpha_composite(lines.resize((size, size), Image.LANCZOS))
    return pic


@lru_cache(maxsize=None)
def medallion_sprite(r, colour=GOLD, alpha=255):
    """Two interlaced squares and rings: the star medallion behind tribe names."""
    ss = 2
    size = int(r * 2.6)
    c = size * ss / 2
    img = Image.new("RGBA", (size * ss, size * ss))
    d = ImageDraw.Draw(img)
    for k in range(2):
        pts = [(c + r * ss * math.cos(math.pi / 4 * k + math.pi / 2 * i + math.pi / 4),
                c + r * ss * math.sin(math.pi / 4 * k + math.pi / 2 * i + math.pi / 4)) for i in range(4)]
        d.line(pts + [pts[0]], fill=colour + (alpha,), width=3 * ss, joint="curve")
    for rr, a in [(0.72, 200), (1.18, 90)]:
        d.ellipse([c - r * rr * ss, c - r * rr * ss, c + r * rr * ss, c + r * rr * ss], outline=colour + (int(a * alpha / 255),), width=2 * ss)
    inner = Image.new("L", img.size, 0)
    ImageDraw.Draw(inner).ellipse([c - r * 0.7 * ss, c - r * 0.7 * ss, c + r * 0.7 * ss, c + r * 0.7 * ss], fill=150)
    inner = inner.filter(ImageFilter.GaussianBlur(20 * ss))
    base = Image.new("RGBA", img.size, (12, 7, 4, 0))
    base.putalpha(inner)
    base.alpha_composite(img)
    return base.resize((size, size), Image.LANCZOS)


@lru_cache(maxsize=None)
def card_sprite(w, h, border=GOLD, fill=(20, 12, 7, 225)):
    ss = 2
    img = Image.new("RGBA", (w * ss, h * ss))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, w * ss - 1, h * ss - 1], radius=14 * ss, fill=fill, outline=border + (210,), width=2 * ss)
    d.rounded_rectangle([10 * ss, 10 * ss, w * ss - 10 * ss, h * ss - 10 * ss], radius=8 * ss, outline=border + (70,), width=1 * ss)
    img = img.resize((w, h), Image.LANCZOS)
    out = Image.new("RGBA", (w + 80, h + 80))
    sh = Image.new("L", out.size, 0)
    ImageDraw.Draw(sh).rounded_rectangle([40, 52, 40 + w, 52 + h], radius=14, fill=170)
    out.putalpha(sh.filter(ImageFilter.GaussianBlur(18)))
    out.alpha_composite(img, (40, 40))
    return out


@lru_cache(maxsize=None)
def orb_sprite(r=70):
    size = r * 2
    yy, xx = np.mgrid[0:size, 0:size]
    d = np.sqrt((xx - r) ** 2 + (yy - r) ** 2) / r
    glow = np.exp(-(d * 3.2) ** 2) * 0.9 + np.exp(-(d * 9) ** 2)
    core = np.clip(1 - d * 6, 0, 1)
    rgb = np.dstack([np.full_like(d, 255), 200 + 55 * core, 120 + 135 * core])
    a = np.clip(glow, 0, 1) * 255
    return Image.fromarray(np.dstack([rgb, a]).clip(0, 255).astype(np.uint8), "RGBA")


@lru_cache(maxsize=None)
def comment_icon(size=220):
    ss = 2
    s = size * ss
    img = Image.new("RGBA", (s, s))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([s * 0.08, s * 0.12, s * 0.92, s * 0.72], radius=s * 0.14, outline=GOLD_LIGHT + (255,), width=int(s * 0.04))
    d.polygon([(s * 0.26, s * 0.70), (s * 0.24, s * 0.90), (s * 0.44, s * 0.70)], fill=GOLD_LIGHT + (255,))
    return img.resize((size, size), Image.LANCZOS)


# ---------------------------------------------------------------- background

def _star_tile(size=360):
    ss = 2
    img = Image.new("L", (size * ss, size * ss), 0)
    d = ImageDraw.Draw(img)
    for cx in (0, size / 2, size):
        for cy in (0, size / 2, size):
            if (cx in (0, size)) != (cy in (0, size)):
                continue
            for rr in (size * 0.30,):
                pts = [(x * ss, y * ss) for x, y in star_points(cx, cy, rr, 0.62)]
                d.line(pts + [pts[0]], fill=255, width=2 * ss)
            pts = [(x * ss, y * ss) for x, y in star_points(cx, cy, size * 0.17, 0.75, rot=math.pi / 8)]
            d.line(pts + [pts[0]], fill=150, width=1 * ss)
    return img.resize((size, size), Image.LANCZOS)


class Background:
    def __init__(self):
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        r = np.sqrt(((xx - W * 0.5) / W) ** 2 + ((yy - H * 0.30) / (H * 0.75)) ** 2)
        glow = np.exp(-(r * 1.9) ** 2)
        base = np.array(BG_DARK, np.float32) + np.array([46, 30, 17], np.float32) * glow[..., None]
        edge = np.clip(1 - 0.55 * np.clip(r - 0.45, 0, None) * 1.6, 0.35, 1)
        self.base = Image.fromarray((base * edge[..., None]).clip(0, 255).astype(np.uint8)).convert("RGBA")
        tile = _star_tile()
        self.tile = tile
        fade = np.clip(1.15 - r * 1.1, 0.15, 1)
        self.pattern_alpha = (fade * 34).astype(np.float32)

    def render(self, cam_x, cam_y, strength=1.0):
        img = self.base.copy()
        if strength <= 0:
            return img
        t = self.tile.size[0]
        ox, oy = int(-cam_x * 0.35) % t, int(-cam_y * 0.35) % t
        big = Image.new("L", (W + t, H + t))
        for x in range(0, W + t, t):
            for y in range(0, H + t, t):
                big.paste(self.tile, (x, y))
        pat = np.asarray(big.crop((t - ox, t - oy, t - ox + W, t - oy + H)), np.float32) / 255
        a = (pat * self.pattern_alpha * strength).astype(np.uint8)
        layer = Image.new("RGBA", (W, H), GOLD + (0,))
        layer.putalpha(Image.fromarray(a))
        img.alpha_composite(layer)
        return img


class Finisher:
    """Film grain, drifting warm light leaks and edge vignette."""

    def __init__(self, seed=3):
        rng = np.random.default_rng(seed)
        self.grain = [rng.normal(0, 1, (H // 2, W // 2)).astype(np.float32) for _ in range(6)]
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
        self.vig = np.clip(1 - 0.38 * np.clip(r - 0.6, 0, None) ** 1.4, 0, 1)[..., None]
        self.leak = Image.radial_gradient("L").resize((1300, 1300))

    def apply(self, img, t, flash=None):
        leak = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        for k, (bx, by, col, amp) in enumerate([(0.9, 0.08, (255, 150, 60), 0.16), (0.05, 0.75, (255, 110, 40), 0.10)]):
            x = int(W * bx + 120 * math.sin(t * 0.21 + k * 2))
            y = int(H * by + 160 * math.cos(t * 0.17 + k))
            a = amp * (0.75 + 0.25 * math.sin(t * 0.5 + k * 1.7))
            blob = Image.new("RGBA", self.leak.size, col + (0,))
            blob.putalpha(self.leak.point(lambda v, a=a: int((255 - v) * a)))
            leak.paste(blob, (x - 650, y - 650), blob)
        img.alpha_composite(leak)
        arr = np.asarray(img.convert("RGB"), np.float32)
        if flash:
            col, a = flash
            arr = arr * (1 - a) + np.array(col, np.float32) * a
        g = self.grain[int(t * FPS) % len(self.grain)]
        g = np.asarray(Image.fromarray(g).resize((W, H), Image.BILINEAR))[..., None]
        arr = arr * self.vig + g * 5.5
        return Image.fromarray(arr.clip(0, 255).astype(np.uint8))


# ---------------------------------------------------------------- golden thread

def bezier(p0, p1, p2, p3, n=48):
    pts = []
    for i in range(n + 1):
        u = i / n
        a, b, c, d = (1 - u) ** 3, 3 * u * (1 - u) ** 2, 3 * u * u * (1 - u), u ** 3
        pts.append((a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]))
    return pts


def polyline_until(pts, k):
    """First fraction k (by length) of a polyline, and the end point."""
    if k <= 0:
        return [pts[0]], pts[0]
    seg = [math.dist(pts[i], pts[i + 1]) for i in range(len(pts) - 1)]
    want = sum(seg) * clamp(k)
    out = [pts[0]]
    acc = 0.0
    for i, s in enumerate(seg):
        if acc + s >= want:
            u = (want - acc) / s if s else 0
            end = (pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u)
            out.append(end)
            return out, end
        out.append(pts[i + 1])
        acc += s
    return out, pts[-1]


def draw_glow_lines(canvas, lines, colour=GOLD_LIGHT, width=3, glow=10, glow_alpha=0.85, core_alpha=1.0):
    """lines: list of point lists in screen coords. Soft glow + bright core."""
    lines = [l for l in lines if len(l) > 1]
    if not lines:
        return
    half = Image.new("L", (W // 2, H // 2), 0)
    d = ImageDraw.Draw(half)
    for l in lines:
        d.line([(x / 2, y / 2) for x, y in l], fill=255, width=max(2, width + 2), joint="curve")
    g = half.filter(ImageFilter.GaussianBlur(glow / 2)).resize((W, H), Image.BILINEAR)
    layer = Image.new("RGBA", (W, H), (255, 170, 70, 0))
    layer.putalpha(g.point(lambda v: int(min(255, v * 2.2 * glow_alpha))))
    canvas.alpha_composite(layer)
    core = Image.new("RGBA", (W, H))
    dc = ImageDraw.Draw(core)
    for l in lines:
        dc.line(l, fill=colour + (int(255 * core_alpha),), width=width, joint="curve")
    canvas.alpha_composite(core)


def sparkles(canvas, x, y, t, n=7, spread=60, seed=0):
    d = ImageDraw.Draw(canvas, "RGBA")
    for i in range(n):
        ph = (t * 0.9 + i / n + seed * 0.37) % 1
        ang = i * 2.39996 + seed
        rr = spread * ph
        px = x + math.cos(ang) * rr
        py = y + math.sin(ang) * rr + ph * 30
        a = int(220 * (1 - ph))
        s = 2.5 * (1 - ph) + 0.8
        d.ellipse([px - s, py - s, px + s, py + s], fill=GOLD_LIGHT + (a,))


# ---------------------------------------------------------------- map

class MapLayer:
    """Sentinel-2 cloudless mosaic, graded to dark gold, with a lon/lat camera."""

    def __init__(self, name):
        with open(os.path.join(MAPDIR, name + ".txt")) as f:
            z, ox, oy = (int(v) for v in f.read().split())
        self.z, self.ox, self.oy = z, ox, oy
        self.img = self._grade(Image.open(os.path.join(MAPDIR, name + ".jpg")).convert("RGB"))
        self.ppd = 256 * 2 ** z / 360.0

    @staticmethod
    def _grade(im):
        a = np.asarray(im, np.float32) / 255
        lum = 0.3 * a[..., 0] + 0.55 * a[..., 1] + 0.15 * a[..., 2]
        blue = np.clip(a[..., 2] - a[..., 0], 0, 1)
        green = np.clip(a[..., 1] - a[..., 0] * 0.95, 0, 1)
        l = np.clip((lum - 0.10) / 0.62, 0, 1) ** 1.35
        l = l * (1 - np.clip(blue * 7, 0, 0.95)) * (1 - np.clip(green * 4, 0, 0.6))
        s, m, h = (np.array(c, np.float32) for c in [(8, 5, 3), (96, 64, 30), (205, 158, 92)])
        lo, hi = np.clip(l * 2, 0, 1)[..., None], np.clip(l * 2 - 1, 0, 1)[..., None]
        rgb = np.where(l[..., None] < 0.5, s + (m - s) * lo, m + (h - m) * hi)
        return Image.fromarray(rgb.clip(0, 255).astype(np.uint8))

    def px(self, lon, lat):
        n = 256 * 2 ** self.z
        x = (lon + 180) / 360 * n
        y = (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n
        return x - self.ox, y - self.oy

    def view(self, lon, lat, span):
        """Return (image, project) for a camera centred at lon/lat showing `span` degrees across."""
        cx, cy = self.px(lon, lat)
        cw = span * self.ppd
        ch = cw * H / W
        box = (cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2)
        if box[0] >= 0 and box[1] >= 0 and box[2] <= self.img.width and box[3] <= self.img.height:
            img = self.img.resize((W, H), Image.BILINEAR, box=box)
        else:  # parts of the view fall outside the mosaic: affine sample with a dark fill
            img = self.img.transform((W, H), Image.AFFINE, (cw / W, 0, box[0], 0, ch / H, box[1]),
                                     Image.BILINEAR, fillcolor=(8, 5, 3))
        sx = W / cw

        def project(lo, la):
            x, y = self.px(lo, la)
            return (x - box[0]) * sx, (y - box[1]) * sx

        return img.convert("RGBA"), project


def load_geo(name):
    with open(os.path.join(MAPDIR, name), encoding="utf-8") as f:
        return json.load(f)


def rings(geom):
    t, c = geom["type"], geom["coordinates"]
    if t == "Polygon":
        return [c[0]]
    if t == "MultiPolygon":
        return [p[0] for p in c]
    if t == "LineString":
        return [c]
    if t == "MultiLineString":
        return c
    return []


# ---------------------------------------------------------------- subtitles

class Subtitles:
    """Karaoke captions: spoken words bright, upcoming words dim."""

    SIZE = 46
    Y = 1470
    MAXW = 900

    def __init__(self, words, blocks):
        self.words = words
        self.blocks = blocks  # list of (start, end, [word indices])
        self.font = font(SANS, self.SIZE, 700)
        self.space = self.font.getlength(" ", direction="rtl", language="ar")

    @lru_cache(maxsize=4096)
    def word_sprite(self, text):
        m = text_mask(text, SANS, self.SIZE, 700, pad=14)
        sh = m.filter(ImageFilter.GaussianBlur(6))
        img = Image.new("RGBA", m.size, (0, 0, 0, 0))
        dark = Image.new("RGBA", m.size, (0, 0, 0, 255))
        img = Image.composite(dark, img, sh.point(lambda v: int(v * 0.75)))
        white = Image.new("RGBA", m.size, (255, 251, 242, 255))
        img = Image.composite(white, img, m)
        a = np.maximum(np.asarray(sh, np.float32) * 0.75, np.asarray(m, np.float32))
        img.putalpha(Image.fromarray(a.astype(np.uint8)))
        return img

    def layout(self, idxs):
        """Greedy line breaking right-to-left; returns [(idx, x_right, line)]."""
        lines, cur, curw = [], [], 0.0
        for i in idxs:
            w = self.font.getlength(self.words[i]["w"], direction="rtl", language="ar")
            if cur and curw + self.space + w > self.MAXW:
                lines.append((cur, curw))
                cur, curw = [], 0.0
            cur.append((i, w))
            curw += w + (self.space if len(cur) > 1 else 0)
        if cur:
            lines.append((cur, curw))
        out = []
        for li, (items, lw) in enumerate(lines):
            x = W / 2 + lw / 2
            for i, w in items:
                out.append((i, x - w / 2, li))
                x -= w + self.space
        return out, len(lines)

    def draw(self, canvas, t):
        for start, end, idxs in self.blocks:
            if not (start - 0.2 <= t <= end):
                continue
            a = life(t, start - 0.2, end, 0.2, 0.25)
            placed, nlines = self.layout(tuple(idxs))
            lh = self.SIZE * 1.55
            y0 = self.Y - (nlines - 1) * lh / 2
            for i, cx, li in placed:
                wd = self.words[i]
                k = clamp((t - wd["s"]) / 0.14) if wd["s"] is not None else 1
                op = (0.30 + 0.70 * k) * a
                sp = self.word_sprite(wd["w"])
                paste(canvas, sp, cx, y0 + li * lh, op)
