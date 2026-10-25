// The finishing reel's voiceover script in normal spelling (FINISHING-SCRIPT.md without the delivery tags).
// scripts/finishing-timeline.py aligns it to the recording and writes src/finishing/timeline.json.
export const SCRIPT = `
قبل ما تمضي عقد تشطيب… اتفرج على ده للآخر.
في ون هاوس… هتعرف كل خطوة قبل ما تحصل.
مهندس بينزلك معاينة ببلاش… يقيس، ويسمع إنت عاوز إيه.
تصميم 3D… تشوف شقتك قبل ما نبدأ.
وتختار خاماتك بإيدك… بورسلين، رخام، باركيه، وألوانك.
عرض سعر بالبنود… وعقد فيه المواصفات ومعاد التسليم. ومفيش مفاجآت.
ونبدأ باللي مش باين… لأنه أهم حاجة.
تكسير وتجديد… لو الشقة قديمة.
كهربا… كل دايرة لوحدها، وسلك بالمقاس الصح.
سباكة… مواسير بتتجرب بالضغط قبل ما الحيطة تتقفل.
عزل الحمامات والمطابخ… ومية تقعد يومين قبل البلاط.
تأسيس تكييف، ونت، ودش، وكاميرات، وسمارت هوم.
ومحارة بالميزان… الحيطة مستقيمة زي المسطرة.
وبعدين… تيجي الشياكة.
جبس بورد… وإضاءة مخفية.
بورسلين ورخام وباركيه… بالميزان.
دهانات، وورق حائط، وتجاليد خشب.
مطابخ، ودريسنج، وأبواب.
ألوميتال، وأطقم حمامات، وكل التركيبات.
ولو فيلا… واجهات ولاندسكيب كمان.
وإنت متابع كل مرحلة بالصور… حتى لو مسافر.
وفي الآخر… نسلّمهالك نضيفة، جاهزة تسكن على طول.
ون هاوس… شياكة من بره، وضمير من جوّه.
احجز معاينتك المجانية دلوقتي!
`;

// Sections in playback order; each starts on the script words in `from` (searched after the previous section).
export const SCENES = [
  { id: "hook", from: "قبل" },
  { id: "promise", from: "في ون" },
  { id: "visit", from: "مهندس" },
  { id: "design", from: "تصميم" },
  { id: "materials", from: "وتختار" },
  { id: "quote", from: "عرض" },
  { id: "hidden", from: "ونبدأ" },
  { id: "demo", from: "تكسير" },
  { id: "electric", from: "كهربا" },
  { id: "plumbing", from: "سباكة" },
  { id: "insulation", from: "عزل" },
  { id: "systems", from: "تأسيس" },
  { id: "plaster", from: "ومحارة" },
  { id: "luxe", from: "وبعدين" },
  { id: "gypsum", from: "جبس" },
  { id: "floors", from: "بورسلين ورخام" },
  { id: "paint", from: "دهانات" },
  { id: "carpentry", from: "مطابخ" },
  { id: "fittings", from: "ألوميتال" },
  { id: "villa", from: "ولو" },
  { id: "follow", from: "وإنت" },
  { id: "handover", from: "وفي" },
  { id: "brand", from: "ون هاوس… شياكة" },
  { id: "cta", from: "احجز" },
] as const;

export type SceneId = (typeof SCENES)[number]["id"];
