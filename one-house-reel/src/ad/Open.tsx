import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { shine } from "@remotion/effects/shine";
import { backOut, C, clamp, cue, easeInOut, easeOut, pop, rand, section } from "../cues";
import { Title } from "../overlay/Cine";
import { headingFont, SHADOW } from "../theme";
import { Box, Iso, iso, Mark, P, Quad, Scene } from "./kit";

// ---------- The building ----------
const W = 4.6;
const D = 3.6;
const FH = 1.45;
const FLOORS = 5;
const PAINT: [string, string, string] = ["#f3ead9", "#dccbae", "#bba98b"];
const GLASS = "#ffd58f";

// A five-storey residential block: painted facade, lit windows, balconies. `grow` stacks the floors.
const Building: React.FC<{ readonly v: Iso; readonly grow: (i: number) => number; readonly opacity?: number; readonly ghost?: boolean }> = ({ v, grow, opacity = 1, ghost }) => {
  const frame = useCurrentFrame();
  return (
    <g opacity={opacity}>
      {Array.from({ length: FLOORS }, (_, i) => {
        const g = grow(i);
        if (g <= 0) return null;
        const z = i * FH;
        const h = FH * Math.min(1, g);
        const c: [string, string, string] = ghost ? ["rgba(143,182,221,0.10)", "rgba(143,182,221,0.06)", "rgba(143,182,221,0.04)"] : PAINT;
        const lit = (k: number) => 0.55 + 0.45 * Math.abs(Math.sin(frame / 37 + i * 1.7 + k));
        return (
          <g key={i}>
            <Box v={v} x={0} y={0} z={z} w={W} d={D} h={h} c={c} stroke={ghost ? P.lineDim : "rgba(0,0,0,0.15)"} />
            {g >= 1 && !ghost && (
              <>
                {[0.45, 1.85, 3.25].map((x, k) => (
                  <Quad key={`f${k}`} v={v} p={[[x, D, z + 0.4], [x + 0.85, D, z + 0.4], [x + 0.85, D, z + 1.15], [x, D, z + 1.15]]} fill={GLASS} opacity={lit(k)} stroke="#8a6b3f" sw={2} />
                ))}
                {[0.5, 2.1].map((y, k) => (
                  <Quad key={`s${k}`} v={v} p={[[W, y, z + 0.4], [W, y + 0.9, z + 0.4], [W, y + 0.9, z + 1.15], [W, y, z + 1.15]]} fill={GLASS} opacity={lit(k + 5) * 0.85} stroke="#8a6b3f" sw={2} />
                ))}
                {i > 0 && (
                  <>
                    <Box v={v} x={1.6} y={D} z={z} w={1.5} d={0.45} h={0.1} c={["#e9dfcc", "#c9b897", "#a8977a"]} />
                    <Quad v={v} p={[[1.6, D + 0.45, z + 0.1], [3.1, D + 0.45, z + 0.1], [3.1, D + 0.45, z + 0.8], [1.6, D + 0.45, z + 0.8]]} fill="rgba(15,44,76,0.25)" stroke="#e9dfcc" sw={3} />
                  </>
                )}
              </>
            )}
          </g>
        );
      })}
      {grow(FLOORS - 1) >= 1 && !ghost && <Box v={v} x={-0.05} y={-0.05} z={FLOORS * FH} w={W + 0.1} d={D + 0.1} h={0.25} c={["#e6dcc8", "#cdbd9f", "#ad9c7f"]} />}
    </g>
  );
};

