"""Storyboard: every beat is anchored to the moment a word is spoken.

`at("هَوّارة")` returns the start time of that word in the voiceover (from
inputs/words.json, produced by align_words.py), so visuals land on the voice.
"""
import json
import os

from align_words import norm
from reel_elements import (FAR, Card, CommentCTA, Counter, Frame, Inset, Medallion, Pulse, Roster, StarWindow, Text)
from reel_lib import NASKH, RUQAA, SANS
from reel_map import Barrier, HUD, MapCamera, MapText, Pin, Region, Route

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
WORDS = json.load(open(os.path.join(ROOT, "inputs", "words.json"), encoding="utf-8"))
TIMED = [w for w in WORDS if w["s"] is not None]
VOICE_END = 252.37
END = VOICE_END + 1.0


def _tok(w):
    n = norm(w)
    return n[1:] if n.startswith("و") and len(n) > 3 else n


def at(phrase, after=0.0, end=False):
    """Start (or end) time of the first occurrence of `phrase` after `after`."""
    want = [_tok(p) for p in phrase.split()]
    toks = [_tok(w["w"]) for w in TIMED]
    for i in range(len(TIMED) - len(want) + 1):
        if TIMED[i]["s"] < after:
            continue
        if all(toks[i + k] == want[k] or (len(want[k]) > 2 and toks[i + k].startswith(want[k])) for k in range(len(want))):
            return TIMED[i + len(want) - 1]["e"] if end else TIMED[i]["s"]
    raise KeyError(f"phrase not found after {after}: {phrase}")


def names_between(t0, t1, stop=("ومنهم", "ومعهم", "الذين", "يعيشون", "حول", "جبل", "موسى", "وإلى", "جوارهم", "ثم")):
    """Tribe names spoken in [t0, t1): words grouped by the commas in the script."""
    out, cur, cur_t = [], [], None
    window = [w for w in TIMED if t0 <= w["s"] < t1]
    colon = next((i for i, w in enumerate(window) if w["w"].endswith(":")), None)
    if colon is not None:  # names start after the intro sentence ("...على ساحلِ العريش:")
        window = window[colon + 1:]
    for w in window:
        raw = w["w"]
        word = raw.strip("،.:؟!…").replace("...", "")
        if norm(word) in {norm(s) for s in stop}:
            cur, cur_t = [], None
            continue
        if not cur:
            cur_t = w["s"]
            if word.startswith("وال") or (word.startswith("و") and word[1:2] != "ا"):
                word = word[1:]  # the conjunction, not part of the name (but keep "واصل")
        cur.append(word)
        if raw.endswith(("،", ".", "...", ":", "؟")):
            out.append((" ".join(cur), cur_t))
            cur, cur_t = [], None
    if cur:
        out.append((" ".join(cur), cur_t))
    return out


class CanvasShot:
    kind = "canvas"

    def __init__(self, t0, t1, elements, anchor=None, pattern=1.0):
        self.t0, self.t1, self.elements = t0, t1, elements
        self.pattern = pattern
        if anchor is None:
            frames = [e for e in elements if isinstance(e, Frame)]
            anchor = frames[0].hang_point() if frames else (0, -470)
            anchor = (anchor[0], anchor[1] - 30) if frames else anchor
        self.anchor = anchor


class MapShot:
    kind = "map"

    def __init__(self, t0, t1, keys, overlays, screen, dims=(), shade=None):
        self.t0, self.t1 = t0, t1
        self.camera = MapCamera(keys)
        self.overlays, self.screen = overlays, screen
        self.dims = dims  # [(t0, t1, amount)] darken the map for dramatic text
        self.shade = shade  # [(t0, t1)] windows with the lower gradient
        self.hud = HUD(t0, t1)


