import {interpolate, random, useCurrentFrame} from 'remotion';
import {clamp, progress} from '../anim';
import {bodyFont, C, headingFont} from '../theme';

const draw = (p: number) => ({pathLength: 1, strokeDasharray: '1 1', strokeDashoffset: 1 - p});

export const DivergenceArt: React.FC = () => {
  const frame = useCurrentFrame();
  const trunk = progress(frame, 10, 30);
  const branches = progress(frame, 36, 42);
  const labels = progress(frame, 70, 20);
  const stroke = {fill: 'none', strokeWidth: 14, strokeLinecap: 'round'} as const;
  return (
    <svg width={760} height={640} viewBox="0 0 760 640">
      <path d="M380 600 L380 380" stroke={C.muted} {...stroke} {...draw(trunk)} />
      <path d="M380 380 C380 260 200 250 170 120" stroke={C.muted} {...stroke} {...draw(branches)} />
      <path d="M380 380 C380 260 560 250 590 120" stroke={C.accent} {...stroke} {...draw(branches)} />
      <circle cx={380} cy={380} r={20} fill={C.text} opacity={trunk} />
      <text x={500} y={420} textAnchor="middle" fontFamily={bodyFont} fontSize={32} fill={C.muted} opacity={trunk}>
        سلف مشترك
      </text>
      <g opacity={labels}>
        <circle cx={170} cy={120} r={16} fill={C.muted} />
        <circle cx={590} cy={120} r={16} fill={C.accent} />
        <text x={170} y={72} textAnchor="middle" fontFamily={headingFont} fontWeight={800} fontSize={42} fill={C.muted}>
          الشمبانزي
        </text>
        <text x={590} y={72} textAnchor="middle" fontFamily={headingFont} fontWeight={800} fontSize={42} fill={C.accent}>
          البشر
        </text>
      </g>
    </svg>
  );
};

