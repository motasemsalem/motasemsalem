import type { CSSProperties } from "react";
import { useCurrentFrame } from "remotion";
import { progress } from "../anim";

// Arabic text revealed word by word (never letter by letter, so letters stay joined).
export const Words: React.FC<{
  readonly text: string;
  readonly start: number;
  readonly stagger?: number;
  readonly style?: CSSProperties;
}> = ({ text, start, stagger = 4, style }) => {
  const frame = useCurrentFrame();
  const words = text.split(" ");
  return (
    <div dir="rtl" lang="ar" style={style}>
      {words.map((word, i) => {
        const p = progress(frame, start + i * stagger, 22);
        return (
          <span key={i}>
            {i > 0 ? " " : null}
            <span
              style={{
                display: "inline-block",
                opacity: p,
                translate: `0 ${(1 - p) * 36}px`,
                filter: `blur(${(1 - p) * 8}px)`,
              }}
            >
              {word}
            </span>
          </span>
        );
      })}
    </div>
  );
};
