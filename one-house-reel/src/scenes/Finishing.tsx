import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { at, backOut, clamp, easeInOut, progress } from "../anim";
import { Backdrop } from "../components/Backdrop";
import { Captions } from "../components/Captions";
import { IsoBuilding } from "../components/IsoBuilding";
import { ChapterHeader } from "../components/Kit";
import { Sfx } from "../components/Sound";
import { C, headingFont } from "../theme";

const stroke = { stroke: "white", strokeWidth: 6, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const ICONS: Record<string, React.ReactNode> = {
  pipe: (
    <g {...stroke}>
      <path d="M 14 30 H 56 Q 70 30 70 44 V 66" />
      <path d="M 14 46 H 52 Q 54 46 54 50 V 66" />
      <path d="M 62 76 Q 54 88 62 94 Q 70 88 62 76 Z" fill="white" />
    </g>
  ),
  bolt: <path d="M 56 8 L 24 56 H 48 L 40 92 L 76 40 H 52 Z" fill="white" />,
  shield: (
    <g {...stroke}>
      <path d="M 50 8 L 84 20 L 80 56 Q 74 80 50 92 Q 26 80 20 56 L 16 20 Z" />
      <path d="M 50 34 Q 38 52 50 64 Q 62 52 50 34 Z" fill="white" />
    </g>
  ),
  trowel: (
    <g {...stroke}>
      <path d="M 12 70 L 60 22 L 84 46 L 36 94 Z" />
      <path d="M 72 34 L 88 18" />
      <circle cx={90} cy={14} r={5} fill="white" />
    </g>
  ),
  marble: (
    <g>
      <rect x={14} y={14} width={72} height={72} rx={8} fill="white" />
      <path d="M 18 40 Q 40 30 50 50 T 84 60 M 30 84 Q 44 64 64 70 M 50 16 Q 56 30 46 40" stroke="#9aa6b8" strokeWidth={3} fill="none" />
    </g>
  ),
  roller: (
    <g {...stroke}>
      <rect x={12} y={14} width={62} height={24} rx={6} />
      <path d="M 74 26 H 86 V 52 H 48 V 64" />
      <rect x={42} y={64} width={12} height={28} rx={3} fill="white" />
    </g>
  ),
};

const TRADES = [
  { word: "سباكة", label: "سباكة", icon: "pipe" },
  { word: "وكهربا", label: "كهربا", icon: "bolt" },
  { word: "وعزل", label: "عزل", icon: "shield" },
  { word: "ومحارة", label: "محارة", icon: "trowel" },
  { word: "ورخام", label: "رخام", icon: "marble" },
  { word: "ودهانات", label: "دهانات", icon: "roller" },
] as const;

export const Finishing: React.FC = () => {
  const frame = useCurrentFrame();
  const bone = at("finishing", "العضم");
  const more = at("finishing", "بنكمّل");
  const design = at("finishing", "وتصميم");
  const see = at("finishing", "تشوف");
  const intro = 1 - progress(frame, more, 12, easeInOut);
  const gridOut = progress(frame, design - 4, 12, easeInOut);
  const iso = progress(frame, design, 14);
  const starts = TRADES.map((t) => at("finishing", t.word));
  const active = starts.filter((s) => frame >= s - 2).length - 1;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Backdrop />

      {/* Bare concrete frame: "we don't stop at the shell" */}
      {intro > 0 && (
        <AbsoluteFill style={{ opacity: intro, transform: `scale(${1 + (1 - intro) * 0.15})` }}>
          <Img
            src={staticFile("photos/formwork-wide.jpg")}
            style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(0.7) brightness(0.55)", transform: `scale(${interpolate(frame, [0, more], [1.3, 1.15])})` }}
          />
          <div dir="rtl" style={{ position: "absolute", top: 620, left: 0, right: 0, textAlign: "center" }}>
            <div style={{ fontFamily: headingFont, fontWeight: 900, fontSize: 120, color: "white", transform: `scale(${0.7 + 0.3 * progress(frame, 4, 10, backOut)})` }}>
              مش بنقف
            </div>
            <div style={{ position: "relative", display: "inline-block", fontFamily: headingFont, fontWeight: 900, fontSize: 150, color: C.red, transform: `scale(${0.6 + 0.4 * progress(frame, bone - 4, 10, backOut)})`, opacity: progress(frame, bone - 4, 6) }}>
              عند العضم!
              <div style={{ position: "absolute", left: -20, right: -20, top: "52%", height: 14, background: "white", transform: `scaleX(${progress(frame, bone + 6, 8)})`, transformOrigin: "right" }} />
            </div>
          </div>
        </AbsoluteFill>
      )}

      {frame >= more - 4 && (
        <>
          <ChapterHeader num="05" kicker="تشطيب كامل" title="على المفتاح" />
          <div
            dir="rtl"
            style={{
              position: "absolute",
              top: 560,
              left: 70,
              right: 70,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 30,
              opacity: 1 - gridOut,
              transform: `scale(${1 - gridOut * 0.2})`,
            }}
          >
            {TRADES.map((t, i) => {
              const p = progress(frame, starts[i] - 4, 12, backOut);
              const on = i === active;
              return (
                <div
                  key={t.word}
                  style={{
                    height: 250,
                    borderRadius: 30,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 18,
                    background: on ? C.red : "rgba(255,255,255,0.07)",
                    border: `2px solid ${on ? C.redGlow : "rgba(255,255,255,0.2)"}`,
                    boxShadow: on ? "0 24px 60px rgba(224,7,26,0.5)" : "0 20px 40px rgba(0,0,0,0.35)",
                    opacity: interpolate(p, [0, 0.3], [0.15, 1], clamp),
                    transform: `scale(${0.75 + 0.25 * p + (on ? 0.04 : 0)}) rotate(${(1 - p) * (i % 2 ? 8 : -8)}deg)`,
                  }}
                >
                  <svg width={120} height={120} viewBox="0 0 100 100">
                    {ICONS[t.icon]}
                  </svg>
                  <div style={{ fontFamily: headingFont, fontWeight: 800, fontSize: 60, color: "white" }}>{t.label}</div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* 3D design: wireframe that turns into the real building */}
      {iso > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: iso }}>
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            <g opacity={1 - progress(frame, see, 12)}>
              <IsoBuilding cx={540} cy={1040} scale={1.15} floors={4} built={interpolate(frame, [design, see], [0, 4.5], clamp)} mode="wire" />
            </g>
            <g opacity={progress(frame, see, 12)}>
              <IsoBuilding cx={540} cy={1040} scale={1.15} floors={4} built={4.5} mode="solid" />
            </g>
          </svg>
          <div
            style={{
              position: "absolute",
              top: 560,
              right: 110,
              padding: "12px 30px",
              borderRadius: 18,
              border: `4px solid ${C.blueprint}`,
              fontFamily: headingFont,
              fontWeight: 900,
              fontSize: 80,
              color: C.blueprint,
              transform: `perspective(600px) rotateY(${interpolate(frame, [design, design + 40], [90, 0], { ...clamp, easing: easeInOut })}deg)`,
            }}
          >
            3D
          </div>
          <div
            dir="rtl"
            style={{
              position: "absolute",
              top: 1330,
              left: 0,
              right: 0,
              textAlign: "center",
              fontFamily: headingFont,
              fontWeight: 800,
              fontSize: 64,
              color: "white",
              opacity: progress(frame, see, 10),
            }}
          >
            شوف بيتك <span style={{ color: C.red }}>قبل ما يتبني</span>
          </div>
        </div>
      )}

      <Captions id="finishing" y={1520} />
      <Sfx name="whoosh" at={0} volume={0.1} />
      <Sfx name="impact" at={bone - 12} volume={0.25} />
      <Sfx name="swoosh" at={bone + 12} volume={0.2} />
      <Sfx name="whoosh" at={more - 4} volume={0.4} />
      {starts.map((s) => (
        <Sfx key={s} name="pop" at={s - 2} volume={0.4} />
      ))}
      <Sfx name="whoosh" at={design - 4} volume={0.35} />
      <Sfx name="typing" at={design + 4} volume={0.2} />
      <Sfx name="chime" at={see - 8} volume={0.15} />
    </AbsoluteFill>
  );
};
