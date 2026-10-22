import { interpolate, useCurrentFrame } from "remotion";
import { clamp, easeInOut, progress } from "../anim";
import { ar, bodyFont, C, headingFont } from "../theme";

const popScale = (frame: number, at: number) =>
  interpolate(frame, [at, at + 6, at + 11], [0, 1.15, 1], clamp);

// Fustat as a city plan: the Nile, the Babylon fortress, the Mosque of Amr,
// and the tribal quarters (khiṭaṭ) filling in as each tribe is named.
const BLOCKS = [
  "M 560 250 L 840 210 L 900 420 L 610 440 Z",
  "M 250 250 L 520 245 L 560 440 L 300 470 Z",
  "M 610 500 L 900 480 L 870 720 L 640 700 Z",
  "M 300 530 L 570 500 L 600 700 L 330 740 Z",
];

export const KhitatArt: React.FC<{
  readonly start: number;
  readonly blocks: readonly { name: string; frame: number }[];
}> = ({ start, blocks }) => {
  const frame = useCurrentFrame();
  const appear = progress(frame, start, 12);
  const mosque = popScale(frame, start + 6);
  return (
    <svg
      width={1080}
      height={940}
      viewBox="0 0 1080 940"
      style={{ position: "absolute", inset: 0, opacity: appear }}
    >
      <rect
        x={60}
        y={120}
        width={960}
        height={720}
        rx={40}
        fill="rgba(15,11,9,0.92)"
        stroke={C.landEdge}
        strokeWidth={3}
      />
      <path
        d="M 150 120 C 120 330 210 520 150 840 L 90 840 C 150 520 60 330 90 120 Z"
        fill={C.nile}
        opacity={0.75}
      />
      <text
        x={120}
        y={480}
        textAnchor="middle"
        fontFamily={bodyFont}
        fontSize={28}
        fill={C.text}
        transform="rotate(-90 120 480)"
      >
        النيل
      </text>
      {[250, 470, 760].map((y) => (
        <path
          key={y}
          d={`M 200 ${y} L 990 ${y - 30}`}
          stroke={C.landEdge}
          strokeOpacity={0.3}
          strokeWidth={4}
          strokeDasharray="14 10"
        />
      ))}
      <g
        transform="translate(250 790)"
        opacity={progress(frame, start + 2, 10)}
      >
        <rect
          x={-55}
          y={-40}
          width={110}
          height={70}
          fill="none"
          stroke={C.sand}
          strokeWidth={4}
        />
        {[-55, -20, 15, 50].map((x) => (
          <rect
            key={x}
            x={x - 6}
            y={-54}
            width={12}
            height={14}
            fill={C.sand}
          />
        ))}
        <text
          y={65}
          textAnchor="middle"
          fontFamily={bodyFont}
          fontWeight={600}
          fontSize={26}
          fill={C.muted}
        >
          حصن بابليون
        </text>
      </g>
      {blocks.map((b, i) => {
        const p = popScale(frame, b.frame);
        const color = i % 2 ? C.red : C.gold;
        const [cx, cy] = [
          [735, 330],
          [405, 355],
          [755, 600],
          [450, 620],
        ][i];
        return (
          <g
            key={b.name}
            opacity={Math.min(1, p)}
            transform={`translate(${cx} ${cy}) scale(${p}) translate(${-cx} ${-cy})`}
          >
            <path
              d={BLOCKS[i]}
              fill={color}
              fillOpacity={0.2}
              stroke={color}
              strokeWidth={4}
              strokeLinejoin="round"
            />
            {[0, 1, 2].map((k) => (
              <rect
                key={k}
                x={cx - 70 + k * 50}
                y={cy + 30}
                width={34}
                height={26}
                fill={color}
                opacity={0.35}
              />
            ))}
            <text
              x={cx}
              y={cy - 12}
              textAnchor="middle"
              fontFamily={bodyFont}
              fontSize={26}
              fill={C.muted}
            >
              خِطّة
            </text>
            <text
              x={cx}
              y={cy + 22}
              textAnchor="middle"
              fontFamily={headingFont}
              fontWeight={900}
              fontSize={54}
              fill={C.text}
            >
              {b.name}
            </text>
          </g>
        );
      })}
      <g transform={`translate(590 470) scale(${mosque})`}>
        <circle r={58} fill={C.bg} stroke={C.gold} strokeWidth={4} />
        <path d="M -28 18 L -28 -2 Q 0 -40 28 -2 L 28 18 Z" fill={C.gold} />
        <rect x={34} y={-40} width={10} height={58} fill={C.gold} />
        <text
          y={92}
          textAnchor="middle"
          fontFamily={headingFont}
          fontWeight={700}
          fontSize={28}
          fill={C.gold}
        >
          جامع عمرو
        </text>
      </g>
    </svg>
  );
};

