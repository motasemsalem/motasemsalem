import {interpolate, random, useCurrentFrame} from 'remotion';
import {clamp, progress} from '../anim';
import {bodyFont, C, headingFont} from '../theme';

const draw = (p: number) => ({pathLength: 1, strokeDasharray: '1 1', strokeDashoffset: 1 - p});

const STALKS = [
  {x: 250, top: 210, start: 0},
  {x: 390, top: 150, start: 10},
  {x: 530, top: 230, start: 20},
];

export const WheatArt: React.FC = () => {
  const frame = useCurrentFrame();
  const ground = 600;
  return (
    <svg width={760} height={640} viewBox="0 0 760 640">
      <line x1={80} x2={700} y1={ground} y2={ground} stroke={C.line} strokeWidth={4} opacity={progress(frame, 0, 15)} />
      {STALKS.map((s, i) => {
        const stem = progress(frame, s.start + 5, 30);
        const sway = Math.sin(frame / 22 + i * 1.3) * 4;
        return (
          <g key={s.x} transform={`rotate(${sway} ${s.x} ${ground})`}>
            <path d={`M ${s.x} ${ground} Q ${s.x - 10} ${(ground + s.top) / 2} ${s.x} ${s.top}`} fill="none" stroke="#b58a3c" strokeWidth={7} strokeLinecap="round" {...draw(stem)} />
            <path
              d={`M ${s.x - 3} ${ground - 140} Q ${s.x - 90} ${ground - 200} ${s.x - 110} ${ground - 290}`}
              fill="none"
              stroke="#8f7a3a"
              strokeWidth={6}
              strokeLinecap="round"
              {...draw(progress(frame, s.start + 25, 25))}
            />
            {new Array(7).fill(true).map((_, g) =>
              [-1, 1].map((side) => {
                const gp = progress(frame, s.start + 32 + g * 4, 14);
                const y = s.top - g * 22;
                return (
                  <ellipse
                    key={`${g}-${side}`}
                    cx={s.x + side * 15}
                    cy={y}
                    rx={11 * gp}
                    ry={22 * gp}
                    fill={C.accent}
                    transform={`rotate(${side * 28} ${s.x + side * 15} ${y})`}
                  />
                );
              }),
            )}
            <ellipse cx={s.x} cy={s.top - 7 * 22} rx={9 * progress(frame, s.start + 62, 12)} ry={20 * progress(frame, s.start + 62, 12)} fill={C.accent} />
          </g>
        );
      })}
    </svg>
  );
};

