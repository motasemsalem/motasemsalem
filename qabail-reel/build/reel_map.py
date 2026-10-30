"""Satellite map shots: multi-resolution camera plus routes, pins and regions."""
import math

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

from reel_lib import (CREAM, GOLD, GOLD_LIGHT, NASKH_REG, RED, SANS, W, H, MapLayer, clamp, draw_glow_lines,
                      ease_io, life, load_geo, orb_sprite, paste, polyline_until, rings, text_sprite, win)


class MapCamera:
    """Keyframed lon/lat/span camera; picks the sharpest mosaic for each frame."""

    def __init__(self, keys):
        self.keys = keys  # [(t, lon, lat, span)]

    def at(self, t):
        ks = self.keys
        if t <= ks[0][0]:
            return ks[0][1:]
        for (t0, *a), (t1, *b) in zip(ks, ks[1:]):
            if t0 <= t <= t1:
                k = ease_io((t - t0) / (t1 - t0)) if t1 > t0 else 1
                # zoom interpolates in log space so it feels like a smooth push
                span = math.exp(math.log(a[2]) + (math.log(b[2]) - math.log(a[2])) * k)
                return a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, span
        return ks[-1][1:]


class MapView:
    LAYERS = None

    @classmethod
    def layers(cls):
        if cls.LAYERS is None:
            cls.LAYERS = [MapLayer("egypt_z8"), MapLayer("mid_z7"), MapLayer("region_z6"), MapLayer("world_z5")]
        return cls.LAYERS

    @staticmethod
    def fits(layer, lon, lat, span):
        x0, y0 = layer.px(lon - span / 2, lat)
        x1, _ = layer.px(lon + span / 2, lat)
        cw = x1 - x0
        ch = cw * H / W
        cx, cy = layer.px(lon, lat)
        return cx - cw / 2 >= 0 and cy - ch / 2 >= 0 and cx + cw / 2 <= layer.img.width and cy + ch / 2 <= layer.img.height

    def render(self, lon, lat, span):
        """Pick the most detailed mosaic that covers the view (upscale <= ~2.6x)."""
        for layer in self.layers():
            if self.fits(layer, lon, lat, span) and span * layer.ppd >= W / 2.6:
                return layer.view(lon, lat, span)
        for layer in reversed(self.layers()):
            if self.fits(layer, lon, lat, span):
                return layer.view(lon, lat, span)
        return self.layers()[-1].view(lon, lat, span)


GOVS = None


def governorates():
    global GOVS
    if GOVS is None:
        GOVS = {f["properties"]["name"]: rings(f["geometry"]) for f in load_geo("egypt_governorates.geojson")["features"]}
    return GOVS


class Route:
    """A glowing route drawn from start to end over [t0, t1], with an orb at its head."""

    def __init__(self, t0, t1, pts, hold=None, style="gold", width=4, arrow=True, dashed=False, fade_at=None):
        self.t0, self.t1, self.pts = t0, t1, pts
        self.style, self.width, self.arrow, self.dashed = style, width, arrow, dashed
        self.fade_at = fade_at

    def draw(self, c, t, proj):
        if t < self.t0:
            return
        a = 1.0 if self.fade_at is None else 1 - win(t, self.fade_at, self.fade_at + 0.5)
        if a <= 0:
            return
        k = ease_io((t - self.t0) / (self.t1 - self.t0))
        dense = []
        for (lo0, la0), (lo1, la1) in zip(self.pts, self.pts[1:]):
            for i in range(12):
                u = i / 12
                dense.append(proj(lo0 + (lo1 - lo0) * u, la0 + (la1 - la0) * u))
        dense.append(proj(*self.pts[-1]))
        part, head = polyline_until(dense, k)
        colour = GOLD_LIGHT if self.style == "gold" else (255, 110, 80)
        if self.dashed:
            segs = []
            for i in range(0, len(part) - 1, 2):
                segs.append(part[i:i + 2])
            draw_glow_lines(c, segs, colour, self.width, 8, 0.7 * a, a)
        else:
            draw_glow_lines(c, [part], colour, self.width, 12, 0.9 * a, a)
        if k < 1:
            paste(c, orb_sprite(60), head[0], head[1], a)
        elif self.arrow and len(part) > 2:
            (x0, y0), (x1, y1) = part[-3], part[-1]
            ang = math.atan2(y1 - y0, x1 - x0)
            s = 22
            tri = [(x1 + s * math.cos(ang), y1 + s * math.sin(ang)),
                   (x1 + s * math.cos(ang + 2.5), y1 + s * math.sin(ang + 2.5)),
                   (x1 + s * math.cos(ang - 2.5), y1 + s * math.sin(ang - 2.5))]
            ImageDraw.Draw(c, "RGBA").polygon(tri, fill=colour + (int(255 * a),))


class Pin:
    """Glowing dot with a label (white bold), popping in at t0."""

    def __init__(self, t0, t1, lon, lat, label=None, style="gold", side="left", size=40, pulse=False):
        self.t0, self.t1, self.lon, self.lat = t0, t1, lon, lat
        self.style, self.side, self.pulse = style, side, pulse
        self.label = text_sprite(label, SANS, size, "white", 0, 0.9) if label else None

    def draw(self, c, t, proj):
        if not (self.t0 <= t <= self.t1):
            return
        a = life(t, self.t0, self.t1, 0.3, 0.4)
        x, y = proj(self.lon, self.lat)
        k = win(t, self.t0, self.t0 + 0.4)
        col = GOLD_LIGHT if self.style == "gold" else (255, 96, 70)
        d = ImageDraw.Draw(c, "RGBA")
        if self.pulse:
            ph = ((t - self.t0) * 1.2) % 1
            rr = 14 + 46 * ph
            d.ellipse([x - rr, y - rr, x + rr, y + rr], outline=col + (int(220 * (1 - ph) * a),), width=3)
        paste(c, orb_sprite(46), x, y, a * k)
        r = 7 * k
        d.ellipse([x - r, y - r, x + r, y + r], fill=(255, 250, 235, int(255 * a)))
        if self.label:
            off = (self.label.width / 2 + 14) * (-1 if self.side == "left" else 1)
            paste(c, self.label, x + off, y - 2, a * k)