def story():
    S = []
    # ------------------------------------------------------------ 01 hook
    t_not = at("ليست")
    S.append(CanvasShot(0.0, at("منفيّون") - 0.25, [
        Frame(0.05, FAR, "upper-nile-village", y=-170, w=780, h=560, dim_at=t_not),
        Text(0.25, t_not - 0.05, "أشهرُ قبيلةٍ في", y=210, size=52, fname=NASKH, style="cream", glow=0, shine_on=False),
        Text(at("صعيدِ") - 0.1, t_not - 0.05, "صعيدِ مصر", y=330, size=128, style="silver"),
        Text(t_not, FAR, "ليست عربيةَ الأصل!", y=290, size=118, style="red", glow=0.9, pop=True),
    ]))
    beats = [("منفيّون", "campfire-sinai", None), ("غُزاة", "bedouin-horsemen-line", "ثمّ"),
             ("ملوك", "old-bedouin-sheikh", "ثمّ")]
    for i, (word, slug, lead) in enumerate(beats):
        t0 = at(word) - 0.25 if i else at("منفيّون") - 0.25
        t1 = at(beats[i + 1][0]) - 0.25 if i < 2 else at("هذه") - 0.2
        els = [Frame(t0 + 0.05, FAR, slug, y=-170, w=720, h=520),
               Text(at(word), FAR, word, y=290, size=150, glow=0.7)]
        if lead:
            els.append(Text(at(word) - 0.3, FAR, lead, y=150, size=50, fname=NASKH, style="dim", glow=0, shine_on=False))
        S.append(CanvasShot(t0, t1, els))
    t_title = at("هذه") - 0.2
    S.append(CanvasShot(t_title, at("البدايةُ") - 0.15, [
        StarWindow(t_title + 0.05, FAR, "sinai-caravan-elkaa", y=-250, r=270),
        Text(at("هذه"), FAR, "هذه حكايةُ", y=150, size=54, fname=NASKH, style="cream", glow=0, shine_on=False),
        Text(at("القبائلِ"), FAR, "القبائلِ العربيةِ", y=270, size=118),
        Text(at("مصر.", after=at("القبائلِ")), FAR, "في مصر", y=390, size=86, style="silver"),
    ], anchor=(0, -560)))

    # ------------------------------------------------------------ 02 first migrations (map)
    t_map = at("البدايةُ") - 0.15
    t_amr, t_yemen, t_hijaz = at("عمرو"), at("اليمنِ"), at("والحجاز")
    t_juh = at("جُهَيْنةُ تحديدًا")
    t_727, t_qays, t_sham, t_bilb = at("سبعِمئةٍ"), at("قَيْس"), at("الشام"), at("بلبيس")
    t_shar, t_south, t_rabia, t_kanz = at("الشرقيةُ"), at("الجنوب..."), at("ربيعةُ"), at("الكَنْز")
    t_end2 = at("اللحظةُ") - 0.9
    fustat = (31.23, 30.01)
    keys = [(t_map, 31.0, 27.4, 15.0), (t_amr - 0.3, 31.0, 27.4, 15.0), (t_amr + 1.6, 32.6, 29.0, 8.0),
            (t_yemen - 0.4, 32.6, 29.0, 8.0), (t_yemen + 1.2, 37.0, 20.5, 24.0),
            (t_juh - 0.2, 37.0, 20.5, 24.0), (t_juh + 1.4, 31.7, 25.9, 5.0),
            (t_727 - 0.6, 31.7, 25.9, 5.0), (t_727 + 1.0, 33.4, 29.6, 11.0),
            (t_shar - 0.3, 33.4, 29.6, 11.0), (t_shar + 1.2, 31.75, 29.9, 3.6),
            (t_south - 0.2, 31.75, 29.9, 3.6), (t_south + 1.3, 35.2, 21.0, 16.0),
            (t_kanz - 1.0, 35.2, 21.0, 16.0), (t_kanz + 0.6, 33.0, 23.2, 5.5)]
    overlays = [
        MapText(t_map, t_yemen + 1, 30.0, 33.3, "البحر المتوسط"),
        MapText(t_map, t_end2, 36.0, 24.6, "البحر الأحمر"),
        Route(t_amr + 0.2, t_amr + 2.4, [(34.45, 31.5), (33.8, 31.13), (32.55, 31.03), (31.56, 30.42), fustat], fade_at=t_juh),
        Pin(t_amr + 2.3, t_juh, *fustat, "الفُسطاط"),
        Route(t_yemen - 0.1, t_yemen + 2.0, [(44.2, 15.35), (42.5, 18.5), (39.6, 22.5), (37.0, 26.5), (34.3, 28.5), (32.7, 29.6), fustat], fade_at=t_juh),
        Route(t_hijaz, t_hijaz + 1.8, [(39.61, 24.47), (37.5, 27.0), (35.0, 29.5), (33.5, 30.3), fustat], fade_at=t_juh),
        Pin(t_yemen + 0.2, t_juh, 44.2, 15.35, "اليمن", side="right"),
        Pin(t_hijaz + 0.2, t_juh, 39.61, 24.47, "الحجاز", side="right"),
        Region(t_juh + 0.8, t_727, ["Suhaj"]),
        Pin(at("تركَت"), t_727, 31.50, 26.67, "مدينة جُهَيْنة", pulse=True),
        Route(t_sham - 0.4, t_sham + 1.9, [(36.29, 33.51), (35.2, 32.2), (34.3, 31.3), (33.0, 31.05), (31.56, 30.42)], fade_at=t_south),
        Pin(t_sham, t_shar + 1.2, 36.29, 33.51, "الشام", side="right"),
        Pin(t_bilb, t_south, 31.56, 30.42, "بلبيس", pulse=True),
        Region(t_shar, t_south + 0.6, ["Ash Sharqiyah"]),
        Route(t_rabia - 0.2, t_rabia + 2.2, [(39.61, 24.47), (37.6, 24.3), (35.5, 24.1), (33.8, 24.0), (32.9, 24.09)]),
        Pin(t_rabia + 2.0, t_end2, 32.9, 24.09, "أسوان", pulse=True),
    ]
    screen = [
        Counter(t_map + 0.1, t_amr - 0.1, 640, y=-500, start=600, suffix=" م", label="البداية"),
        Card(t_amr, t_yemen - 0.3, ["جيشُ عمرو بن العاص يدخل مصر"], y=-500, title="فتحُ مصر"),
        Text(at("لَخْم"), t_juh - 0.2, "لَخْم", x=300, y=330, size=82, pop=True),
        Text(at("وجُذام"), t_juh - 0.2, "جُذام", x=100, y=330, size=82, pop=True),
        Text(at("وبَلِيّ"), t_juh - 0.2, "بَلِيّ", x=-100, y=330, size=82, pop=True),
        Text(at("وجُهَيْنة"), t_juh - 0.2, "جُهَيْنة", x=-300, y=330, size=82, pop=True),
        Text(t_juh, t_727 - 0.3, "جُهَيْنة", y=300, size=130, glow=0.7),
        Card(at("سوهاج") - 0.2, t_727 - 0.3, ["مدينةٌ كاملة في سوهاج تحمل اسمها حتى اليوم"], y=470, w=860),
        Inset(at("تركَت"), t_727 - 0.3, "upper-egypt-village", y=-440),
        Counter(t_727 - 0.3, t_qays - 0.1, 727, y=-500, start=690, suffix=" م", label="بعد قرنٍ تقريبًا"),
        Text(t_qays, t_shar - 0.2, "قَيْس", y=300, size=150, glow=0.7),
        Card(t_shar, t_south - 0.2, ["أولُ موطنٍ كبير للعرب في الدلتا"], y=330, title="الشرقية"),
        Text(t_rabia, t_kanz - 0.3, "ربيعة", y=300, size=150, glow=0.7),
        Card(t_kanz - 0.2, t_end2, ["حُكّامُ أقصى جنوبِ مصر"], y=330, title="بنو الكَنْز"),
        Inset(t_kanz, t_end2, "assouan-1856", y=-440),
    ]
    S.append(MapShot(t_map, t_end2, keys, overlays, screen,
                     shade=[(at("لَخْم") - 0.5, t_727 - 0.2), (t_qays - 0.4, t_end2)]))

    # ------------------------------------------------------------ 03 the dangerous moment
    t_dang = at("اللحظةُ")
    t_fat = at("الفاطميونَ")
    S.append(CanvasShot(t_end2, t_fat - 0.3, [
        Text(t_dang - 0.6, FAR, "ثمّ جاءت", y=-120, size=56, fname=NASKH, style="dim", glow=0, shine_on=False),
        Text(t_dang, FAR, "اللحظةُ الأخطر", y=20, size=140, style="red", glow=1.0, pop=True),
    ], anchor=(0, -470), pattern=0.5))
    S.append(CanvasShot(t_fat - 0.3, at("وقبيلتانِ") - 0.3, [
        Frame(t_fat - 0.25, FAR, "azhar-minarets-1867", y=-190, w=560, h=700, focus=(0.5, 0.3)),
        Text(t_fat, FAR, "الفاطميون", y=300, size=132),
        Text(at("يحكمونَ"), FAR, "يحكمونَ مصر", y=420, size=52, fname=NASKH, style="cream", glow=0, shine_on=False),
    ]))
    t_q = at("القرامطة")
    S.append(CanvasShot(at("وقبيلتانِ") - 0.3, at("العقاب؟") - 0.35, [
        Text(at("وقبيلتانِ"), FAR, "قبيلتانِ عربيتانِ كبيرتان", y=-560, size=50, fname=NASKH, style="cream", glow=0, shine_on=False),
        Medallion(at("هلالٍ") - 0.3, FAR, "بنو هلال", x=-232, y=-250, r=172, size=66),
        Medallion(at("سُلَيْم") - 0.3, FAR, "بنو سُلَيْم", x=232, y=-250, r=172, size=66),
        Text(at("تقفانِ"), FAR, "تقفانِ مع", y=-30, size=48, fname=NASKH, style="dim", glow=0, shine_on=False),
        Medallion(t_q - 0.2, FAR, "القرامطة", y=200, r=180, style="red", size=74, sub="أعداءُ الفاطميين"),
    ], anchor=(0, -640), pattern=0.6))

    # ------------------------------------------------------------ 03b exile and the march west (map)
    t_pun = at("العقاب؟") - 0.35
    t_exile, t_nile = at("النفيُ"), at("ومنعُهم")
    t_tun, t_open, t_west = at("تمرّدَ"), at("فتحَ"), at("وأطلقوهم")
    t_cross, t_magh, t_remain = at("عبرَ"), at("المغرب..."), at("لكنّ")
    t_sira = at("ومن هنا")
    said = (32.4, 26.3)
    keys = [(t_pun, 31.6, 26.9, 9.0), (t_exile, 31.6, 26.9, 9.0), (t_exile + 1.0, 33.0, 26.0, 10.0),
            (t_tun - 0.4, 33.0, 26.0, 10.0), (t_tun + 1.3, 18.0, 25.0, 40.0),
            (t_cross, 14.0, 25.0, 46.0), (t_magh + 0.6, 12.0, 25.0, 50.0),
            (t_remain, 12.0, 25.0, 50.0), (t_remain + 1.2, 31.8, 26.4, 8.0), (t_sira, 31.8, 26.4, 8.0)]
    overlays = [
        Route(t_exile, t_exile + 1.0, [(45.0, 25.5), (41.0, 25.8), (37.0, 26.0), (34.0, 26.2), said], fade_at=t_tun),
        Region(t_exile + 0.6, t_tun, ["Asyut", "Suhaj", "Qina", "Luxor"]),
        Barrier(t_nile, t_tun + 0.4, [(32.95, 24.2), (32.85, 25.7), (32.85, 26.2), (31.85, 26.7), (31.4, 27.3)]),
        Pin(t_tun - 0.1, t_cross, 10.1, 35.68, "تونس", style="red", pulse=True, side="right"),
        Pin(t_tun + 0.2, t_cross, 31.25, 30.05, "القاهرة", side="left"),
        Route(t_west - 0.4, t_west + 1.6, [said, (30.6, 28.5), (29.0, 30.6), (25.0, 31.6), (20.1, 32.1), (15.0, 32.4), (13.2, 32.9), (10.1, 35.68)], width=6, fade_at=t_remain + 0.4),
        Route(t_cross, t_magh + 0.8, [(10.1, 35.68), (5.0, 35.0), (0.0, 34.6), (-5.0, 34.0), (-8.0, 31.63)], width=6, fade_at=t_remain + 0.4),
        Pin(t_magh, t_remain + 0.5, -8.0, 31.63, "المغرب", side="right"),
        Pin(t_remain + 1.0, t_sira, 31.7, 26.55, None, pulse=True),
        Pin(t_remain + 1.2, t_sira, 32.7, 25.7, None, pulse=True),
        Pin(t_remain + 1.4, t_sira, 31.2, 27.2, None, pulse=True),
        Pin(t_remain + 1.6, t_sira, 32.75, 26.1, None, pulse=True),
    ]
    screen = [
        Text(t_pun + 0.15, t_exile + 0.1, "العقاب؟", y=-40, size=170, style="red", glow=0.9, pop=True),
        Card(t_exile, t_nile - 0.1, ["النفيُ إلى الصعيد"], y=330, w=640),
        Card(t_nile, t_tun - 0.2, ["ومنعُهم من عبور النيل"], y=330, w=700, title_style="red"),
        Card(t_tun, t_open - 0.2, ["حُكّامُ تونس يتمرّدون على القاهرة"], y=330, w=820),
        Card(t_open, t_west - 0.2, ["الفاطميون يفتحون الباب للمنفيّين"], y=330, w=820),
        Text(t_west, t_cross - 0.2, "غربًا", y=320, size=150, glow=0.7),
        Text(t_cross, t_remain - 0.2, "الهلاليّون إلى المغرب", y=320, size=104, glow=0.6),
        Card(t_remain, t_sira, ["لكنّ بطونًا منهم بقيت في مصر"], y=330, w=760),
    ]
    S.append(MapShot(t_pun, t_sira, keys, overlays, screen, dims=[(t_pun, t_exile, 0.55)],
                     shade=[(t_exile - 0.2, t_sira)]))

    # ------------------------------------------------------------ 03c the Hilali epic
    t_q2 = at("هل تذكرُ") - 0.9
    S.append(CanvasShot(t_sira, t_q2, [
        Frame(t_sira + 0.05, FAR, "bedouins-coffee-tent", y=-170, w=760, h=560),
        Text(t_sira + 0.1, FAR, "ومن هنا وُلدت", y=180, size=52, fname=NASKH, style="cream", glow=0, shine_on=False),
        Text(at("السيرةُ"), FAR, "السيرةُ الهلالية", y=300, size=124),
        Text(at("شعراءُ"), FAR, "يُنشدها شعراءُ الصعيدِ حتى اليوم", y=420, size=46, fname=NASKH, style="dim", glow=0, shine_on=False),
    ]))

    # ------------------------------------------------------------ 04 Hawwara
    t_haw = at("هَوّارة")
    S.append(CanvasShot(t_q2, t_haw - 0.05, [
        Pulse(t_q2 + 0.4, t_haw, "؟", y=-120),
        Text(at("هل تذكرُ"), t_haw, "القبيلة التي", y=190, size=54, fname=NASKH, style="cream", glow=0, shine_on=False),
        Text(at("ليست", after=80), t_haw, "ليست عربيةَ الأصل", y=290, size=92, style="red", glow=0.7),
    ], anchor=(0, -620), pattern=0.35))
    t_arr, t_amaz, t_arab = at("وصلَت"), at("أمازيغيٌّ"), at("تعرّبَت")
    t_mam = at("نزلَت")
    S.append(CanvasShot(t_haw - 0.05, t_mam - 0.3, [
        StarWindow(t_haw - 0.05, FAR, "village-sheik-children", y=-300, r=250, focus=(0.5, 0.35)),
        Text(t_haw, FAR, "هَوّارة", y=120, size=190, glow=1.0, pop=True),
        Card(t_arr, t_amaz - 0.15, ["وصلت مع الفاطميين"], y=360, w=620),
        Card(t_amaz, t_arab - 0.15, ["الأصل: أمازيغي · من المغرب"], y=360, w=700),
        Card(t_arab, FAR, ["تعرّبت تمامًا"], y=360, w=520, title="لكنها"),
    ], anchor=(0, -600)))
    t_ham = at("وأشهرُ", after=100)
    S.append(CanvasShot(t_mam - 0.3, t_ham - 0.25, [
        Frame(t_mam - 0.25, FAR, "upper-egypt-village", y=-170, w=760, h=560),
        Text(at("المماليك"), FAR, "أيام المماليك", y=180, size=52, fname=NASKH, style="cream", glow=0, shine_on=False),
        Text(at("الحاكمَ"), FAR, "حكّامُ الصعيد", y=300, size=128),
        Text(at("لقرون."), FAR, "لقرون", y=420, size=62, fname=NASKH, style="gold", glow=0.3, shine_on=False),
    ]))
    t_nb = at("وإلى جوارِها")
    S.append(CanvasShot(t_ham - 0.25, t_nb - 0.3, [
        Medallion(t_ham - 0.2, FAR, "", y=-200, r=270, size=40),
        Text(t_ham, FAR, "أشهرُ رجالِها", y=-330, size=50, fname=NASKH, style="cream", glow=0, shine_on=False),
        Text(at("شيخُ"), FAR, "شيخُ العربِ", y=-230, size=80, style="silver"),
        Text(at("همّام."), FAR, "همّام", y=-90, size=170, glow=0.9),
        Text(at("همّام.") + 0.4, FAR, "تُوفّي ١٧٦٩م", y=110, size=40, fname=NASKH, style="dim", glow=0, shine_on=False),
    ], anchor=(0, -650)))
    S.append(CanvasShot(t_nb - 0.3, at("العثماني") - 0.6, [
        Text(t_nb, FAR, "إلى جوارِها في الصعيد", y=-600, size=50, fname=NASKH, style="cream", glow=0, shine_on=False),
        Medallion(t_nb - 0.2, FAR, "هوّارة", y=-180, r=190, size=104),
        Text(at("عَرَك"), FAR, "عَرَك", x=270, y=170, size=96, pop=True),
        Text(at("وفَزارة"), FAR, "فَزارة", x=0, y=250, size=96, pop=True),
        Text(at("ومُحارِب"), FAR, "مُحارِب", x=-270, y=170, size=96, pop=True),
    ], anchor=(0, -650)))

    # ------------------------------------------------------------ 05 Awlad Ali (map)
    t_ott = at("العثماني") - 0.6
    t_wave, t_awlad, t_nasab = at("آخرُ"), at("أولادِ علي"), at("يرجعُ")
    t_today, t_sallum = at("واليوم..."), at("السلّومِ")
    t_1400 = at("ألفٌ وأربعُمئةِ") - 0.3
    keys = [(t_ott, 27.0, 28.5, 22.0), (t_awlad - 0.4, 27.0, 28.5, 22.0), (t_awlad + 1.4, 25.0, 30.6, 14.0),
            (t_today, 25.0, 30.6, 14.0), (t_sallum + 0.2, 27.8, 30.3, 7.5), (t_1400, 27.8, 30.3, 7.5)]
    overlays = [
        MapText(t_ott, t_1400, 26.0, 33.4, "البحر المتوسط"),
        Route(t_awlad - 0.2, t_awlad + 2.0, [(20.07, 32.1), (21.6, 32.75), (23.5, 32.4), (25.15, 31.57), (27.24, 31.35)], width=5, fade_at=t_sallum),
        Pin(t_awlad, t_today, 20.07, 32.1, "ليبيا", side="right"),
        Route(t_sallum - 0.1, t_sallum + 1.8, [(25.15, 31.57), (27.24, 31.35), (28.95, 30.83), (30.47, 31.03)], width=5, arrow=False),
        Pin(t_sallum, t_1400, 25.15, 31.57, "السلّوم", side="right"),
        Pin(t_sallum + 1.7, t_1400, 30.47, 31.03, "البحيرة"),
        Region(t_sallum + 0.4, t_1400, ["Matruh"], strength=0.7),
    ]
    screen = [
        Counter(t_ott + 0.2, t_wave - 0.1, 1670, y=-500, start=1600, suffix=" م", label="العصر العثماني"),
        Card(t_wave, t_awlad - 0.1, ["آخرُ موجةٍ كبرى من الغرب"], y=330, w=680),
        Text(t_awlad, t_nasab - 0.1, "أولاد علي", y=300, size=150, glow=0.7),
        Card(t_nasab, t_today - 0.1, ["يرجعُ نسبُهم إلى بني سُلَيْم"], y=330, w=760, title="من ليبيا"),
        Counter(at("يتجاوزونَ") - 0.2, t_1400, 2000000, y=270, start=0, dur=1.8, prefix="+", size=140,
                label="نسمة اليوم", bar=False),
    ]
    S.append(MapShot(t_ott, t_1400, keys, overlays, screen, shade=[(t_ott, t_1400)]))

    # ------------------------------------------------------------ 06 where did they settle?
    t_where, t_come = at("فأين"), at("تعالَ")
    t_tour = at("نبدأُ") - 0.2
    S.append(CanvasShot(t_1400, t_tour, [
        Medallion(t_1400 + 0.1, FAR, "", y=-160, r=390, size=40),
        Counter(t_1400 + 0.2, FAR, 1400, y=-230, start=0, dur=1.6, size=200),
        Text(at("عامٍ من", after=120), FAR, "عامٍ من الهجرات", y=-30, size=84),
        Text(t_where, FAR, "فأين استقرّت؟", y=230, size=110, glow=0.7),
        Text(t_come, FAR, "تعالَ نتجوّلْ على خريطة مصر", y=360, size=50, fname=NASKH, style="cream", glow=0, shine_on=False),
    ], anchor=(0, -650)))

    # ------------------------------------------------------------ 07 map tour
    regions = [
        ("شمال سيناء", ["Shamal Sina'"], (33.7, 30.75), 4.4, at("في الشمال"), at("ننزلُ"), "sinai-caravan-elwad"),
        ("وسط وجنوب سيناء", ["Janub Sina'"], (33.85, 28.75), 4.6, at("ننزلُ"), at("نعبرُ"), "jebel-musa-summit"),
        ("الشرقية والإسماعيلية والدلتا", ["Ash Sharqiyah", "Al Isma`iliyah", "Al Qalyubiyah", "Ad Daqahliyah"], (31.6, 30.65), 3.8,
         at("نعبرُ"), at("نتّجهُ"), "delta-air-view"),
        ("مطروح والصحراء الغربية", ["Matruh"], (27.4, 30.3), 8.5, at("نتّجهُ"), at("ننحدرُ"), "bedouins-horses"),
        ("الفيوم وبني سويف والمنيا", ["Al Fayyum", "Bani Suwayf", "Al Minya"], (30.8, 28.9), 4.6, at("ننحدرُ"), at("ونصلُ"), "upper-nile-village"),
        ("قلبُ الصعيد", ["Asyut", "Suhaj", "Qina", "Luxor", "Aswan"], (32.2, 25.8), 6.0, at("ونصلُ"), at("ونختمُ"), "village-sheik-children"),
        ("البحر الأحمر والصحراء الشرقية", ["Al Bahr al Ahmar"], (34.2, 25.4), 7.0, at("ونختمُ"), at("ألفٌ وأربعُمئةِ", after=200) - 0.4, "sinai-caravan-elkaa"),
    ]
    t_tour_end = regions[-1][5]
    keys = [(t_tour, 31.0, 26.5, 13.0), (t_tour + 0.4, 31.0, 26.5, 13.0)]
    overlays, screen = [MapText(t_tour, regions[1][4], 32.0, 33.2, "البحر المتوسط", size=40)], []
    inset_end = {0: at("والتَّرابينُ تحديدًا"), 1: at("الذين يعيشونَ")}  # make room for the cards
    for i, (title, govs, (lon, lat), span, a, b, slug) in enumerate(regions):
        cam_lat = lat - span * 0.24  # keep the region in the upper half, names below
        arrive = a + 1.1
        keys += [(a - 0.1, *keys[-1][1:]) if i else (a - 0.1, 31.0, 26.5, 13.0), (arrive, lon, cam_lat, span),
                 (b - 0.6, lon + span * 0.02, cam_lat - span * 0.01, span * 0.96)]
        overlays.append(Region(a + 0.3, b + 0.2, govs))
        tribes = names_between(a, at("والتَّرابينُ تحديدًا") if i == 0 else b)
        hl = {}
        if i == 0:
            hl = {"التَّرابين": (at("والتَّرابينُ تحديدًا"), b)}
        if i == 1:
            overlays.append(Pin(at("والجَبالِيّة") + 0.3, b, 33.975, 28.539, "جبل موسى", pulse=True, side="right"))
        screen += [
            Text(a + 0.2, b, title, y=-560, size=72 if len(title) < 18 else 58, glow=0.5),
            Roster(a, b, tribes, y=200, highlight=hl, count_y=-470),
            Inset(a + 0.6, inset_end.get(i, b), slug, x=-330, y=-250, w=300, h=220),
        ]
    screen.append(Card(at("والتَّرابينُ تحديدًا"), regions[0][5] - 0.1, ["من أكبر قبائل البدو في المنطقة كلّها"], y=-330, w=780))
    screen.append(Card(at("الذين يعيشونَ"), regions[1][5] - 0.1, ["الجبالية · حول جبل موسى"], y=-330, w=640))
    keys.append((t_tour_end + 0.3, 31.0, 26.5, 13.0))
    S.append(MapShot(t_tour, t_tour_end, keys, overlays, screen, shade=[(t_tour + 1.5, t_tour_end - 0.2)]))

    # ------------------------------------------------------------ 08 the tribe today
    t_alive = at("وما زالت")
    t_not2 = at("ليست", after=230)
    S.append(CanvasShot(t_tour_end, t_not2 - 0.3, [
        Medallion(t_tour_end + 0.1, FAR, "", y=-150, r=390, size=40),
        Counter(t_tour_end + 0.2, FAR, 1400, y=-240, start=1000, dur=1.2, size=190, suffix=" عام"),
        Text(t_alive, FAR, "وما زالت القبيلةُ", y=110, size=60, fname=NASKH, style="cream", glow=0, shine_on=False),
        Text(at("حيّة."), FAR, "حيّة", y=250, size=180, glow=0.9),
    ], anchor=(0, -650)))
    t_karam, t_adat, t_majlis = at("كرمٌ"), at("وعاداتٌ"), at("ومجالسُ")
    S.append(CanvasShot(t_not2 - 0.3, at("والآن", after=245) - 0.2, [
        Text(t_not2, FAR, "ليست نسبًا فقط", y=-600, size=60, fname=NASKH, style="cream", glow=0, shine_on=False),
        Frame(t_karam - 0.2, FAR, "coffee-pots-fire", x=0, y=-330, w=700, h=420),
        Text(t_karam, FAR, "كرمٌ", x=270, y=60, size=104, pop=True),
        Frame(t_adat - 0.2, FAR, "feiran-bedouin-tents", x=0, y=-330, w=700, h=420),
        Text(t_adat, FAR, "عاداتٌ", x=0, y=60, size=104, pop=True),
        Frame(t_majlis - 0.2, FAR, "bedouins-coffee-tent", x=0, y=-330, w=700, h=420),
        Text(t_majlis, FAR, "مجالسُ عُرفية", x=-250, y=60, size=92, pop=True),
        Card(at("تحفظُ"), FAR, ["تحفظُ السلام"], y=250, w=520),
    ], anchor=(0, -590)))

    # ------------------------------------------------------------ 09 your turn
    t_now = at("والآن", after=245)
    t_turn = at("دورُك.")
    S.append(CanvasShot(t_now - 0.2, END, [
        Text(t_now, t_turn + 0.1, "والآن...", y=-200, size=70, fname=NASKH, style="cream", glow=0, shine_on=False),
        Text(t_turn, FAR, "دورُك", y=-330, size=230, glow=1.0, pop=True),
        Text(at("من أيِّ"), FAR, "من أيِّ قبيلةٍ أنت؟", y=-90, size=96, style="silver", glow=0.4),
        Text(at("وهل"), FAR, "وهل ذكرناها؟", y=40, size=56, fname=NASKH, style="dim", glow=0, shine_on=False),
        CommentCTA(at("وهل") + 0.4, FAR, y=270),
    ], anchor=(0, -650)))

    flashes = [(t_not, (200, 30, 20), 0.45, 0.5), (t_dang, (200, 30, 20), 0.35, 0.6),
               (t_haw - 0.03, (255, 236, 200), 0.75, 0.55), (t_turn, (255, 220, 160), 0.25, 0.5)]
    shakes = [(t_not, 12, 0.45), (t_dang, 9, 0.4), (t_haw, 10, 0.4)]
    chapters = [(0, t_map, "٠١", "البداية"), (t_map, t_end2, "٠٢", "الهجرات الأولى"),
                (t_end2, t_q2, "٠٣", "بنو هلال وبنو سُليم"), (t_q2, t_ott, "٠٤", "هوّارة"),
                (t_ott, t_1400, "٠٥", "أولاد علي"), (t_1400, t_tour_end, "٠٦", "خريطة القبائل"),
                (t_tour_end, END, "٠٧", "القبيلة اليوم")]
    cues = {"hook": t_not, "danger": t_dang, "hawwara": t_haw, "turn": t_turn,
            "map1": t_map, "map2": t_pun, "map3": t_ott, "tour": t_tour, "outro": t_tour_end,
            "epic": t_end2, "suspense": t_q2, "calm": at("وإلى جوارِها") - 0.3}
    return S, flashes, shakes, chapters, cues


