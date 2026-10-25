import type { ReelDef, Timeline } from "./Reel";
import * as choose from "./choose-company/narration";
import chooseTl from "./choose-company/timeline.json";
import * as order from "./finishing-order/narration";
import orderTl from "./finishing-order/timeline.json";
import * as foundation from "./foundation/narration";
import foundationTl from "./foundation/timeline.json";
import * as rebar from "./rebar-check/narration";
import rebarTl from "./rebar-check/timeline.json";
import * as mistakes from "./slab-mistakes/narration";
import mistakesTl from "./slab-mistakes/timeline.json";

// The voiced reels: scripts in social/voice/<id>.txt, voiced by the owner. Clips are named in scripts/finishing_media.py.
const STRUCTURE_END = { media: "slab-building", line: "المسلّح صح… من أول طوبة" };
const FINISHING_END = { media: "kitchen", line: "تشطيب على أصوله" };

export const REELS: ReelDef[] = [
  {
    id: "rebar-check",
    timeline: rebarTl as Timeline,
    scenes: rebar.SCENES,
    shots: [
      { media: "slab-formwork", scene: "hook" },
      { media: "slab-grid", scene: "hook", word: "فيه" },
      { media: "str-cutting", scene: "dia" },
      { media: "slab-stirrups", scene: "dia", word: "ولازم" },
      { media: "slab-beam", scene: "count" },
      { media: "slab-mesh-wide", scene: "count", word: "واحد" },
      { media: "str-rust", scene: "rust" },
      { media: "slab-tying", scene: "lap" },
      { media: "slab-plans", scene: "engineer" },
      { media: "slab-pour", scene: "engineer", word: "قبل" },
      { media: "slab-aerial", scene: "brand" },
    ],
    cards: [
      { type: "title", scene: "hook", text: "قبل ما الحديد يدخل الشدّة…", accent: "الحديد", sub: "4 حاجات تكشف عليها بنفسك", subWord: "فيه", size: 88 },
      { type: "check", scene: "dia", n: 1, of: 4, name: "القُطر", point: "مكتوب على السيخ… ومطابق للرسومات", on: "مكتوب" },
      { type: "check", scene: "count", n: 2, of: 4, name: "العدد", point: "في الكمرة والعمود… واحد واحد", on: "عد" },
      { type: "check", scene: "rust", n: 3, of: 4, name: "الصدا", point: "الخفيف عادي… القِشر مرفوض", on: "الصدا", },
      { type: "check", scene: "lap", n: 4, of: 4, name: "التراكُب", point: "بالطول اللي في الرسومات", on: "يركب" },
      { type: "title", scene: "engineer", word: "المهندس", kicker: "وفي الآخر", text: "المهندس يراجع ويمضي", accent: "ويمضي" },
      { type: "title", scene: "brand", word: "الحديد", kicker: "في ون هاوس", text: "الحديد بيتكشف عليه قبل ما يتصبّ", accent: "يتصبّ", size: 84 },
    ],
    end: STRUCTURE_END,
  },
  {
    id: "slab-mistakes",
    timeline: mistakesTl as Timeline,
    scenes: mistakes.SCENES,
    shots: [
      { media: "str-crack", scene: "hook" },
      { media: "str-pump2", scene: "m1" },
      { media: "slab-pour", scene: "m1", word: "فيبقى" },
      { media: "str-night-mix", scene: "m2" },
      { media: "slab-mixer", scene: "m2", word: "الخرسانة" },
      { media: "str-form-worker", scene: "m3" },
      { media: "slab-formwork", scene: "m3", word: "قبل" },
      { media: "slab-pump", scene: "fix" },
      { media: "slab-beam", scene: "vibe" },
      { media: "slab-curing", scene: "vibe", word: "ورش" },
      { media: "slab-aerial", scene: "brand" },
    ],
    cards: [
      { type: "title", scene: "hook", text: "3 غلطات بتبوّظ السقف", accent: "بتبوّظ", sub: "وإنت مش واخد بالك", subWord: "وإنت" },
      { type: "check", scene: "m1", n: 1, of: 3, name: "الصبّ على مرّتين", point: "فاصل يدخل منه النشع", on: "فيبقى" },
      { type: "check", scene: "m2", n: 2, of: 3, name: "مية زيادة في الخلطة", point: "أسهل في الصبّ… بس أضعف", on: "الخرسانة" },
      { type: "check", scene: "m3", n: 3, of: 3, name: "فكّ الشدّة بدري", point: "قبل ما الخرسانة تاخد قوّتها", on: "قبل" },
      { type: "title", scene: "fix", word: "صبة", kicker: "والحل؟", text: "صبّة واحدة وخلطة مظبوطة", accent: "واحدة", sub: "وصبر على الشدّة", subWord: "وصبر", size: 88 },
      { type: "title", scene: "vibe", text: "هزّاز يطلّع الهوا", accent: "الهوا", sub: "ورشّ مية أسبوع كامل", subWord: "ورش" },
      { type: "title", scene: "brand", word: "السقف", kicker: "في ون هاوس", text: "السقف بيتصبّ مرة واحدة", accent: "واحدة", size: 88 },
    ],
    end: STRUCTURE_END,
  },
  {
    id: "foundation",
    timeline: foundationTl as Timeline,
    scenes: foundation.SCENES,
    shots: [
      { media: "str-crack", scene: "hook" },
      { media: "str-site-aerial", scene: "hook", word: "غالبا" },
      { media: "str-excavator", scene: "survey" },
      { media: "str-dig-aerial", scene: "depth" },
      { media: "str-footings", scene: "footings" },
      { media: "str-footings2", scene: "footings", word: "بتتسلح" },
      { media: "slab-formwork", scene: "blinding" },
      { media: "str-coating", scene: "insulation" },
      { media: "slab-aerial", scene: "brand" },
    ],
    cards: [
      { type: "title", scene: "hook", text: "البيت اللي بيشرّخ بعد سنين…", accent: "بيشرّخ", sub: "غالباً المشكلة في الأساس", subWord: "غالبا", size: 88 },
      { type: "check", scene: "survey", n: 1, of: 4, name: "جسّة تربة", point: "قبل أي حفر", on: "قبل" },
      { type: "title", scene: "depth", word: "الأرض", text: "الأرض شايلة قد إيه؟", accent: "قد إيه؟", sub: "ولازم نحفر لحد فين", subWord: "ولازم" },
      { type: "check", scene: "footings", n: 2, of: 4, name: "القواعد", point: "على الرسومات بالظبط", on: "بتتسلح" },
      { type: "check", scene: "blinding", n: 3, of: 4, name: "خرسانة عادية تحتها", point: "الحديد ميلمسش التربة", on: "علشان" },
      { type: "check", scene: "insulation", n: 4, of: 4, name: "عزل القواعد", point: "من الرطوبة والأملاح", on: "يحميها" },
      { type: "title", scene: "brand", word: "البيت", kicker: "في ون هاوس", text: "البيت بيتبني من تحت لفوق", accent: "لفوق", size: 88 },
    ],
    end: STRUCTURE_END,
  },
  {
    id: "finishing-order",
    timeline: orderTl as Timeline,
    scenes: order.SCENES,
    shots: [
      { media: "luxe-white", scene: "hook", look: "warm" },
      { media: "str-breaking", scene: "hook", word: "هتكسر" },
      { media: "drilling", scene: "mep", focus: 0.42 },
      { media: "pipes", scene: "mep", word: "وسباكة" },
      { media: "screed", scene: "insulation", focus: 0.45 },
      { media: "straightedge", scene: "plaster" },
      { media: "cove", scene: "gypsum", look: "warm" },
      { media: "tiling", scene: "gypsum", word: "وبعدين", look: "warm" },
      { media: "roller", scene: "paint", look: "warm" },
      { media: "brief", scene: "follow", look: "warm" },
      { media: "luxe-lights", scene: "brand", look: "warm" },
    ],
    cards: [
      { type: "title", scene: "hook", text: "التشطيب بالترتيب الغلط…", accent: "الغلط…", sub: "هتكسّر اللي اتعمل", subWord: "هتكسر", size: 92 },
      { type: "check", scene: "mep", n: 1, of: 5, name: "كهربا وسباكة", point: "اللي جوّه الحيطة الأول", on: "باللي" },
      { type: "check", scene: "insulation", n: 2, of: 5, name: "العزل", point: "وتجربة المية", on: "وتجربة" },
      { type: "check", scene: "plaster", n: 3, of: 5, name: "المحارة", point: "بالميزان", on: "بالميزان" },
      { type: "check", scene: "gypsum", n: 4, of: 5, name: "الجبس والإضاءة", point: "وبعدين الأرضيات", on: "وبعدين" },
      { type: "check", scene: "paint", n: 5, of: 5, name: "الدهان", point: "آخر حاجة… علشان ميتبهدلش", on: "آخر" },
      { type: "title", scene: "follow", word: "متابع", text: "متابع كل مرحلة بالصور", accent: "بالصور", size: 88 },
      { type: "title", scene: "brand", word: "كل", kicker: "في ون هاوس", text: "كل مرحلة في وقتها", accent: "وقتها" },
    ],
    end: FINISHING_END,
  },
  {
    id: "choose-company",
    timeline: chooseTl as Timeline,
    scenes: choose.SCENES,
    shots: [
      { media: "listen", scene: "hook", look: "warm" },
      { media: "brief", scene: "hook", word: "اسألها", look: "warm" },
      { media: "level-room", scene: "q1" },
      { media: "quote", scene: "q2" },
      { media: "render-room", scene: "q3", look: "warm" },
      { media: "contract", scene: "q4" },
      { media: "skim", scene: "q5" },
      { media: "luxe-white", scene: "think", look: "warm" },
      { media: "luxe-lights", scene: "brand", look: "warm" },
    ],
    cards: [
      { type: "title", scene: "hook", text: "قبل ما تختار شركة تشطيب…", accent: "شركة", sub: "اسألهم 5 أسئلة", subWord: "اسألها", size: 88 },
      { type: "check", scene: "q1", n: 1, of: 5, name: "مين المهندس اللي هيتابع؟" },
      { type: "check", scene: "q2", n: 2, of: 5, name: "عرض سعر بالبند؟", point: "بالخامة والكمية", on: "بالخامة" },
      { type: "check", scene: "q3", n: 3, of: 5, name: "تصميم 3D قبل ما نبدأ؟" },
      { type: "check", scene: "q4", n: 4, of: 5, name: "معاد التسليم في العقد؟" },
      { type: "check", scene: "q5", n: 5, of: 5, name: "صور كل مرحلة؟" },
      { type: "title", scene: "think", text: "لو أي إجابة مش واضحة…", accent: "واضحة…", sub: "فكّر تاني", subWord: "فكر", size: 88 },
      { type: "title", scene: "brand", word: "الخمس", kicker: "في ون هاوس", text: "الخمس إجابات مكتوبين", accent: "مكتوبين", sub: "قبل ما نبدأ", subWord: "قبل", size: 88 },
    ],
    end: FINISHING_END,
  },
];