// A rebab (spike fiddle) with sound waves, and the UNESCO badge.
export const RebabArt: React.FC<{ readonly badgeAt: number }> = ({
  badgeAt,
}) => {
  const frame = useCurrentFrame();
  const draw = progress(frame, 0, 24, easeInOut);
  const bow = Math.sin(frame / 5) * 40;
  const badge = popScale(frame, badgeAt);
  return (
    <svg width={1080} height={940} viewBox="0 0 1080 940">
      {[0, 1, 2, 3].map((i) => {
        const r = ((frame * 3 + i * 70) % 280) + 60;
        return (
          <circle
            key={i}
            cx={430}
            cy={560}
            r={r}
            fill="none"
            stroke={C.gold}
            strokeWidth={4}
            opacity={(1 - (r - 60) / 280) * 0.5 * draw}
          />
        );
      })}
      <g
        transform={`rotate(-14 430 470)`}
        stroke={C.sand}
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1={430} y1={110} x2={430} y2={820} opacity={draw} />
        <path
          d="M 330 560 Q 330 470 430 470 Q 530 470 530 560 Q 530 680 430 680 Q 330 680 330 560 Z"
          fill="#3a2618"
          strokeDasharray={1}
          pathLength={1}
          strokeDashoffset={1 - draw}
        />
        <circle
          cx={430}
          cy={575}
          r={70}
          fill="#e8d4b0"
          opacity={0.9 * draw}
          stroke="none"
        />
        <line
          x1={415}
          y1={150}
          x2={415}
          y2={680}
          strokeWidth={2}
          opacity={draw}
        />
        <line
          x1={445}
          y1={150}
          x2={445}
          y2={680}
          strokeWidth={2}
          opacity={draw}
        />
        <rect
          x={400}
          y={150}
          width={60}
          height={22}
          rx={8}
          fill={C.red}
          stroke="none"
          opacity={draw}
        />
        <g transform={`translate(${bow} 0)`} opacity={draw}>
          <path
            d="M 220 600 Q 430 540 640 600"
            stroke={C.gold}
            strokeWidth={7}
          />
          <line
            x1={225}
            y1={612}
            x2={635}
            y2={612}
            stroke={C.text}
            strokeWidth={2}
          />
        </g>
      </g>
      <g transform={`translate(800 260) scale(${badge})`}>
        <circle r={150} fill={C.bg} stroke={C.gold} strokeWidth={6} />
        <circle
          r={132}
          fill="none"
          stroke={C.gold}
          strokeWidth={2}
          strokeDasharray="6 8"
        />
        <text
          textAnchor="middle"
          y={-30}
          fontFamily={headingFont}
          fontWeight={800}
          fontSize={42}
          fill={C.gold}
        >
          اليونسكو
        </text>
        <text
          textAnchor="middle"
          y={50}
          fontFamily={headingFont}
          fontWeight={900}
          fontSize={86}
          fill={C.text}
        >
          {ar(2008)}
        </text>
        <text
          textAnchor="middle"
          y={100}
          fontFamily={bodyFont}
          fontSize={30}
          fill={C.muted}
          direction="rtl"
        >
          تراث إنساني
        </text>
      </g>
    </svg>
  );
};

