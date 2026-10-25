// Voiceover script for the "slab-mistakes" reel in normal spelling (social/voice/slab-mistakes.txt without the diacritics).
// REEL=reels/slab-mistakes scripts/finishing-timeline.py aligns it to the recording and writes timeline.json here.
export const SCRIPT = `
تلات غلطات… ممكن تبوظ السقف وإنت مش واخد بالك.
الغلطة الأولى: الصب على مرتين… فيبقى فيه فاصل يدخل منه النشع.
الغلطة التانية: مية زيادة في الخلطة… الخرسانة تبقى أسهل في الصب، بس أضعف بكتير.
الغلطة التالتة: فك الشدة بدري… قبل ما الخرسانة تاخد قوتها.
والحل؟ صبة واحدة، وخلطة مظبوطة، وصبر على الشدة.
وهزاز يطلع الهوا… ورش مية أسبوع كامل.
في ون هاوس… السقف بيتصب مرة واحدة، وصح.
احجز معاينتك المجانية… وابعتلنا رسالة على الصفحة.
`;

export const SCENES = [
  { id: "hook", from: "تلات غلطات…" },
  { id: "m1", from: "الغلطة الأولى:" },
  { id: "m2", from: "الغلطة التانية:" },
  { id: "m3", from: "الغلطة التالتة:" },
  { id: "fix", from: "والحل؟ صبة" },
  { id: "vibe", from: "وهزاز يطلع" },
  { id: "brand", from: "في ون" },
  { id: "cta", from: "احجز معاينتك" },
] as const;
