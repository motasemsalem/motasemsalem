import { interpolate, useCurrentFrame } from "remotion";
import { clamp, easeInOut, progress } from "../anim";
import { ar, bodyFont, C, headingFont } from "../theme";

const popScale = (frame: number, at: number) =>
  interpolate(frame, [at, at + 6, at + 11], [0, 1.15, 1], clamp);

// Fustat's tribal quarters (khiṭaṭ) laid out as city blocks that fill in one by one.
const KHITAT = ["تُجيب", "لَخْم", "المَعافِر", "مَهْرة", "الأزد", "خَولان"];

export const KhitatArt: React.FC<{ readonly start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const appear = progress(frame, start, 10);
  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        inset: "120px 80px 140px",
        opacity: appear,
        scale: 0.9 + 0.1 * appear,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 22,
        padding: 28,
        borderRadius: 36,
        background: "rgba(15,11,9,0.88)",
        border: `3px solid ${C.landEdge}`,
      }}
    >
      {KHITAT.map((name, i) => {
        const at = start + 6 + i * 4;
        return (
          <div
            key={name}
            style={{
              scale: popScale(frame, at),
              borderRadius: 22,
              background:
                i % 2 ? "rgba(208,65,47,0.22)" : "rgba(242,179,61,0.16)",
              border: `3px solid ${i % 2 ? C.red : C.gold}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
            }}
          >
            <div style={{ fontFamily: bodyFont, fontSize: 30, color: C.muted }}>
              خِطّة
            </div>
            <div
              style={{
                fontFamily: headingFont,
                fontWeight: 800,
                fontSize: 64,
                color: C.text,
              }}
            >
              {name}
            </div>
          </div>
        );
      })}
    </div>
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

const Icon: React.FC<{ name: "majlis" | "poetry" | "coffee" }> = ({ name }) => {
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
        inset: "40px 70px 60px",
        display: "flex",
        flexDirection: "column",
        gap: 26,
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
              border: `3px solid ${i === 1 ? C.red : C.gold}`,
              opacity: p,
              translate: `${(1 - p) * 300}px 0`,
            }}
          >
            <svg width={260} height={220} viewBox="-150 -120 300 240">
              <Icon name={c.icon} />
            </svg>
            <div>
              <div
                style={{
                  fontFamily: headingFont,
                  fontWeight: 900,
                  fontSize: 68,
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
