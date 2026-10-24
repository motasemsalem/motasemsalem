import timeline from "./timeline.json";
import type { SceneId } from "./narration";

// Timing for the finishing reel, from src/finishing/timeline.json (scripts/finishing-timeline.py).
export const FPS = timeline.fps;
export const TOTAL = timeline.total;
export const VOICE: number[] = timeline.voice;

type Word = { text: string; start: number; end: number };
const WORDS: Word[] = timeline.words;
const bare = (w: string) => w.replace(/[.,،:!؟?…]/g, "");

export const section = (id: SceneId) => timeline.sections[id];

// Frame where the narrator starts `word` (matched from its start): the `nth` match at or after section `id`.
// Without a word, the section's own start.
export const at = (id: SceneId, word?: string, nth = 0) => {
  if (!word) return section(id);
  const from = section(id) / FPS - 0.01;
  const hit = WORDS.filter((w) => w.start >= from && bare(w.text).startsWith(word))[nth];
  if (!hit) throw new Error(`"${word}" (#${nth}) is not in section ${id}`);
  return Math.round(hit.start * FPS);
};
