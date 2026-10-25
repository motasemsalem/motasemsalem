// Voiceover script for the "rebar-check" reel in normal spelling (social/voice/rebar-check.txt without the diacritics).
// REEL=reels/rebar-check scripts/finishing-timeline.py aligns it to the recording and writes timeline.json here.
export const SCRIPT = `
قبل ما الحديد يدخل الشدة… فيه أربع حاجات تكشف عليها بنفسك.
أولا: القطر… مكتوب على كل سيخ، ولازم يطابق الرسومات.
تانيا: العدد… عد الأسياخ في الكمرة والعمود، واحد واحد.
تالتا: الصدا… الصدا الخفيف عادي، لكن القشر اللي بيقع مرفوض.
رابعا: التراكب… الحديد لما يتوصل، يركب على بعضه بالطول اللي في الرسومات.
وفي الآخر… المهندس يراجع ويمضي قبل ما الصبة تبدأ.
في ون هاوس… الحديد بيتكشف عليه قبل ما يتصب.
احجز معاينتك المجانية… وابعتلنا رسالة على الصفحة.
`;

export const SCENES = [
  { id: "hook", from: "قبل ما" },
  { id: "dia", from: "أولا: القطر…" },
  { id: "count", from: "تانيا: العدد…" },
  { id: "rust", from: "تالتا: الصدا…" },
  { id: "lap", from: "رابعا: التراكب…" },
  { id: "engineer", from: "وفي الآخر…" },
  { id: "brand", from: "في ون" },
  { id: "cta", from: "احجز معاينتك" },
] as const;
