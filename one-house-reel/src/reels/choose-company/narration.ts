// Voiceover script for the "choose-company" reel in normal spelling (social/voice/choose-company.txt without the diacritics).
// REEL=reels/choose-company scripts/finishing-timeline.py aligns it to the recording and writes timeline.json here.
export const SCRIPT = `
قبل ما تختار شركة تشطيب… اسألها خمس أسئلة.
مين المهندس اللي هيتابع شقتي؟
فين عرض السعر بالبند… بالخامة والكمية؟
هشوف تصميم ثري دي قبل ما نبدأ؟
معاد التسليم مكتوب في العقد؟
وهتوصلني صور كل مرحلة؟
لو أي إجابة مش واضحة… فكر تاني.
في ون هاوس… الخمس إجابات مكتوبين قبل ما نبدأ.
احجز معاينتك المجانية… وابعتلنا رسالة على الصفحة.
`;

export const SCENES = [
  { id: "hook", from: "قبل ما" },
  { id: "q1", from: "مين المهندس" },
  { id: "q2", from: "فين عرض" },
  { id: "q3", from: "هشوف تصميم" },
  { id: "q4", from: "معاد التسليم" },
  { id: "q5", from: "وهتوصلني صور" },
  { id: "think", from: "لو أي" },
  { id: "brand", from: "في ون" },
  { id: "cta", from: "احجز معاينتك" },
] as const;
