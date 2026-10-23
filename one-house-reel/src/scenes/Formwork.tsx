import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { at, backOut, clamp, easeInOut, progress } from "../anim";
import { Backdrop } from "../components/Backdrop";
import { Captions } from "../components/Captions";
import { Callout, ChapterHeader, PhotoCard } from "../components/Kit";
import { Sfx } from "../components/Sound";
import { bodyFont, C, headingFont } from "../theme";

// A spirit level whose bubble wobbles, then settles in the middle.
const SpiritLevel: React.FC<{ readonly settle: number; readonly frame: number; readonly ok: number }> = ({
  settle,
  frame,
  ok,
}) => {
  const wobble = Math.sin(frame / 4) * 120 * (1 - settle);
  const tilt = Math.sin(frame / 5) * 4 * (1 - settle);
  return (
    <svg width={760} height={180} viewBox="0 0 760 180" style={{ transform: `rotate(${tilt}deg)` }}>
      <defs>
        <linearGradient id="lvl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff3346" />
          <stop offset="1" stopColor="#a00313" />
        </linearGradient>
        <linearGradient id="vial" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d6ff7a" />
          <stop offset="1" stopColor="#7fbf1a" />
        </linearGradient>
      </defs>
      <rect x={10} y={40} width={740} height={100} rx={18} fill="url(#lvl)" stroke="#5c020b" strokeWidth={3} />
      <rect x={10} y={40} width={740} height={18} rx={9} fill="rgba(255,255,255,0.25)" />
      <rect x={250} y={62} width={260} height={56} rx={28} fill="url(#vial)" stroke="#2d4a05" strokeWidth={3} />
      <line x1={350} y1={62} x2={350} y2={118} stroke="#2d4a05" strokeWidth={3} />
      <line x1={410} y1={62} x2={410} y2={118} stroke="#2d4a05" strokeWidth={3} />
      <ellipse cx={380 + wobble * 0.9} cy={90} rx={26} ry={18} fill="rgba(255,255,255,0.85)" />
      {[60, 120, 640, 700].map((x) => (
        <circle key={x} cx={x} cy={90} r={14} fill="#5c020b" />
      ))}
      <g opacity={ok} transform={`translate(380 20) scale(${0.6 + 0.4 * ok})`}>
        <rect x={-175} y={-30} width={350} height={56} rx={28} fill="white" />
        <text x={0} y={10} textAnchor="middle" fontFamily={headingFont} fontWeight={800} fontSize={34} fill={C.navy} direction="rtl">
          مستوي ومظبوط
        </text>
      </g>
    </svg>
  );
};

export const Formwork: React.FC = () => {
  const frame = useCurrentFrame();
  const props = at("formwork", "قوايم");
  const beams = at("formwork", "وعروق");
  const level = at("formwork", "بالميزان");
  const flat = at("formwork", "مستوي");
  const second = progress(frame, props - 8, 22, backOut);
  const lvl = progress(frame, level - 10, 18, backOut);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Backdrop />
      <ChapterHeader num="03" kicker="المرحلة التالتة" title="الشدّة الخشبية" />
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${-second * 30}px) scale(${1 - second * 0.06})`, opacity: 1 - second * 0.4 }}>
        <PhotoCard src="photos/formwork-wide.jpg" x={70} y={480} w={940} h={700} start={6} duration={330} panX={-30} />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateY(${(1 - second) * 1200}px) rotate(${(1 - second) * 8 - 2}deg)`,
        }}
      >
        <PhotoCard src="photos/formwork-props.jpg" x={70} y={560} w={940} h={760} start={props - 8} duration={250} zoomFrom={1.1} zoomTo={1.02}>
          <Callout x={602} y={420} lx={820} ly={560} label="قوايم" start={props + 6} />
          <Callout x={300} y={190} lx={130} ly={330} label="عروق" start={beams + 4} />
        </PhotoCard>
      </div>
      <div
        style={{
          position: "absolute",
          left: 160,
          top: 1280,
          opacity: interpolate(lvl, [0, 0.3], [0, 1], clamp),
          transform: `translateY(${(1 - lvl) * 200}px)`,
          filter: "drop-shadow(0 24px 40px rgba(0,0,0,0.6))",
        }}
      >
        <SpiritLevel frame={frame} settle={progress(frame, level + 10, 40, easeInOut)} ok={progress(frame, flat, 12, backOut)} />
      </div>
      <div
        dir="rtl"
        style={{
          position: "absolute",
          top: 1255,
          right: 80,
          fontFamily: bodyFont,
          fontWeight: 600,
          fontSize: 32,
          color: C.steel,
          opacity: progress(frame, level, 12) * (1 - progress(frame, flat - 6, 6)),
        }}
      >
        ضبط المنسوب
      </div>
      <Captions id="formwork" y={1520} />
      <Sfx name="whoosh" at={0} volume={0.1} />
      {[0, 1, 2, 3].map((i) => (
        <Sfx key={i} name="hammer" at={at("formwork", "بتتركب") + i * 9} volume={0.18} />
      ))}
      <Sfx name="whoosh" at={props - 8} volume={0.45} />
      <Sfx name="pop" at={props + 20} volume={0.35} />
      <Sfx name="pop" at={beams + 18} volume={0.35} />
      <Sfx name="swoosh" at={level - 10} volume={0.35} />
      <Sfx name="chime" at={flat} volume={0.3} />
    </AbsoluteFill>
  );
};
