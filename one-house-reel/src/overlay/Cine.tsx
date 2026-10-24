import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { clamp, easeInOut, easeOut, pop, rand } from "../cues";
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

// Chapter marker in the top-right corner: "02 | الأعمدة" with a progress hairline.
export const Chapter: React.FC<{ readonly num: number; readonly label: string; readonly from: number; readonly to: number }> = ({ num, label, from, to }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to + 8) return null;
  const p = pop(frame, from + 2, 14) * (1 - pop(frame, to - 4, 8));
  const progress = interpolate(frame, [from, to], [0, 1], clamp);
  return (
    <div dir="rtl" style={{ position: "absolute", top: 120, right: 64, opacity: p, transform: `translateX(${(1 - p) * 40}px)` }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
        <div style={{ fontFamily: headingFont, fontWeight: 300, fontSize: 64, color: "white", textShadow: SHADOW, lineHeight: 1 }}>
          {String(num).padStart(2, "0")}
        </div>
        <div style={{ width: 2, height: 44, background: BRAND.red, alignSelf: "center" }} />
        <div style={{ fontFamily: headingFont, fontWeight: 700, fontSize: 40, color: "white", textShadow: SHADOW }}>{label}</div>
      </div>
      <div style={{ marginTop: 12, width: 300, height: 3, background: "rgba(255,255,255,0.22)" }}>
        <div style={{ width: `${progress * 100}%`, height: "100%", background: "white", marginRight: 0, marginLeft: "auto" }} />
      </div>
    </div>
  );
};

// An engineering annotation: a pulsing anchor dot, a leader line that draws out, and a label card.
export const Callout: React.FC<{
  readonly at: number;
  readonly to: number;
  readonly x: number;
  readonly y: number;
  readonly dx: number;
  readonly dy: number;
  readonly label: string;
  readonly value?: string;
  readonly color?: string;
}> = ({ at, to, x, y, dx, dy, label, value, color = "white" }) => {
  const frame = useCurrentFrame();
  if (frame < at - 2 || frame > to + 6) return null;
  const out = pop(frame, to, 6);
  const dot = pop(frame, at, 8);
  const line = pop(frame, at + 3, 10);
  const card = pop(frame, at + 9, 10);
  const ring = ((frame - at) % 30) / 30;
  const ex = x + dx;
  const ey = y + dy;
  const right = dx < 0; // card hangs to the left of the line end
  return (
    <AbsoluteFill style={{ opacity: 1 - out, pointerEvents: "none" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <circle cx={x} cy={y} r={10 * dot} fill={color} />
        <circle cx={x} cy={y} r={10 + ring * 34} fill="none" stroke={color} strokeWidth={3} opacity={(1 - ring) * dot} />
        <path
          d={`M ${x} ${y} L ${x + dx * 0.35} ${ey} L ${ex} ${ey}`}
          stroke={color}
          strokeWidth={3}
          fill="none"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - line}
          style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.6))" }}
        />
      </svg>
      <div
        dir="rtl"
        style={{
          position: "absolute",
          top: ey - 44,
          ...(right ? { right: 1080 - ex + 14 } : { left: ex + 14 }),
          padding: "12px 22px",
          background: "rgba(2,13,28,0.62)",
          border: `2px solid ${color}`,
          borderRadius: 6,
          backdropFilter: "blur(6px)",
          opacity: card,
          transform: `translateX(${(1 - card) * (right ? -20 : 20)}px)`,
          whiteSpace: "nowrap",
        }}
      >
        <div style={{ fontFamily: headingFont, fontWeight: 700, fontSize: 38, color: "white", lineHeight: 1.2 }}>{label}</div>
        {value && <div style={{ fontFamily: headingFont, fontWeight: 400, fontSize: 30, color, lineHeight: 1.2, direction: "ltr", textAlign: "right" }}>{value}</div>}
      </div>
    </AbsoluteFill>
  );
};

// A bright flash that covers a cut (white or warm).
export const Flash: React.FC<{ readonly at: number; readonly color?: string; readonly peak?: number; readonly length?: number }> = ({ at, color = "white", peak = 0.9, length = 10 }) => {
  const frame = useCurrentFrame();
  if (frame < at - 3 || frame > at + length) return null;
  const o = interpolate(frame, [at - 3, at, at + length], [0, peak, 0], clamp);
  return <AbsoluteFill style={{ background: color, opacity: o, mixBlendMode: "screen", pointerEvents: "none" }} />;
};

