import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { at, backOut, clamp, easeInOut, progress } from "../anim";
import { Backdrop } from "../components/Backdrop";
import { Captions } from "../components/Captions";
import { Sfx, Voice } from "../components/Sound";
import { bodyFont, C, headingFont } from "../theme";

const Shield: React.FC<{ readonly p: number }> = ({ p }) => (
  <svg width={130} height={130} viewBox="0 0 100 100">
    <path d="M 50 6 L 88 20 L 84 58 Q 78 82 50 95 Q 22 82 16 58 L 12 20 Z" fill={C.red} stroke="white" strokeWidth={4} />
    <path d="M 32 52 L 45 65 L 70 38" stroke="white" strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
  </svg>
);

const Clock: React.FC<{ readonly spin: number }> = ({ spin }) => (
  <svg width={130} height={130} viewBox="0 0 100 100">
    <circle cx={50} cy={50} r={42} fill={C.red} stroke="white" strokeWidth={4} />
    {Array.from({ length: 12 }, (_, i) => (
      <line key={i} x1={50} y1={14} x2={50} y2={i % 3 ? 19 : 23} stroke="white" strokeWidth={3} transform={`rotate(${i * 30} 50 50)`} />
    ))}
    <line x1={50} y1={50} x2={50} y2={22} stroke="white" strokeWidth={5} strokeLinecap="round" transform={`rotate(${spin * 720} 50 50)`} />
    <line x1={50} y1={50} x2={50} y2={32} stroke="white" strokeWidth={6} strokeLinecap="round" transform={`rotate(${spin * 60 + 90} 50 50)`} />
    <circle cx={50} cy={50} r={5} fill="white" />
  </svg>
);

const Eye: React.FC<{ readonly open: number; readonly look: number }> = ({ open, look }) => (
  <svg width={130} height={130} viewBox="0 0 100 100">
    <circle cx={50} cy={50} r={46} fill={C.red} stroke="white" strokeWidth={4} />
    <path d={`M 14 50 Q 50 ${50 - 30 * open} 86 50 Q 50 ${50 + 30 * open} 14 50 Z`} fill="white" />
    <circle cx={50 + look * 8} cy={50} r={13 * open} fill={C.navy} />
    <circle cx={54 + look * 8} cy={46} r={4 * open} fill="white" />
  </svg>
);

export const Values: React.FC = () => {
  const frame = useCurrentFrame();
  const three = at("values", "تلات");
  const never = at("values", "عمرنا");
  const items = [
    { word: "خامات", title: "خامات مضمونة", sub: "مواد معروفة المصدر" },
    { word: "والتزام", title: "التزام بالمواعيد", sub: "جدول تنفيذ واضح" },
    { word: "وشفافية", title: "شفافية في كل خطوة", sub: "تقارير وصور من الموقع" },
  ] as const;
  const head = progress(frame, three - 6, 16, backOut);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Backdrop glow="rgba(224, 7, 26, 0.25)" />
      <div dir="rtl" style={{ position: "absolute", top: 170, left: 80, right: 80, textAlign: "center" }}>
        <div
          style={{
            fontFamily: headingFont,
            fontWeight: 900,
            fontSize: 300,
            lineHeight: 1,
            color: C.red,
            transform: `scale(${interpolate(head, [0, 1], [2, 1])})`,
            opacity: interpolate(head, [0, 0.3], [0, 1], clamp),
            textShadow: "0 20px 80px rgba(224,7,26,0.6)",
          }}
        >
          ٣
        </div>
        <div style={{ fontFamily: headingFont, fontWeight: 800, fontSize: 92, color: C.white, opacity: progress(frame, three, 12) }}>
          حاجات
        </div>
        <div
          style={{
            display: "inline-block",
            marginTop: 18,
            padding: "10px 34px",
            borderRadius: 999,
            border: "2px solid rgba(255,255,255,0.35)",
            fontFamily: bodyFont,
            fontWeight: 600,
            fontSize: 44,
            color: C.white,
            opacity: progress(frame, never, 12),
          }}
        >
          عمرنا ما نتنازل عنهم
        </div>
      </div>
      <div dir="rtl" style={{ position: "absolute", top: 790, left: 80, right: 80, display: "flex", flexDirection: "column", gap: 34 }}>
        {items.map((it, i) => {
          const start = at("values", it.word) - 6;
          const p = progress(frame, start, 18, backOut);
          const local = frame - start;
          const icon =
            i === 0 ? (
              <Shield p={progress(local, 10, 14)} />
            ) : i === 1 ? (
              <Clock spin={progress(local, 0, 40, easeInOut)} />
            ) : (
              <Eye open={progress(local, 6, 10)} look={Math.sin(local / 10)} />
            );
          return (
            <div
              key={it.word}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 34,
                padding: "26px 36px",
                borderRadius: 30,
                background: "linear-gradient(270deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03))",
                border: "2px solid rgba(255,255,255,0.18)",
                boxShadow: "0 30px 60px rgba(0,0,0,0.4)",
                opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
                transform: `translateX(${(1 - p) * 300}px) rotate(${(1 - p) * 4}deg)`,
              }}
            >
              <div style={{ transform: `scale(${0.6 + 0.4 * p})` }}>{icon}</div>
              <div>
                <div style={{ fontFamily: headingFont, fontWeight: 800, fontSize: 62, color: C.white, lineHeight: 1.2 }}>{it.title}</div>
                <div style={{ fontFamily: bodyFont, fontWeight: 400, fontSize: 38, color: C.steel }}>{it.sub}</div>
              </div>
              <div style={{ marginRight: "auto", fontFamily: headingFont, fontWeight: 900, fontSize: 70, color: "rgba(255,255,255,0.15)" }}>
                {`0${i + 1}`}
              </div>
            </div>
          );
        })}
      </div>
      <Captions id="values" y={1560} />
      <Voice id="values" />
      <Sfx name="impact" at={three - 6} volume={0.35} />
      <Sfx name="swoosh" at={never} volume={0.3} />
      {items.map((it) => (
        <Sfx key={it.word} name="whoosh" at={at("values", it.word) - 8} volume={0.35} />
      ))}
      <Sfx name="stamp" at={at("values", "خامات") + 8} volume={0.3} />
      <Sfx name="typing" at={at("values", "والتزام")} volume={0.25} />
      <Sfx name="chime" at={at("values", "وشفافية") + 6} volume={0.25} />
    </AbsoluteFill>
  );
};
