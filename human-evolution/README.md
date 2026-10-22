# رحلة الإنسان — فيديو موشن جرافيك

فيديو عربي (1920×1080، 30 إطار/ث، نحو 3 دقائق) بتعليق صوتي وموسيقى ومؤثرات، يشرح تطور البشرية من السلف المشترك مع الشمبانزي قبل نحو 7 ملايين سنة إلى اليوم، معمول بـ [Remotion](https://www.remotion.dev/).

النسخة المرندرة: [`renders/human-evolution.mp4`](renders/human-evolution.mp4)

## المشاهد

المقدمة · السلف المشترك · لوسي · أول الأدوات · الإنسان المنتصب · ترويض النار · دماغ يكبر · النياندرتال · الإنسان العاقل · الانتشار في العالم · الفن والرموز · الزراعة · الكتابة · الثورة الصناعية · العصر الرقمي · الخاتمة (شجرة التطور)

## الصوت

- **التعليق الصوتي:** نصه في `src/narration.ts`، ومولَّد بـ ElevenLabs في `public/voiceover/`. مدة كل مشهد بتتحسب أوتوماتيك من طول صوته (`src/voiceover.ts`).
- **الموسيقى والمؤثرات:** متولّدة بالكود (`scripts/generate-sfx.py`) في `public/music` و `public/sfx`، فمفيش مشاكل حقوق.

لإعادة توليد التعليق بعد تعديل النص (احذف ملف المشهد القديم أو استخدم `--force`):

```console
ELEVENLABS_API_KEY=sk_... NODE_USE_ENV_PROXY=1 node --experimental-strip-types scripts/generate-voiceover.ts
```

## التعديل

- النصوص على الشاشة والمؤثرات: `src/HumanEvolution.tsx`
- الرسومات: `src/art/`
- الألوان والخطوط: `src/theme.ts`

```console
npm i
npm run dev                                  # Remotion Studio للمعاينة والتعديل
npx remotion render HumanEvolution out/human-evolution.mp4
```

الخطوط (Alexandria و IBM Plex Sans Arabic) موجودة في `public/fonts` برخصة SIL OFL، فالرندر مش محتاج إنترنت.
