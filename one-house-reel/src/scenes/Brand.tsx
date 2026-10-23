import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { at, backOut, clamp, easeInOut, progress, rand } from "../anim";
import { Backdrop } from "../components/Backdrop";
import { Sfx, Voice } from "../components/Sound";
import { bodyFont, C, headingFont } from "../theme";

// Rotating engineering rings behind the logo.
const Rings: React.FC<{ readonly p: number }> = ({ p }) => {
  const frame = useCurrentFrame();
  const ticks = Array.from({ length: 72 }, (_, i) => i);
  return (
    <svg width={1080} height={1080} style={{ position: "absolute", left: 0, top: 420, opacity: p }}>
      <g transform={`translate(540 540) rotate(${frame * 0.4})`}>
        <circle r={420} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={2} />
        {ticks.map((i) => (
          <line key={i} x1={0} y1={-420} x2={0} y2={i % 6 === 0 ? -392 : -406} stroke="rgba(255,255,255,0.35)" strokeWidth={2} transform={`rotate(${i * 5})`} />
        ))}
      </g>
      <g transform={`translate(540 540) rotate(${-frame * 0.7})`}>
        <circle r={360} fill="none" stroke={C.red} strokeWidth={3} strokeDasharray="60 30 8 30" opacity={0.6} />
      </g>
      <g transform={`translate(540 540) rotate(${frame * 1.2})`}>
        <circle r={300} fill="none" stroke="rgba(95,168,255,0.35)" strokeWidth={2} strokeDasharray="4 12" />
      </g>
    </svg>
  );
};

export const Brand: React.FC = () => {
  const frame = useCurrentFrame();
  const name = at("brand", "وان");
  const icon = progress(frame, 2, 24, backOut);
  const word = progress(frame, 16, 22, easeInOut);
  const sweep = interpolate(frame, [34, 70], [-0.3, 1.3], clamp);
  const pulse = interpolate(frame, [name, name + 6, name + 20], [1, 1.07, 1], clamp);
  const flash = interpolate(frame, [0, 10], [0.85, 0], clamp);
  const sparks = Array.from({ length: 46 }, (_, i) => i);
  const tag = progress(frame, name + 24, 18);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Backdrop glow="rgba(224, 7, 26, 0.30)" />
      <Rings p={progress(frame, 0, 30)} />

      {/* Spark burst on the drop */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {sparks.map((i) => {
          const angle = rand(i) * Math.PI * 2;
          const speed = 300 + rand(i + 9) * 700;
          const t = interpolate(frame, [0, 40], [0, 1], { ...clamp, easing: (x) => 1 - (1 - x) ** 3 });
          const r = speed * t;
          return (
            <circle
              key={i}
              cx={540 + Math.cos(angle) * r}
              cy={900 + Math.sin(angle) * r}
              r={2 + rand(i + 3) * 5}
              fill={i % 3 ? "white" : C.red}
              opacity={1 - t}
            />
          );
        })}
      </svg>

      <div
        style={{
          position: "absolute",
          top: 560,
          left: 90,
          width: 900,
          transform: `scale(${pulse})`,
        }}
      >
        <div style={{ position: "relative", width: 900, height: 379 }}>
          <Img
            src={staticFile("brand/icon-white.png")}
            style={{
              width: 900,
              position: "absolute",
              top: 0,
              clipPath: `inset(${(1 - icon) * 100}% 0 0 0)`,
              transform: `translateY(${(1 - icon) * 120}px) scale(${1.25 - 0.25 * icon})`,
              filter: `drop-shadow(0 0 ${30 + 30 * (1 - icon)}px rgba(224,7,26,0.55))`,
            }}
          />
          {/* Light sweep across the icon */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(100deg, transparent ${sweep * 100 - 12}%, rgba(255,255,255,0.75) ${sweep * 100}%, transparent ${sweep * 100 + 12}%)`,
              WebkitMaskImage: `url(${staticFile("brand/icon-white.png")})`,
              WebkitMaskSize: "100% 100%",
              mixBlendMode: "overlay",
            }}
          />
        </div>
        <Img
          src={staticFile("brand/wordmark-white.png")}
          style={{
            width: 900,
            marginTop: 20,
            clipPath: `inset(0 ${(1 - word) * 100}% 0 0)`,
          }}
        />
      </div>

      <div
        dir="rtl"
        style={{
          position: "absolute",
          top: 1200,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: bodyFont,
          fontWeight: 600,
          fontSize: 50,
          color: C.steel,
          opacity: progress(frame, 30, 16),
        }}
      >
        مقاولات · إنشاءات · تشطيبات
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
          fontSize: 84,
          color: C.white,
          opacity: tag,
          transform: `translateY(${(1 - tag) * 40}px)`,
        }}
      >
        بنبني بيتك… <span style={{ color: C.red }}>كأنه بيتنا</span>
      </div>

      <AbsoluteFill style={{ backgroundColor: "white", opacity: flash }} />
      <Voice id="brand" />
      <Sfx name="whoosh" at={14} volume={0.35} />
      <Sfx name="chime" at={name} volume={0.3} />
      <Sfx name="swoosh" at={name + 24} volume={0.3} />
    </AbsoluteFill>
  );
};