// Warm light leak drifting across the frame (screen-blended blobs of film-burn colour).
export const Leak: React.FC<{ readonly at: number; readonly length?: number; readonly seed?: number; readonly peak?: number }> = ({ at, length = 26, seed = 1, peak = 0.85 }) => {
  const frame = useCurrentFrame();
  if (frame < at - 6 || frame > at + length) return null;
  const p = (frame - (at - 6)) / (length + 6);
  const o = interpolate(frame, [at - 6, at, at + length], [0, peak, 0], clamp);
  const x = interpolate(p, [0, 1], [-20, 120]) + rand(seed) * 20;
  const y = 20 + rand(seed + 1) * 60;
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", opacity: o, pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 45% at ${x}% ${y}%, rgba(255,140,40,0.95), rgba(255,60,20,0.5) 40%, transparent 70%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 35% 60% at ${100 - x}% ${100 - y}%, rgba(255,210,120,0.8), transparent 65%)` }} />
      <AbsoluteFill style={{ background: `linear-gradient(${100 + seed * 20}deg, transparent 30%, rgba(255,90,40,0.35) 50%, transparent 70%)` }} />
    </AbsoluteFill>
  );
};

// The x-ray scan line: a glowing bar sweeping down; everything above it already shows the inside of the wall.
export const ScanLine: React.FC<{ readonly from: number; readonly to: number }> = ({ from, to }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to + 4) return null;
  const y = interpolate(frame, [from, to], [0, 1920], { ...clamp, easing: easeInOut });
  const o = 1 - pop(frame, to, 4);
  return (
    <AbsoluteFill style={{ opacity: o, pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: y - 160, height: 160, background: "linear-gradient(180deg, transparent, rgba(110,200,255,0.25))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: y - 3, height: 6, background: "#dff6ff", boxShadow: "0 0 30px 8px rgba(110,200,255,0.9), 0 0 90px 20px rgba(60,150,255,0.6)" }} />
    </AbsoluteFill>
  );
};

// Blueprint HUD for the x-ray: grid, corner brackets, a ruler and a readout.
export const XrayHud: React.FC<{ readonly from: number; readonly to: number }> = ({ from, to }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to + 6) return null;
  const p = pop(frame, from, 10) * (1 - pop(frame, to, 6));
  const c = "rgba(140,210,255,0.85)";
  const b = 70;
  const L = 90;
  const depth = interpolate(frame, [from, to], [0, -3.5], clamp);
  return (
    <AbsoluteFill style={{ opacity: p, pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          backgroundImage: "linear-gradient(rgba(120,200,255,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(120,200,255,0.10) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          backgroundPosition: `0 ${frame * 2}px`,
        }}
      />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {[
          [b, b, 1, 1],
          [1080 - b, b, -1, 1],
          [b, 1920 - b, 1, -1],
          [1080 - b, 1920 - b, -1, -1],
        ].map(([x, y, sx, sy], i) => (
          <path key={i} d={`M ${x} ${y + sy * L} L ${x} ${y} L ${x + sx * L} ${y}`} stroke={c} strokeWidth={4} fill="none" />
        ))}
        {Array.from({ length: 25 }, (_, i) => (
          <line key={i} x1={40} x2={i % 5 === 0 ? 76 : 58} y1={420 + i * 44} y2={420 + i * 44} stroke={c} strokeWidth={2} />
        ))}
      </svg>
      <div style={{ position: "absolute", left: 90, top: 1480, fontFamily: headingFont, fontWeight: 400, fontSize: 30, color: c, direction: "ltr", lineHeight: 1.5 }}>
        <div>SCAN · {String(Math.min(100, Math.round(((frame - from) / Math.max(1, to - from)) * 100))).padStart(3, "0")}%</div>
        <div>DEPTH {depth.toFixed(2)} m</div>
      </div>
    </AbsoluteFill>
  );
};

// Tape-rewind treatment: scanlines, a sliding tracking band, ◀◀ and a counter that runs back.
export const RewindFx: React.FC<{ readonly from: number; readonly to: number }> = ({ from, to }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) return null;
  const p = (frame - from) / (to - from);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 5px)", mixBlendMode: "overlay" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: ((frame * 97) % 2100) - 120, height: 60, background: "rgba(255,255,255,0.14)", filter: "blur(4px)" }} />
      <div style={{ position: "absolute", top: 130, left: 80, display: "flex", alignItems: "center", gap: 16, fontFamily: headingFont, fontWeight: 700, color: "white", textShadow: SHADOW }}>
        <div style={{ fontSize: 70, letterSpacing: -14 }}>◀◀</div>
        <div style={{ fontSize: 40, direction: "ltr" }}>{`00:${String(Math.round(59 * (1 - p))).padStart(2, "0")}:${String(Math.round(rand(frame) * 99)).padStart(2, "0")}`}</div>
      </div>
    </AbsoluteFill>
  );
};

// Darkening gradients so type stays legible at the top and bottom of every shot.
export const Legibility: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.0) 30%, rgba(0,0,0,0.0) 62%, rgba(0,0,0,0.62) 100%)",
    }}
  />
);
