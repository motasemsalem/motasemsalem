import { interpolate, useCurrentFrame } from "remotion";
import { backOut, C, clamp, easeInOut, easeOut, pop, rand, ramp } from "../cues";
import { headingFont } from "../theme";
import { Bar, Box, Dim, Iso, iso, Line, Mark, P, Quad, Scene, Step, Tie } from "./kit";

const CONCRETE: [string, string, string] = [P.concreteTop, P.concreteL, P.concreteR];
const SOIL: [string, string, string] = [P.soilTop, P.soilL, P.soilR];
const WOOD: [string, string, string] = [P.wood, P.woodL, P.woodR];

const Svg: React.FC<{ readonly children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
    {children}
  </svg>
);

// A label tag in screen space with a leader line to (x, y).
const Tag: React.FC<{ readonly at: number; readonly x: number; readonly y: number; readonly tx: number; readonly ty: number; readonly text: string; readonly color?: string }> = ({ at, x, y, tx, ty, text, color = "white" }) => {
  const frame = useCurrentFrame();
  const p = pop(frame, at, 10, easeOut);
  if (p <= 0) return null;
  const w = text.length * 26 + 50;
  return (
    <g opacity={p}>
      <circle cx={x} cy={y} r={8} fill={color} />
      <line x1={x} y1={y} x2={x + (tx - x) * p} y2={y + (ty - y) * p} stroke={color} strokeWidth={3} />
      <g transform={`translate(${tx} ${ty})`}>
        <rect x={tx > x ? 0 : -w} y={-34} width={w} height={68} rx={12} fill="rgba(4,15,29,0.85)" stroke={color} strokeWidth={2.5} />
        <text x={tx > x ? w / 2 : -w / 2} y={13} textAnchor="middle" fontFamily={headingFont} fontWeight={700} fontSize={38} fill="white">
          {text}
        </text>
      </g>
    </g>
  );
};

