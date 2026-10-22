import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { clamp, progress } from "../anim";
import { ar, bodyFont, C, headingFont, H, W } from "../theme";
import type { Tribe } from "../tribes";

export type TimedTribe = Tribe & { readonly frame: number };

const CARD_H = 96;
const GAP = 14;
const BOTTOM = 1395;

// The first letter of the name proper, for the crest.
const initial = (name: string) =>
  name.replace(/^(بنو|أولاد|ال)\s?/, "").replace(/^ال/, "")[0];

const Crest: React.FC<{ letter: string; color: string; spin: number }> = ({
  letter,
  color,
  spin,
}) => (
  <svg width={70} height={70} viewBox="-35 -35 70 70">
    <g transform={`rotate(${spin})`}>
      <path
        d="M 0 -32 L 9 -9 L 32 0 L 9 9 L 0 32 L -9 9 L -32 0 L -9 -9 Z"
        fill={color}
        opacity={0.25}
      />
    </g>
    <circle r={23} fill={C.bg} stroke={color} strokeWidth={3} />
    <text
      textAnchor="middle"
      y={9}
      fontFamily={headingFont}
      fontWeight={900}
      fontSize={26}
      fill={color}
    >
      {letter}
    </text>
  </svg>
);

// Tribe cards that land one by one in a two-column grid above the captions.
export const TribeCards: React.FC<{
  readonly tribes: readonly TimedTribe[];
}> = ({ tribes }) => {
  const frame = useCurrentFrame();
  const rows = Math.ceil(tribes.length / 2);
  const top = BOTTOM - rows * CARD_H - (rows - 1) * GAP;
  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        top,
        left: 44,
        right: 44,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: GAP,
      }}
    >
      {tribes.map((t, i) => {
        const p = interpolate(
          frame,
          [t.frame, t.frame + 7, t.frame + 12],
          [0, 1.08, 1],
          clamp,
        );
        const flash = interpolate(
          frame,
          [t.frame + 4, t.frame + 16],
          [1, 0],
          clamp,
        );
        const color = i % 2 ? C.red : C.gold;
        return (
          <div
            key={t.name}
            style={{
              height: CARD_H,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "0 14px",
              borderRadius: 24,
              background: `linear-gradient(90deg, rgba(15,11,9,0.92), rgba(43,26,18,0.92))`,
              border: `3px solid ${color}`,
              boxShadow: `0 0 ${30 * flash}px ${color}, 0 12px 30px rgba(0,0,0,0.5)`,
              opacity: Math.min(1, p),
              scale: p,
              translate: `${(1 - Math.min(1, p)) * 120}px 0`,
            }}
          >
            <Crest letter={initial(t.name)} color={color} spin={frame * 1.5} />
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: headingFont,
                  fontWeight: 800,
                  fontSize: 40,
                  lineHeight: 1.15,
                  color: C.text,
                }}
              >
                {t.name}
              </div>
              <div
                style={{
                  fontFamily: bodyFont,
                  fontWeight: 600,
                  fontSize: 24,
                  color: C.muted,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {t.place}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Running count of tribes met so far, in the top corner.
export const Tally: React.FC<{
  readonly before: number;
  readonly frames: readonly number[];
}> = ({ before, frames }) => {
  const frame = useCurrentFrame();
  const count = before + frames.filter((f) => frame >= f).length;
  const last = Math.max(-100, ...frames.filter((f) => frame >= f));
  const bump = interpolate(
    frame,
    [last, last + 5, last + 12],
    [1, 1.35, 1],
    clamp,
  );
  const appear = progress(frame, 0, 10);
  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        top: 92,
        left: 44,
        display: "flex",
        alignItems: "center",
        gap: 10,
        opacity: appear,
        fontFamily: headingFont,
      }}
    >
      <div
        style={{
          minWidth: 64,
          height: 64,
          borderRadius: 18,
          background: C.gold,
          color: C.bg,
          fontWeight: 900,
          fontSize: 38,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          scale: bump,
        }}
      >
        {ar(count)}
      </div>
      <div
        style={{
          color: C.sand,
          fontWeight: 700,
          fontSize: 26,
          lineHeight: 1.1,
        }}
      >
        قبيلة
        <br />
        <span style={{ color: C.muted, fontWeight: 400, fontSize: 22 }}>
          حتى الآن
        </span>
      </div>
    </div>
  );
};

// Animated film grain and a slow light leak, over everything.
export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const leakX = interpolate(Math.sin(frame / 70), [-1, 1], [-20, 80]);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 40% at ${leakX}% 20%, rgba(242,179,61,0.12), transparent 70%)`,
          mixBlendMode: "screen",
        }}
      />
      <svg
        width={W}
        height={H}
        style={{ opacity: 0.07, mixBlendMode: "overlay" }}
      >
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={0.85}
            numOctaves={2}
            seed={Math.floor(random(`grain-${frame % 12}`) * 1000)}
          />
        </filter>
        <rect width={W} height={H} filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};
