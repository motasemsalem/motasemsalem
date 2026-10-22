# القبائل العربية في مصر — ريل موشن جرافيك

ريل عربي رأسي (1080×1920، 30 إطار/ث، نحو 3 دقائق) بتعليق صوتي وكابشن متزامن كلمة بكلمة وموسيقى ومؤثرات، عن أكثر من 30 قبيلة عربية في مصر من الفتح الإسلامي سنة 639م إلى اليوم، معمول بـ [Remotion](https://www.remotion.dev/).

النسخة المرندرة: [`renders/arab-tribes.mp4`](renders/arab-tribes.mp4)

## المحطات

المقدمة · الفتح وخِطَط الفسطاط (تُجيب، لخم، المعافر، مهرة) · قيس في الشرقية · تغريبة بني هلال وبني سُليم · السيرة الهلالية · جُهينة وهوّارة · الأشراف والجعافرة وبنو الكنز · العبابدة · شمال سيناء (السواركة، الرميلات، الترابين، المساعيد، البياضية) · وسط وجنوب سيناء (التياها، الأحيوات، العزازمة، مزينة، العليقات، القرارشة، الجبالية) · القناة والشرقية (الحويطات، العيايدة، الطحاوية) · أولاد علي · الجوازي والفوايد والرماح والهنادي · العادات · الخاتمة

بيانات القبائل (الاسم، المكان، الإحداثيات، الكلمة اللي بتظهر عندها) في `src/tribes.ts`.

## الصوت

- **التعليق الصوتي:** نصه مشكّل في `src/narration.ts`، ومولَّد بموديل ElevenLabs الأكثر تعبيرًا `eleven_v3` في `public/voiceover/`: ملف `mp3` وملف `json` فيه توقيت كل كلمة. مدة كل مشهد بتتحسب من آخر كلمة (`src/timing.ts`)، والكابشن وكروت القبائل والعناصر على الخريطة بتتزامن مع الكلمات نفسها (`src/cue.ts`).
- **مراجعة النطق:** `scripts/check-voiceover.py` بيفرّغ كل مقطع بـ Whisper ويطلع الكلمات اللي اتقالت غلط مقارنة بالنص، فيتعاد توليد المقاطع دي بـ seed تاني.
- **الموسيقى والمؤثرات:** متولّدة بالكود، فمفيش مشاكل حقوق: إيقاع مقسوم على مقام حجاز ومؤثرات (swoosh، pop، hit، riser...) من `scripts/generate-audio.py`، والباقي من `human-evolution/scripts/generate-sfx.py`.

لإعادة توليد التعليق بعد تعديل النص (احذف ملفات المشهد أو استخدم `--force`):

```console
ELEVENLABS_API_KEY=sk_... NODE_USE_ENV_PROXY=1 FFMPEG=ffmpeg node --experimental-strip-types scripts/generate-voiceover.ts
pip install faster-whisper && python3 scripts/check-voiceover.py      # يطلع الكلمات الغلط
ELEVENLABS_API_KEY=sk_... ... generate-voiceover.ts --only=qays,south --seed=2   # إعادة المقاطع دي بس
```

## التعديل

- المشاهد والنصوص على الشاشة والمؤثرات: `src/scenes.tsx`
- كروت القبائل والعدّاد: `src/components/Tribes.tsx`
- الخريطة: `src/components/EgyptMap.tsx` والإحداثيات في `src/geo.ts`
- الألوان والخطوط: `src/theme.ts`

```console
npm i
npm run dev                                   # Remotion Studio للمعاينة والتعديل
npx remotion render ArabTribes out/arab-tribes.mp4
```

الخطوط (Alexandria و IBM Plex Sans Arabic) موجودة في `public/fonts` برخصة SIL OFL، فالرندر مش محتاج إنترنت.
