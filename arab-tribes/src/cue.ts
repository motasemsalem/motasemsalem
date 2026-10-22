import { VOICE_LEAD, type Word } from "./timing";

const plain = (s: string) => s.replace(/[ً-ْ]/g, "");

// Returns the frame at which the first word containing `text` is spoken (searching from the `nth` match).
export const makeCue =
  (words: Word[], fps: number) =>
  (text: string, offset = 0, nth = 0) => {
    const matches = (words ?? []).filter((w) =>
      plain(w.text).includes(plain(text)),
    );
    const word = matches[nth] ?? matches[0];
    if (!word) return offset;
    return Math.round((word.start + VOICE_LEAD) * fps) + offset;
  };
