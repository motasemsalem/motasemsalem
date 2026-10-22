import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { clamp, easeInOut, progress } from "../anim";
import { bodyFont, C } from "../theme";

// Logarithmic "years ago" axis: 7 million years at the right, today at the left.
const MAX_YEARS = 7_000_000;
const LOG_MAX = Math.log10(MAX_YEARS);
const position = (yearsAgo: number) =>
  (LOG_MAX - Math.log10(Math.max(1, yearsAgo))) / LOG_MAX;

const TICKS: [number, string][] = [
  [7_000_000, "7 ملايين"],
  [1_000_000, "مليون"],
  [100_000, "100 ألف"],
  [10_000, "10 آلاف"],
  [1_000, "ألف"],
  [100, "100"],
  [1, "اليوم"],
];

const SIDE = 130;
const WIDTH = 1920 - SIDE * 2;
const BOTTOM = 118;

export const Timeline: React.FC<{
  readonly yearsAgo: number;
  readonly prevYearsAgo: number;
}> = ({ yearsAgo, prevYearsAgo }) => {
  const frame = useCurrentFrame();
  const t = interpolate(
    frame,
    [8, 50],
    [position(prevYearsAgo), position(yearsAgo)],
    {
      ...clamp,
      easing: easeInOut,
    },
  );
  return (
    <AbsoluteFill style={{ opacity: progress(frame, 0, 20) }}>
      <div
        style={{
          position: "absolute",
          left: SIDE,
          right: SIDE,
          bottom: BOTTOM,
          height: 4,
          borderRadius: 2,
          background: C.line,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: SIDE,
          bottom: BOTTOM,
          height: 4,
          borderRadius: 2,
          width: t * WIDTH,
          background: C.accent,
        }}
      />
      {TICKS.map(([years, label]) => (
        <div
          key={label}
          style={{
            position: "absolute",
            right: SIDE + position(years) * WIDTH,
            bottom: BOTTOM - 62,
            translate: "50% 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ width: 2, height: 16, background: C.dim }} />
          <div
            dir="rtl"
            style={{
              fontFamily: bodyFont,
              fontSize: 26,
              color: C.muted,
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </div>
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          right: SIDE + t * WIDTH - 14,
          bottom: BOTTOM - 12,
          width: 28,
          height: 28,
          borderRadius: 14,
          background: C.accent,
          boxShadow: `0 0 0 8px ${C.accent}33, 0 0 30px ${C.accent}`,
        }}
      />
      <div
        dir="rtl"
        style={{
          position: "absolute",
          left: SIDE,
          bottom: BOTTOM + 22,
          fontFamily: bodyFont,
          fontSize: 22,
          color: C.dim,
        }}
      >
        سنوات مضت · مقياس لوغاريتمي
      </div>
    </AbsoluteFill>
  );
};
