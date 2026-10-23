import { Easing, interpolate } from "remotion";
import timeline from "./timeline.json";
import type { SceneId } from "./narration";

export const FPS = timeline.fps;
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const backOut = Easing.bezier(0.34, 1.56, 0.64, 1);
export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// 0 → 1 between `start` and `start + duration` frames.
export const progress = (
  frame: number,
  start: number,
  duration: number,
  easing = easeOut,
) =>
  interpolate(frame, [start, start + duration], [0, 1], { ...clamp, easing });

export type Word = { text: string; start: number; end: number };
// Script words with their spoken times, in seconds from the start of the scene.
export const sceneWords = (id: SceneId): Word[] => timeline.words[id];

// Frame (within the scene) at which the narrator starts saying `word`.
// `nth` picks a later occurrence when the word repeats.
export const at = (id: SceneId, word: string, nth = 0) => {
  const hits = sceneWords(id).filter((w) => w.text.includes(word));
  const hit = hits[nth];
  if (!hit) throw new Error(`"${word}" is not in the ${id} narration`);
  return Math.round(hit.start * FPS);
};

// Deterministic pseudo-random in [0, 1).
export const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
