import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { at, backOut, clamp, easeInOut, progress } from "../anim";
import { Backdrop } from "../components/Backdrop";
import { Captions } from "../components/Captions";
import { ChapterHeader, Check } from "../components/Kit";
import { Phone } from "../components/Phone";
import { Sfx } from "../components/Sound";
import { bodyFont, C, headingFont } from "../theme";

const Counter: React.FC<{ readonly to: number; readonly prefix?: string; readonly label: string; readonly from: number; readonly until: number }> = ({
  to,
  prefix = "",
  label,
  from,
  until,
}) => {
  const frame = useCurrentFrame();
  const p = progress(frame, from - 4, 12, backOut);
  const n = Math.round(interpolate(frame, [from, until], [0, to], { ...clamp, easing: easeInOut }));
  const done = frame >= until;
  return (
    <div
      style={{
        flex: 1,
        height: 400,
        borderRadius: 36,
        background: done ? `linear-gradient(160deg, ${C.red}, #8f0412)` : "rgba(255,255,255,0.07)",
        border: `2px solid ${done ? C.redGlow : "rgba(255,255,255,0.2)"}`,
        boxShadow: done ? "0 30px 70px rgba(224,7,26,0.45)" : "0 20px 50px rgba(0,0,0,0.4)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
        transform: `scale(${0.7 + 0.3 * p + (done ? interpolate(frame - until, [0, 4, 10], [0, 0.05, 0], clamp) : 0)})`,
      }}
    >
      <div style={{ fontFamily: headingFont, fontWeight: 900, fontSize: 170, lineHeight: 1, color: "white" }}>
        {prefix}
        {n}
      </div>
      <div dir="rtl" style={{ marginTop: 20, fontFamily: headingFont, fontWeight: 700, fontSize: 52, color: "white" }}>
        {label}
      </div>
    </div>
  );
};

const PROMISES = [
  { word: "وعقود", label: "عقود واضحة" },
  { word: "ومواعيد", label: "مواعيد تسليم بنلتزم بيها" },
] as const;

export const Stats: React.FC = () => {
  const frame = useCurrentFrame();
  const projects = at("stats", "خمسمية");
  const years = at("stats", "واتناشر");
  const follow = at("stats", "وإنت");
  const out = progress(frame, follow - 6, 12, easeInOut);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Backdrop glow="rgba(224, 7, 26, 0.22)" />
      <ChapterHeader num="07" kicker="ثقة بالأرقام" title="شغلنا بيتكلم" />
      <div style={{ position: "absolute", inset: 0, opacity: 1 - out, transform: `translateY(${-out * 300}px) scale(${1 - out * 0.1})` }}>
        <div dir="rtl" style={{ position: "absolute", top: 520, left: 70, right: 70, display: "flex", gap: 30 }}>
          <Counter to={500} prefix="+" label="مشروع" from={projects - 6} until={at("stats", "مشروع") + 4} />
          <Counter to={12} label="سنة خبرة" from={years} until={at("stats", "خبرة")} />
        </div>
        <div dir="rtl" style={{ position: "absolute", top: 990, left: 70, right: 70, display: "flex", flexDirection: "column", gap: 26 }}>
          {PROMISES.map((pr) => {
            const start = at("stats", pr.word);
            const p = progress(frame, start - 4, 12, backOut);
            return (
              <div
                key={pr.word}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 24,
                  padding: "26px 34px",
                  borderRadius: 26,
                  background: "rgba(2,13,28,0.75)",
                  border: "2px solid rgba(255,255,255,0.2)",
                  fontFamily: bodyFont,
                  fontWeight: 600,
                  fontSize: 52,
                  color: "white",
                  opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
                  transform: `translateX(${(1 - p) * 260}px)`,
                }}
              >
                <Check size={64} p={progress(frame, start + 4, 10)} />
                {pr.label}
              </div>
            );
          })}
        </div>
      </div>
      <Phone start={follow - 6} updates={["تحديث جديد من موقعك", "صور شغل النهارده", "تم استلام حديد السقف"]} top={470} />
      <Captions id="stats" y={1520} />
      <Sfx name="whoosh" at={0} volume={0.1} />
      <Sfx name="typing" at={projects - 6} volume={0.25} />
      <Sfx name="impact" at={at("stats", "مشروع") + 4} volume={0.35} />
      <Sfx name="typing" at={years} volume={0.2} />
      <Sfx name="impact" at={at("stats", "خبرة")} volume={0.3} />
      {PROMISES.map((pr) => (
        <Sfx key={pr.word} name="pop" at={at("stats", pr.word) + 4} volume={0.4} />
      ))}
      <Sfx name="whoosh" at={follow - 6} volume={0.45} />
      {[0, 1, 2].map((i) => (
        <Sfx key={i} name="blip" at={follow + 4 + i * 9} volume={0.35} />
      ))}
    </AbsoluteFill>
  );
};