// Footings and column stubs under the building (seen "through" the ground).
const Footings: React.FC<{ readonly v: Iso; readonly p: number }> = ({ v, p }) => (
  <g>
    {[
      [0.3, 0.3],
      [W - 1.3, 0.3],
      [0.3, D - 1.3],
      [W - 1.3, D - 1.3],
    ].map(([x, y], i) => {
      const q = interpolate(p, [i * 0.12, i * 0.12 + 0.5], [0, 1], clamp);
      return (
        <g key={i} opacity={q}>
          <Box v={v} x={x} y={y} z={-2.2} w={1.0} d={1.0} h={0.6 * q} c={[P.concreteTop, P.concreteL, P.concreteR]} />
          <Box v={v} x={x + 0.35} y={y + 0.35} z={-1.6} w={0.3} d={0.3} h={1.6 * q} c={[P.concreteTop, P.concreteL, P.concreteR]} />
        </g>
      );
    })}
  </g>
);

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const v: Iso = { ox: 560, oy: 1180, s: 92 };
  const wallPt = iso(v, 2.3, D, 3.6);
  const lens = pop(frame, C.wall - 4, 12, backOut);
  const peelAt = C.paint;
  return (
    <>
      {/* A: the good-looking building, then a lens shows what is inside the wall. */}
      <Scene from={-12} to={peelAt - 2} zoom={[1, 1.12]} drift={[0, 40]} origin="52% 55%">
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <ellipse cx={560} cy={1260} rx={520} ry={150} fill="rgba(0,0,0,0.35)" />
          <Quad v={v} p={[[-1.2, -1.2, 0], [W + 1.2, -1.2, 0], [W + 1.2, D + 1.4, 0], [-1.2, D + 1.4, 0]]} fill="#1a3a5c" stroke={P.lineDim} />
          <Building v={v} grow={(i) => pop(frame, -6 + i * 4, 10, backOut)} />
          {lens > 0 && (
            <g transform={`translate(${wallPt[0]} ${wallPt[1]}) scale(${lens})`}>
              <defs>
                <clipPath id="lens">
                  <circle r={190} />
                </clipPath>
              </defs>
              <g clipPath="url(#lens)">
                <rect x={-200} y={-200} width={400} height={400} fill="#071a30" />
                {Array.from({ length: 9 }, (_, k) => (
                  <line key={`h${k}`} x1={-200} x2={200} y1={-160 + k * 40} y2={-160 + k * 40} stroke="rgba(143,182,221,0.15)" strokeWidth={1} />
                ))}
                {[-90, -30, 30, 90].map((x) => (
                  <line key={x} x1={x} x2={x} y1={-200} y2={200} stroke={P.steel} strokeWidth={10} strokeLinecap="round" />
                ))}
                {[-140, -70, 0, 70, 140].map((y) => (
                  <rect key={y} x={-110} y={y - 5} width={220} height={10} rx={5} fill="none" stroke={P.line} strokeWidth={6} />
                ))}
                <text y={175} textAnchor="middle" fontFamily={headingFont} fontWeight={700} fontSize={30} fill={P.line}>
                  ؟
                </text>
              </g>
              <circle r={190} fill="none" stroke="white" strokeWidth={10} />
              <line x1={134} y1={134} x2={250} y2={250} stroke="white" strokeWidth={26} strokeLinecap="round" />
            </g>
          )}
        </svg>
      </Scene>
      <Title from={0} to={cue("بس") - 3} text="شكلها حلو من بره…" accent="حلو" size={90} top={260} />
      <Title from={cue("بس")} to={peelAt - 4} kicker="بس" kickerAt={cue("بس")} text="جوّه الحيطة فيه إيه؟" accent="جوّه" size={90} top={240} />

      {/* B: the paint flakes off and shows the crack it was hiding. */}
      <Scene from={peelAt} to={C.base - 2} zoom={[1, 1.05]}>
        <PeelingWall from={peelAt} />
      </Scene>
      <Title from={peelAt} to={C.base - 4} text="الدهان بيداري…" accent="بيداري…" size={112} top={250} />

      {/* C: the building turns to glass and the foundations show under the ground. */}
      <Scene from={C.base} to={section("pain") - 2} zoom={[1.02, 1.08]}>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <Box v={{ ...v, oy: v.oy - 120 }} x={-1.2} y={-1.2} z={-2.6} w={W + 2.4} d={D + 2.6} h={2.6} c={["rgba(154,122,87,0.55)", "rgba(125,96,69,0.85)", "rgba(101,76,54,0.85)"]} />
          <Footings v={{ ...v, oy: v.oy - 120 }} p={interpolate(frame, [C.base, C.base + 24], [0, 1], clamp)} />
          <Building v={{ ...v, oy: v.oy - 120 }} grow={() => 1} ghost />
          <Mark at={C.base + 26} x={860} y={1420} size={96} />
        </svg>
      </Scene>
      <Title from={C.base} to={section("pain") - 3} kicker="لكن" kickerAt={C.base} text="الأساس مبيكدبش" accent="مبيكدبش" size={112} top={250} />
    </>
  );
};

