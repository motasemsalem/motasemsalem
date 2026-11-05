// Voiceover script for the "ac-wiring" reel in normal spelling (social/voice/ac-wiring.txt without the diacritics).
// REEL=reels/ac-wiring scripts/finishing-timeline.py aligns it to the recording and writes timeline.json here.
export const SCRIPT = `
التكييف بيفصل لوحده كل شوية؟ والفيشة سخنة؟
المشكلة غالبا مش في التكييف… المشكلة في السلك.
التكييف محتاج خط لوحده من اللوحة… بسلك تخين على قد حمله… وقاطع خاص بيه.
ودي حاجة بتتحدد في التأسيس… قبل المحارة… مش بعد ما تتكسر الحيطة.
في ون هاوس… رسمة الكهربا بتتعمل لكل جهاز قبل أول سلك.
ابعتلنا كلمة معاينة في رسالة… والمهندس يجيلك ويشوفها معاك.
`;

export const SCENES = [
  { id: "hook", from: "التكييف بيفصل" },
  { id: "cause", from: "المشكلة غالبا" },
  { id: "line", from: "التكييف محتاج" },
  { id: "wire", from: "بسلك" },
  { id: "breaker", from: "وقاطع" },
  { id: "early", from: "ودي حاجة" },
  { id: "brand", from: "في ون" },
  { id: "cta", from: "ابعتلنا" },
] as const;
