// The slab-pour reel's voiceover script in normal spelling (social/voice/slab-reel.txt without the diacritics).
// REEL=slab scripts/finishing-timeline.py aligns it to the recording and writes src/slab/timeline.json.
export const SCRIPT = `
قبل ما تصب السقف… فيه خمس حاجات لازم تتأكد منها.
أولاً: الشدة تكون مستوية بالميزان.
تانياً: الحديد مطابق للرسومات، في العدد والقطر.
تالتاً: الكانات متقاسة بالمسطرة… مش بالعين.
رابعاً: البسكوت تحت الحديد، علشان الخرسانة تغطيه وميصديش.
خامساً: المهندس يراجع ويمضي، قبل ما الصبة تبدأ.
وبعد الصبة: مكعبات للمعمل، ورش مية أسبوع كامل.
في ون هاوس… كل صبة بتتعمل كده.
احجز معاينتك المجانية… وابعتلنا رسالة على الصفحة.
`;

// Sections in playback order; each starts on the script words in `from` (searched after the previous section).
export const SCENES = [
  { id: "hook", from: "قبل" },
  { id: "level", from: "أولاً" },
  { id: "rebar", from: "تانياً" },
  { id: "stirrups", from: "تالتاً" },
  { id: "spacers", from: "رابعاً" },
  { id: "engineer", from: "خامساً" },
  { id: "after", from: "وبعد" },
  { id: "brand", from: "في ون" },
  { id: "cta", from: "احجز" },
] as const;

export type SceneId = (typeof SCENES)[number]["id"];