// ---------- 1 Foundation: soil test, then a reinforced footing that matches the drawings ----------
export const Foundation: React.FC = () => {
  const frame = useCurrentFrame();
  const from = C.foundation;
  const to = C.columns;
  const v: Iso = { ox: 540, oy: 800, s: 120 };
  const soil = pop(frame, from, 14, easeOut);
  const probe = ramp(frame, C.soil, C.soil + 22);
  const pad = pop(frame, C.footing - 2, 8);
  const mesh = ramp(frame, C.footing + 2, C.footing + 16);
  const pourP = ramp(frame, C.footing + 14, C.drawings - 2);
  const starters = ramp(frame, C.drawings - 6, C.drawings + 8);
  const plan = pop(frame, C.drawings, 12, backOut);
  const layers = [
    { z: -0.35, label: "ردم" },
    { z: -1.0, label: "طمي" },
    { z: -1.65, label: "رمل" },
  ];
  const probeTop = iso(v, 4, 1.6, 0.9);
  const probeBot = iso(v, 4, 1.6, 0.9 - 2.8 * probe);
  return (
    <>
      <Scene from={from} to={to - 1} zoom={[1, 1.05]}>
        <Svg>
          <g opacity={soil} transform={`translate(0 ${(1 - soil) * 80})`}>
            <Box v={v} x={0} y={0} z={-2} w={4} d={3.2} h={2} c={SOIL} />
            {[-0.65, -1.35].map((z) => (
              <g key={z}>
                <Quad v={v} p={[[0, 3.2, z], [4, 3.2, z], [4, 3.2, z - 0.04], [0, 3.2, z - 0.04]]} fill="rgba(0,0,0,0.25)" />
                <Quad v={v} p={[[4, 0, z], [4, 3.2, z], [4, 3.2, z - 0.04], [4, 0, z - 0.04]]} fill="rgba(0,0,0,0.25)" />
              </g>
            ))}
            {Array.from({ length: 26 }, (_, i) => {
              const [x, y] = iso(v, 4, rand(i) * 3.2, -rand(i + 9) * 2);
              return <circle key={i} cx={x} cy={y} r={2 + rand(i + 4) * 4} fill="rgba(255,255,255,0.12)" />;
            })}
          </g>
          {/* Soil test probe on the cut face, with the layers it reads. */}
          {probe > 0 && (
            <g>
              <line x1={probeTop[0]} y1={probeTop[1]} x2={probeBot[0]} y2={probeBot[1]} stroke="#ffd166" strokeWidth={10} strokeLinecap="round" />
              <path d={`M ${probeBot[0] - 12} ${probeBot[1] - 10} L ${probeBot[0]} ${probeBot[1] + 18} L ${probeBot[0] + 12} ${probeBot[1] - 10} Z`} fill="#ffd166" />
              <rect x={probeTop[0] - 30} y={probeTop[1] - 70} width={60} height={70} rx={8} fill="#ffd166" />
            </g>
          )}
          {layers.map((l, i) => {
            const [x, y] = iso(v, 4, 1.6, l.z);
            return <Tag key={l.label} at={C.soil + 8 + i * 5} x={x} y={y} tx={x - 46} ty={y + 4} text={l.label} color="#ffd166" />;
          })}
          {/* Footing: blinding, mesh, concrete, starter bars. */}
          {pad > 0 && <Box v={v} x={0.7} y={0.6} z={0} w={2.4} d={2} h={0.08 * pad} c={["#f1efe9", "#d3cfc6", "#b6b1a6"]} />}
          {pourP > 0 && <Box v={v} x={0.85} y={0.75} z={0.08} w={2.1} d={1.7} h={0.55 * pourP} c={CONCRETE} opacity={0.96} />}
          {[0.95, 1.3, 1.65, 2.0, 2.35, 2.7].map((x, i) => (
            <Bar key={`x${i}`} v={v} a={[x, 0.85, 0.16 + 0.55 * pourP]} b={[x, 2.35, 0.16 + 0.55 * pourP]} p={interpolate(mesh, [i * 0.08, i * 0.08 + 0.5], [0, 1], clamp)} w={5} />
          ))}
          {[0.95, 1.3, 1.65, 2.0, 2.35].map((y, i) => (
            <Bar key={`y${i}`} v={v} a={[0.95, y, 0.2 + 0.55 * pourP]} b={[2.75, y, 0.2 + 0.55 * pourP]} p={interpolate(mesh, [0.3 + i * 0.08, 0.8 + i * 0.08], [0, 1], clamp)} w={5} />
          ))}
          {[
            [1.65, 1.4],
            [2.05, 1.4],
            [1.65, 1.8],
            [2.05, 1.8],
          ].map(([x, y], i) => (
            <Bar key={`s${i}`} v={v} a={[x, y, 0.63]} b={[x, y, 2.0]} p={starters} w={7} />
          ))}
          <Dim a={iso(v, 0.85, 2.6, 0.08)} b={iso(v, 2.95, 2.6, 0.08)} label="2.00 م" p={ramp(frame, C.footing + 18, C.footing + 30)} offset={[-30, 44]} />
          {plan > 0 && (
            <g transform={`translate(240 650) scale(${plan}) rotate(${(1 - plan) * -10})`} opacity={plan}>
              <rect x={-170} y={-150} width={340} height={300} rx={18} fill="#0c3a66" stroke="white" strokeWidth={4} />
              {Array.from({ length: 7 }, (_, i) => (
                <line key={i} x1={-150} x2={150} y1={-130 + i * 40} y2={-130 + i * 40} stroke="rgba(255,255,255,0.12)" />
              ))}
              <rect x={-90} y={-80} width={180} height={150} fill="none" stroke="white" strokeWidth={4} />
              {[-60, -30, 0, 30, 60].map((x) => (
                <line key={x} x1={x} x2={x} y1={-70} y2={60} stroke="white" strokeWidth={2} strokeDasharray="8 6" />
              ))}
              <text y={118} textAnchor="middle" fontFamily={headingFont} fontWeight={700} fontSize={30} fill="white">
                لوحة القواعد
              </text>
              <Mark at={C.drawings + 8} x={150} y={-130} size={70} />
            </g>
          )}
        </Svg>
      </Scene>
      <Step n={1} label="الأساس" from={from} to={to - 4} />
      <Line at={C.soil} to={C.footing - 3} text="جسّة تربة" top={360} />
      <Line at={C.footing} to={to - 4} text="قواعد مسلحة على الرسومات" top={360} />
    </>
  );
};