const Foot: React.FC<{x: number; y: number; rot: number; flip: boolean; p: number; dim: number}> = ({
  x, y, rot, flip, p, dim,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -1 : 1} 1)`} opacity={p * dim}>
    <g transform={`scale(${0.6 + 0.4 * p})`}>
      <path
        d="M2 -58 C 24 -58 28 -18 22 12 C 18 40 14 62 0 64 C -14 62 -22 40 -20 10 C -20 -22 -20 -58 2 -58 Z"
        fill={C.accent}
      />
      <circle cx={-10} cy={-74} r={10} fill={C.accent} />
      <circle cx={7} cy={-78} r={7} fill={C.accent} />
      <circle cx={18} cy={-72} r={6} fill={C.accent} />
      <circle cx={26} cy={-62} r={5} fill={C.accent} />
      <circle cx={30} cy={-50} r={4.5} fill={C.accent} />
    </g>
  </g>
);

export const FootprintsArt: React.FC = () => {
  const frame = useCurrentFrame();
  const from = [600, 590];
  const to = [170, 70];
  const steps = 8;
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const len = Math.hypot(dx, dy);
  const perp = [-dy / len, dx / len];
  const rot = (Math.atan2(dx, -dy) * 180) / Math.PI;
  return (
    <svg width={760} height={660} viewBox="0 0 760 660">
      {new Array(steps).fill(true).map((_, i) => {
        const t = i / (steps - 1);
        const side = i % 2 === 0 ? 1 : -1;
        const start = 12 + i * 12;
        return (
          <Foot
            key={i}
            x={from[0] + dx * t + perp[0] * 38 * side}
            y={from[1] + dy * t + perp[1] * 38 * side}
            rot={rot}
            flip={side < 0}
            p={progress(frame, start, 14)}
            dim={interpolate(frame - start, [40, 80], [1, 0.4], clamp)}
          />
        );
      })}
    </svg>
  );
};

const HITS = [28, 54, 80];
const CONTACT = [470, 250];

export const StoneToolArt: React.FC = () => {
  const frame = useCurrentFrame();
  const appear = progress(frame, 0, 20);
  const swing = Math.max(...HITS.map((h) => interpolate(frame, [h - 14, h, h + 14], [0, 1, 0], clamp)));
  const facets = ['M300 250 L380 330 L330 420', 'M380 330 L470 300', 'M380 330 L420 430'];
  return (
    <svg width={760} height={640} viewBox="0 0 760 640" opacity={appear}>
      <polygon
        points="260,300 330,210 430,200 500,250 520,340 470,440 360,470 270,420"
        fill="#8a7a69"
        stroke="#bfae98"
        strokeWidth={4}
        strokeLinejoin="round"
      />
      {facets.map((d, i) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke="#5e5144"
          strokeWidth={5}
          strokeLinecap="round"
          {...draw(progress(frame, HITS[i], 14))}
        />
      ))}
      <path
        d="M430 200 L500 250 L520 340 L470 440"
        fill="none"
        stroke={C.accent}
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...draw(progress(frame, 95, 30))}
      />
      {HITS.flatMap((hit, h) =>
        new Array(6).fill(true).map((_, i) => {
          const t = frame - hit;
          if (t < 0 || t > 32) return null;
          const vx = (random(`chip-x-${h}-${i}`) * 2 + 1.5) * 3;
          const vy = -(random(`chip-y-${h}-${i}`) * 4 + 3);
          return (
            <rect
              key={`${h}-${i}`}
              x={CONTACT[0] + vx * t}
              y={CONTACT[1] + vy * t + 0.25 * t * t}
              width={10}
              height={7}
              rx={2}
              fill="#bfae98"
              opacity={1 - t / 32}
              transform={`rotate(${t * 14 * (i % 2 ? 1 : -1)} ${CONTACT[0] + vx * t} ${CONTACT[1] + vy * t + 0.25 * t * t})`}
            />
          );
        }),
      )}
      <ellipse
        cx={interpolate(swing, [0, 1], [640, 528])}
        cy={interpolate(swing, [0, 1], [110, 205])}
        rx={58}
        ry={44}
        fill="#6f6255"
        stroke="#a89582"
        strokeWidth={4}
      />
    </svg>
  );
};

type Build = {head: [number, number]; torso: [number, number]; arm: number; leg: number};
const LUCY: Build = {head: [-0.88, 0.09], torso: [-0.78, 0.38], arm: 0.44, leg: 0.4};
const ERECTUS: Build = {head: [-0.925, 0.075], torso: [-0.83, 0.36], arm: 0.36, leg: 0.47};

// Pictogram person, feet at (x, ground), `h` pixels tall, grown upward by `p`.
const Person: React.FC<{x: number; ground: number; h: number; p: number; color: string; build: Build}> = ({
  x, ground, h, p, color, build,
}) => (
  <g transform={`translate(${x} ${ground}) scale(${h} ${h * p})`} fill={color}>
    <circle cx={0} cy={build.head[0]} r={build.head[1]} />
    <rect x={-0.11} y={build.torso[0]} width={0.22} height={build.torso[1]} rx={0.05} />
    <rect x={-0.175} y={build.torso[0] + 0.02} width={0.055} height={build.arm} rx={0.027} />
    <rect x={0.12} y={build.torso[0] + 0.02} width={0.055} height={build.arm} rx={0.027} />
    <rect x={-0.1} y={-build.leg} width={0.085} height={build.leg} rx={0.04} />
    <rect x={0.015} y={-build.leg} width={0.085} height={build.leg} rx={0.04} />
  </g>
);

export const HeightArt: React.FC = () => {
  const frame = useCurrentFrame();
  const ground = 590;
  const lucy = progress(frame, 10, 34);
  const erectus = progress(frame, 30, 40);
  const people = [
    {x: 560, h: 1.1 * 250, p: lucy, color: C.muted, build: LUCY, name: 'لوسي', size: '1.1 م'},
    {x: 250, h: 1.7 * 250, p: erectus, color: C.accent, build: ERECTUS, name: 'المنتصب', size: '1.7 م'},
  ];
  return (
    <svg width={760} height={640} viewBox="0 0 760 640">
      <line x1={60} x2={700} y1={ground} y2={ground} stroke={C.line} strokeWidth={4} />
      {people.map((person) => (
        <g key={person.name}>
          <Person x={person.x} ground={ground} h={person.h} p={person.p} color={person.color} build={person.build} />
          <line
            x1={60}
            x2={700}
            y1={ground - person.h * person.p}
            y2={ground - person.h * person.p}
            stroke={person.color}
            strokeWidth={2}
            strokeDasharray="8 10"
            opacity={0.5 * person.p}
          />
          <g opacity={progress(frame, 60, 20)}>
            <text
              x={person.x}
              y={ground - person.h - 70}
              textAnchor="middle"
              direction="rtl"
              fontFamily={headingFont}
              fontWeight={800}
              fontSize={38}
              fill={person.color}
            >
              {person.name}
            </text>
            <text
              x={person.x}
              y={ground - person.h - 26}
              textAnchor="middle"
              direction="rtl"
              fontFamily={bodyFont}
              fontSize={30}
              fill={C.muted}
            >
              {person.size}
            </text>
          </g>
        </g>
      ))}
    </svg>
  );
};

const flame = (cx: number, base: number, w: number, h: number, sway: number) =>
  `M ${cx - w} ${base} C ${cx - w} ${base - h * 0.45} ${cx - w * 0.25 + sway} ${base - h * 0.7} ${cx + sway * 1.6} ${base - h}` +
  ` C ${cx + w * 0.3 + sway} ${base - h * 0.7} ${cx + w} ${base - h * 0.45} ${cx + w} ${base}` +
  ` Q ${cx} ${base + w * 0.6} ${cx - w} ${base} Z`;

export const FireArt: React.FC = () => {
  const frame = useCurrentFrame();
  const grow = progress(frame, 8, 40);
  const cx = 380;
  const base = 520;
  const layers = [
    {w: 120, h: 330, color: C.accent2, phase: 0},
    {w: 82, h: 250, color: C.accent, phase: 1.7},
    {w: 44, h: 150, color: C.pale, phase: 3.1},
  ];
  return (
    <svg width={760} height={660} viewBox="0 0 760 660">
      <defs>
        <radialGradient id="fire-glow">
          <stop offset="0%" stopColor={C.accent} stopOpacity={0.55} />
          <stop offset="100%" stopColor={C.accent} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={base - 120} r={320} fill="url(#fire-glow)" opacity={grow * (0.85 + 0.15 * Math.sin(frame / 5))} />
      <g transform={`translate(${cx} ${base}) scale(${grow}) translate(${-cx} ${-base})`}>
        {layers.map((l) => (
          <path
            key={l.color}
            d={flame(cx, base, l.w, l.h * (1 + 0.07 * Math.sin(frame / 4 + l.phase)), Math.sin(frame / 7 + l.phase) * l.w * 0.22)}
            fill={l.color}
          />
        ))}
      </g>
      <rect x={cx - 190} y={base + 10} width={380} height={44} rx={22} fill="#5a3d2b" transform={`rotate(-12 ${cx} ${base + 32})`} />
      <rect x={cx - 190} y={base + 10} width={380} height={44} rx={22} fill="#6e4a33" transform={`rotate(12 ${cx} ${base + 32})`} />
      {new Array(16).fill(true).map((_, i) => {
        const period = 50 + random(`spark-p-${i}`) * 30;
        const t = ((frame + random(`spark-o-${i}`) * period) % period) / period;
        return (
          <circle
            key={i}
            cx={cx + (random(`spark-x-${i}`) - 0.5) * 160 + Math.sin(t * 6 + i) * 24}
            cy={base - 80 - t * 420}
            r={2.5 + random(`spark-r-${i}`) * 3}
            fill={C.pale}
            opacity={grow * (1 - t)}
          />
        );
      })}
    </svg>
  );
};
