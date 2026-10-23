import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { at, backOut, clamp, easeInOut, progress } from "../anim";
import { Captions } from "../components/Captions";
import { ChapterHeader, Check } from "../components/Kit";
import { Sfx } from "../components/Sound";
import { bodyFont, C } from "../theme";

// Line drawing of a column rebar cage: vertical bars rise, then stirrups wrap them one by one.
const RebarCage: React.FC<{ readonly bars: number; readonly stirrups: number }> = ({ bars, stirrups }) => {
  const H = 760;
  const xs = [0, 60, 120];
  const back = [30, 90, 150];
  return (
    <svg width={260} height={H + 80} viewBox={`-50 -40 260 ${H + 80}`}>
      {back.map((x) => (
        <line key={`b${x}`} x1={x} y1={H + 20} x2={x} y2={H + 20 - (H + 20) * bars} stroke="rgba(255,255,255,0.4)" strokeWidth={5} />
      ))}
      {xs.map((x) => (
        <line key={x} x1={x} y1={H} x2={x} y2={H - H * bars} stroke="white" strokeWidth={7} strokeLinecap="round" />
      ))}
      {Array.from({ length: 12 }, (_, i) => {
        const y = H - 30 - i * 62;
        const p = Math.min(1, Math.max(0, stirrups * 12 - i));
        return (
          <polygon
            key={i}
            points={`0,${y} 120,${y} 150,${y + 20} 30,${y + 20}`}
            fill="none"
            stroke={C.red}
            strokeWidth={5}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - p}
          />
        );
      })}
      <g opacity={stirrups > 0.5 ? 1 : 0} fontFamily={bodyFont} fontWeight={600} fontSize={30} fill="white">
        <line x1={-30} y1={H} x2={-30} y2={0} stroke={C.blueprint} strokeWidth={2} />
        <text x={-40} y={H / 2} transform={`rotate(-90 -40 ${H / 2})`} textAnchor="middle" fill={C.blueprint}>
          طول العمود
        </text>
      </g>
    </svg>
  );
};

const STEPS = [
  { word: "حديد", label: "تربيط الحديد" },
  { word: "بيتراجع", label: "مراجعة على الرسومات" },
  { word: "مهندس", label: "استلام مهندس الموقع" },
] as const;

export const Columns: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = at("columns", "الأعمدة");
  const steel = at("columns", "حديد");
  const push = interpolate(frame, [0, 300], [1.25, 1.05], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: C.deep, overflow: "hidden" }}>
      <Img
        src={staticFile("photos/foundation-columns.jpg")}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${push}) translateY(${interpolate(frame, [0, 300], [40, -20])}px)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(2,13,28,0.92) 0%, rgba(2,13,28,0.35) 32%, rgba(2,13,28,0.25) 55%, rgba(2,13,28,0.95) 82%)",
        }}
      />
      {/* Scanning line sweeping over the photo */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: interpolate((frame % 90) / 90, [0, 1], [480, 1400]),
          height: 4,
          background: `linear-gradient(90deg, transparent, ${C.blueprint}, transparent)`,
          boxShadow: `0 0 30px ${C.blueprint}`,
          opacity: 0.55,
        }}
      />
      <ChapterHeader num="02" kicker="المرحلة التانية" title="الأعمدة" />
      <div style={{ position: "absolute", left: 70, top: 520, opacity: progress(frame, rise - 6, 12) }}>
        <RebarCage
          bars={progress(frame, rise, 30, easeInOut)}
          stirrups={progress(frame, steel, 70, (x) => x)}
        />
      </div>
      <div dir="rtl" style={{ position: "absolute", right: 70, top: 640, display: "flex", flexDirection: "column", gap: 28 }}>
        {STEPS.map((s) => {
          const start = at("columns", s.word);
          const p = progress(frame, start, 16, backOut);
          return (
            <div
              key={s.word}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 22,
                padding: "22px 30px",
                borderRadius: 22,
                background: "rgba(2,13,28,0.82)",
                border: "2px solid rgba(255,255,255,0.18)",
                fontFamily: bodyFont,
                fontWeight: 600,
                fontSize: 46,
                color: C.white,
                opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
                transform: `translateX(${(1 - p) * 200}px)`,
              }}
            >
              <Check size={56} p={progress(frame, start + 8, 12)} />
              {s.label}
            </div>
          );
        })}
      </div>
      <Captions id="columns" />
      <Sfx name="whoosh" at={0} volume={0.1} />
      <Sfx name="riser" at={rise - 10} volume={0.2} />
      {STEPS.map((s) => (
        <Sfx key={s.word} name="pop" at={at("columns", s.word) + 8} volume={0.4} />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <Sfx key={i} name="hammer" at={steel + 8 + i * 11} volume={0.12} />
      ))}
    </AbsoluteFill>
  );
};