def subtitle_blocks(max_words=7):
    """Group spoken words into caption blocks along the script's punctuation."""
    lines = open(os.path.join(ROOT, "inputs", "script.txt"), encoding="utf-8").read().strip().split("\n")
    blocks, i = [], 0
    for line in lines:
        n = len(line.split())
        idx = [k for k in range(i, i + n) if WORDS[k]["s"] is not None]
        i += n
        clauses, cur = [], []
        for k in idx:
            cur.append(k)
            if WORDS[k]["w"].endswith(("...", "،", ".", ":", "؟", "!")):
                clauses.append(cur)
                cur = []
        if cur:
            clauses.append(cur)
        block = []
        for cl in clauses:
            while len(cl) > max_words:
                if block:
                    blocks.append(block)
                    block = []
                blocks.append(cl[:6])
                cl = cl[6:]
            if block and len(block) + len(cl) > max_words:
                blocks.append(block)
                block = []
            block = block + cl
        if block:
            blocks.append(block)
    out = []
    for j, b in enumerate(blocks):
        s = WORDS[b[0]]["s"]
        e = WORDS[b[-1]]["e"] + 0.45
        if j + 1 < len(blocks):
            e = min(e, WORDS[blocks[j + 1][0]]["s"] - 0.02)
        out.append((s, e, b))
    return out
