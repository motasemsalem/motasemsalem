// Voiceover script for the "finishing-order" reel in normal spelling (social/voice/finishing-order.txt without the diacritics).
// REEL=reels/finishing-order scripts/finishing-timeline.py aligns it to the recording and writes timeline.json here.
export const SCRIPT = `
لو التشطيب ماشي بالترتيب الغلط… هتكسر اللي اتعمل.
الترتيب الصح بيبدأ باللي جوه الحيطة: كهربا وسباكة.
بعدها العزل… وتجربة المية في الحمامات والمطابخ.
وبعدين المحارة… بالميزان.
بعدها الجبس والإضاءة… وبعدين الأرضيات.
والدهان… آخر حاجة، علشان ميتبهدلش.
وإنت متابع كل مرحلة بالصور.
في ون هاوس… كل مرحلة في وقتها.
احجز معاينتك المجانية… وابعتلنا رسالة على الصفحة.
`;

export const SCENES = [
  { id: "hook", from: "لو التشطيب" },
  { id: "mep", from: "الترتيب الصح" },
  { id: "insulation", from: "بعدها العزل…" },
  { id: "plaster", from: "وبعدين المحارة…" },
  { id: "gypsum", from: "بعدها الجبس" },
  { id: "paint", from: "والدهان… آخر" },
  { id: "follow", from: "وإنت متابع" },
  { id: "brand", from: "في ون" },
  { id: "cta", from: "احجز معاينتك" },
] as const;