// A camel in side view; `stride` swings the legs (radians), `color` fills it.
export const Camel: React.FC<{ stride: number; color: string }> = ({
  stride,
  color,
}) => {
  const leg = (x: number, phase: number) => {
    const a = Math.sin(stride + phase) * 0.45;
    return (
      <line
        x1={x}
        y1={18}
        x2={x + Math.sin(a) * 52}
        y2={18 + Math.cos(a) * 52}
        stroke={color}
        strokeWidth={9}
        strokeLinecap="round"
      />
    );
  };
  return (
    <g>
      {leg(-38, 0)}
      {leg(-24, Math.PI)}
      {leg(30, Math.PI)}
      {leg(44, 0)}
      <ellipse rx={60} ry={28} fill={color} />
      <path d="M -34 -14 Q -4 -78 30 -14 Z" fill={color} />
      <path
        d="M 50 -6 Q 70 -30 82 -62"
        stroke={color}
        strokeWidth={18}
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx={96} cy={-64} rx={20} ry={11} fill={color} />
      <path
        d="M -58 -4 Q -76 10 -70 34"
        stroke={color}
        strokeWidth={5}
        fill="none"
      />
    </g>
  );
};

const Icon: React.FC<{ name: "majlis" | "poetry" | "coffee" | "camel" }> = ({
  name,
}) => {
  const frame = useCurrentFrame();
  const stroke = {
    stroke: C.gold,
    strokeWidth: 7,
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  } as const;
  if (name === "majlis")
    return (
      <g {...stroke}>
        <path d="M -110 60 L 0 -80 L 110 60 Z" fill="rgba(208,65,47,0.25)" />
        <path d="M -150 60 L 150 60" />
        {[-60, 0, 60].map((x) => (
          <g key={x}>
            <circle cx={x} cy={10} r={14} fill={C.gold} stroke="none" />
            <path d={`M ${x - 18} 58 Q ${x} 20 ${x + 18} 58`} />
          </g>
        ))}
      </g>
    );
  if (name === "camel")
    return (
      <g>
        <path
          d="M -150 80 L 150 80"
          stroke={C.sand}
          strokeWidth={4}
          strokeDasharray="16 12"
          strokeDashoffset={frame * 6}
        />
        <g
          transform={`translate(${Math.sin(frame / 9) * 10} ${-4 + Math.abs(Math.sin(frame / 4)) * -8}) scale(1.05)`}
        >
          <Camel stride={frame / 3} color={C.gold} />
        </g>
      </g>
    );
  if (name === "poetry")
    return (
      <g {...stroke}>
        <rect
          x={-90}
          y={-80}
          width={180}
          height={150}
          rx={14}
          fill="rgba(242,179,61,0.12)"
        />
        {[-40, -5, 30].map((y, i) => (
          <path
            key={y}
            d={`M 60 ${y} L ${60 - 120 * progress(frame, 6 + i * 6, 12)} ${y}`}
          />
        ))}
        <path d="M 70 80 L 140 -40" stroke={C.sand} />
        <path d="M 140 -40 L 150 -70 L 128 -48" stroke={C.sand} />
      </g>
    );
  return (
    <g {...stroke}>
      <path
        d="M -50 70 L 50 70 L 40 -10 Q 0 -40 -40 -10 Z"
        fill="rgba(242,179,61,0.12)"
      />
      <path d="M -40 -10 L -20 -50 L 20 -50 L 40 -10" />
      <path d="M 0 -50 L 0 -78" />
      <path d="M 45 10 Q 110 0 120 -40" />
      <path d="M -45 20 Q -95 20 -85 60" />
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M ${-20 + i * 20} ${-95 - ((frame / 2 + i * 6) % 18)} q 10 -15 0 -30`}
          strokeWidth={4}
          opacity={0.5 + 0.5 * Math.sin(frame / 6 + i)}
        />
      ))}
    </g>
  );
};

const CUSTOMS = [
  { icon: "majlis", title: "المجالس العُرفية", note: "لحلّ النزاعات" },
  { icon: "poetry", title: "الشعر البدوي", note: "ذاكرة القبيلة" },
  { icon: "camel", title: "سباقات الهُجن", note: "سيناء والصحراء" },
  { icon: "coffee", title: "كرم الضيافة", note: "القهوة أولًا" },
] as const;

export const CustomsArt: React.FC<{ readonly cues: readonly number[] }> = ({
  cues,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        inset: "110px 60px 40px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {CUSTOMS.map((c, i) => {
        const p = progress(frame, cues[i], 10);
        return (
          <div
            key={c.title}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 30,
              padding: "0 40px",
              borderRadius: 32,
              background: "rgba(15,11,9,0.75)",
              border: `3px solid ${i % 2 ? C.red : C.gold}`,
              boxShadow: `0 0 ${40 * (1 - p)}px ${C.gold}`,
              opacity: p,
              translate: `${(1 - p) * 300}px 0`,
            }}
          >
            <svg width={210} height={168} viewBox="-150 -120 300 240">
              <Icon name={c.icon} />
            </svg>
            <div>
              <div
                style={{
                  fontFamily: headingFont,
                  fontWeight: 900,
                  fontSize: 62,
                  color: C.text,
                }}
              >
                {c.title}
              </div>
              <div
                style={{ fontFamily: bodyFont, fontSize: 40, color: C.muted }}
              >
                {c.note}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Gold flecks rising, for the Wadi Allaqi gold mines.
export const GoldDust: React.FC<{
  readonly start: number;
  readonly x: number;
  readonly y: number;
}> = ({ start, x: cx, y: cy }) => {
  const frame = useCurrentFrame();
  const local = frame - start;
  if (local < 0) return null;
  return (
    <svg
      width={1080}
      height={940}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      {new Array(26).fill(true).map((_, i) => {
        const x = cx + Math.sin(i * 12.9) * 150;
        const y = cy + 60 - ((local * (2 + (i % 5)) + i * 37) % 320);
        return (
          <path
            key={i}
            d={`M ${x} ${y - 9} L ${x + 4} ${y} L ${x} ${y + 9} L ${x - 4} ${y} Z`}
            fill={C.gold}
            opacity={0.4 + 0.6 * Math.abs(Math.sin(local / 4 + i))}
          />
        );
      })}
    </svg>
  );
};

// Every tribe in the reel, slamming into a wall of names.
export const NamesWall: React.FC<{
  readonly names: readonly string[];
  readonly start: number;
}> = ({ names, start }) => {
  const frame = useCurrentFrame();
  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        inset: "60px 40px 40px",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignContent: "center",
        gap: "14px 14px",
      }}
    >
      {names.map((name, i) => {
        const at = start + i * 2;
        const p = interpolate(
          frame,
          [at, at + 5, at + 9],
          [2.2, 0.92, 1],
          clamp,
        );
        const shine = (frame - start - i * 2) % 90;
        const lit = shine >= 40 && shine < 52;
        return (
          <div
            key={name}
            style={{
              opacity: progress(frame, at, 4),
              scale: p,
              padding: "6px 22px 10px",
              borderRadius: 16,
              fontFamily: headingFont,
              fontWeight: 800,
              fontSize: 40,
              color: lit ? C.bg : i % 3 === 0 ? C.gold : C.text,
              background: lit
                ? C.gold
                : i % 2
                  ? "rgba(208,65,47,0.2)"
                  : "rgba(242,179,61,0.12)",
              border: `2px solid ${i % 2 ? C.red : C.gold}`,
            }}
          >
            {name}
          </div>
        );
      })}
    </div>
  );
};
