// Voiceover script for the "bathroom-test" reel in normal spelling (social/voice/bathroom-test.txt without the diacritics).
// REEL=reels/bathroom-test scripts/finishing-timeline.py aligns it to the recording and writes timeline.json here.
export const SCRIPT = `
الجيران اشتكوا من نشع في سقفهم… وانت لسه مشطب الحمام؟
الحمام لازم يتعزل قبل السيراميك… الأرضية كلها… وطالع على الحيطة.
وبعدها… بنملاه مية… ونسيبه يومين.
لو سقف الجيران فضل ناشف… ساعتها بس بنركب السيراميك.
في ون هاوس… تجربة المية خطوة ثابتة في كل حمام.
ابعتلنا كلمة معاينة في رسالة… والمهندس يجيلك ويشوف شقتك.
`;

export const SCENES = [
  { id: "hook", from: "الجيران" },
  { id: "seal", from: "الحمام لازم" },
  { id: "fill", from: "وبعدها" },
  { id: "dry", from: "لو سقف" },
  { id: "brand", from: "في ون" },
  { id: "cta", from: "ابعتلنا" },
] as const;
