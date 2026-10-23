import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { at, backOut, clamp, easeInOut, progress, rand } from "../anim";
import { Sfx } from "../components/Sound";
import { bodyFont, C, headingFont } from "../theme";

// Where the apartment the hook points at sits on the aerial photo (1080×1920 frame space).
const FLAT = { x: 600, y: 1330 };
// The building's structural grid as it lines up with the photo.
const COLS = [120, 335, 560, 790];
const BEAMS = [960, 1150, 1340, 1530, 1720];

// Words that pop in one by one, each on the frame the narrator says it.
const Line: React.FC<{
  readonly words: { text: string; at: number; color?: string }[];
  readonly size: number;
  readonly top: number;
  readonly out?: number;
}> = ({ words, size, top, out = 99999 }) => {
  const frame = useCurrentFrame();
  const gone = progress(frame, out, 6);
  if (frame < words[0].at - 2 || gone >= 1) return null;
  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        top,
        left: 60,
        right: 60,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0 26px",
        opacity: 1 - gone,
        transform: `translateY(${-gone * 40}px)`,
      }}
    >
      {words.map((w) => {
        const p = progress(frame, w.at - 2, 8, backOut);
        return (
          <span
            key={w.text + w.at}
            style={{
              display: "inline-block",
              fontFamily: headingFont,
              fontWeight: 900,
              fontSize: size,
              lineHeight: 1.15,
              color: w.color ?? C.white,
              opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
              transform: `scale(${1.6 - 0.6 * p}) translateY(${(1 - p) * 30}px)`,
              textShadow: "0 10px 40px rgba(0,0,0,0.75)",
            }}
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
};

// Structural skeleton seen through the scanner: columns, beams, rebar, and footings below ground.
const Skeleton: React.FC<{ readonly steel: number; readonly concrete: number; readonly base: number; readonly frame: number }> = ({
  steel,
  concrete,
  base,
  frame,
}) => {
  const glow = 0.6 + 0.4 * Math.sin(frame / 4);
  return (
    <svg width={1080} height={2500} style={{ position: "absolute", left: 0, top: 0 }}>
      {/* concrete columns and beams */}
      <g opacity={0.35 + 0.65 * concrete}>
        {COLS.map((x) => (
          <rect key={x} x={x - 26} y={900} width={52} height={1100} fill={`rgba(120,200,255,${0.18 + 0.25 * concrete})`} stroke="#9fe0ff" strokeWidth={3} />
        ))}
        {BEAMS.map((y) => (
          <rect key={y} x={60} y={y - 16} width={780} height={32} fill={`rgba(120,200,255,${0.14 + 0.2 * concrete})`} stroke="#9fe0ff" strokeWidth={2} />
        ))}
      </g>
      {/* rebar */}
      <g stroke={C.redGlow} strokeWidth={4} opacity={steel * glow} style={{ filter: "drop-shadow(0 0 8px rgba(255,42,61,0.9))" }}>
        {COLS.flatMap((x) => [x - 14, x + 14].map((rx) => <line key={`${x}${rx}`} x1={rx} y1={2000 - 1100 * steel} x2={rx} y2={2000} />))}
        {COLS.flatMap((x) =>
          Array.from({ length: 18 }, (_, i) => 920 + i * 60)
            .filter((y) => y > 2000 - 1100 * steel)
            .map((y) => <line key={`${x}s${y}`} x1={x - 20} y1={y} x2={x + 20} y2={y} strokeWidth={3} />),
        )}
        {BEAMS.map((y) => (
          <line key={y} x1={60} y1={y} x2={60 + 780 * steel} y2={y} strokeDasharray="20 8" />
        ))}
      </g>
      {/* ground line and footings below the building */}
      <line x1={0} y1={2000} x2={1080} y2={2000} stroke="white" strokeWidth={5} strokeDasharray="26 12" opacity={base} />
      <g opacity={base}>
        {COLS.map((x) => (
          <g key={x}>
            <rect x={x - 26} y={2000} width={52} height={140 * base} fill="rgba(120,200,255,0.35)" stroke="#9fe0ff" strokeWidth={3} />
            <rect x={x - 110} y={2140} width={220} height={90} fill="rgba(120,200,255,0.4)" stroke="#9fe0ff" strokeWidth={4} transform={`translate(0 ${(1 - base) * 60})`} />
            <rect x={x - 130} y={2230} width={260} height={24} fill="rgba(200,200,200,0.4)" stroke="white" strokeWidth={2} transform={`translate(0 ${(1 - base) * 60})`} />
          </g>
        ))}
      </g>
    </svg>
  );
};

const Tag: React.FC<{ readonly label: string; readonly x: number; readonly y: number; readonly start: number; readonly end: number }> = ({
  label,
  x,
  y,
  start,
  end,
}) => {
  const frame = useCurrentFrame();
  const p = progress(frame, start - 2, 10, backOut) * (1 - progress(frame, end, 5));
  if (frame < start - 2 || p <= 0) return null;
  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        left: x,
        top: y,
        padding: "14px 34px",
        borderRadius: 16,
        background: C.red,
        boxShadow: "0 16px 50px rgba(224,7,26,0.6)",
        fontFamily: headingFont,
        fontWeight: 800,
        fontSize: 64,
        color: "white",
        transform: `translate(-50%, -50%) scale(${0.4 + 0.6 * p})`,
        opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
      }}
    >
      {label}
    </div>
  );
};

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const flat = at("hook", "شقة");
  const but = at("hook", "بس");
  const inside = at("hook", "جوّه");
  const steel = at("hook", "الحديد");
  const concrete = at("hook", "والخرسانة");
  const base = at("hook", "والأساس");
  const show = at("hook", "تعالى");

  // Camera: push in on the photo, zoom towards the flat, then tilt down to the foundations.
  const zoom =
    interpolate(frame, [0, flat], [1.22, 1.05], { ...clamp, easing: easeInOut }) +
    interpolate(frame, [but, inside], [0, 0.32], { ...clamp, easing: easeInOut }) -
    interpolate(frame, [steel, steel + 12], [0, 0.32], { ...clamp, easing: easeInOut });
  const tilt = interpolate(frame, [base - 4, base + 14], [0, -560], { ...clamp, easing: easeInOut });
  const scan = interpolate(frame, [inside, steel + 4], [0, 1], { ...clamp, easing: easeInOut });
  const kick = Math.max(
    interpolate(frame - flat, [0, 8], [1, 0], clamp),
    interpolate(frame - show, [0, 8], [1, 0], clamp),
  );
  const shake = `translate(${(rand(frame) - 0.5) * 24 * kick}px, ${(rand(frame + 9) - 0.5) * 24 * kick}px)`;
  const bracket = progress(frame, flat - 2, 10, backOut) * (1 - progress(frame, steel, 8));
  const dim = progress(frame, show, 6);

  return (
    <AbsoluteFill style={{ backgroundColor: "black", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: shake }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 1080,
            height: 2500,
            transformOrigin: `${FLAT.x}px ${FLAT.y}px`,
            transform: `translateY(${tilt}px) scale(${zoom})`,
          }}
        >
          <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 2500, background: "#3b2a1a" }} />
          <Img src={staticFile("photos/aerial-sunset.jpg")} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 2000, objectFit: "cover", objectPosition: "center top" }} />
          {/* X-ray layer, revealed from the top by the scanner */}
          <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 2500, clipPath: `inset(0 0 ${(1 - scan) * 100}% 0)` }}>
            <Img
              src={staticFile("photos/aerial-sunset.jpg")}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: 1080,
                height: 2000,
                objectFit: "cover",
                objectPosition: "center top",
                filter: "grayscale(1) invert(1) brightness(0.55) contrast(1.5) sepia(1) hue-rotate(170deg) saturate(2.2)",
              }}
            />
            <div style={{ position: "absolute", left: 0, top: 2000, width: 1080, height: 500, background: "linear-gradient(180deg, #06223f, #020d1c)" }} />
            <Skeleton
              frame={frame}
              steel={progress(frame, steel - 4, 22, easeInOut)}
              concrete={progress(frame, concrete - 4, 18)}
              base={progress(frame, base + 4, 18, easeInOut)}
            />
          </div>
          {/* Scanner bar */}
          {scan > 0 && scan < 1 && (
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: scan * 2500 - 4,
                height: 8,
                background: "#9fe0ff",
                boxShadow: "0 0 40px 14px rgba(95,200,255,0.8)",
              }}
            />
          )}
          {/* "Your flat" target brackets */}
          <svg width={1080} height={2500} style={{ position: "absolute", left: 0, top: 0, opacity: bracket }}>
            <g transform={`translate(${FLAT.x} ${FLAT.y}) scale(${1.8 - 0.8 * bracket})`} stroke={C.red} strokeWidth={8} fill="none">
              <path d="M -130 -60 V -100 H -90 M 90 -100 H 130 V -60 M 130 60 V 100 H 90 M -90 100 H -130 V 60" />
              <circle r={10} fill={C.red} />
            </g>
          </svg>
        </div>
      </AbsoluteFill>

      {/* Top gradient so the lines always read */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(2,13,28,0.85) 0%, rgba(2,13,28,0.2) 38%, transparent 60%, rgba(2,13,28,0.5) 100%)" }} />

      <Line
        top={180}
        size={92}
        out={but}
        words={[
          { text: "إنت دافع", at: 0 },
          { text: "تحويشة عمرك", at: at("hook", "تحويشة"), color: C.red },
          { text: "في شقة", at: flat },
        ]}
      />
      <Line
        top={180}
        size={96}
        out={steel - 4}
        words={[
          { text: "إيه اللي", at: at("hook", "إيه") },
          { text: "جوّه", at: inside, color: C.red },
          { text: "الحيطة دي؟", at: at("hook", "الحيطة") },
        ]}
      />
      {frame >= flat && frame < steel && (
        <div
          dir="rtl"
          style={{
            position: "absolute",
            left: FLAT.x - 90,
            top: 1500,
            padding: "10px 26px",
            borderRadius: 12,
            background: "rgba(2,13,28,0.85)",
            border: `3px solid ${C.red}`,
            fontFamily: bodyFont,
            fontWeight: 600,
            fontSize: 44,
            color: "white",
            opacity: bracket,
          }}
        >
          شقتك
        </div>
      )}

      <Tag label="حديد" x={300} y={620} start={steel} end={show} />
      <Tag label="خرسانة" x={760} y={820} start={concrete} end={show} />
      <Tag label="أساس" x={540} y={1460} start={base + 8} end={show} />

      {frame >= show && <AbsoluteFill style={{ background: `rgba(2,13,28,${0.65 * dim})` }} />}
      <Line top={780} size={150} words={[{ text: "تعالى", at: show }, { text: "أوريك", at: at("hook", "أوريك"), color: C.red }]} />

      <Sfx name="subdrop" at={0} volume={0.45} />
      <Sfx name="swoosh" at={at("hook", "تحويشة") - 2} volume={0.3} />
      <Sfx name="stamp" at={flat} volume={0.5} />
      <Sfx name="whoosh" at={but} volume={0.35} />
      <Sfx name="riser" at={inside - 10} volume={0.3} />
      <Sfx name="glitch" at={inside} volume={0.25} />
      <Sfx name="blip" at={steel} volume={0.4} />
      <Sfx name="blip" at={concrete} volume={0.4} />
      <Sfx name="whoosh" at={base - 4} volume={0.4} />
      <Sfx name="impact" at={base + 12} volume={0.35} />
      <Sfx name="glitch" at={show} volume={0.35} />
      <Sfx name="impact" at={show} volume={0.5} />
    </AbsoluteFill>
  );
};
