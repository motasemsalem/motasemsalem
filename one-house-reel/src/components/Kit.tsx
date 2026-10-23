import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { backOut, clamp, easeInOut, easeOut, progress } from "../anim";
import { bodyFont, C, headingFont } from "../theme";

// A site photo in a rounded frame: wipes in, slowly pushes in, with corner crop marks.
export const PhotoCard: React.FC<{
  readonly src: string;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly start?: number;
  readonly zoomFrom?: number;
  readonly zoomTo?: number;
  readonly panX?: number;
  readonly panY?: number;
  readonly objectPosition?: string;
  readonly duration?: number;
  readonly children?: React.ReactNode;
}> = ({
  src,
  x,
  y,
  w,
  h,
  start = 0,
  zoomFrom = 1.18,
  zoomTo = 1.04,
  panX = 0,
  panY = 0,
  objectPosition = "center",
  duration = 300,
  children,
}) => {
  const frame = useCurrentFrame();
  const reveal = progress(frame, start, 22, easeInOut);
  const drift = interpolate(frame, [start, start + duration], [0, 1], clamp);
  const zoom = zoomFrom + (zoomTo - zoomFrom) * easeOut(drift);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 28,
        overflow: "hidden",
        clipPath: `inset(${(1 - reveal) * 50}% 0 ${(1 - reveal) * 50}% 0 round 28px)`,
        boxShadow: "0 40px 90px rgba(0,0,0,0.6), 0 0 0 2px rgba(255,255,255,0.12)",
      }}
    >
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition,
          transform: `scale(${zoom}) translate(${panX * drift}px, ${panY * drift}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(2,13,28,0.25) 0%, transparent 30%, transparent 60%, rgba(2,13,28,0.7) 100%)",
        }}
      />
      <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
        {children}
      </svg>
      <CropMarks w={w} h={h} />
    </div>
  );
};

const CropMarks: React.FC<{ readonly w: number; readonly h: number }> = ({ w, h }) => {
  const s = 46;
  const pad = 22;
  const d = [
    `M ${pad} ${pad + s} V ${pad} H ${pad + s}`,
    `M ${w - pad - s} ${pad} H ${w - pad} V ${pad + s}`,
    `M ${pad} ${h - pad - s} V ${h - pad} H ${pad + s}`,
    `M ${w - pad - s} ${h - pad} H ${w - pad} V ${h - pad - s}`,
  ];
  return (
    <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
      {d.map((p) => (
        <path key={p} d={p} stroke="white" strokeWidth={4} fill="none" opacity={0.85} />
      ))}
    </svg>
  );
};

// A pulsing target on the photo with a leader line and a label box.
export const Callout: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly lx: number;
  readonly ly: number;
  readonly label: string;
  readonly start: number;
  // Width of the photo the callout sits on, so the label box stays inside it.
  readonly maxX?: number;
}> = ({ x, y, lx, ly, label, start, maxX = 940 }) => {
  const frame = useCurrentFrame();
  const p = progress(frame, start, 14, backOut);
  const line = progress(frame, start + 6, 14);
  const text = progress(frame, start + 14, 12);
  const pulse = ((frame - start) % 40) / 40;
  if (frame < start) return null;
  const width = label.length * 22 + 60;
  const boxX = Math.min(maxX - width - 20, Math.max(20, lx < x ? lx - width : lx));
  return (
    <g>
      <circle cx={x} cy={y} r={18 + pulse * 40} fill="none" stroke={C.red} strokeWidth={4} opacity={1 - pulse} />
      <circle cx={x} cy={y} r={16 * p} fill={C.red} stroke="white" strokeWidth={5} />
      <line
        x1={x}
        y1={y}
        x2={x + (lx - x) * line}
        y2={y + (ly - y) * line}
        stroke="white"
        strokeWidth={4}
      />
      <g opacity={text} transform={`translate(0 ${(1 - text) * 14})`}>
        <rect x={boxX} y={ly - 36} width={width} height={72} rx={14} fill="rgba(2,13,28,0.88)" stroke={C.red} strokeWidth={3} />
        <text
          x={boxX + width / 2}
          y={ly + 13}
          textAnchor="middle"
          fontFamily={bodyFont}
          fontWeight={600}
          fontSize={38}
          fill="white"
          direction="rtl"
        >
          {label}
        </text>
      </g>
    </g>
  );
};

// "01 — الأساسات" style chapter heading with a giant outlined number behind it.
export const ChapterHeader: React.FC<{
  readonly num: string;
  readonly title: string;
  readonly kicker: string;
  readonly y?: number;
}> = ({ num, title, kicker, y = 150 }) => {
  const frame = useCurrentFrame();
  const n = progress(frame, 0, 26);
  const t = progress(frame, 6, 20);
  const k = progress(frame, 12, 20);
  const bar = progress(frame, 4, 30, easeInOut);
  return (
    <div style={{ position: "absolute", top: y, left: 80, right: 80, height: 300 }}>
      <div
        style={{
          position: "absolute",
          left: -20,
          top: -60,
          fontFamily: headingFont,
          fontWeight: 900,
          fontSize: 330,
          lineHeight: 1,
          color: "transparent",
          WebkitTextStroke: "3px rgba(255,255,255,0.18)",
          transform: `translateX(${(1 - n) * -120}px)`,
          opacity: n,
        }}
      >
        {num}
      </div>
      <div dir="rtl" style={{ position: "absolute", right: 0, top: 40, textAlign: "right" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
            fontFamily: bodyFont,
            fontWeight: 600,
            fontSize: 40,
            color: C.white,
            opacity: k,
            transform: `translateY(${(1 - k) * 20}px)`,
          }}
        >
          <span style={{ width: 18, height: 18, borderRadius: 4, background: C.red, display: "inline-block" }} />
          {kicker}
        </div>
        <div
          style={{
            fontFamily: headingFont,
            fontWeight: 800,
            fontSize: 118,
            lineHeight: 1.15,
            color: C.white,
            clipPath: `inset(0 0 ${(1 - t) * 100}% 0)`,
            transform: `translateY(${(1 - t) * 50}px)`,
          }}
        >
          {title}
        </div>
        <div
          style={{
            height: 8,
            marginTop: 10,
            width: 420 * bar,
            marginLeft: "auto",
            borderRadius: 4,
            background: `linear-gradient(270deg, ${C.red}, rgba(224,7,26,0))`,
          }}
        />
      </div>
    </div>
  );
};

// A pill tag that pops in, e.g. a spec or a value.
export const Chip: React.FC<{
  readonly label: string;
  readonly start: number;
  readonly icon?: React.ReactNode;
  readonly accent?: boolean;
}> = ({ label, start, icon, accent }) => {
  const frame = useCurrentFrame();
  const p = progress(frame, start, 16, backOut);
  return (
    <div
      dir="rtl"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 30px",
        borderRadius: 999,
        fontFamily: bodyFont,
        fontWeight: 600,
        fontSize: 42,
        color: C.white,
        background: accent ? C.red : "rgba(255,255,255,0.08)",
        border: `2px solid ${accent ? C.redGlow : "rgba(255,255,255,0.25)"}`,
        backdropFilter: "blur(10px)",
        opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
        transform: `scale(${0.6 + 0.4 * p}) translateY(${(1 - p) * 30}px)`,
      }}
    >
      {icon}
      {label}
    </div>
  );
};

export const Check: React.FC<{ readonly size?: number; readonly p?: number }> = ({ size = 40, p = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <circle cx={20} cy={20} r={19} fill={C.red} />
    <path
      d="M 11 21 L 18 28 L 30 13"
      stroke="white"
      strokeWidth={5}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - p}
    />
  </svg>
);
