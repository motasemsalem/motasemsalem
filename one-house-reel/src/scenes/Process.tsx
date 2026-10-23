import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { at, backOut, clamp, easeInOut, progress } from "../anim";
import { Backdrop } from "../components/Backdrop";
import { Captions } from "../components/Captions";
import { IsoBuilding } from "../components/IsoBuilding";
import { ChapterHeader } from "../components/Kit";
import { Sfx, Voice } from "../components/Sound";
import { bodyFont, C, headingFont } from "../theme";

const icon = (kind: number) => {
  const s = { stroke: "white", strokeWidth: 5, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (kind) {
    case 0: // pencil on a ruler
      return (
        <g {...s}>
          <rect x={14} y={58} width={72} height={18} rx={3} />
          <path d="M 26 58 V 66 M 38 58 V 70 M 50 58 V 66 M 62 58 V 70 M 74 58 V 66" />
          <path d="M 30 46 L 66 10 L 78 22 L 42 58 L 26 62 Z" />
        </g>
      );
    case 1: // tower crane
      return (
        <g {...s}>
          <path d="M 30 88 V 18 M 18 18 H 86 M 30 30 L 86 18 M 74 18 V 46" />
          <rect x={66} y={46} width={16} height={12} />
          <path d="M 18 88 H 44" />
        </g>
      );
    case 2: // paint roller
      return (
        <g {...s}>
          <rect x={14} y={16} width={62} height={22} rx={6} />
          <path d="M 76 27 H 86 V 50 H 50 V 62" />
          <rect x={44} y={62} width={12} height={26} rx={3} />
        </g>
      );
    default: // key
      return (
        <g {...s}>
          <circle cx={32} cy={40} r={16} />
          <path d="M 48 40 H 88 M 76 40 V 54 M 86 40 V 50" />
        </g>
      );
  }
};

const STEPS = [
  { word: "التصميم", label: "التصميم", sub: "رسومات ومقايسة" },
  { word: "للتنفيذ", label: "التنفيذ", sub: "عضم وخرسانات" },
  { word: "للتشطيب", label: "التشطيب", sub: "تشطيب بالمواصفات" },
  { word: "التسليم", label: "التسليم", sub: "المفتاح في إيدك" },
] as const;

const UPDATES = ["تحديث جديد من موقعك", "صور شغل النهارده", "تم استلام حديد السقف"];

export const Process: React.FC = () => {
  const frame = useCurrentFrame();
  const starts = STEPS.map((s) => at("process", s.word));
  const you = at("process", "إنت");
  const out = progress(frame, you - 8, 16, easeInOut);
  const phone = progress(frame, you - 4, 22, backOut);
  const fill = interpolate(frame, [starts[0], starts[3] + 10], [0, 1], { ...clamp, easing: easeInOut });
  const designBuilt = interpolate(frame, [starts[0], starts[1]], [0, 5], clamp);
  const realBuilt = interpolate(frame, [starts[1], starts[2]], [0, 5], clamp) + interpolate(frame, [starts[2], starts[3]], [0, 0.4], clamp);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Backdrop />
      <ChapterHeader num="05" kicker="من الفكرة للمفتاح" title="خطوة بخطوة" />

      <div style={{ position: "absolute", inset: 0, opacity: 1 - out, transform: `translateY(${-out * 200}px)` }}>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <g opacity={frame < starts[1] ? 1 : interpolate(frame, [starts[1], starts[1] + 8], [1, 0], clamp)}>
            <IsoBuilding cx={290} cy={950} scale={0.82} floors={5} built={designBuilt} mode="wire" />
          </g>
          <g opacity={interpolate(frame, [starts[1], starts[1] + 8], [0, 1], clamp)}>
            <IsoBuilding cx={290} cy={950} scale={0.82} floors={5} built={realBuilt} mode="solid" />
          </g>
          {/* Handover glow */}
          <circle cx={290} cy={760} r={260} fill="url(#glow)" opacity={progress(frame, starts[3], 14)} />
          <defs>
            <radialGradient id="glow">
              <stop offset="0" stopColor="rgba(255,220,150,0.5)" />
              <stop offset="1" stopColor="rgba(255,220,150,0)" />
            </radialGradient>
          </defs>
        </svg>

        {/* Timeline */}
        <div style={{ position: "absolute", right: 80, top: 520, width: 470, height: 840 }}>
          <div style={{ position: "absolute", right: 44, top: 50, width: 8, height: 700, borderRadius: 4, background: "rgba(255,255,255,0.15)" }}>
            <div style={{ width: "100%", height: `${fill * 100}%`, background: C.red, borderRadius: 4, boxShadow: `0 0 20px ${C.red}` }} />
          </div>
          {STEPS.map((s, i) => {
            const p = progress(frame, starts[i] - 4, 14, backOut);
            const active = frame >= starts[i] && (i === 3 || frame < starts[i + 1]);
            return (
              <div key={s.word} dir="rtl" style={{ position: "absolute", right: 0, top: i * 230, display: "flex", alignItems: "center", gap: 26 }}>
                <svg width={100} height={100} viewBox="0 0 100 100" style={{ transform: `scale(${0.5 + 0.5 * p})`, filter: active ? `drop-shadow(0 0 18px ${C.red})` : "none" }}>
                  <rect x={0} y={0} width={100} height={100} rx={24} fill={p > 0.5 ? C.red : C.ink} stroke="white" strokeWidth={3} />
                  {icon(i)}
                </svg>
                <div style={{ opacity: interpolate(p, [0, 0.4], [0.25, 1], clamp) }}>
                  <div style={{ fontFamily: headingFont, fontWeight: 800, fontSize: 58, color: "white" }}>{s.label}</div>
                  <div style={{ fontFamily: bodyFont, fontWeight: 400, fontSize: 34, color: C.steel }}>{s.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Phone with live site updates */}
      <div
        style={{
          position: "absolute",
          left: 540 - 250,
          top: 500,
          width: 500,
          height: 960,
          borderRadius: 70,
          background: "linear-gradient(180deg, #0b2a52, #041327)",
          border: "10px solid #1c2636",
          boxShadow: "0 60px 120px rgba(0,0,0,0.7), inset 0 0 0 2px rgba(255,255,255,0.15)",
          transform: `translateY(${(1 - phone) * 1600}px) rotate(${(1 - phone) * 12}deg)`,
          opacity: phone > 0 ? 1 : 0,
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: 22, left: 190, width: 120, height: 32, borderRadius: 16, background: "#000" }} />
        <Img src={staticFile("brand/logo-white.png")} style={{ position: "absolute", top: 120, left: 110, width: 260, opacity: 0.9 }} />
        {UPDATES.map((u, i) => {
          const p = progress(frame, you + 14 + i * 16, 14, backOut);
          return (
            <div
              key={u}
              dir="rtl"
              style={{
                position: "absolute",
                left: 24,
                right: 24,
                top: 330 + i * 150,
                padding: "20px 22px",
                borderRadius: 26,
                background: "rgba(255,255,255,0.95)",
                display: "flex",
                alignItems: "center",
                gap: 16,
                opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
                transform: `translateY(${(1 - p) * -60}px) scale(${0.9 + 0.1 * p})`,
                boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
              }}
            >
              <div style={{ width: 64, height: 64, borderRadius: 16, background: C.red, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width={40} height={40} viewBox="0 0 40 40">
                  <path d="M 4 22 L 20 6 L 36 22 M 10 18 V 34 H 30 V 18" stroke="white" strokeWidth={4} fill="none" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <div style={{ fontFamily: headingFont, fontWeight: 700, fontSize: 30, color: C.navy }}>وان هاوس</div>
                <div style={{ fontFamily: bodyFont, fontWeight: 600, fontSize: 28, color: "#33445c" }}>{u}</div>
              </div>
            </div>
          );
        })}
      </div>

      <Captions id="process" y={1560} />
      <Voice id="process" />
      <Sfx name="whoosh" at={0} volume={0.3} />
      {starts.map((s, i) => (
        <Sfx key={i} name="blip" at={s} volume={0.35} />
      ))}
      <Sfx name="keys" at={starts[3] + 4} volume={0.3} />
      <Sfx name="whoosh" at={you - 6} volume={0.45} />
      {UPDATES.map((u, i) => (
        <Sfx key={u} name="pop" at={you + 16 + i * 16} volume={0.4} />
      ))}
    </AbsoluteFill>
  );
};
