# One House social: Facebook page + Instagram

Everything the page posts lives here:

| File | What it is |
|---|---|
| `posts.py` | Every post in publishing order: its id, image or video file, and caption |
| `calendar.json` | When each post goes out, and its Facebook / Instagram ids once posted |
| `publish.py` | Posts, schedules, reads comments, replies, and pulls the numbers |

The images come from Remotion stills (`src/posts/Finishing.tsx`, rendered into `renders/finishing-posts/` and `renders/unit-posts/`).

```console
cd one-house-reel
python3 social/publish.py status
python3 social/publish.py plan --start 2026-12-01   # dates new posts in posts.py: two a day, 14:00 and 21:00 (reels in the evening)
python3 social/publish.py respace --start 2026-12-01  # moves everything not out yet onto the two-a-day slots
python3 social/publish.py run                       # posts what is due on Instagram, schedules Facebook 4 weeks ahead
python3 social/publish.py inbox                     # unanswered comments from the last 7 days
python3 social/publish.py reply <comment id> "<text>" [--ig]
python3 social/publish.py report
```

**Token:**
- `META_PAGE_TOKEN` comes from the environment's settings. It is never written to the repo, a log or a commit.
- Page: One House (`111210318028466`). Instagram: `@onehouse_eg` (`17841456046087917`).
- Facebook holds scheduled posts itself, so they go out on time with no session running. Instagram has no scheduling in the API, so `run` posts it when the time comes.

## Cadence

Two posts a day, every day: **14:00 and 21:00 Cairo** (lunch break and the evening peak). Reels take the evening slot. The content runs (Sunday and Wednesday) keep at least 8 days queued.

## House style

The page should read like a big, confident brand. Never like a hard sell.

- One idea per post, and **a new idea every time**. Before writing, read every caption in `posts.py` and don't repeat an idea, an angle or a headline already used.
- **Every post stands on its own.** Most people seeing it have never seen another One House post. So each post says what we do and what to do next (the closing line or the footer), and never leans on another post: no «زي ما قلنا», «الجزء التاني», «كمان».
- Short lines, plain Egyptian Arabic, and concrete facts over adjectives.
- No hype words (خطير، نار، مبيخلصش), no strings of emojis, no "اكتب كلمة كذا".
- At most one question per post, and not on every post. Three or four hashtags, always starting with `#ون_هاوس`.
- The two lines of business alternate:
  - Structure (المسلّح والصبّات: foundations, columns, slabs, concrete), on real site photos (`SPOSTS`, `renders/structure-posts/`).
  - Finishing and renovation, on photos (`renders/finishing-posts/`).
  - Both close on «احجز معاينتك المجانية».
- Bathroom units are paused by the owner: no unit posts until they say so (`UPOSTS` stays in the code).
- Images keep the shared frame from `src/posts/Finishing.tsx`: full-bleed photo, logo, gold rule, footer.
- Every post is designed as a post. Never use a frame or a drawing from one of the videos: on its own it explains nothing.
- **It should look like Egypt.** Clips and photos come from places that could pass for New Cairo or a desert city: dry, sandy ground, beige and white concrete, strong sun, palm trees at most. People should look Egyptian or Arab. So never use lush green fields, tropical or jungle trees, snow, European or East Asian streets, or crews and clients who clearly don't look Egyptian. Search for footage with terms like "desert construction", "Middle East construction", "Dubai", "Cairo", "Arab engineer", "Arab family", and look at a frame of every clip before using it.
- **Every video is unique.** A clip appears in one video only: add new clips to `scripts/finishing_media.py` under the reel's own prefix, and run `python3 scripts/check-media.py` (it fails on any shared clip) before rendering. Each voiced reel also gets its own signature graphic (`src/reels/signatures.tsx`: scan, stamp, depth, stages, chat); a new reel gets a new one rather than a repeat.

**Never in a post or a reply:**
- Warranties or guarantees.
- Payment in instalments.
- Maintenance after handover.
- Client testimonials or made-up reviews.
- Phone or WhatsApp numbers.
- Prices. Offers change; prices go by message.
- Anything about competitors.

## Replying to comments

