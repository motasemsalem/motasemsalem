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
python3 social/publish.py plan --start 2026-12-01   # dates new posts in posts.py, one every 2 days at 20:00
python3 social/publish.py run                       # posts what is due on Instagram, schedules Facebook 4 weeks ahead
python3 social/publish.py inbox                     # unanswered comments from the last 7 days
python3 social/publish.py reply <comment id> "<text>" [--ig]
python3 social/publish.py report
```

**Token:**
- `META_PAGE_TOKEN` comes from the environment's settings. It is never written to the repo, a log or a commit.
- Page: One House (`111210318028466`). Instagram: `@onehouse_eg` (`17841456046087917`).
- Facebook holds scheduled posts itself, so they go out on time with no session running. Instagram has no scheduling in the API, so `run` posts it when the time comes.

## House style

The page should read like a big, confident brand. Never like a hard sell.

- One idea per post. Short lines, plain Egyptian Arabic, and concrete facts over adjectives.
- No hype words (خطير، نار، مبيخلصش), no strings of emojis, no "اكتب كلمة كذا".
- At most one question per post, and not on every post. Three or four hashtags, always starting with `#ون_هاوس`.
- The two lines of business alternate:
  - Finishing and renovation, closing on «احجز معاينتك المجانية».
  - Bordium bathroom units, closing on «ابعتلنا مقاس حمامك».
- Images keep the shared frame from `src/posts/Finishing.tsx`: full-bleed photo, logo, gold rule, footer.

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
- `python3 social/publish.py run` publishes what is due.
- `python3 social/publish.py inbox` lists new comments; reply to each per the rules above.
- Commit and push `social/calendar.json` if it changed.
- Stay silent unless something failed or needs the owner.

**Weekly run (Sunday morning):**
1. Run `python3 social/publish.py report` and write the week's numbers into a short report for the owner. Include what worked best and what you will do differently.
2. Keep at least two weeks of posts queued:
   - Write new posts into `posts.py`, alternating finishing and bathroom units.
   - Build the images as new entries in `src/posts/Finishing.tsx` (`FPOSTS` / `UPOSTS`) and render them with `npx remotion still`.
   - Reuse the photos already in `public/unit-photos/` and the posts pipeline. New stock photos are fine (Pexels or Pixabay), but never commit an API key.
   - Look at each render before queuing it.
3. Run `plan` and `run`, then commit and push.
4. Never create or activate paid ads, and never spend money. The paid campaign drafts stay drafts until the owner says «انشر» for them.

## Voiceover (ElevenLabs)

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
