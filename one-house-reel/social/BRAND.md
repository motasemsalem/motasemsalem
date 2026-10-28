# One House brand guide

Everything the page posts follows this file and `README.md`. Where they disagree, `README.md` ("Never in a post or a reply") wins.

## The idea

**One House is the engineer's eye on your home.** Most people can't see what goes into the walls or the slab, and that is what they worry about. So the brand **shows the work the way an engineer sees it**: measured, checked, annotated, on real sites and real rooms.

- Tagline: **«اتبنى صح من أول طوبة»** (used on hero posts and reel end cards, not on every post).
- Promise in every post: a free inspection with an engineer (**«احجز معاينتك المجانية»**).
- What we never promise: warranties, prices, payment plans, after-handover maintenance (see `README.md`).

## Voice

Confident, plain Egyptian Arabic, like a senior engineer explaining something to a friend.

| Do | Don't |
|---|---|
| One concrete fact or number per line («الصبّة محتاجة ٢٨ يوم معالجة») | Adjectives with nothing behind them («أفضل»، «رائع»، «خطير») |
| Open on the reader's problem («السقف بينشّع؟») | Open on the brand name |
| Short lines, one idea per post | Lists of services in every post |
| Calm certainty | Hype, strings of emojis, «اكتب كلمة كذا» |

## Colour

Taken from the logo. Navy and white carry the brand; red is only for the one thing to act on.

| Token | Hex | Use |
|---|---|---|
| `navy` | `#062448` | Main brand fields, panels |
| `deep` | `#020d1c` | Darkest backgrounds, photo overlays |
| `red` | `#e0071a` | CTA, the one key word, stamps, check marks. Never large areas |
| `paper` | `#f3f5f8` | Light posts, spec sheets |
| `blueprint` | `#5fa8ff` | Technical lines, dimension marks, annotations |
| `steel` | `#8ea3bf` | Secondary text on navy |
| `concrete` | `#b9b3a7` | Warm neutral for structure posts |

Rule of thumb per post: 60 % photo or navy, 30 % white or paper, 10 % red at most.

## Type

- Headlines: **Alexandria** 800–900. Big and short, never more than three lines.
- Body and labels: **IBM Plex Sans Arabic** 400 / 600.
- Numbers on technical labels are Latin digits in Alexandria (e.g. `4.20 m`, `28`), so they read like a drawing.
- Both are bundled in `public/fonts`, so renders need no network.

## Logo

- `public/brand/logo-white.png` on dark or photo backgrounds, `logo-color.png` on paper.
- Clear space around it at least the height of the house icon. Never stretched, recoloured or placed on a busy part of a photo.
- One logo per post, in the footer bar or a corner.

## Photos and footage

- Real only (Pexels, Pixabay or the owner's own). No AI images and no Canva images.
- It should look like Egypt: dry sandy ground, beige and white concrete, strong sun, people who look Egyptian or Arab. See `README.md`.
- Grade lightly (a bit more contrast, never orange-teal filters). Keep the photo honest: it is the proof.

## Signature graphics (the "engineer's eye")

These are what makes a post recognisably One House. Each post uses one or two, never all.

- **Blueprint lines:** thin `blueprint` lines and a faint grid over navy or over the photo.
- **Dimension marks:** an arrowed measure line with a value (`↔ 4.20 m`) along an edge of the photo.
- **Callouts:** a dot on a detail in the photo, a leader line, and a short label («عزل مائي ٣ طبقات»).
- **The check stamp:** a red circular stamp «تمت المراجعة» or a red ✓, for checklists and inspections.
- **Spec strip:** a row of small labelled values like a drawing's title block (المرحلة · البند · الحالة).

## Layouts (`src/posts/Editorial.tsx`)

The current look family. Posts rotate through these; never the same look twice in a row.

| Look | What it is | Best for |
|---|---|---|
| `spec` | Photo with 2–4 callouts and a title block, like an annotated drawing | Showing what's inside a wall, a slab, a kitchen |
| `measure` | Photo framed by dimension lines, big headline in the white space | Sizes, steps, "the right way" |
| `report` | Paper inspection report: checklist with red ticks and a stamp | Checklists, «قبل ما تستلم» |
| `bignum` | One huge outlined number over a cropped photo | One fact with a number |
| `cutout` | A big word filled with the photo (photo inside the letters) on navy | Hero and brand posts |

The older looks (`src/posts/Studio.tsx`, `Finishing.tsx`) stay in the code for the posts already queued.

## Video

- First 2 seconds: the hook as big white text on the first shot, a problem or a number. No logo intro.
- Cuts every 1.5–3 s, captions burned in (most people watch muted).
- End card: logo, «احجز معاينتك المجانية», tagline. 2–3 seconds.
- Ad cuts: 20–30 s, vertical 1080×1920, safe zone 250 px top and bottom.
