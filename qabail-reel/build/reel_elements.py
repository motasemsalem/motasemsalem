"""Animated elements placed on the canvas or over the map.

Every element is a small object with absolute start/end times and a
`draw(canvas, t, ox, oy)` method: (ox, oy) is the screen position of its
shot's centre, so the same element works on the moving canvas and pinned
to the screen over the map.
"""
import math

from PIL import ImageDraw

from reel_lib import (CREAM, DIM, GOLD, GOLD_LIGHT, NASKH, NASKH_REG, RED, RUQAA, SANS, W, H,
                      card_sprite, clamp, comment_icon, ease_io, ease_out, frame_sprite, life,
                      medallion_sprite, paste, shine, star_window, text_sprite, to_arabic_digits, win)

FAR = 1e9


class Element:
    def __init__(self, t0, t1=FAR, x=0, y=0):
        self.t0, self.t1, self.x, self.y = t0, t1, x, y

    def alpha(self, t, fin=0.45, fout=0.35):
        return life(t, self.t0, self.t1, fin, fout)

    def visible(self, t):
        return self.t0 - 0.05 <= t <= self.t1 + 0.05


class Text(Element):
    """Calligraphic keyword / lead line with rise-in and a gold shine."""

    def __init__(self, t0, t1, text, x=0, y=0, size=110, fname=RUQAA, style="gold", glow=0.55,
                 pop=False, shine_on=True, shadow=0.7):
        super().__init__(t0, t1, x, y)
        self.sprite = text_sprite(text, fname, size, style, glow, shadow)
        self.pop, self.shine_on = pop, shine_on

    def draw(self, c, t, ox, oy):
        if not self.visible(t):
            return
        a = self.alpha(t, 0.3 if self.pop else 0.5)
        k = win(t, self.t0, self.t0 + (0.35 if self.pop else 0.7))
        if self.pop:
            scale, dy = 1.28 - 0.28 * k, 0
        else:
            scale, dy = 0.95 + 0.05 * k, 36 * (1 - k)
        sp = self.sprite
        if self.shine_on:
            sp = shine(sp, (t - self.t0 - 0.45) / 1.1)
        paste(c, sp, ox + self.x, oy + self.y + dy, a, scale)


class Frame(Element):
    """Photo in a gold frame hanging from the thread, swinging in."""

    def __init__(self, t0, t1, slug, x=0, y=-150, w=760, h=560, focus=(0.5, 0.5), dim_at=None):
        super().__init__(t0, t1, x, y)
        self.sprite = frame_sprite(slug, w, h, focus)
        self.h = h
        self.dim_at = dim_at

    def hang_point(self):
        return self.x, self.y - self.h / 2 - 12

    def draw(self, c, t, ox, oy):
        if not self.visible(t):
            return
        a = self.alpha(t, 0.4)
        dt = t - self.t0
        rot = 5.5 * math.exp(-2.6 * dt) * math.cos(7.5 * dt) if dt > 0 else 5.5
        drop = 70 * (1 - ease_out(dt / 0.7))
        if self.dim_at is not None:
            a *= 1 - 0.55 * win(t, self.dim_at, self.dim_at + 0.25)
        hx, hy = self.hang_point()
        d = ImageDraw.Draw(c, "RGBA")
        d.line([(ox + hx, oy + hy - 30), (ox + hx, oy + hy + drop + 12)], fill=GOLD_LIGHT + (int(200 * a),), width=2)
        paste(c, self.sprite, ox + self.x, oy + self.y + drop, a, 1.0, rot)


class StarWindow(Element):
    def __init__(self, t0, t1, slug, x=0, y=-260, r=260, focus=(0.5, 0.5)):
        super().__init__(t0, t1, x, y)
        self.sprite = star_window(slug, r, focus)

    def draw(self, c, t, ox, oy):
        if not self.visible(t):
            return
        a = self.alpha(t, 0.6)
        k = win(t, self.t0, self.t0 + 1.0)
        breathe = 1 + 0.015 * math.sin((t - self.t0) * 1.4)
        paste(c, self.sprite, ox + self.x, oy + self.y, a, (0.88 + 0.12 * k) * breathe, rot=8 * (1 - k))