// Close-up of a painted wall: flakes fall away cell by cell and a crack draws itself underneath.
const PeelingWall: React.FC<{ readonly from: number }> = ({ from }) => {
  const frame = useCurrentFrame();
  const top = 480;
  const h = 1000;
  const cols = 6;
  const rows = 9;
  const cw = 1080 / cols;
  const rh = h / rows;
  const crack = "M 120 520 L 260 600 L 330 720 L 470 760 L 520 900 L 650 960 L 700 1120 L 860 1180 L 960 1320";
  const crackP = interpolate(frame, [from + 14, from + 40], [0, 1], { ...clamp, easing: easeOut });
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <filter id="plaster">
          <feTurbulence type="fractalNoise" baseFrequency={0.04} numOctaves={3} seed={4} />
          <feColorMatrix values="0 0 0 0 0.62  0 0 0 0 0.6  0 0 0 0 0.56  0 0 0 0.55 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
      <rect x={0} y={top} width={1080} height={h} fill="#9d978c" />
      <rect x={0} y={top} width={1080} height={h} fill="#b8b2a6" filter="url(#plaster)" />
      <path d={crack} transform={`translate(0 ${top - 480})`} stroke="#1c1712" strokeWidth={14} fill="none" strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - crackP} />
      <path d={crack} transform={`translate(0 ${top - 480})`} stroke="#3a2f25" strokeWidth={5} fill="none" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - crackP} opacity={0.7} />
      {Array.from({ length: cols * rows }, (_, i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        // Cells near the crack flake first.
        const order = rand(i + 5) * 0.5 + Math.abs(c / cols - r / rows) * 0.9;
        const t0 = from + 4 + order * 30;
        const fall = interpolate(frame, [t0, t0 + 14], [0, 1], { ...clamp, easing: easeInOut });
        const keep = r === 0 || r === rows - 1 ? 0.2 : 0;
        if (fall >= 1 && keep === 0) return null;
        const f = keep ? 0 : fall;
        const jx = (k: number) => (rand(i * 7 + k) - 0.5) * 18;
        const x0 = c * cw;
        const y0 = top + r * rh;
        const poly = `${x0 + jx(1)},${y0 + jx(2)} ${x0 + cw + jx(3)},${y0 + jx(4)} ${x0 + cw + jx(5)},${y0 + rh + jx(6)} ${x0 + jx(7)},${y0 + rh + jx(8)}`;
        return (
          <g key={i} transform={`translate(${f * (rand(i) - 0.5) * 200} ${f * f * 700}) rotate(${f * (rand(i + 1) - 0.5) * 70} ${x0 + cw / 2} ${y0 + rh / 2})`} opacity={1 - f}>
            <polygon points={poly} fill={P.paint} stroke="rgba(0,0,0,0.12)" strokeWidth={2} />
          </g>
        );
      })}
      <circle cx={540} cy={900} r={interpolate(frame, [from + 34, from + 44], [0, 260], clamp)} fill="none" stroke={P.red} strokeWidth={10} opacity={interpolate(frame, [from + 34, from + 40], [0, 1], clamp)} />
    </svg>
  );
};

// ---------- The market's usual problems ----------
const PROBLEMS = ["حديد ناقص", "أسمنت مغشوش", "سقف بينشّ مية", "شروخ بعد سنة"];

const ProblemIcon: React.FC<{ readonly k: number; readonly t: number }> = ({ k, t }) => {
  if (k === 0)
    return (
      <g>
        {[-60, -20, 20, 60].map((x, i) => (
          <line key={x} x1={x} x2={x} y1={-90} y2={90} stroke={i === 2 ? "rgba(255,255,255,0.25)" : P.steel} strokeWidth={12} strokeLinecap="round" strokeDasharray={i === 2 ? "10 14" : undefined} />
        ))}
        {[-60, 0, 60].map((y) => (
          <rect key={y} x={-80} y={y - 4} width={160} height={8} rx={4} fill="none" stroke={P.line} strokeWidth={5} />
        ))}
      </g>
    );
  if (k === 1)
    return (
      <g>
        <path d="M -70 -80 L 70 -80 L 85 80 L -85 80 Z" fill="#d8cdb8" stroke="#8b7b5e" strokeWidth={5} />
        <text y={10} textAnchor="middle" fontFamily={headingFont} fontWeight={800} fontSize={40} fill="#5a4a33">
          أسمنت
        </text>
        <text y={64} textAnchor="middle" fontFamily={headingFont} fontWeight={900} fontSize={54} fill={P.red}>
          ؟
        </text>
      </g>
    );
  if (k === 2)
    return (
      <g>
        <rect x={-110} y={-90} width={220} height={36} fill={P.concreteL} stroke={P.concreteR} strokeWidth={4} />
        {[-50, 10, 60].map((x, i) => {
          const y = ((t * 3 + i * 23) % 60) * 2.2 - 40;
          return <path key={x} d={`M ${x} ${y - 16} Q ${x + 12} ${y + 4} ${x} ${y + 12} Q ${x - 12} ${y + 4} ${x} ${y - 16}`} fill={P.water} />;
        })}
      </g>
    );
  return (
    <g>
      <rect x={-100} y={-90} width={200} height={180} fill="#d9d2c4" stroke="#a79f90" strokeWidth={4} />
      <path d="M -60 -90 L -20 -30 L -40 10 L 10 40 L 0 90" stroke="#2a221a" strokeWidth={8} fill="none" strokeLinejoin="round" />
    </g>
  );
};

