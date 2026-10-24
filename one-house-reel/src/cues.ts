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
  wall: cue("جوّه"),
  paint: cue("الدهان"),
  base: cue("الأساس"),
  pain: [cue("حديد"), cue("أسمنت"), cue("سقف"), cue("شروخ")],
  notUs: cue("مش"),
  brand: section("brand"),
  right: cue("صح"),
  brick: cue("طوبة"),
  foundation: section("foundation"),
  soil: cue("جسّة"),
  footing: cue("وقواعد"),
  drawings: cue("الرسومات"),
  columns: section("columns"),
  bars: cue("حديد", 1),
  stirrups: cue("وكانات"),
  ruler: cue("بالمسطرة"),
  eye: cue("مش", 1),
  slab: section("slab"),
  forms: cue("شدّة"),
  level: cue("بالميزان"),
  pour: cue("وصبّة"),
  vibrator: cue("بالهزّاز"),
  concrete: section("concrete"),
  cubes: cue("مكعبات"),
  lab: cue("للمعمل"),
  cure: cue("ورشّ"),
  week: cue("أسبوع"),
  review: section("review"),
  engineer: cue("مهندس"),
  sign: cue("ويمضي"),
  follow: cue("وإنت"),
  photos: cue("بالصور"),
  steps: cue("خطوة"),
  studio: section("studio"),
  question: cue("هتتقسم"),
  studioName: cue("استوديو"),
  draw: cue("ارسم"),
  exportPdf: cue("صدّرها"),
  send: cue("وابعتها"),
  free: cue("ببلاش"),
  closing: section("closing"),
  life: cue("يعيش"),
  cta: cue("احجز"),
};