class Medallion(Element):
    """Rotating star medallion with a name (and optional subtitle)."""

    def __init__(self, t0, t1, name, x=0, y=0, r=170, style="gold", sub=None, size=96):
        super().__init__(t0, t1, x, y)
        colour = RED if style == "red" else GOLD
        self.ring = medallion_sprite(r, colour)
        self.name = text_sprite(name, RUQAA, size, style, 0.6, 0.6) if name else None
        self.sub = text_sprite(sub, SANS, 30, "cream", 0, 0.6) if sub else None
        self.r = r

    def draw(self, c, t, ox, oy):
        if not self.visible(t):
            return
        a = self.alpha(t, 0.5)
        k = win(t, self.t0, self.t0 + 0.8)
        rot = (t - self.t0) * 6
        paste(c, self.ring, ox + self.x, oy + self.y, a, 0.7 + 0.3 * k, rot)
        if self.name:
            paste(c, shine(self.name, (t - self.t0 - 0.4) / 1.0), ox + self.x, oy + self.y - (12 if self.sub else 0), a)
        if self.sub:
            paste(c, self.sub, ox + self.x, oy + self.y + self.r * 0.42, a)


class Card(Element):
    """Dark card with gold border: an optional title and up to three lines."""

    def __init__(self, t0, t1, lines, x=0, y=0, w=820, title=None, title_style="gold", size=40):
        super().__init__(t0, t1, x, y)
        self.title = text_sprite(title, RUQAA, 70, title_style, 0.4, 0.5) if title else None
        self.lines = [text_sprite(l, SANS, size, "cream", 0, 0.5) for l in lines]
        th = (self.title.height - 30) if self.title else 0
        h = th + sum(l.height - 22 for l in self.lines) + 60
        self.box = card_sprite(w, int(h))
        self.h = h

    def draw(self, c, t, ox, oy):
        if not self.visible(t):
            return
        a = self.alpha(t, 0.4)
        dy = 30 * (1 - win(t, self.t0, self.t0 + 0.5))
        cx, cy = ox + self.x, oy + self.y + dy
        paste(c, self.box, cx, cy, a)
        y = cy - self.h / 2 + 30
        if self.title:
            paste(c, self.title, cx, y + (self.title.height - 30) / 2 - 6, a)
            y += self.title.height - 30
        for l in self.lines:
            paste(c, l, cx, y + (l.height - 22) / 2, a)
            y += l.height - 22


class Counter(Element):
    """Gold number counting up (years, populations), with a label under it."""

    def __init__(self, t0, t1, value, x=0, y=0, start=0, dur=1.3, prefix="", suffix="", label=None,
                 size=170, digits="arabic", bar=False):
        super().__init__(t0, t1, x, y)
        self.value, self.start, self.dur = value, start, dur
        self.prefix, self.suffix, self.size, self.digits = prefix, suffix, size, digits
        self.label = text_sprite(label, RUQAA, 64, "gold", 0.3, 0.6) if label else None
        self.bar = bar
        self._cache = {}

    def number(self, n):
        s = f"{n:,}" if self.value >= 10000 else str(n)
        s = to_arabic_digits(s) if self.digits == "arabic" else s
        key = self.prefix + s + self.suffix
        if key not in self._cache:
            self._cache[key] = text_sprite(key, NASKH, self.size, "gold", 0.5, 0.6)
        return self._cache[key]

    def draw(self, c, t, ox, oy):
        if not self.visible(t):
            return
        a = self.alpha(t, 0.35)
        k = ease_io((t - self.t0) / self.dur)
        n = int(round(self.start + (self.value - self.start) * k))
        if self.value >= 10000:
            n = int(round(n / 1000.0)) * 1000
        sp = self.number(n)
        paste(c, sp, ox + self.x, oy + self.y, a)
        if self.label:
            paste(c, self.label, ox + self.x, oy + self.y + self.size * 0.75, a)
        if self.bar:
            d = ImageDraw.Draw(c, "RGBA")
            y = oy + self.y + self.size * 0.62
            x0, x1 = ox + self.x - 300, ox + self.x + 300
            d.rounded_rectangle([x0, y, x1, y + 8], radius=4, fill=(60, 40, 22, int(200 * a)))
            d.rounded_rectangle([x1 - (x1 - x0) * k, y, x1, y + 8], radius=4, fill=GOLD + (int(255 * a),))


