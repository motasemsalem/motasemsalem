// Voiceover script (Egyptian Arabic), one entry per scene in playback order.
// `minSeconds` is the shortest the scene may be for its animation to finish.
// `seed` overrides the ElevenLabs seed for a scene whose default take had a slip.
export const NARRATION = [
  {
    id: "hook",
    minSeconds: 10,
    text: "استنّى ثانية! قبل ما تستلم مفتاح بيتك، فيه حكاية كاملة إنت ما شُفتهاش. حكاية بتبدأ بحفرة في الأرض، وبتخلص بالمفتاح ده في إيدك.",
  },
  {
    id: "brand",
    minSeconds: 6.5,
    text: "ودي حكايتنا كل يوم، في وان هاوس.",
  },
  {
    id: "foundation",
    minSeconds: 10,
    text: "كل حاجة بتبدأ من تحت. حفر، وخرسانة نضافة، وقواعد مصبوبة بالحساب. لأن البيت القوي، بيبان من أساسه.",
  },
  {
    id: "columns",
    minSeconds: 10,
    text: "وبعدها الأعمدة بتطلع. حديد متربط بإيد خبرة، وكل عمود بيتراجع على الرسم، قبل ما الخرسانة تنزل.",
  },
  {
    id: "formwork",
    minSeconds: 10.5,
    text: "وفوق، الشدّة الخشبية بتتركب واحدة واحدة. قوايم وعروق متظبطة بالميزان، علشان السقف يتصب مستوي ومظبوط.",
  },
  {
    id: "floors",
    minSeconds: 10.5,
    text: "ودور ورا دور، المبنى بيكبر قدام عينيك. وفريقنا موجود في الموقع كل يوم، في الحر وفي البرد.",
  },
  {
    id: "values",
    minSeconds: 11,
    seed: 21, // this seed reads every word cleanly
    text: "وعندنا تلات حاجات، عمرنا ما نتنازل عنهم: خامات مضمونة، والتزام بالمواعيد، وشفافية في كل خطوة.",
  },
  {
    id: "process",
    minSeconds: 11,
    text: "من التصميم، للتنفيذ، للتشطيب، لحد التسليم. إنت متابع معانا خطوة بخطوة.",
  },
  {
    id: "closing",
    minSeconds: 13,
    text: "وان هاوس. من أول طوبة، لحد ما تستلم المفتاح. ابعتلنا رسالة دلوقتي، وخلّي بيتك يبدأ صح.",
  },
] as const;

export type SceneId = (typeof NARRATION)[number]["id"];
