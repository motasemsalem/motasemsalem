import { useCurrentFrame } from "remotion";
import { FPS, WORDS } from "../cues";
import { BRAND, headingFont, SHADOW } from "../theme";

const strip = (w: string) => w.replace(/[.,،:!؟?…]/g, "");

// Subtitles along the bottom: the phrase being spoken, the current word underlined in red.
export const Subtitles: React.FC<{ readonly hidden: (frame: number) => boolean }> = ({ hidden }) => {
  const frame = useCurrentFrame();
  if (hidden(frame)) return null;
  const t = frame / FPS;
  // Phrases end at punctuation or every five words.
  const phrases: { start: number; end: number; words: typeof WORDS }[] = [];
  let cur: typeof WORDS = [];
  for (const w of WORDS) {
    cur.push(w);
    if (/[.,،:!؟?…]$/.test(w.text) || cur.length >= 5) {
      phrases.push({ start: cur[0].start, end: w.end, words: cur });
      cur = [];
    }
  }
  const i = phrases.findIndex((p, k) => t < (phrases[k + 1]?.start ?? p.end + 0.5));
  const phrase = phrases[i];
  if (!phrase || t < phrase.start - 0.1) return null;
  const k = phrase.words.findIndex((w, j) => t < (phrase.words[j + 1]?.start ?? 999));
  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top: 1500,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "4px 16px",
      }}
    >
      {phrase.words.map((w, j) => {
        const on = j === k;
        const seen = t >= w.start - 0.05;
        return (
          <span
            key={j}
            style={{
              position: "relative",
              fontFamily: headingFont,
              fontWeight: 700,
              fontSize: 50,
              lineHeight: 1.35,
              color: on ? "white" : seen ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.4)",
              textShadow: SHADOW,
            }}
          >
            {strip(w.text)}
            <span
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 2,
                height: 6,
                borderRadius: 4,
                background: BRAND.red,
                transform: `scaleX(${on ? 1 : 0})`,
              }}
            />
          </span>
        );
      })}
    </div>
  );
};
