import { Easing, interpolate } from "remotion";
import timeline from "./timeline.json";
import type { SceneId } from "./narration";

export const FPS = timeline.fps;
export const TOTAL = timeline.total;
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const backOut = Easing.bezier(0.34, 1.56, 0.64, 1);
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export type Word = { text: string; start: number; end: number };
export const WORDS: Word[] = timeline.words;
export const section = (id: SceneId) => timeline.sections[id];

const bare = (w: string) => w.replace(/[.,،:!؟?…]/g, "");

// Absolute frame where the narrator starts the `nth` occurrence of `word` (matched from its start).
export const cue = (word: string, nth = 0) => {
  const hits = WORDS.filter((w) => bare(w.text).startsWith(word));
  const hit = hits[nth];
  if (!hit) throw new Error(`"${word}" (#${nth}) is not in the script`);
  return Math.round(hit.start * FPS);
};

// 0 → 1 from frame a to frame b.
export const ramp = (frame: number, a: number, b: number, easing = easeInOut) =>
  interpolate(frame, [a, b], [0, 1], { ...clamp, easing });

// 0 → 1 starting at `a`, lasting `d` frames.
export const pop = (frame: number, a: number, d = 12, easing = easeOut) => ramp(frame, a, a + d, easing);

export const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// Every cue the film is timed to, in absolute frames.
export const C = {
  flat: cue("شقة"),
  inside: cue("جوّه"),
  steel: cue("الحديد"),
  concrete: cue("والخرسانة"),
  base: cue("والأساس"),
  rewind: cue("تعالى"),
  brand: cue("إحنا"),
  brandName: cue("ون"),
  start: section("foundation"),
  dig: cue("حفر"),
  lean: cue("خرسانة"),
  footings: cue("وقواعد"),
  calc: cue("بالحساب"),
  strong: cue("البيت"),
  columns: cue("الأعمدة"),
  rebar: cue("حديد"),
  check: cue("بيتراجع"),
  pourColumns: cue("للخرسانة"),
  formwork: cue("الشدّة"),
  props: cue("بتتركب"),
  posts: cue("قوايم"),
  beams: cue("وعروق"),
  level: cue("بالميزان"),
  pourSlab: cue("السقف"),
  flatSlab: cue("مستوي"),
  floors: cue("ودور"),
  grows: cue("العمارة"),
  team: cue("وفريقنا"),
  heat: cue("حر"),
  cold: cue("برد"),
  shell: cue("ومش"),
  bone: cue("العضم"),
  turnkey: cue("التشطيب"),
  plumbing: cue("سباكة"),
  electric: cue("وكهربا"),
  insulation: cue("وعزل"),
  plaster: cue("ومحارة"),
  marble: cue("ورخام"),
  paint: cue("ودهانات"),
  design: cue("وتصميم"),
  see: cue("تشوف"),
  bath: cue("وكمان"),
  units: cue("لوحدات"),
  water: cue("مقاومة"),
  warranty: cue("وبضمان"),
  stats: cue("أكتر"),
  projects: cue("خمسمية"),
  projectsEnd: cue("مشروع"),
  years: cue("واتناشر"),
  yearsEnd: cue("خبرة"),
  contracts: cue("وعقود"),
  deadlines: cue("ومواعيد"),
  follow: cue("وإنت"),
  closing: section("closing"),
  brick: cue("طوبة"),
  key: cue("المفتاح", 1),
  cta: cue("احجز"),
  right: cue("صح"),
};
