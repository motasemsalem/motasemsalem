// The voiceover script in normal spelling, as it appears on screen. (The recording was generated from a
// respelled copy so the voice pronounces it right; alignment to the audio is fuzzy, so that is fine.)
// scripts/generate-audio.py aligns it to the Whisper word timings of public/voiceover/voiceover.mp3.
export const SCRIPT = `
إنت دافع تحويشة عمرك في شقة… بس عمرك سألت نفسك: إيه اللي جوّه الحيطة دي؟ الحديد، والخرسانة، والأساس اللي تحت رجليك… تعالى أوريك.
إحنا ون هاوس! وده اللي بنعمله كل يوم.
كل حاجة بتبدأ من تحت. حفر بالمقاسات، خرسانة نضافة، وقواعد مسلحة مصبوبة بالحساب الإنشائي… لأن البيت القوي بيبان من أساسه، مش من دهانه.
بعدها الأعمدة بتطلع. حديد متربط بإيد صنايعية فاهمة، وكل عمود بيتراجع على الرسومات مع مهندس الموقع، قبل ما نقرّب للخرسانة.
وعلى السطح، الشدّة الخشب بتتركب حتّة حتّة. قوايم وعروق متظبطة بالميزان، علشان السقف يتصب مستوي… من غير شرخ ولا ميل.
ودور ورا دور، العمارة بتكبر قدام عينك. وفريقنا في الموقع كل يوم، في حر الصيف، وفي برد الشتا.
ومش بنقف عند العضم! بنكمّل معاك التشطيب على المفتاح: سباكة، وكهربا، وعزل، ومحارة، ورخام، ودهانات… وتصميم تلاتي الأبعاد، تشوف بيه بيتك قبل ما يتبني.
وكمان عندنا مصنعنا الخاص لوحدات الحمام البورديوم، مقاومة للمية، وبضمان مدى الحياة.
أكتر من خمسمية مشروع، واتناشر سنة خبرة، وعقود واضحة، ومواعيد تسليم بنلتزم بيها… وإنت متابع معانا خطوة بخطوة.
ون هاوس… من أول طوبة، لحد ما تستلم المفتاح. احجز استشارتك المجانية دلوقتي، وخلّي بيتك يبدأ صح.
`;

// Sections in playback order; each one starts on the script word in `from`.
export const SCENES = [
  { id: "hook", from: "إنت" },
  { id: "brand", from: "إحنا" },
  { id: "foundation", from: "كل حاجة" },
  { id: "columns", from: "بعدها" },
  { id: "formwork", from: "وعلى السطح" },
  { id: "floors", from: "ودور ورا" },
  { id: "finishing", from: "ومش بنقف" },
  { id: "bathroom", from: "وكمان" },
  { id: "stats", from: "أكتر" },
  { id: "closing", from: "ون هاوس… من" },
] as const;

export type SceneId = (typeof SCENES)[number]["id"];
