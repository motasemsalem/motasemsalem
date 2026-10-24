import { createContext, useContext } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { clamp, easeInOut, easeOut, pop, rand } from "../cues";
import { bodyFont, headingFont } from "../theme";

// The ad's palette: One House navy and red (from the website's studio), with drawing colours for materials.
export const P = {
  night: "#040f1d",
  navy: "#0F2C4C",
  navy2: "#1e4d7b",
  red: "#E31E24",
  redDeep: "#C0181D",
  white: "#ffffff",
  ink: "#0b1f36",
  line: "#8fb6dd",
  lineDim: "rgba(143,182,221,0.35)",
  steel: "#c9d4df",
  steelDark: "#6f8296",
  concreteTop: "#e4e1da",
  concreteL: "#c3beb3",
  concreteR: "#a29d92",
  soilTop: "#9a7a57",
  soilL: "#7d6045",
  soilR: "#654c36",
  wood: "#d9a55c",
  woodL: "#b98543",
  woodR: "#9b6d33",
  water: "#6cc8ff",
  paint: "#efe6d6",
  ok: "#22c55e",
};

// ---------- Isometric projection ----------
// x runs to the lower right, y to the lower left, z up. `S` pixels per metre.
export type Iso = { readonly ox: number; readonly oy: number; readonly s: number };
const COS = Math.cos(Math.PI / 6);
export const iso = (v: Iso, x: number, y: number, z: number): [number, number] => [v.ox + (x - y) * COS * v.s, v.oy + (x + y) * 0.5 * v.s - z * v.s];
const pts = (v: Iso, list: [number, number, number][]) => list.map(([x, y, z]) => iso(v, x, y, z).join(",")).join(" ");

// A shaded box (top + the two faces toward the viewer).
export const Box: React.FC<{
  readonly v: Iso;
  readonly x: number;
  readonly y: number;
  readonly z?: number;
  readonly w: number;
  readonly d: number;
  readonly h: number;
  readonly c: readonly [string, string, string];
  readonly opacity?: number;
  readonly stroke?: string;
}> = ({ v, x, y, z = 0, w, d, h, c, opacity = 1, stroke = "rgba(0,0,0,0.18)" }) => {
  if (h <= 0.0001 || w <= 0 || d <= 0) return null;
  const t = z + h;
  return (
    <g opacity={opacity} strokeLinejoin="round">
      <polygon points={pts(v, [[x, y + d, z], [x + w, y + d, z], [x + w, y + d, t], [x, y + d, t]])} fill={c[1]} stroke={stroke} strokeWidth={1.5} />
      <polygon points={pts(v, [[x + w, y, z], [x + w, y + d, z], [x + w, y + d, t], [x + w, y, t]])} fill={c[2]} stroke={stroke} strokeWidth={1.5} />
      <polygon points={pts(v, [[x, y, t], [x + w, y, t], [x + w, y + d, t], [x, y + d, t]])} fill={c[0]} stroke={stroke} strokeWidth={1.5} />
    </g>
  );
};

// A flat quad on any plane, for outlines, glass and drawings.
export const Quad: React.FC<{ readonly v: Iso; readonly p: [number, number, number][]; readonly fill?: string; readonly stroke?: string; readonly sw?: number; readonly opacity?: number; readonly dash?: string }> = ({
  v,
  p,
  fill = "none",
  stroke = "none",
  sw = 2,
  opacity = 1,
  dash,
}) => <polygon points={pts(v, p)} fill={fill} stroke={stroke} strokeWidth={sw} opacity={opacity} strokeDasharray={dash} strokeLinejoin="round" />;

// A reinforcing bar: dark rim, light core, drawn from a to b up to `p` (0..1).
export const Bar: React.FC<{ readonly v: Iso; readonly a: [number, number, number]; readonly b: [number, number, number]; readonly p?: number; readonly w?: number; readonly color?: string }> = ({
  v,
  a,
  b,
  p = 1,
  w = 7,
  color = P.steel,
}) => {
  if (p <= 0) return null;
  const e: [number, number, number] = [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p, a[2] + (b[2] - a[2]) * p];
  const [x1, y1] = iso(v, ...a);
  const [x2, y2] = iso(v, ...e);
  return (
    <g strokeLinecap="round">
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#2c3a48" strokeWidth={w + 3} />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={w} />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.55)" strokeWidth={w * 0.28} />
    </g>
  );
};

