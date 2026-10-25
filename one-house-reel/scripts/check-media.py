"""Fails if a clip appears in more than one video, so every reel stays unique.

    python3 scripts/check-media.py

Reads the clip names each video uses: the finishing reel (src/finishing, overlays included), the slab-pour reel
(src/slab) and every voiced reel in src/reels/index.ts. Run it before rendering a new reel.
"""
import collections, re, sys

NAME = r'(?:media|photo)(?:: |=)\{?"([\w-]+)"'
videos = {
    'finishing-reel': open('src/finishing/FinishingReel.tsx').read() + open('src/finishing/overlays.tsx').read(),
    'slab-reel': open('src/slab/SlabReel.tsx').read(),
}
# Clips the finishing overlays name directly (InsideOut, and EndCard's default background).
fixed = {'finishing-reel': {'luxe-white', 'conduits', 'kitchen'}}
for block in re.split(r'\n  \{\n    id: "', open('src/reels/index.ts').read())[1:]:
    videos['reel ' + block.split('"')[0]] = block

uses = collections.defaultdict(set)
for video, code in videos.items():
    for name in set(re.findall(NAME, code)) | fixed.get(video, set()):
        uses[name].add(video)
shared = {n: v for n, v in uses.items() if len(v) > 1}
for n, v in sorted(shared.items()):
    print(f'{n}: {", ".join(sorted(v))}')
print(f'{len(uses)} clips across {len(videos)} videos;', 'every clip is used once' if not shared else f'{len(shared)} shared')
sys.exit(1 if shared else 0)