export const Pain: React.FC = () => {
  const frame = useCurrentFrame();
  const from = section("pain");
  const stamp = pop(frame, C.notUs - 2, 8, easeOut);
  return (
    <Scene from={from} to={C.brand - 1} zoom={[1, 1.04]}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {PROBLEMS.map((label, k) => {
          const at = C.pain[k];
          const p = pop(frame, at - 3, 9, backOut);
          if (p <= 0) return null;
          const col = k % 2;
          const row = Math.floor(k / 2);
          const x = col === 0 ? 800 : 280;
          const y = 700 + row * 500;
          const out = stamp;
          return (
            <g key={label} transform={`translate(${x} ${y + (1 - p) * 140}) scale(${0.6 + 0.4 * p}) rotate(${(1 - p) * (col ? -8 : 8)})`} opacity={interpolate(p, [0, 0.4], [0, 1], clamp) * (1 - out * 0.55)}>
              <rect x={-250} y={-215} width={500} height={430} rx={36} fill="rgba(15,44,76,0.92)" stroke="rgba(143,182,221,0.4)" strokeWidth={3} />
              <g transform="translate(0 -40) scale(1.25)">
                <ProblemIcon k={k} t={frame - at} />
              </g>
              <text y={165} textAnchor="middle" fontFamily={headingFont} fontWeight={800} fontSize={56} fill="white">
                {label}
              </text>
              <Mark at={at + 6} x={205} y={-170} size={90} ok={false} />
            </g>
          );
        })}
        {stamp > 0 && (
          <g transform={`translate(540 880) rotate(-8) scale(${interpolate(stamp, [0, 1], [2.6, 1])})`} opacity={interpolate(stamp, [0, 0.3], [0, 1], clamp)}>
            <rect x={-400} y={-120} width={800} height={240} rx={28} fill={P.red} stroke="white" strokeWidth={10} />
            <rect x={-374} y={-94} width={748} height={188} rx={18} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={4} strokeDasharray="14 12" />
            <text y={42} textAnchor="middle" fontFamily={headingFont} fontWeight={900} fontSize={128} fill="white">
              مش عندنا
            </text>
          </g>
        )}
      </svg>
    </Scene>
  );
};

// ---------- Brand ----------
export const Brand: React.FC = () => {
  const frame = useCurrentFrame();
  const from = C.brand;
  const logo = pop(frame, from, 16, backOut);
  const sharp = pop(frame, from, 10, easeOut);
  const brick = pop(frame, C.brick - 4, 10, easeOut);
  return (
    <Scene from={from} to={C.foundation - 2} zoom={[1, 1.04]}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 42%, rgba(227,30,36,0.28), transparent 55%)", opacity: logo }} />
      <div style={{ position: "absolute", left: 140, top: 520, width: 800, transform: `scale(${1.3 - 0.3 * logo})`, opacity: interpolate(logo, [0, 0.4], [0, 1], clamp), filter: `blur(${(1 - sharp) * 16}px)` }}>
        <Img src={staticFile("brand/logo-white.png")} style={{ width: 800 }} effects={[shine({ progress: interpolate(frame, [from + 8, from + 32], [0, 1], clamp), angle: 25 })]} />
      </div>
      <div dir="rtl" style={{ position: "absolute", top: 1000, left: 0, right: 0, textAlign: "center", fontFamily: headingFont, fontWeight: 900, fontSize: 96, color: "white", textShadow: SHADOW }}>
        <span style={{ display: "inline-block", opacity: pop(frame, cue("المسلّح") - 2, 8), transform: `translateY(${(1 - pop(frame, cue("المسلّح") - 2, 10)) * 30}px)` }}>المسلّح</span>
        <span style={{ display: "inline-block", marginRight: 26, color: P.red, opacity: pop(frame, C.right - 2, 8), transform: `scale(${interpolate(pop(frame, C.right - 2, 10, backOut), [0, 1], [1.6, 1])})` }}>صح</span>
      </div>
      <div dir="rtl" style={{ position: "absolute", top: 1150, left: 0, right: 0, textAlign: "center", fontFamily: headingFont, fontWeight: 700, fontSize: 60, color: "rgba(255,255,255,0.92)", opacity: pop(frame, cue("من", 1) - 2, 8) }}>
        من أول طوبة
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(540 ${interpolate(brick, [0, 1], [900, 1330])})`} opacity={brick}>
          <Box v={{ ox: 0, oy: 0, s: 120 }} x={-0.6} y={-0.3} w={1.2} d={0.6} h={0.42} c={["#d4673f", "#b04f2c", "#8f3e22"]} />
        </g>
        {brick >= 1 && <ellipse cx={540} cy={1352} rx={interpolate(frame - C.brick, [0, 12], [60, 200], clamp)} ry={22} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={3} opacity={interpolate(frame - C.brick, [0, 14], [1, 0], clamp)} />}
      </svg>
    </Scene>
  );
};