// A closed rectangular loop of bar (a stirrup / tie) at height z around a column.
export const Tie: React.FC<{ readonly v: Iso; readonly x: number; readonly y: number; readonly w: number; readonly d: number; readonly z: number; readonly color?: string; readonly sw?: number }> = ({
  v,
  x,
  y,
  w,
  d,
  z,
  color = P.steel,
  sw = 5,
}) => (
  <g>
    <Quad v={v} p={[[x, y, z], [x + w, y, z], [x + w, y + d, z], [x, y + d, z]]} stroke="#2c3a48" sw={sw + 3} />
    <Quad v={v} p={[[x, y, z], [x + w, y, z], [x + w, y + d, z], [x, y + d, z]]} stroke={color} sw={sw} />
  </g>
);

// Dimension line between two screen points with ticks and a label at the middle.
export const Dim: React.FC<{ readonly a: [number, number]; readonly b: [number, number]; readonly label: string; readonly p: number; readonly color?: string; readonly size?: number; readonly offset?: [number, number] }> = ({
  a,
  b,
  label,
  p,
  color = "white",
  size = 34,
  offset = [0, -34],
}) => {
  if (p <= 0) return null;
  const e: [number, number] = [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p];
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const nx = -Math.sin(ang) * 12;
  const ny = Math.cos(ang) * 12;
  const mid: [number, number] = [(a[0] + b[0]) / 2 + offset[0], (a[1] + b[1]) / 2 + offset[1]];
  return (
    <g>
      <line x1={a[0]} y1={a[1]} x2={e[0]} y2={e[1]} stroke={color} strokeWidth={3} />
      <line x1={a[0] - nx} y1={a[1] - ny} x2={a[0] + nx} y2={a[1] + ny} stroke={color} strokeWidth={3} />
      {p >= 1 && <line x1={b[0] - nx} y1={b[1] - ny} x2={b[0] + nx} y2={b[1] + ny} stroke={color} strokeWidth={3} />}
      <text
        x={mid[0]}
        y={mid[1]}
        textAnchor="middle"
        fontFamily={headingFont}
        fontWeight={700}
        fontSize={size}
        fill={color}
        opacity={interpolate(p, [0.6, 1], [0, 1], clamp)}
        style={{ paintOrder: "stroke", stroke: "rgba(4,15,29,0.85)", strokeWidth: 8 }}
      >
        {label}
      </text>
    </g>
  );
};

// Set by the Facebook posts, which draw their own headlines: on-screen text of the reel stays hidden.
export const ArtOnly = createContext(false);

// ---------- Stage ----------

// Deep navy studio backdrop: a soft spotlight, the studio's dotted grid, and slow drifting dust.
export const Backdrop: React.FC<{ readonly glow?: string }> = ({ glow = "rgba(30,77,123,0.55)" }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 60% at 50% 45%, ${glow}, ${P.night} 75%)` }}>
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(rgba(143,182,221,0.22) 1.6px, transparent 1.8px)",
          backgroundSize: "44px 44px",
          backgroundPosition: `${(frame * 0.3) % 44}px ${(frame * 0.6) % 44}px`,
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 80%)",
        }}
      />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 40 }, (_, i) => {
          const x = (rand(i) * 1080 + frame * (0.2 + rand(i + 3) * 0.5)) % 1080;
          const y = (rand(i + 7) * 1920 - frame * (0.3 + rand(i + 5) * 0.6) + 1920 * 4) % 1920;
          return <circle key={i} cx={x} cy={y} r={1 + rand(i + 11) * 2.2} fill="white" opacity={0.08 + rand(i + 13) * 0.18} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

// Film grain and vignette over everything.
export const Finish: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.5) 100%)" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.06, mixBlendMode: "overlay" }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency={0.85} numOctaves={2} seed={frame % 9} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={1080} height={1920} filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

// A scene visible from `from` to `to` (absolute frames), with a camera that eases in and drifts.
// The children get the scene's progress through `useCurrentFrame` as usual (absolute).
export const Scene: React.FC<{
  readonly from: number;
  readonly to: number;
  readonly children: React.ReactNode;
  readonly zoom?: [number, number];
  readonly drift?: [number, number];
  readonly origin?: string;
}> = ({ from, to, children, zoom = [1.0, 1.06], drift = [0, -20], origin = "50% 50%" }) => {
  const frame = useCurrentFrame();
  if (frame < from - 2 || frame > to + 10) return null;
  const t = interpolate(frame, [from, to], [0, 1], clamp);
  const inP = pop(frame, from - 2, 12, easeOut);
  const out = pop(frame, to, 10, easeInOut);
  const scale = interpolate(t, [0, 1], zoom) * (1.08 - 0.08 * inP) * (1 + out * 0.12);
  return (
    <AbsoluteFill
      style={{
        opacity: inP * (1 - out),
        transform: `translate(${drift[0] * t}px, ${drift[1] * t}px) scale(${scale})`,
        transformOrigin: origin,
        filter: out > 0.01 ? `blur(${out * 14}px)` : inP < 0.99 ? `blur(${(1 - inP) * 10}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// Brand-red diagonal wipe that sweeps across a cut between sections.
export const Wipe: React.FC<{ readonly at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  if (frame < at - 8 || frame > at + 8) return null;
  const p = interpolate(frame, [at - 8, at + 8], [0, 1], { ...clamp, easing: easeInOut });
  const x = interpolate(p, [0, 1], [1700, -1700]);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -400, left: x - 300, width: 900, height: 2800, background: P.red, transform: "rotate(18deg)" }} />
      <div style={{ position: "absolute", top: -400, left: x + 640, width: 90, height: 2800, background: "white", transform: "rotate(18deg)", opacity: 0.9 }} />
    </AbsoluteFill>
  );
};