class Pulse(Element):
    """A big glyph that breathes (the question mark before the reveal)."""

    def __init__(self, t0, t1, text, x=0, y=0, size=360, style="gold"):
        super().__init__(t0, t1, x, y)
        self.sprite = text_sprite(text, RUQAA, size, style, 0.9, 0.5)

    def draw(self, c, t, ox, oy):
        if not self.visible(t):
            return
        a = self.alpha(t, 0.4, 0.15)
        beat = 1 + 0.06 * max(0.0, math.sin((t - self.t0) * 2 * math.pi * 1.1)) ** 6
        paste(c, self.sprite, ox + self.x, oy + self.y, a * (0.75 + 0.25 * beat), beat)


class CommentCTA(Element):
    def __init__(self, t0, t1, x=0, y=0):
        super().__init__(t0, t1, x, y)
        self.icon = comment_icon(200)
        self.text = text_sprite("اكتبها في التعليقات", SANS, 48, "cream", 0, 0.6)

    def draw(self, c, t, ox, oy):
        if not self.visible(t):
            return
        a = self.alpha(t, 0.4)
        dt = t - self.t0
        bounce = 1 + 0.12 * math.exp(-3 * dt) * math.sin(14 * dt)
        cx, cy = ox + self.x, oy + self.y
        paste(c, self.icon, cx, cy, a, bounce)
        d = ImageDraw.Draw(c, "RGBA")
        for i in range(3):  # typing dots
            ph = (dt * 2.2 - i * 0.25) % 1
            r = 9 + 4 * max(0.0, math.sin(ph * math.pi))
            px = cx + (i - 1) * 42
            d.ellipse([px - r, cy - 30 - r, px + r, cy - 30 + r], fill=GOLD_LIGHT + (int(255 * a),))
        paste(c, self.text, cx, cy + 150, a)


class Inset(Element):
    """Small framed photo pinned to the screen over the map."""

    def __init__(self, t0, t1, slug, x=-300, y=-560, w=360, h=260, focus=(0.5, 0.5)):
        super().__init__(t0, t1, x, y)
        self.sprite = frame_sprite(slug, w, h, focus)

    def draw(self, c, t, ox, oy):
        if not self.visible(t):
            return
        a = self.alpha(t, 0.5)
        k = win(t, self.t0, self.t0 + 0.6)
        paste(c, self.sprite, ox + self.x, oy + self.y + 40 * (1 - k), a, 0.92 + 0.08 * k)


class Roster(Element):
    """Tribe names appearing one by one in a 3-column grid (map tour)."""

    def __init__(self, t0, t1, names, y=180, cols=3, size=60, highlight=None, count_y=None):
        super().__init__(t0, t1, 0, y)
        self.count_y = count_y
        self.counts = {}
        self.names = names  # [(display, time)]
        self.cols = cols
        self.sprites = [text_sprite(n, RUQAA, size, "gold", 0.45, 0.8) for n, _ in names]
        self.hl = highlight or {}
        self.row_h = size * 1.45

    def draw(self, c, t, ox, oy):
        if not self.visible(t):
            return
        a = self.alpha(t, 0.4)
        n = len(self.names)
        rows = math.ceil(n / self.cols)
        col_w = 920 / self.cols
        if self.count_y is not None:
            shown = sum(1 for _, tn in self.names if t >= tn)
            if shown not in self.counts:
                word = "قبيلتان" if shown == 2 else ("قبائل" if 3 <= shown <= 10 else "قبيلة")
                label = word if shown == 2 else f"{to_arabic_digits(shown)} {word}"
                self.counts[shown] = text_sprite(label, SANS, 40, "cream", 0, 0.6)
            paste(c, self.counts[shown], ox, oy + self.count_y, a)
        for i, ((name, tn), sp) in enumerate(zip(self.names, self.sprites)):
            if t < tn - 0.1:
                continue
            r, col = divmod(i, self.cols)
            in_row = min(self.cols, n - r * self.cols)
            x = ox + (col - (in_row - 1) / 2) * col_w * -1  # right-to-left
            y = oy + self.y + (r - (rows - 1) / 2) * self.row_h
            k = win(t, tn - 0.1, tn + 0.35)
            boost = 0
            if name in self.hl and self.hl[name][0] <= t <= self.hl[name][1]:
                boost = 0.12 * win(t, self.hl[name][0], self.hl[name][0] + 0.3)
            fit = min(1.0, col_w * 0.95 / (sp.width - 60))
            paste(c, sp, x, y + 18 * (1 - k), a * k, (0.9 + 0.1 * k + boost) * fit)
