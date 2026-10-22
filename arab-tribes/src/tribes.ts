import type { LonLat } from "./geo";
import type { SceneId } from "./narration";

export type Tribe = {
  readonly name: string;
  // Where they live today (or settled), shown on the tribe's card.
  readonly place: string;
  // A word from the scene's narration; the tribe appears when it is spoken.
  readonly cue: string;
  readonly at: LonLat;
  readonly side?: "top" | "bottom" | "left" | "right";
};

// Every tribe named in the narration, by scene. The running tally counts these.
export const TRIBES: Partial<Record<SceneId, readonly Tribe[]>> = {
  conquest: [
    {
      name: "تُجيب",
      place: "خِطّة في الفسطاط",
      cue: "تجيب",
      at: [31.23, 30.0],
    },
    {
      name: "لَخْم",
      place: "خِطّة في الفسطاط",
      cue: "ولخم",
      at: [31.23, 30.0],
    },
    {
      name: "المَعافِر",
      place: "خِطّة في الفسطاط",
      cue: "والمعافر",
      at: [31.23, 30.0],
    },
    {
      name: "مَهْرة",
      place: "خِطّة في الفسطاط",
      cue: "ومهرة",
      at: [31.23, 30.0],
    },
  ],
  qays: [
    {
      name: "قيس",
      place: "الشرقية · بلبيس",
      cue: "قيس",
      at: [31.56, 30.42],
      side: "bottom",
    },
  ],
  hilal: [
    {
      name: "بنو هلال",
      place: "الصعيد ← المغرب",
      cue: "هلال",
      at: [31.4, 27.6],
      side: "right",
    },
    {
      name: "بنو سُليم",
      place: "الصعيد ← برقة",
      cue: "سليم",
      at: [31.4, 25.4],
      side: "right",
    },
  ],
  saeed: [
    {
      name: "جُهينة",
      place: "سوهاج",
      cue: "جهينة",
      at: [31.46, 26.67],
      side: "left",
    },
    {
      name: "هوّارة",
      place: "قنا · سوهاج · فرشوط",
      cue: "وهوارة",
      at: [32.16, 26.05],
      side: "right",
    },
  ],
  south: [
    {
      name: "الأشراف",
      place: "قنا · الأقصر",
      cue: "الأشراف",
      at: [32.72, 26.16],
      side: "right",
    },
    {
      name: "الجعافرة",
      place: "أسوان · دراو",
      cue: "الجعافرة",
      at: [32.93, 24.42],
      side: "left",
    },
    {
      name: "بنو الكنز",
      place: "أسوان · من ربيعة",
      cue: "الكنز",
      at: [32.9, 24.09],
      side: "right",
    },
  ],
  ababda: [
    {
      name: "العبابدة",
      place: "الصحراء الشرقية",
      cue: "العبابدة",
      at: [34.0, 24.6],
      side: "top",
    },
  ],
  sinaiNorth: [
    {
      name: "السواركة",
      place: "الشيخ زويد",
      cue: "السواركة",
      at: [34.05, 31.12],
      side: "right",
    },
    {
      name: "الرميلات",
      place: "رفح",
      cue: "والرميلات",
      at: [34.24, 31.27],
      side: "top",
    },
    {
      name: "الترابين",
      place: "شمال ووسط سيناء",
      cue: "والترابين",
      at: [34.4, 30.45],
      side: "right",
    },
    {
      name: "المساعيد",
      place: "العريش",
      cue: "والمساعيد",
      at: [33.8, 31.1],
      side: "bottom",
    },
    {
      name: "البياضية",
      place: "بئر العبد",
      cue: "والبياضية",
      at: [33.0, 30.98],
      side: "top",
    },
  ],
  sinaiSouth: [
    {
      name: "التياها",
      place: "وسط سيناء",
      cue: "التياها",
      at: [33.65, 29.9],
      side: "top",
    },
    {
      name: "الأحيوات",
      place: "وسط سيناء",
      cue: "والأحيوات",
      at: [34.25, 29.65],
      side: "right",
    },
    {
      name: "العزازمة",
      place: "وسط سيناء",
      cue: "والعزازمة",
      at: [34.5, 30.2],
      side: "right",
    },
    {
      name: "مزينة",
      place: "جنوب سيناء",
      cue: "مزينة",
      at: [34.35, 28.3],
      side: "right",
    },
    {
      name: "العليقات",
      place: "أبو زنيمة",
      cue: "والعليقات",
      at: [33.3, 29.1],
      side: "top",
    },
    {
      name: "القرارشة",
      place: "أبو رديس",
      cue: "والقرارشة",
      at: [33.25, 28.75],
      side: "left",
    },
    {
      name: "الجبالية",
      place: "سانت كاترين",
      cue: "والجبالية",
      at: [33.95, 28.56],
      side: "bottom",
    },
  ],
  canal: [
    {
      name: "الحويطات",
      place: "السويس · الإسماعيلية",
      cue: "الحويطات",
      at: [32.45, 29.97],
      side: "right",
    },
    {
      name: "العيايدة",
      place: "الشرقية · سيناء",
      cue: "والعيايدة",
      at: [32.15, 30.55],
      side: "top",
    },
    {
      name: "الطحاوية",
      place: "الشرقية",
      cue: "والطحاوية",
      at: [31.6, 30.75],
      side: "left",
    },
  ],
  west: [
    {
      name: "أولاد علي",
      place: "مطروح · الإسكندرية · البحيرة",
      cue: "أولاد",
      at: [27.24, 31.35],
      side: "bottom",
    },
  ],
  middle: [
    {
      name: "الجوازي",
      place: "الفيوم · المنيا",
      cue: "الجوازي",
      at: [30.84, 29.31],
      side: "left",
    },
    {
      name: "الفوايد",
      place: "المنيا",
      cue: "والفوايد",
      at: [30.75, 28.1],
      side: "left",
    },
    {
      name: "الرماح",
      place: "بني سويف",
      cue: "والرماح",
      at: [31.1, 29.07],
      side: "right",
    },
    {
      name: "الهنادي",
      place: "البحيرة · الشرقية",
      cue: "والهنادي",
      at: [30.45, 30.85],
      side: "top",
    },
  ],
};

export const ALL_TRIBES = Object.values(TRIBES).flat();

// How many tribes the reel has introduced before the given scene.
export const tallyBefore = (id: SceneId, order: readonly SceneId[]) =>
  order
    .slice(0, order.indexOf(id))
    .reduce((sum, s) => sum + (TRIBES[s]?.length ?? 0), 0);