- Reply to every genuine comment within the day, in short, warm Egyptian Arabic. One or two sentences, from "ون هاوس". No emojis beyond one.
- Questions about price, sizes, availability, location or a visit:
  - Thank them and invite them to message the page. For example: «أهلاً بيك 🙏 ابعتلنا رسالة على الصفحة بمقاس حمامك وهنبعتلك كل التفاصيل».
  - For finishing, invite them to book the free inspection.
- Compliments: a short thank-you.
- A complaint or an angry comment:
  - Don't argue and don't promise anything.
  - Apologise for the trouble and ask them to message the page so the team can follow up.
  - Then tell the owner. Send a push notification quoting the comment.
- Spam, ads, links or abuse: don't reply.
- Anything you are unsure about: don't reply, and list it for the owner.

## Scheduled runs

Scheduled tasks clone this repository on branch `claude/company-motion-graphics-video-fp6kq7`, work in `one-house-reel/`, and commit `social/calendar.json` (and any new posts) back to that branch. Messages to the owner are in Egyptian Arabic.

**Daily run (several times a day):**
- `python3 social/publish.py sync`, then `python3 social/publish.py run`: publishes what is due, and re-queues anything that dropped out of Facebook's queue.
- `python3 social/publish.py inbox` lists new comments; reply to each per the rules above.
- Commit and push `social/calendar.json` if it changed.
- Stay silent unless something failed or needs the owner.

**Weekly run (Sunday morning):**
1. Run `python3 social/publish.py report` and write the week's numbers into a short report for the owner. Include what worked best and what you will do differently.
2. Keep at least two weeks of posts queued:
   - Write new posts into `posts.py`, alternating structure and finishing.
   - Build the images as new entries in `src/posts/Finishing.tsx` (`SPOSTS` for structure, `FPOSTS` for finishing), and render them with `npx remotion still`.
   - Photos: the posts' own photos come from Pixabay (`scripts/prepare-post-photos.py`, needs `PIXABAY_KEY`). Without that key, use Pexels: find photos with a web fetch of `https://www.pexels.com/search/<query>/?orientation=portrait`, then download `https://images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg` into `public/post-photos/` and add it to `src/posts/photos.json`. Credit new photos in `CREDITS.md`. New stock photos are fine (Pexels or Pixabay), but never commit an API key.
   - Look at each render before queuing it.
3. Run `plan` and `run`, then commit and push.
4. Never create or activate paid ads, and never spend money. The paid campaign drafts stay drafts until the owner says «انشر» for them.

## Voiceover (ElevenLabs)

**For now the owner generates every voiceover himself on the ElevenLabs website.** The API keys are free accounts, which can't use library voices. So never call the API. Write the script in `social/voice/<name>.txt`, send him the text ready to paste, and wait for the file. When it arrives, `check` and `verify` still apply: Whisper listens to his file the same way.


`social/voice.py` makes the reels' narration. The voice is «Mostafa – Bold and Spirited» on model `eleven_v4`, the voice of the finishing reel. The keys are `ELEVENLABS_API_KEY`, `ELEVENLABS_API_KEY2` and onwards in the environment. When one key runs out, the next one is used.

Credits are limited, so a voiceover is generated **once, when the script is final**:

1. Write the script in `social/voice/<name>.txt`, one sentence per line. Get it right first: read it aloud in your head as an Egyptian announcer would say it, and keep it short.
2. Add diacritics only where Egyptian pronunciation is at risk, never on every letter. Full tashkeel pushes the voice towards formal Arabic. Mark:
   - brand and foreign words: وَن هاوْس، بورْدْيوم، سوفْت كْلوز، سْمارْت هوم
   - words the model has misread before: نِتّ
   - a shadda or vowel wherever a word could be read two ways.
3. Run `python3 social/voice.py check <file>`. It is free, and it shows the cost, the credits left, and lines that still need diacritics.
4. Run `say`. Lines already generated come from the cache and cost nothing.
5. Run `verify`. Whisper listens back to every line.
6. For any flagged line, fix only its text and run `redo <file> <line>`. Never regenerate the whole script to fix one word.
