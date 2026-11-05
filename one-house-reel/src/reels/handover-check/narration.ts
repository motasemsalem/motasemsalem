// Voiceover script for the "handover-check" reel in normal spelling (social/voice/handover-check.txt without the diacritics).
// REEL=reels/handover-check scripts/finishing-timeline.py aligns it to the recording and writes timeline.json here.
export const SCRIPT = `
قبل ما تمضي إنك استلمت شقتك من المطور… افحص أربع حاجات.
الحيطان… حط عليها قدة طويلة… وشوف فيه ميل ولا لأ.
السقف… دور على أي بقعة نشع أو شرخ.
الشبابيك… افتح واقفل… وشوف المية بتدخل من حواليها ولا لأ.
وضغط المية… افتح كل الحنفيات مع بعض.
في ون هاوس… المهندس ممكن يستلم الشقة معاك.
ابعتلنا كلمة معاينة في رسالة… ونحدد معاد.
`;

export const SCENES = [
  { id: "hook", from: "قبل ما" },
  { id: "walls", from: "الحيطان" },
  { id: "ceiling", from: "السقف" },
  { id: "windows", from: "الشبابيك" },
  { id: "water", from: "وضغط" },
  { id: "brand", from: "في ون" },
  { id: "cta", from: "ابعتلنا" },
] as const;
