// Voiceover script for the "gypsum-cracks" reel in normal spelling (social/voice/gypsum-cracks.txt without the diacritics).
// REEL=reels/gypsum-cracks scripts/finishing-timeline.py aligns it to the recording and writes timeline.json here.
export const SCRIPT = `
السقف الجبس اتشرخ بعد كام شهر؟ الشرخ ده ليه سبب.
الشريط بتاع الوصلات لازم يتحط… والمعجون يتعمل على مرتين.
القطاعات المعدن بتتركب على مسافات مظبوطة… مش على قد ما الخامة تكفي.
وفي الحمام والمطبخ… لوح أخضر بيستحمل الرطوبة.
في ون هاوس… كل لوح بيتراجع قبل ما يتقفل عليه.
ابعتلنا كلمة معاينة في رسالة… والمهندس يجيلك ويشوف شقتك.
`;

export const SCENES = [
  { id: "hook", from: "السقف الجبس" },
  { id: "tape", from: "الشريط" },
  { id: "studs", from: "القطاعات" },
  { id: "wet", from: "وفي الحمام" },
  { id: "brand", from: "في ون" },
  { id: "cta", from: "ابعتلنا" },
] as const;
