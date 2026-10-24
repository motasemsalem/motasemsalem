// The voiceover script in normal spelling, as it appears on screen. (The recording was generated from a
// respelled copy so the voice pronounces it right; alignment to the audio is fuzzy, so that is fine.)
// scripts/generate-audio.py aligns it to the Whisper word timings of public/voiceover/voiceover.mp3.
export const SCRIPT = `
شكلها حلو من بره… بس جوّه الحيطة فيه إيه؟ الدهان بيداري… لكن الأساس مبيكدبش.
حديد ناقص؟ أسمنت مغشوش؟ سقف بينشّ مية؟ شروخ بعد سنة؟ مش عندنا.
ون هاوس… المسلّح صح، من أول طوبة.
واحد: الأساس… جسّة تربة، وقواعد مسلحة على الرسومات.
اتنين: الأعمدة… حديد مطابق، وكانات بالمسطرة… مش بالعين.
تلاتة: السقف… شدّة بالميزان، وصبّة واحدة بالهزّاز.
أربعة: الخرسانة… مكعبات للمعمل، ورشّ مية أسبوع.
وكل مرحلة… مهندس يراجع ويمضي. وإنت متابع بالصور… خطوة بخطوة.
عايز تعرف شقتك هتتقسم إزاي؟ استوديو ون هاوس 2D: ارسم شقتك… صدّرها PDF… وابعتها للمهندس. ببلاش!
ون هاوس… بيت يعيش العمر كله. احجز معاينتك المجانية دلوقتي!
`;

// Sections in playback order; each one starts on the script word in `from`.
export const SCENES = [
  { id: "hook", from: "شكلها" },
  { id: "pain", from: "حديد" },
  { id: "brand", from: "ون" },
  { id: "foundation", from: "واحد:" },
  { id: "columns", from: "اتنين:" },
  { id: "slab", from: "تلاتة:" },
  { id: "concrete", from: "أربعة:" },
  { id: "review", from: "وكل" },
  { id: "studio", from: "عايز" },
  { id: "closing", from: "ون هاوس… بيت" },
] as const;

export type SceneId = (typeof SCENES)[number]["id"];