// ---------- 2 Columns: certified bars, ties spaced by the ruler ----------
export const Columns: React.FC = () => {
  const frame = useCurrentFrame();
  const from = C.columns;
  const to = C.slab;
  const v: Iso = { ox: 540, oy: 1400, s: 205 };
  const rise = ramp(frame, from + 2, C.bars + 6, easeOut);
  const H = 4.4;
  const cx = 0.55;
  const cy = 0.55;
  const s = 0.5;
  const bars: [number, number][] = [
    [cx, cy],
    [cx + s / 2, cy],
    [cx + s, cy],
    [cx + s, cy + s / 2],
    [cx + s, cy + s],
    [cx + s / 2, cy + s],
    [cx, cy + s],
    [cx, cy + s / 2],
  ];
  const ties = Array.from({ length: 10 }, (_, i) => 0.3 + i * 0.42);
  const rulerP = ramp(frame, C.ruler - 2, C.ruler + 10);
  const r1 = iso(v, cx - 0.35, cy + s + 0.35, ties[4]);
  const r2 = iso(v, cx - 0.35, cy + s + 0.35, ties[5]);
  return (
    <>
      <Scene from={from} to={to - 1} zoom={[1, 1.06]} drift={[0, 30]}>
        <Svg>
          <ellipse cx={540} cy={1500} rx={420} ry={120} fill="rgba(0,0,0,0.35)" />
          <Box v={v} x={0} y={0} z={-0.5} w={1.6} d={1.6} h={0.5} c={CONCRETE} />
          {/* Back bars first, then ties, then front bars, so the cage reads in depth. */}
          {bars.slice(0, 4).map(([x, y], i) => (
            <Bar key={`b${i}`} v={v} a={[x, y, 0]} b={[x, y, H]} p={interpolate(rise, [i * 0.04, 0.7 + i * 0.04], [0, 1], clamp)} w={9} />
          ))}
          {ties.map((z, i) => {
            const t0 = C.stirrups - 4 + i * 2.2;
            const q = interpolate(frame, [t0, t0 + 9], [0, 1], { ...clamp, easing: easeOut });
            if (q <= 0) return null;
            const zz = z + (1 - q) * 1.6;
            return (
              <g key={`t${i}`} opacity={q}>
                <Tie v={v} x={cx - 0.04} y={cy - 0.04} w={s + 0.08} d={s + 0.08} z={zz} color={i === 4 || i === 5 ? (rulerP > 0 ? "#ffd166" : P.line) : P.line} />
              </g>
            );
          })}
          {bars.slice(4).map(([x, y], i) => (
            <Bar key={`f${i}`} v={v} a={[x, y, 0]} b={[x, y, H]} p={interpolate(rise, [0.16 + i * 0.04, 0.86 + i * 0.04], [0, 1], clamp)} w={9} />
          ))}
          {/* Ruler beside the cage. */}
          {rulerP > 0 && (
            <g opacity={rulerP}>
              <rect x={r1[0] - 48} y={r2[1] - 70} width={36} height={r1[1] - r2[1] + 140} rx={4} fill="#ffd166" />
              {Array.from({ length: 12 }, (_, k) => (
                <line key={k} x1={r1[0] - 48} x2={r1[0] - (k % 3 === 0 ? 26 : 36)} y1={r2[1] - 60 + k * ((r1[1] - r2[1] + 120) / 11)} y2={r2[1] - 60 + k * ((r1[1] - r2[1] + 120) / 11)} stroke="#5a4500" strokeWidth={2} />
              ))}
            </g>
          )}
          <Dim a={[r1[0] - 70, r1[1]]} b={[r2[0] - 70, r2[1]]} label="15 سم" p={rulerP} color="#ffd166" size={40} offset={[-80, 12]} />
          <Tag at={C.bars + 2} x={iso(v, cx + s, cy, H * 0.8)[0]} y={iso(v, cx + s, cy, H * 0.8)[1]} tx={iso(v, cx + s, cy, H * 0.8)[0] + 150} ty={iso(v, cx + s, cy, H * 0.8)[1] - 40} text="حديد Ø16" />
          <Mark at={C.bars + 10} x={880} y={620} size={92} />
        </Svg>
      </Scene>
      <Step n={2} label="الأعمدة" from={from} to={to - 4} />
      <Line at={C.bars} to={C.stirrups - 3} text="حديد مطابق للمواصفات" top={360} />
      <Line at={C.stirrups} to={C.eye - 2} text="كانات بالمسطرة" top={360} />
      <Line at={C.eye} to={to - 4} text="مش بالعين ✓" top={360} accent />
    </>
  );
};

