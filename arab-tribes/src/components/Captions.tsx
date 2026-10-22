import { useCurrentFrame, useVideoConfig } from "remotion";
import { progress } from "../anim";
import { C, headingFont } from "../theme";
import { VOICE_LEAD, type Word } from "../timing";

const MAX_WORDS = 3;
// Diacritics help the voice but crowd big captions.
const plain = (s: string) => s.replace(/[ً-ْ]/g, "");

// Splits words into short pages, breaking early after punctuation.
const paginate = (words: Word[]) => {
  const pages: Word[][] = [];
  let page: Word[] = [];
  for (const w of words) {
    page.push(w);
    if (page.length === MAX_WORDS || /[.,،:؟!]$/.test(w.text)) {
      pages.push(page);
      page = [];
    }
  }
  if (page.length) pages.push(page);
  return pages;
};

// Karaoke-style captions, synced to the voiceover word timings.
export const Captions: React.FC<{ readonly words: Word[] }> = ({ words }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!words?.length) return null;
  const t = frame / fps - VOICE_LEAD;
  const pages = paginate(words);
  const index = pages.findIndex(
    (p, i) => t < (pages[i + 1]?.[0].start ?? p[p.length - 1].end + 0.3),
  );
  const page = pages[index];
  if (!page || t < page[0].start - 0.05) return null;
  const startFrame = (page[0].start + VOICE_LEAD) * fps;
  const enter = progress(frame, startFrame - 2, 6);
  return (
    <div
      dir="rtl"
      lang="ar"
      style={{
        position: "absolute",
        top: 1430,
        left: 70,
        right: 70,
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "0 22px",
        fontFamily: headingFont,
        fontWeight: 800,
        fontSize: 76,
        lineHeight: 1.35,
        scale: 0.85 + 0.15 * enter,
        opacity: enter,
      }}
    >
      {page.map((w, i) => {
        const active = t >= w.start && t < w.end + 0.08;
        const said = t >= w.start;
        return (
          <span
            key={i}
            style={{
              color: active ? C.bg : said ? C.text : "rgba(247,236,217,0.5)",
              background: active ? C.gold : "transparent",
              borderRadius: 16,
              padding: "0 14px",
              scale: active ? 1.08 : 1,
              textShadow: active ? "none" : "0 6px 24px rgba(0,0,0,0.9)",
              WebkitTextStroke: active ? "0" : "2px rgba(0,0,0,0.35)",
            }}
          >
            {plain(w.text)}
          </span>
        );
      })}
    </div>
  );
};