// A numbered step badge used as the chapter header of the four construction steps.
export const Step: React.FC<{ readonly n: number; readonly label: string; readonly from: number; readonly to: number }> = ({ n, label, from, to }) => {
  const frame = useCurrentFrame();
  if (useContext(ArtOnly)) return null;
  if (frame < from - 2 || frame > to + 8) return null;
  const p = pop(frame, from - 2, 14, easeOut) * (1 - pop(frame, to, 8));
  const dots = [1, 2, 3, 4];
  return (
    <div dir="rtl" style={{ position: "absolute", top: 150, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", opacity: p }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22, transform: `translateY(${(1 - p) * -30}px)` }}>
        <div
          style={{
            width: 118,
            height: 118,
            borderRadius: 30,
            background: P.red,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: headingFont,
            fontWeight: 900,
            fontSize: 76,
            color: "white",
            boxShadow: "0 20px 50px rgba(227,30,36,0.45)",
          }}
        >
          {n}
        </div>
        <div style={{ fontFamily: headingFont, fontWeight: 800, fontSize: 96, color: "white" }}>{label}</div>
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 26 }}>
        {dots.map((d) => (
          <div key={d} style={{ width: d === n ? 64 : 22, height: 10, borderRadius: 5, background: d <= n ? P.red : "rgba(255,255,255,0.25)" }} />
        ))}
      </div>
    </div>
  );
};

// A short on-screen line that pops in (used under the illustration).
export const Line: React.FC<{ readonly at: number; readonly to: number; readonly text: string; readonly top: number; readonly accent?: boolean; readonly size?: number }> = ({
  at,
  to,
  text,
  top,
  accent,
  size = 58,
}) => {
  const frame = useCurrentFrame();
  if (useContext(ArtOnly)) return null;
  if (frame < at - 3 || frame > to + 6) return null;
  const p = pop(frame, at - 3, 10, easeOut) * (1 - pop(frame, to, 6));
  return (
    <div dir="rtl" style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: p, transform: `translateY(${(1 - p) * 24}px)` }}>
      <div
        style={{
          padding: "14px 34px",
          borderRadius: 18,
          background: accent ? P.red : "rgba(4,15,29,0.72)",
          border: accent ? "none" : "2px solid rgba(143,182,221,0.35)",
          fontFamily: headingFont,
          fontWeight: 800,
          fontSize: size,
          color: "white",
          boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
        }}
      >
        {text}
      </div>
    </div>
  );
};

// A check (or cross) badge that pops at `at`.
export const Mark: React.FC<{ readonly at: number; readonly x: number; readonly y: number; readonly size?: number; readonly ok?: boolean }> = ({ at, x, y, size = 90, ok = true }) => {
  const frame = useCurrentFrame();
  const p = pop(frame, at, 10, easeOut);
  if (p <= 0) return null;
  const s = interpolate(p, [0, 0.6, 1], [0.2, 1.15, 1]);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle r={size / 2} fill={ok ? P.ok : P.red} />
      {ok ? (
        <path d={`M ${-size * 0.22} 0 L ${-size * 0.05} ${size * 0.18} L ${size * 0.25} ${-size * 0.17}`} stroke="white" strokeWidth={size * 0.12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d={`M ${-size * 0.18} ${-size * 0.18} L ${size * 0.18} ${size * 0.18} M ${size * 0.18} ${-size * 0.18} L ${-size * 0.18} ${size * 0.18}`} stroke="white" strokeWidth={size * 0.12} strokeLinecap="round" />
      )}
    </g>
  );
};

export const body = bodyFont;