// One wedge of cuneiform: a triangular head with a tail, pointing in `angle` degrees.
const Wedge: React.FC<{x: number; y: number; angle: number; s: number}> = ({x, y, angle, s}) => (
  <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${s})`} fill="#5b3c25">
    <polygon points="0,-9 0,9 14,0" />
    <rect x={10} y={-2.5} width={22} height={5} rx={2} />
  </g>
);

export const TabletArt: React.FC = () => {
  const frame = useCurrentFrame();
  const rows = 5;
  const perRow = 7;
  return (
    <svg width={760} height={640} viewBox="0 0 760 640">
      <g opacity={progress(frame, 0, 18)}>
        <rect x={120} y={70} width={520} height={500} rx={50} fill="#a77b52" />
        <rect x={140} y={90} width={480} height={460} rx={38} fill="#b98d62" />
      </g>
      {new Array(rows).fill(true).map((_, r) => (
        <g key={r}>
          <line x1={170} x2={590} y1={175 + r * 82} y2={175 + r * 82} stroke="#8e6644" strokeWidth={3} opacity={progress(frame, 10 + r * 6, 12)} />
          {new Array(perRow).fill(true).map((__, c) => {
            const start = 18 + (r * perRow + c) * 2.6;
            const p = progress(frame, start, 8);
            const kind = Math.floor(random(`sign-${r}-${c}`) * 3);
            const x = 190 + c * 58;
            const y = 140 + r * 82;
            const s = interpolate(p, [0, 1], [1.5, 1]);
            return (
              <g key={c} opacity={p}>
                <Wedge x={x} y={y} angle={0} s={s} />
                {kind > 0 ? <Wedge x={x + 4} y={y - 14} angle={90} s={s * 0.8} /> : null}
                {kind > 1 ? <Wedge x={x + 18} y={y + 6} angle={45} s={s * 0.7} /> : null}
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
};

const gearPath = (r: number, teeth: number, depth: number) => {
  const steps = teeth * 4;
  let d = '';
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const rad = i % 4 < 2 ? r : r - depth;
    d += `${i === 0 ? 'M' : 'L'} ${Math.cos(a) * rad} ${Math.sin(a) * rad} `;
  }
  return d + 'Z';
};

const GEARS = [
  {x: 300, y: 360, r: 160, teeth: 16, color: C.accent, dir: 1},
  {x: 530, y: 220, r: 110, teeth: 11, color: C.muted, dir: -1},
  {x: 560, y: 470, r: 80, teeth: 8, color: C.accent2, dir: -1},
];

export const GearsArt: React.FC = () => {
  const frame = useCurrentFrame();
  const base = frame * 1.6;
  return (
    <svg width={760} height={640} viewBox="0 0 760 640">
      {GEARS.map((g, i) => {
        const p = progress(frame, i * 10, 24);
        const rot = g.dir * base * (GEARS[0].teeth / g.teeth) + (g.dir < 0 ? 180 / g.teeth : 0);
        return (
          <g key={g.r} transform={`translate(${g.x} ${g.y}) scale(${p}) rotate(${rot})`}>
            <path d={gearPath(g.r, g.teeth, 22)} fill={g.color} />
            <circle r={g.r * 0.55} fill={C.bg} opacity={0.35} />
            <circle r={g.r * 0.18} fill={C.bg} />
          </g>
        );
      })}
    </svg>
  );
};

// A jittered 7×5 grid keeps the network evenly spread.
const NODES = new Array(35).fill(true).map((_, i) => ({
  x: 90 + (i % 7) * 97 + (random(`node-x-${i}`) - 0.5) * 60,
  y: 260 + Math.floor(i / 7) * 82 + (random(`node-y-${i}`) - 0.5) * 50,
}));
const order = NODES.map((n, i) => ({i, d: Math.hypot(n.x - 380, n.y - 420)})).sort((a, b) => a.d - b.d);
const rank = new Map(order.map((o, k) => [o.i, k]));
const EDGES = NODES.flatMap((n, i) =>
  NODES.map((m, j) => ({j, d: Math.hypot(n.x - m.x, n.y - m.y)}))
    .filter((e) => e.j !== i)
    .sort((a, b) => a.d - b.d)
    .slice(0, 2)
    .map((e) => [i, e.j] as const),
);

// World population milestones (billions).
const YEARS = [1804, 1927, 1960, 1974, 1987, 1999, 2011, 2022, 2026];
const POPS = [1, 2, 3, 4, 5, 6, 7, 8, 8.2];

export const NetworkArt: React.FC = () => {
  const frame = useCurrentFrame();
  const step = interpolate(frame, [20, 130], [0, YEARS.length - 1], clamp);
  const steps = YEARS.map((_, k) => k);
  const pop = interpolate(step, steps, POPS);
  const year = Math.round(interpolate(step, steps, YEARS));
  return (
    <svg width={760} height={640} viewBox="0 0 760 640">
      {EDGES.map(([a, b], k) => {
        const p = progress(frame, 10 + Math.max(rank.get(a)!, rank.get(b)!) * 3, 16);
        const t = ((frame + k * 7) % 40) / 40;
        return (
          <g key={k} opacity={p}>
            <line x1={NODES[a].x} y1={NODES[a].y} x2={NODES[b].x} y2={NODES[b].y} stroke={C.line} strokeWidth={2.5} />
            <circle cx={NODES[a].x + (NODES[b].x - NODES[a].x) * t} cy={NODES[a].y + (NODES[b].y - NODES[a].y) * t} r={3.5} fill={C.accent} />
          </g>
        );
      })}
      {NODES.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={9 * progress(frame, 8 + rank.get(i)! * 3, 14)} fill={i % 5 === 0 ? C.accent : C.muted} />
      ))}
      <text x={380} y={110} textAnchor="middle" direction="rtl" fontFamily={headingFont} fontWeight={800} fontSize={92} fill={C.text}>
        {`${pop.toFixed(1)} مليار`}
      </text>
      <text x={380} y={170} textAnchor="middle" direction="rtl" fontFamily={bodyFont} fontSize={34} fill={C.muted}>
        {`عدد البشر · ${year}`}
      </text>
    </svg>
  );
};
