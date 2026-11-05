// Voiceover script for the "design-first" reel in normal spelling (social/voice/design-first.txt without the diacritics).
// REEL=reels/design-first scripts/finishing-timeline.py aligns it to the recording and writes timeline.json here.
export const SCRIPT = `
عاوز تغير مكان المطبخ بعد ما اتركب؟ يعني تكسير… وخامة من الأول… ووقت ضايع.
التعديل على الشاشة ببلاش… التعديل على الحيطة غالي.
عشان كده بنعمل تصميم ثري دي لكل أوضة… تلف فيه… وتغير اللون… والخامة… والإضاءة.
ولما توافق… التنفيذ بيمشي على التصميم بالظبط.
في ون هاوس… بتشوف بيتك قبل ما يتبني.
ابعتلنا كلمة معاينة في رسالة… والمهندس يجيلك ويبدأ معاك.
`;

export const SCENES = [
  { id: "hook", from: "عاوز تغير" },
  { id: "screen", from: "التعديل على" },
  { id: "design", from: "عشان كده" },
  { id: "build", from: "ولما توافق" },
  { id: "brand", from: "في ون" },
  { id: "cta", from: "ابعتلنا" },
] as const;