// ---------- 3 Slab: formwork on props, laser level, one continuous pour with a vibrator ----------
export const Slab: React.FC = () => {
  const frame = useCurrentFrame();
  const from = C.slab;
  const to = C.concrete;
  const v: Iso = { ox: 560, oy: 1130, s: 112 };
  const L = 4.6;
  const Wd = 3.6;
  const Z = 2.5;
  const cols: [number, number][] = [
    [0, 0],
    [L - 0.35, 0],
    [0, Wd - 0.35],
    [L - 0.35, Wd - 0.35],
  ];
  const props: [number, number][] = [];
  for (let i = 1; i <= 3; i++) for (let j = 1; j <= 2; j++) props.push([(L / 4) * i, (Wd / 3) * j]);
  const laser = interpolate(frame, [C.level - 2, C.level + 14], [0, 1], { ...clamp, easing: easeInOut });
  const meshP = ramp(frame, C.pour - 4, C.pour + 6);
  const fill = ramp(frame, C.pour + 2, C.vibrator + 8, easeInOut);
  const vib = frame >= C.vibrator ? (frame - C.vibrator) / 30 : -1;
  const shake = vib >= 0 ? Math.sin(frame * 2.3) * 2 : 0;
  return (
    <>
      <Scene from={from} to={to - 1} zoom={[1, 1.06]}>
        <Svg>
          <ellipse cx={560} cy={1240} rx={480} ry={140} fill="rgba(0,0,0,0.35)" />
          <Quad v={v} p={[[-0.4, -0.4, 0], [L + 0.4, -0.4, 0], [L + 0.4, Wd + 0.4, 0], [-0.4, Wd + 0.4, 0]]} fill="#163556" stroke={P.lineDim} />
          {cols.slice(0, 1).map(([x, y], i) => (
            <Box key={i} v={v} x={x} y={y} w={0.35} d={0.35} h={Z} c={CONCRETE} />
          ))}
          {props.map(([x, y], i) => {
            const q = pop(frame, from + 6 + i * 3, 8, backOut);
            return <Box key={`p${i}`} v={v} x={x - 0.05} y={y - 0.05} w={0.1} d={0.1} h={(Z - 0.14) * q} c={WOOD} />;
          })}
          {cols.slice(1).map(([x, y], i) => (
            <Box key={`c${i}`} v={v} x={x} y={y} w={0.35} d={0.35} h={Z} c={CONCRETE} />
          ))}
          {[Wd / 3, (2 * Wd) / 3].map((y, i) => {
            const q = pop(frame, C.forms - 6 + i * 3, 10, easeOut);
            return <Box key={`bm${i}`} v={v} x={0} y={y - 0.07} z={Z - 0.14 + (1 - q) * 1.2} w={L * q} d={0.14} h={0.12} c={WOOD} opacity={q} />;
          })}
          {Array.from({ length: 6 }, (_, i) => {
            const q = pop(frame, C.forms + i * 2.5, 9, easeOut);
            if (q <= 0) return null;
            const y = (Wd / 6) * i;
            return <Box key={`d${i}`} v={v} x={0} y={y} z={Z - 0.02 + (1 - q) * 0.9} w={L} d={Wd / 6 - 0.02} h={0.06} c={WOOD} opacity={q} stroke="rgba(0,0,0,0.25)" />;
          })}
          {/* Laser line sweeping the deck. */}
          {laser > 0 && laser < 1 && (
            <g>
              <Quad v={v} p={[[L * laser - 0.04, 0, Z + 0.05], [L * laser + 0.04, 0, Z + 0.05], [L * laser + 0.04, Wd, Z + 0.05], [L * laser - 0.04, Wd, Z + 0.05]]} fill="#ff3b3b" />
              <Quad v={v} p={[[L * laser - 0.25, 0, Z + 0.05], [L * laser + 0.25, 0, Z + 0.05], [L * laser + 0.25, Wd, Z + 0.05], [L * laser - 0.25, Wd, Z + 0.05]]} fill="rgba(255,60,60,0.25)" />
            </g>
          )}
          {/* Mesh, then the concrete running across in one pour. */}
          {Array.from({ length: 9 }, (_, i) => (
            <Bar key={`mx${i}`} v={v} a={[0.2, 0.2 + i * 0.4, Z + 0.1]} b={[L - 0.2, 0.2 + i * 0.4, Z + 0.1]} p={interpolate(meshP, [i * 0.05, 0.5 + i * 0.05], [0, 1], clamp)} w={3} />
          ))}
          {Array.from({ length: 11 }, (_, i) => (
            <Bar key={`my${i}`} v={v} a={[0.2 + i * 0.42, 0.2, Z + 0.12]} b={[0.2 + i * 0.42, Wd - 0.2, Z + 0.12]} p={interpolate(meshP, [0.3 + i * 0.04, 0.8 + i * 0.04], [0, 1], clamp)} w={3} />
          ))}
          {fill > 0 && (
            <g transform={`translate(${shake} 0)`}>
              <Box v={v} x={0} y={0} z={Z + 0.04} w={L * fill} d={Wd} h={0.2} c={["#cfccc5", "#aaa59b", "#8f8a80"]} />
            </g>
          )}
          {vib >= 0 &&
            [0, 1, 2].map((k) => {
              const t = (vib * 2 + k / 3) % 1;
              const [x, y] = iso(v, L * 0.55, Wd * 0.5, Z + 0.24);
              return <ellipse key={k} cx={x} cy={y} rx={40 + t * 220} ry={(40 + t * 220) * 0.5} fill="none" stroke="white" strokeWidth={3} opacity={(1 - t) * 0.7} />;
            })}
          <Tag at={C.level + 4} x={iso(v, 3.5, 0.5, Z + 0.08)[0]} y={iso(v, 3.5, 0.5, Z + 0.08)[1]} tx={iso(v, 3.5, 0.5, Z + 0.08)[0] - 20} ty={iso(v, 3.5, 0.5, Z + 0.08)[1] - 300} text="مستوي ± 0 مم" color="#ff6b6b" />
        </Svg>
      </Scene>
      <Step n={3} label="السقف" from={from} to={to - 4} />
      <Line at={C.forms} to={C.pour - 3} text="شدّة بالميزان" top={360} />
      <Line at={C.pour} to={C.vibrator - 2} text="صبّة واحدة" top={360} />
      <Line at={C.vibrator} to={to - 4} text="بالهزّاز ✓" top={360} accent />
    </>
  );
};

