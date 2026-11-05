// Voiceover script for the "one-engineer" reel in normal spelling (social/voice/one-engineer.txt without the diacritics).
// REEL=reels/one-engineer scripts/finishing-timeline.py aligns it to the recording and writes timeline.json here.
export const SCRIPT = `
أول مرة تشطب… هتلاقي نفسك بتكلم سباك… وكهربائي… ونقاش… ومبلط.
وكل واحد بيقول الغلط من اللي قبله.
في ون هاوس… مهندس واحد مسؤول عن شقتك كلها… من الطوب للمفتاح.
بيمشي كل مرحلة في ترتيبها… والصور بتوصلك أول بأول.
ابعتلنا كلمة معاينة في رسالة… والمهندس عندك خلال تمانية وأربعين ساعة.
`;

export const SCENES = [
  { id: "hook", from: "أول مرة" },
  { id: "trades", from: "سباك" },
  { id: "blame", from: "وكل واحد" },
  { id: "brand", from: "في ون" },
  { id: "order", from: "بيمشي كل" },
  { id: "photos", from: "والصور" },
  { id: "cta", from: "ابعتلنا" },
] as const;