class Region:
    """Governorate highlight: soft gold fill with a glowing border."""

    def __init__(self, t0, t1, names, strength=1.0, style="gold"):
        self.t0, self.t1, self.names = t0, t1, names
        self.strength, self.style = strength, style

    def draw(self, c, t, proj):
        if not (self.t0 <= t <= self.t1):
            return
        a = life(t, self.t0, self.t1, 0.6, 0.6) * self.strength
        pulse = 0.85 + 0.15 * math.sin((t - self.t0) * 2.2)
        polys = []
        for n in self.names:
            for ring in governorates()[n]:
                polys.append([proj(lo, la) for lo, la in ring])
        fill = Image.new("L", (W // 2, H // 2), 0)
        d = ImageDraw.Draw(fill)
        for p in polys:
            d.polygon([(x / 2, y / 2) for x, y in p], fill=255)
        fill = fill.resize((W, H), Image.BILINEAR)
        col = (255, 190, 90) if self.style == "gold" else (255, 80, 50)
        layer = Image.new("RGBA", (W, H), col + (0,))
        layer.putalpha(fill.point(lambda v: int(v * 0.30 * a * pulse)))
        c.alpha_composite(layer)
        draw_glow_lines(c, [p + [p[0]] for p in polys], GOLD_LIGHT, 2, 10, 0.75 * a, 0.9 * a)


class MapText:
    """Map-anchored italic label (seas, regions)."""

    def __init__(self, t0, t1, lon, lat, text, size=44, style="dim"):
        self.t0, self.t1, self.lon, self.lat = t0, t1, lon, lat
        self.sprite = text_sprite(text, NASKH_REG, size, style, 0, 0.6)

    def draw(self, c, t, proj):
        if not (self.t0 <= t <= self.t1):
            return
        x, y = proj(self.lon, self.lat)
        paste(c, self.sprite, x, y, life(t, self.t0, self.t1, 0.6, 0.5) * 0.85)


class Barrier:
    """Red dashed line with small cross ticks: the forbidden Nile crossing."""

    def __init__(self, t0, t1, pts):
        self.t0, self.t1, self.pts = t0, t1, pts

    def draw(self, c, t, proj):
        if not (self.t0 <= t <= self.t1):
            return
        a = life(t, self.t0, self.t1, 0.4, 0.4)
        k = win(t, self.t0, self.t0 + 0.8)
        dense = []
        for (lo0, la0), (lo1, la1) in zip(self.pts, self.pts[1:]):
            for i in range(10):
                u = i / 10
                dense.append(proj(lo0 + (lo1 - lo0) * u, la0 + (la1 - la0) * u))
        dense.append(proj(*self.pts[-1]))
        part, _ = polyline_until(dense, k)
        segs = [part[i:i + 2] for i in range(0, len(part) - 1, 2)]
        draw_glow_lines(c, segs, (255, 96, 70), 5, 10, 0.9 * a, a)


class HUD:
    """Coordinates box (top-left) and the imagery credit, like a field instrument."""

    def __init__(self, t0, t1):
        self.t0, self.t1 = t0, t1
        self.credit = text_sprite("Sentinel-2 cloudless 2016 · EOX · CC BY 4.0", SANS, 20, "dim", 0, 0, 500)

    def draw(self, c, t, lon, lat):
        if not (self.t0 <= t <= self.t1):
            return
        a = life(t, self.t0, self.t1, 0.5, 0.4)
        d = ImageDraw.Draw(c, "RGBA")
        x0, y0 = 70, 120
        d.rounded_rectangle([x0, y0, x0 + 330, y0 + 76], radius=8, fill=(14, 9, 5, int(170 * a)),
                            outline=GOLD + (int(120 * a),), width=1)
        txt = f"{abs(lat):.3f}°{'N' if lat >= 0 else 'S'}  ·  {abs(lon):.3f}°{'E' if lon >= 0 else 'W'}"
        d.text((x0 + 16, y0 + 12), txt, fill=CREAM + (int(230 * a),), font=_mono())
        paste(c, self.credit, x0 + 16 + self.credit.width / 2 - 10, y0 + 54, a)


_MONO = None


def _mono():
    global _MONO
    if _MONO is None:
        from PIL import ImageFont
        _MONO = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", 24)
    return _MONO


_SHADE = None


def bottom_shade(c, alpha=0.85, y0=880, y1=1650):
    """Darken the lower part of the map so names and captions read cleanly."""
    global _SHADE
    if alpha <= 0.01:
        return
    if _SHADE is None:
        ys = np.clip((np.arange(H) - y0) / (y1 - y0), 0, 1) ** 1.2 * 255
        _SHADE = Image.fromarray(np.repeat(ys.astype(np.uint8)[:, None], W, axis=1))
    layer = Image.new("RGBA", (W, H), (10, 6, 3, 0))
    layer.putalpha(_SHADE.point(lambda v: int(v * alpha)))
    c.alpha_composite(layer)
