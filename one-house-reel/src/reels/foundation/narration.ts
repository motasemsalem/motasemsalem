// Voiceover script for the "foundation" reel in normal spelling (social/voice/foundation.txt without the diacritics).
// REEL=reels/foundation scripts/finishing-timeline.py aligns it to the recording and writes timeline.json here.
export const SCRIPT = `
البيت اللي بيشرخ بعد سنين… غالبا المشكلة في الأساس.
علشان كده قبل أي حفر… بنعمل جسة تربة.
الجسة بتقولنا الأرض شايلة قد إيه… ولازم نحفر لحد فين.
وبعدها القواعد… بتتسلح على الرسومات بالظبط.
وخرسانة عادية تحتها… علشان الحديد ميلمسش التربة.
وعزل للقواعد… يحميها من الرطوبة والأملاح.
في ون هاوس… البيت بيتبني من تحت لفوق، صح.
احجز معاينتك المجانية… وابعتلنا رسالة على الصفحة.
`;

export const SCENES = [
  { id: "hook", from: "البيت اللي" },
  { id: "survey", from: "علشان كده" },
  { id: "depth", from: "الجسة بتقولنا" },
  { id: "footings", from: "وبعدها القواعد…" },
  { id: "blinding", from: "وخرسانة عادية" },
  { id: "insulation", from: "وعزل للقواعد…" },
  { id: "brand", from: "في ون" },
  { id: "cta", from: "احجز معاينتك" },
] as const;
