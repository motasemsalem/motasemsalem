# القبائل العربية في مصر — ريل موشن جرافيك

ريل عربي رأسي (1080×1920، 30 إطار/ث، نحو دقيقتين) بتعليق صوتي وكابشن متزامن كلمة بكلمة وموسيقى ومؤثرات، عن القبائل العربية في مصر من الفتح الإسلامي سنة 639م إلى اليوم، معمول بـ [Remotion](https://www.remotion.dev/).

النسخة المرندرة: [`renders/arab-tribes.mp4`](renders/arab-tribes.mp4)

## المحطات

المقدمة · الفتح والفسطاط وخِطَطها · قيس في الشرقية (727م) · تغريبة بني هلال وبني سُليم · السيرة الهلالية · جُهينة · بنو الكنز في أسوان · هوّارة وشيخ العرب همّام · الأشراف والعبابدة · قبائل سيناء · أولاد علي في مطروح · العادات · الخاتمة

## الصوت

- **التعليق الصوتي:** نصه في `src/narration.ts`، ومولَّد بـ ElevenLabs (endpoint `with-timestamps`) في `public/voiceover/`: ملف `mp3` وملف `json` فيه توقيت كل كلمة. مدة كل مشهد بتتحسب من آخر كلمة (`src/timing.ts`)، والكابشن والعناصر اللي بتظهر على الخريطة بتتزامن مع الكلمات نفسها (`src/cue.ts`).
- **الموسيقى والمؤثرات:** متولّدة بالكود، فمفيش مشاكل حقوق: إيقاع مقسوم على مقام حجاز ومؤثرات (swoosh، pop، hit، riser...) من `scripts/generate-audio.py`، والباقي من `human-evolution/scripts/generate-sfx.py`.

لإعادة توليد التعليق بعد تعديل النص (احذف ملفات المشهد أو استخدم `--force`):

```console
ELEVENLABS_API_KEY=sk_... NODE_USE_ENV_PROXY=1 node --experimental-strip-types scripts/generate-voiceover.ts
```

## التعديل

- المشاهد والنصوص على الشاشة والمؤثرات: `src/scenes.tsx`
- الخريطة: `src/components/EgyptMap.tsx` والإحداثيات في `src/geo.ts`
- الألوان والخطوط: `src/theme.ts`

```console
npm i
npm run dev                                   # Remotion Studio للمعاينة والتعديل
npx remotion render ArabTribes out/arab-tribes.mp4
```

الخطوط (Alexandria و IBM Plex Sans Arabic) موجودة في `public/fonts` برخصة SIL OFL، فالرندر مش محتاج إنترنت.
