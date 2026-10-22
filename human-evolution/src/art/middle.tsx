import {interpolate, random, useCurrentFrame} from 'remotion';
import {clamp, progress} from '../anim';
import {bodyFont, C, headingFont} from '../theme';
import {AFRICA_PATH} from './africa';

const draw = (p: number) => ({pathLength: 1, strokeDasharray: '1 1', strokeDashoffset: 1 - p});

// Approximate average brain volumes in cm³; oldest on the right to follow the RTL reading order.
const BRAINS: {name: string[]; value: number; color: string}[] = [
  {name: ['ساحل', 'أنثروبوس'], value: 360, color: C.dim},
  {name: ['لوسي'], value: 450, color: C.dim},
  {name: ['الإنسان', 'الماهر'], value: 610, color: C.muted},
  {name: ['الإنسان', 'المنتصب'], value: 900, color: C.muted},
  {name: ['النياندرتال'], value: 1450, color: C.accent2},
  {name: ['الإنسان', 'العاقل'], value: 1350, color: C.accent},
];

export const BrainChartArt: React.FC = () => {
  const frame = useCurrentFrame();
  const baseline = 470;
  const maxH = 380;
  return (
    <svg width={780} height={620} viewBox="0 0 780 620">
      <line x1={20} x2={760} y1={baseline} y2={baseline} stroke={C.line} strokeWidth={3} />
      {BRAINS.map((b, i) => {
        const p = progress(frame, 12 + i * 10, 32);
        const x = 780 - 30 - 92 - i * 122;
        const h = (b.value / 1500) * maxH * p;
        return (
          <g key={b.value}>
            <rect x={x} y={baseline - h} width={92} height={h} rx={10} fill={b.color} />
            <text
              x={x + 46}
              y={baseline - h - 18}
              textAnchor="middle"
              fontFamily={headingFont}
              fontWeight={800}
              fontSize={32}
              fill={C.text}
              opacity={p}
            >
              {Math.round(b.value * p)}
            </text>
            <text x={x + 46} y={baseline + 44} textAnchor="middle" fontFamily={bodyFont} fontSize={25} fill={C.muted} opacity={p}>
              {b.name.map((line, l) => (
                <tspan key={line} x={x + 46} dy={l === 0 ? 0 : 32}>
                  {line}
                </tspan>
              ))}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export const DnaArt: React.FC = () => {
  const frame = useCurrentFrame();
  const cx = 450;
  const amp = 130;
  const rungs = 22;
  const spacing = 24;
  const top = 60;
  const phase = frame * 0.06;
  const highlight = 13;
  const reveal = progress(frame, 0, 50) * rungs;
  const strand = (sign: number) => {
    let d = '';
    for (let s = 0; s <= Math.min(reveal, rungs - 1); s += 0.2) {
      const x = cx + sign * amp * Math.sin(phase + s * 0.45);
      d += `${d ? 'L' : 'M'} ${x} ${top + s * spacing} `;
    }
    return d;
  };
  const hy = top + highlight * spacing;
  return (
    <svg width={760} height={640} viewBox="0 0 760 640">
      {new Array(rungs).fill(true).map((_, i) => {
        if (i > reveal) return null;
        const a = phase + i * 0.45;
        const isNeanderthal = i === highlight;
        return (
          <line
            key={i}
            x1={cx + amp * Math.sin(a)}
            x2={cx - amp * Math.sin(a)}
            y1={top + i * spacing}
            y2={top + i * spacing}
            stroke={isNeanderthal ? C.accent : C.line}
            strokeWidth={isNeanderthal ? 9 : 5}
            strokeLinecap="round"
          />
        );
      })}
      <path d={strand(1)} fill="none" stroke={C.muted} strokeWidth={8} strokeLinecap="round" />
      <path d={strand(-1)} fill="none" stroke={C.accent2} strokeWidth={8} strokeLinecap="round" />
      <g opacity={progress(frame, 55, 20)}>
        <line x1={cx - amp - 24} x2={cx - amp - 64} y1={hy} y2={hy} stroke={C.accent} strokeWidth={3} />
        <text x={cx - amp - 78} y={hy + 12} textAnchor="end" direction="ltr" fontFamily={headingFont} fontWeight={800} fontSize={38} fill={C.accent}>
          1–2%
        </text>
        <text x={cx - amp - 78} y={hy + 52} textAnchor="start" direction="rtl" fontFamily={bodyFont} fontSize={28} fill={C.muted}>
          إرث نياندرتالي
        </text>
      </g>
    </svg>
  );
};

export const SapiensPinArt: React.FC = () => {
  const frame = useCurrentFrame();
  const outline = progress(frame, 0, 45);
  const fill = progress(frame, 25, 30);
  const pin = {x: 112, y: 128};
  const drop = interpolate(frame, [45, 62, 68, 72], [-260, 0, -18, 0], clamp);
  const pinIn = progress(frame, 45, 8);
  return (
    <svg width={700} height={760} viewBox="0 0 700 760">
      <g transform="translate(0 90)">
      <path d={AFRICA_PATH} fill={C.bgGlow} fillOpacity={fill} stroke={C.muted} strokeWidth={4} {...draw(outline)} />
      {[0, 1, 2].map((k) => {
        const t = ((frame - 70 - k * 15) % 45) / 45;
        if (frame < 70 + k * 15) return null;
        return <circle key={k} cx={pin.x} cy={pin.y} r={10 + t * 70} fill="none" stroke={C.accent} strokeWidth={3} opacity={1 - t} />;
      })}
      <g transform={`translate(${pin.x} ${pin.y + drop})`} opacity={pinIn}>
        <path d="M0 0 C -10 -22 -30 -34 -30 -58 A 30 30 0 1 1 30 -58 C 30 -34 10 -22 0 0 Z" fill={C.accent} />
        <circle cx={0} cy={-58} r={11} fill={C.bg} />
      </g>
      </g>
      <g opacity={progress(frame, 75, 20)}>
        <text x={pin.x + 52} y={70} textAnchor="end" direction="rtl" fontFamily={headingFont} fontWeight={800} fontSize={38} fill={C.text}>
          جبل إيغود
        </text>
        <text x={pin.x + 52} y={112} textAnchor="end" direction="rtl" fontFamily={bodyFont} fontSize={30} fill={C.muted}>
          المغرب · نحو 300 ألف سنة
        </text>
      </g>
    </svg>
  );
};

const ORIGIN = {x: 470, y: 400};
// Approximate arrival times; label positions keep clear of the routes.
const ROUTES = [
  {name: 'آسيا', date: 'نحو 65 ألف', x: 640, y: 250, lx: 728, ly: 225, d: 'M470 400 Q 560 300 640 250', start: 15},
  {name: 'أستراليا', date: 'نحو 50 ألف', x: 720, y: 540, lx: 690, ly: 590, d: 'M640 250 Q 740 380 720 540', start: 45},
  {name: 'أوروبا', date: 'نحو 45 ألف', x: 390, y: 180, lx: 300, ly: 180, d: 'M470 400 Q 420 290 390 180', start: 70},
  {name: 'الأمريكتان', date: 'نحو 20 ألف', x: 90, y: 280, lx: 100, ly: 330, d: 'M640 250 C 650 30 90 20 90 280', start: 95},
];

export const DispersalArt: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg width={800} height={640} viewBox="0 0 800 640">
      <g transform="translate(255 265) scale(0.42)">
        <path d={AFRICA_PATH} fill={C.bgGlow} stroke={C.muted} strokeWidth={8} opacity={progress(frame, 0, 20)} />
      </g>
      <circle cx={ORIGIN.x} cy={ORIGIN.y} r={14} fill={C.accent} opacity={progress(frame, 5, 15)} />
      {ROUTES.map((r) => {
        const p = progress(frame, r.start, 32);
        const arrived = progress(frame, r.start + 26, 16);
        return (
          <g key={r.name}>
            <path d={r.d} fill="none" stroke={C.accent} strokeWidth={5} strokeLinecap="round" {...draw(p)} />
            <circle cx={r.x} cy={r.y} r={12 * arrived} fill={C.accent} />
            <g opacity={arrived}>
              <text x={r.lx} y={r.ly} textAnchor="middle" direction="rtl" fontFamily={headingFont} fontWeight={800} fontSize={34} fill={C.text}>
                {r.name}
              </text>
              <text x={r.lx} y={r.ly + 36} textAnchor="middle" direction="rtl" fontFamily={bodyFont} fontSize={26} fill={C.muted}>
                {r.date}
              </text>
            </g>
          </g>
        );
      })}
      <text x={ORIGIN.x - 60} y={ORIGIN.y + 60} textAnchor="middle" direction="rtl" fontFamily={headingFont} fontWeight={800} fontSize={30} fill={C.accent} opacity={progress(frame, 5, 15)}>
        أفريقيا
      </text>
    </svg>
  );
};

const Hand: React.FC = () => (
  <g fill="#2b2019">
    <rect x={-46} y={-40} width={92} height={92} rx={32} />
    <rect x={-36} y={40} width={72} height={70} rx={14} />
    <rect x={-64} y={-40} width={26} height={80} rx={13} transform="rotate(-38 -51 0)" />
    <rect x={-44} y={-128} width={24} height={100} rx={12} />
    <rect x={-16} y={-144} width={24} height={114} rx={12} />
    <rect x={12} y={-132} width={24} height={104} rx={12} />
    <rect x={38} y={-104} width={20} height={80} rx={10} transform="rotate(8 48 -64)" />
  </g>
);

const HANDS = [
  {x: 250, y: 320, rot: -14, start: 10},
  {x: 470, y: 260, rot: 10, start: 32},
  {x: 360, y: 470, rot: -4, start: 54},
];

export const HandsArt: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg width={760} height={640} viewBox="0 0 760 640">
      <defs>
        <radialGradient id="spray">
          <stop offset="0%" stopColor={C.accent2} stopOpacity={0.95} />
          <stop offset="55%" stopColor={C.accent2} stopOpacity={0.6} />
          <stop offset="100%" stopColor={C.accent2} stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={40} y={40} width={680} height={560} rx={60} fill="#2b2019" opacity={progress(frame, 0, 15)} />
      {new Array(120).fill(true).map((_, i) => (
        <circle
          key={i}
          cx={60 + random(`wall-x-${i}`) * 640}
          cy={60 + random(`wall-y-${i}`) * 520}
          r={1 + random(`wall-r-${i}`) * 4}
          fill={C.pale}
          opacity={0.05}
        />
      ))}
      {HANDS.map((h) => {
        const p = progress(frame, h.start, 26);
        return (
          <g key={h.start} transform={`translate(${h.x} ${h.y}) rotate(${h.rot})`}>
            <circle cx={0} cy={-20} r={200 * (0.5 + 0.5 * p)} fill="url(#spray)" opacity={p} />
            <g opacity={p}>
              <Hand />
            </g>
          </g>
        );
      })}
    </svg>
  );
};