// ---------- 4 Concrete: test cubes to the lab, then a week of curing ----------
export const Concrete: React.FC = () => {
  const frame = useCurrentFrame();
  const from = C.concrete;
  const to = C.review;
  const cv: Iso = { ox: 0, oy: 0, s: 130 };
  const slide = ramp(frame, C.lab - 4, C.lab + 10);
  const needle = interpolate(frame, [C.lab + 8, C.lab + 22], [-80, 40], { ...clamp, easing: easeOut });
  const sv: Iso = { ox: 540, oy: 1170, s: 82 };
  const wet = ramp(frame, C.cure, C.cure + 16);
  const days = Math.floor(interpolate(frame, [C.cure + 4, C.week + 10], [0, 7], clamp));
  return (
    <>
      <Scene from={from} to={to - 1} zoom={[1, 1.04]}>
        <Svg>
          {/* Three test cubes; one slides into the press, the gauge passes. */}
          {[0, 1, 2].map((i) => {
            const q = pop(frame, from + 4 + i * 4, 10, backOut);
            if (q <= 0) return null;
            const moving = i === 0 ? slide : 0;
            const x = 210 + i * 150 + moving * 470;
            const y = 800 - moving * 40;
            return (
              <g key={i} transform={`translate(${x} ${y}) scale(${q})`}>
                <Box v={cv} x={-0.3} y={-0.3} w={0.6} d={0.6} h={0.6} c={CONCRETE} />
              </g>
            );
          })}
          <text x={360} y={900} textAnchor="middle" fontFamily={headingFont} fontWeight={700} fontSize={34} fill={P.line} opacity={pop(frame, from + 14, 10)}>
            15 × 15 × 15 سم
          </text>
          <g opacity={pop(frame, from + 10, 12)} transform="translate(0 100)">
            <rect x={600} y={430} width={300} height={330} rx={20} fill="#163556" stroke={P.line} strokeWidth={4} />
            <rect x={725} y={455} width={50} height={110 + slide * 40} fill={P.steelDark} />
            <rect x={660} y={560 + slide * 40} width={180} height={22} rx={6} fill={P.steel} />
            <rect x={640} y={700} width={220} height={26} rx={6} fill={P.steel} />
            <g transform="translate(750 360)">
              <path d="M -90 0 A 90 90 0 0 1 90 0" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={14} />
              <path d="M 30 -84 A 90 90 0 0 1 90 0" fill="none" stroke={P.ok} strokeWidth={14} />
              <line x1={0} y1={0} x2={0} y2={-80} stroke="white" strokeWidth={6} strokeLinecap="round" transform={`rotate(${needle})`} />
              <circle r={10} fill="white" />
            </g>
            <Mark at={C.lab + 22} x={880} y={420} size={80} />
          </g>
          {/* The slab being kept wet for a week. */}
          <g opacity={pop(frame, C.cure - 6, 12)}>
            <Box v={sv} x={0} y={0} w={4.4} d={3.4} h={0.3} c={CONCRETE} />
            <Quad v={sv} p={[[0, 0, 0.3], [4.4, 0, 0.3], [4.4, 3.4, 0.3], [0, 3.4, 0.3]]} fill={`rgba(108,200,255,${0.35 * wet})`} />
            {Array.from({ length: 34 }, (_, i) => {
              const t = ((frame - C.cure) / 18 + rand(i)) % 1;
              if (frame < C.cure) return null;
              const [x0, y0] = iso(sv, rand(i + 1) * 4.4, rand(i + 2) * 3.4, 2.2);
              return <ellipse key={i} cx={x0} cy={y0 + t * 230} rx={4} ry={10} fill={P.water} opacity={0.85 * (1 - t)} />;
            })}
          </g>
          {Array.from({ length: 7 }, (_, i) => {
            const on = i < days;
            return (
              <g key={i} transform={`translate(${300 + i * 80} 1090)`} opacity={pop(frame, C.cure - 4 + i, 8)}>
                <rect x={-32} y={-32} width={64} height={64} rx={16} fill={on ? P.water : "rgba(255,255,255,0.12)"} />
                <text y={14} textAnchor="middle" fontFamily={headingFont} fontWeight={800} fontSize={36} fill={on ? P.night : "white"}>
                  {i + 1}
                </text>
              </g>
            );
          })}
        </Svg>
      </Scene>
      <Step n={4} label="الخرسانة" from={from} to={to - 4} />
      <Line at={C.cubes} to={C.cure - 3} text="مكعبات للمعمل" top={960} />
      <Line at={C.cure} to={to - 4} text="رشّ مية 7 أيام" top={960} accent />
    </>
  );
};
