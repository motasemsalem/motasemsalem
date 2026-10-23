import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { at, backOut, clamp, easeInOut, progress } from "../anim";
import { Captions } from "../components/Captions";
import { ChapterHeader } from "../components/Kit";
import { Sfx, Voice } from "../components/Sound";
import { bodyFont, C, headingFont } from "../theme";

const FLOORS = ["الأرضي", "الأول", "التاني", "التالت", "الرابع"];

const Sun: React.FC<{ readonly frame: number }> = ({ frame }) => (
  <svg width={90} height={90} viewBox="-45 -45 90 90">
    <g transform={`rotate(${frame * 2})`}>
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1={0} y1={-26} x2={0} y2={-40} stroke="#ffb020" strokeWidth={6} strokeLinecap="round" transform={`rotate(${i * 45})`} />
      ))}
    </g>
    <circle r={18} fill="#ffb020" />
  </svg>
);

const Snow: React.FC<{ readonly frame: number }> = ({ frame }) => (
  <svg width={90} height={90} viewBox="-45 -45 90 90">
    <g transform={`rotate(${frame})`} stroke="#9fd4ff" strokeWidth={6} strokeLinecap="round">
      {Array.from({ length: 6 }, (_, i) => (
        <g key={i} transform={`rotate(${i * 60})`}>
          <line x1={0} y1={0} x2={0} y2={-38} />
          <line x1={0} y1={-24} x2={-10} y2={-34} />
          <line x1={0} y1={-24} x2={10} y2={-34} />
        </g>
      ))}
    </g>
  </svg>
);

export const Floors: React.FC = () => {
  const frame = useCurrentFrame();
  const grow = at("floors", "المبنى");
  const eyes = at("floors", "عينيك");
  const team = at("floors", "وفريقنا");
  const hot = at("floors", "الحر");
  const cold = at("floors", "البرد");
  const swap = progress(frame, team - 6, 18, easeInOut);
  const lit = interpolate(frame, [0, eyes + 10], [0, FLOORS.length], clamp);
  const gauge = progress(frame, 4, 14) * (1 - progress(frame, team - 6, 12));
  const ring = progress(frame, team + 8, 16, backOut);
  return (
    <AbsoluteFill style={{ backgroundColor: C.deep, overflow: "hidden" }}>
      <Img
        src={staticFile("photos/aerial-sunset.jpg")}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${interpolate(frame, [0, team], [1.3, 1.08], clamp)}) translateY(${interpolate(frame, [0, team], [-60, 0], clamp)}px)`,
        }}
      />
      <Img
        src={staticFile("photos/aerial-roof.jpg")}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          clipPath: `circle(${swap * 120}% at 30% 32%)`,
          transform: `scale(${interpolate(frame, [team, 315], [1.15, 1.02], clamp)})`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(2,13,28,0.9) 0%, rgba(2,13,28,0.2) 28%, rgba(2,13,28,0.1) 55%, rgba(2,13,28,0.92) 80%)",
        }}
      />
      <ChapterHeader num="04" kicker="المرحلة الرابعة" title="دور ورا دور" />

      {/* Floor gauge on the side */}
      <div style={{ position: "absolute", left: 70, top: 560, display: "flex", flexDirection: "column-reverse", gap: 14, opacity: gauge }}>
        {FLOORS.map((f, i) => {
          const p = Math.min(1, Math.max(0, lit - i));
          return (
            <div key={f} dir="rtl" style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 120,
                  height: 64,
                  borderRadius: 12,
                  border: "3px solid rgba(255,255,255,0.6)",
                  background: `linear-gradient(0deg, ${C.red} ${p * 100}%, rgba(2,13,28,0.6) ${p * 100}%)`,
                  boxShadow: p >= 1 ? `0 0 26px rgba(224,7,26,0.6)` : "none",
                }}
              />
              <span style={{ fontFamily: bodyFont, fontWeight: 600, fontSize: 36, color: "white", opacity: 0.4 + 0.6 * p }}>{f}</span>
            </div>
          );
        })}
      </div>

      {/* Team callout on the roof photo */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: ring }}>
        <circle cx={400} cy={640} r={150 * ring} fill="none" stroke="white" strokeWidth={5} strokeDasharray="18 12" transform={`rotate(${frame} 400 640)`} />
        <circle cx={400} cy={640} r={170 * ring} fill="none" stroke={C.red} strokeWidth={3} opacity={0.7} />
        <line x1={540} y1={720} x2={680} y2={860} stroke="white" strokeWidth={4} />
      </svg>
      <div
        dir="rtl"
        style={{
          position: "absolute",
          left: 600,
          top: 860,
          padding: "16px 30px",
          borderRadius: 18,
          background: C.red,
          fontFamily: headingFont,
          fontWeight: 800,
          fontSize: 44,
          color: "white",
          opacity: progress(frame, team + 18, 12),
          transform: `scale(${0.7 + 0.3 * progress(frame, team + 18, 14, backOut)})`,
        }}
      >
        فريقنا في الموقع
      </div>

      {/* In the heat and in the cold */}
      <div dir="rtl" style={{ position: "absolute", left: 80, right: 80, top: 1180, display: "flex", gap: 30, justifyContent: "center" }}>
        {[
          { at: hot, label: "في الحر", icon: <Sun frame={frame} />, tint: "rgba(255,176,32,0.18)" },
          { at: cold, label: "وفي البرد", icon: <Snow frame={frame} />, tint: "rgba(159,212,255,0.18)" },
        ].map((b) => {
          const p = progress(frame, b.at - 4, 14, backOut);
          return (
            <div
              key={b.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "18px 34px",
                borderRadius: 24,
                background: `linear-gradient(180deg, ${b.tint}, rgba(2,13,28,0.85))`,
                border: "2px solid rgba(255,255,255,0.25)",
                fontFamily: headingFont,
                fontWeight: 800,
                fontSize: 50,
                color: "white",
                opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
                transform: `translateY(${(1 - p) * 80}px)`,
              }}
            >
              {b.icon}
              {b.label}
            </div>
          );
        })}
      </div>
      <Captions id="floors" />
      <Voice id="floors" />
      <Sfx name="whoosh" at={0} volume={0.3} />
      {FLOORS.map((f, i) => (
        <Sfx key={f} name="blip" at={((i + 1) / FLOORS.length) * (eyes + 10) - 6} volume={0.25} />
      ))}
      <Sfx name="whoosh" at={team - 6} volume={0.45} />
      <Sfx name="pop" at={team + 18} volume={0.4} />
      <Sfx name="pop" at={hot} volume={0.35} />
      <Sfx name="pop" at={cold} volume={0.35} />
      <Sfx name="riser" at={grow} volume={0.15} />
    </AbsoluteFill>
  );
};
