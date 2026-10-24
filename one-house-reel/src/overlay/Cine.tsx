import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { clamp, easeInOut, easeOut, pop } from "../cues";
import { bodyFont, BRAND, headingFont, SHADOW } from "../theme";

// A cinematic headline: each word rises out of a mask, one accent word in red with an underline that draws in.
// Leaves on `to` by drifting up and blurring out.
export const Title: React.FC<{
  readonly from: number;
  readonly to: number;
  readonly text: string;
  readonly accent?: string;
  readonly kicker?: string;
  readonly kickerAt?: number;
  readonly sub?: string;
  readonly subAt?: number;
  readonly size?: number;
  readonly top?: number;
}> = ({ from, to, text, accent, kicker, kickerAt, sub, subAt, size = 112, top = 300 }) => {
  const frame = useCurrentFrame();
  if (frame < Math.min(from, kickerAt ?? from) - 3 || frame > to + 8) return null;
  const out = pop(frame, to, 8, easeInOut);
  const words = text.split(" ");
  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        top,
        left: 60,
        right: 60,
        textAlign: "center",
        opacity: 1 - out,
        transform: `translateY(${-out * 40}px)`,
        filter: out > 0 ? `blur(${out * 12}px)` : undefined,
      }}
    >
      {kicker && <Kicker text={kicker} at={kickerAt ?? from - 2} />}
      <div style={{ fontFamily: headingFont, fontWeight: 800, fontSize: size, lineHeight: 1.22, color: "white", textShadow: SHADOW }}>
        {words.map((w, i) => {
          const p = pop(frame, from - 3 + i * 2, 11, easeOut);
          const isAccent = accent ? accent.split(" ").includes(w) : false;
          return (
            <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", padding: "0 0.12em", marginBottom: -8 }}>
              <span
                style={{
                  position: "relative",
                  display: "inline-block",
                  transform: `translateY(${(1 - p) * 105}%)`,
                  color: isAccent ? BRAND.redGlow : "white",
                }}
              >
                {w}
                {isAccent && (
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: "0.06em",
                      height: Math.max(6, size * 0.06),
                      background: BRAND.red,
                      transformOrigin: "right",
                      transform: `scaleX(${pop(frame, from + 6 + i * 2, 12, easeOut)})`,
                      boxShadow: `0 0 24px ${BRAND.red}`,
                    }}
                  />
                )}
              </span>
            </span>
          );
        })}
      </div>
      {sub && (
        <div
          style={{
            marginTop: 14,
            fontFamily: bodyFont,
            fontWeight: 600,
            fontSize: size * 0.42,
            color: "rgba(255,255,255,0.92)",
            textShadow: SHADOW,
            opacity: pop(frame, subAt ?? from + 8, 10),
            transform: `translateY(${(1 - pop(frame, subAt ?? from + 8, 12)) * 20}px)`,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
};

// Small line above a headline, between two thin rules.
const Kicker: React.FC<{ readonly text: string; readonly at: number }> = ({ text, at }) => {
  const frame = useCurrentFrame();
  const p = pop(frame, at, 12);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, marginBottom: 10, opacity: p }}>
      <div style={{ width: 70 * p, height: 2, background: "rgba(255,255,255,0.7)" }} />
      <div style={{ fontFamily: bodyFont, fontWeight: 600, fontSize: 42, color: "rgba(255,255,255,0.95)", textShadow: SHADOW }}>{text}</div>
      <div style={{ width: 70 * p, height: 2, background: "rgba(255,255,255,0.7)" }} />
    </div>
  );
};

// A bright flash that covers a cut (white or warm).
export const Flash: React.FC<{ readonly at: number; readonly color?: string; readonly peak?: number; readonly length?: number }> = ({ at, color = "white", peak = 0.9, length = 10 }) => {
  const frame = useCurrentFrame();
  if (frame < at - 3 || frame > at + length) return null;
  const o = interpolate(frame, [at - 3, at, at + length], [0, peak, 0], clamp);
  return <AbsoluteFill style={{ background: color, opacity: o, mixBlendMode: "screen", pointerEvents: "none" }} />;
};
