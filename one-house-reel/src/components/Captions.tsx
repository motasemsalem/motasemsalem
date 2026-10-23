import { interpolate, useCurrentFrame } from "remotion";
import { backOut, clamp, FPS, sceneWords } from "../anim";
import type { SceneId } from "../narration";
import { C, headingFont } from "../theme";

const MAX_WORDS = 4;
const strip = (w: string) => w.replace(/[.,،:!؟?…]/g, "");

// Groups words into short phrases, breaking at punctuation or after MAX_WORDS.
const phrases = (id: SceneId) => {
  const out: { words: ReturnType<typeof sceneWords>; start: number; end: number }[] = [];
  let cur: ReturnType<typeof sceneWords> = [];
  for (const w of sceneWords(id)) {
    cur.push(w);
    if (/[.,،:!؟?…]$/.test(w.text) || cur.length >= MAX_WORDS) {
      out.push({ words: cur, start: cur[0].start, end: w.end });
      cur = [];
    }
  }
  if (cur.length) out.push({ words: cur, start: cur[0].start, end: cur[cur.length - 1].end });
  return out;
};

// Word-by-word captions synced to the voiceover word timings; the spoken word is boxed in red.
export const Captions: React.FC<{ readonly id: SceneId; readonly y?: number }> = ({
  id,
  y = 1490,
}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const list = phrases(id);
  const idx = list.findIndex((p, i) => t < (list[i + 1]?.start ?? p.end + 0.6));
  const phrase = idx >= 0 && t >= list[0].start - 0.1 ? list[idx] : null;
  if (!phrase) return null;
  const sinceStart = (t - phrase.start) * FPS;
  const out = interpolate(t, [phrase.end + 0.35, phrase.end + 0.55], [1, 0], clamp);
  return (
    <div
      dir="rtl"
      lang="ar"
      style={{
        position: "absolute",
        top: y,
        left: 70,
        right: 70,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "8px 18px",
        opacity: idx === list.length - 1 ? out : 1,
      }}
    >
      {phrase.words.map((w, i) => {
        const appear = (w.start - phrase.start) * FPS;
        const local = sinceStart - appear;
        const shown = interpolate(local, [-2, 4], [0, 1], { ...clamp, easing: backOut });
        const active = t >= w.start - 0.03 && t < (phrase.words[i + 1]?.start ?? phrase.end + 0.3);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              fontFamily: headingFont,
              fontWeight: 800,
              fontSize: 72,
              lineHeight: 1.25,
              padding: "2px 18px 10px",
              borderRadius: 16,
              color: C.white,
              background: active ? C.red : "rgba(2, 13, 28, 0.55)",
              boxShadow: active ? `0 10px 40px rgba(224, 7, 26, 0.55)` : "none",
              opacity: shown,
              transform: `translateY(${(1 - shown) * 30}px) scale(${0.7 + shown * 0.3 + (active ? 0.06 : 0)})`,
              textShadow: "0 4px 18px rgba(0,0,0,0.5)",
            }}
          >
            {strip(w.text)}
          </span>
        );
      })}
    </div>
  );
};
