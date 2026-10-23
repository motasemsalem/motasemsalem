import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { at, backOut, clamp, easeInOut, progress, rand } from "../anim";
import { Sfx } from "../components/Sound";
import { bodyFont, C, headingFont } from "../theme";

// Bricks fly in and stack into a short wall under the logo.
const BrickWall: React.FC<{ readonly start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const bricks: { x: number; y: number; i: number }[] = [];
  let i = 0;
  for (let row = 0; row < 3; row++) {
    // Odd rows are offset by half a brick, like a real running bond.
    for (let col = 0; col < (row % 2 ? 6 : 7); col++) {
      bricks.push({ x: col * 112 + (row % 2 ? 56 : 0), y: (2 - row) * 52, i: i++ });
    }
  }
  return (
    <svg width={800} height={160} viewBox="-10 -10 800 170">
      {bricks.map((b) => {
        const p = progress(frame, start + b.i * 1.6, 12, backOut);
        return (
          <rect
            key={b.i}
            x={b.x}
            y={b.y - (1 - p) * 300}
            width={104}
            height={44}
            rx={5}
            fill={b.i % 5 === 2 ? C.red : "#b7462f"}
            stroke="#7a2a1c"
            strokeWidth={2}
            opacity={interpolate(p, [0, 0.2], [0, 1], clamp)}
            transform={`rotate(${(1 - p) * (rand(b.i) - 0.5) * 60} ${b.x + 52} ${b.y + 22})`}
          />
        );
      })}
    </svg>
  );
};

export const Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const brick = at("closing", "طوبة");
  const key = at("closing", "المفتاح");
  const cta = at("closing", "احجز");
  const right = at("closing", "صح");
  const logo = progress(frame, 4, 26, backOut);
  const wipe = progress(frame, 0, 18, easeInOut);
  const button = progress(frame, cta - 6, 16, backOut);
  const pulse = ((frame - cta) % 36) / 36;
  const tap = progress(frame, cta + 20, 10);
  const press = interpolate(frame, [cta + 28, cta + 32, cta + 38], [1, 0.92, 1], clamp);
  const final = progress(frame, right - 30, 18);
  return (
    <AbsoluteFill style={{ backgroundColor: C.deep, overflow: "hidden" }}>
      {/* White end card wipes up over the navy */}
      <AbsoluteFill style={{ background: C.paper, clipPath: `inset(${(1 - wipe) * 100}% 0 0 0)` }}>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.6 }}>
          <defs>
            <pattern id="paperGrid" width={60} height={60} patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(6,36,72,0.07)" strokeWidth={2} />
            </pattern>
          </defs>
          <rect width={1080} height={1920} fill="url(#paperGrid)" />
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 16, background: C.red }} />
      </AbsoluteFill>

      <div style={{ position: "absolute", top: 260, left: 110, width: 860, transform: `scale(${0.8 + 0.2 * logo})`, opacity: interpolate(logo, [0, 0.3], [0, 1], clamp) }}>
        <Img src={staticFile("brand/logo-color.png")} style={{ width: 860 }} />
      </div>

      <div style={{ position: "absolute", top: 820, left: 140 }}>
        <BrickWall start={brick - 10} />
      </div>

      <div dir="rtl" style={{ position: "absolute", top: 1000, left: 60, right: 60, textAlign: "center" }}>
        <div style={{ fontFamily: headingFont, fontWeight: 800, fontSize: 82, color: C.navy, opacity: progress(frame, brick - 14, 14), transform: `translateY(${(1 - progress(frame, brick - 14, 14)) * 30}px)` }}>
          من أول طوبة
        </div>
        <div style={{ fontFamily: headingFont, fontWeight: 800, fontSize: 82, color: C.red, opacity: progress(frame, key - 10, 14), transform: `translateY(${(1 - progress(frame, key - 10, 14)) * 30}px)` }}>
          لحد ما تستلم المفتاح
        </div>
      </div>

      {/* Call to action */}
      <div style={{ position: "absolute", top: 1330, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ position: "relative", transform: `scale(${(0.5 + 0.5 * button) * press})`, opacity: interpolate(button, [0, 0.3], [0, 1], clamp) }}>
          <div
            style={{
              position: "absolute",
              inset: -16 - pulse * 30,
              borderRadius: 999,
              border: `4px solid ${C.red}`,
              opacity: frame > cta ? 1 - pulse : 0,
            }}
          />
          <div
            dir="rtl"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 22,
              padding: "30px 64px",
              borderRadius: 999,
              background: C.red,
              boxShadow: "0 24px 60px rgba(224,7,26,0.45)",
              fontFamily: headingFont,
              fontWeight: 800,
              fontSize: 54,
              color: "white",
            }}
          >
            <svg width={70} height={70} viewBox="0 0 70 70">
              <path d="M 10 14 H 60 V 48 H 30 L 16 60 V 48 H 10 Z" fill="white" />
              <circle cx={24} cy={31} r={4} fill={C.red} />
              <circle cx={35} cy={31} r={4} fill={C.red} />
              <circle cx={46} cy={31} r={4} fill={C.red} />
            </svg>
            احجز استشارتك المجانية
          </div>
          {/* Tapping finger */}
          <svg
            width={130}
            height={150}
            viewBox="0 0 130 150"
            style={{
              position: "absolute",
              left: 80,
              top: 70,
              opacity: tap,
              transform: `translate(${(1 - tap) * 120}px, ${(1 - tap) * 120 + (press < 1 ? 10 : 0)}px)`,
            }}
          >
            <path
              d="M 46 10 Q 58 4 64 16 L 66 64 Q 80 56 92 64 Q 106 60 112 72 Q 124 72 126 88 L 120 124 Q 114 146 90 146 L 60 146 Q 40 146 30 128 L 10 92 Q 6 80 18 76 Q 28 74 36 86 L 40 92 L 40 20 Q 40 12 46 10 Z"
              fill="white"
              stroke={C.navy}
              strokeWidth={6}
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <div
        dir="rtl"
        style={{
          position: "absolute",
          top: 1600,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: bodyFont,
          fontWeight: 600,
          fontSize: 56,
          color: C.navy,
          opacity: final,
          transform: `translateY(${(1 - final) * 30}px)`,
        }}
      >
        وخلّي بيتك <span style={{ color: C.red, fontFamily: headingFont, fontWeight: 900 }}>يبدأ صح</span>
      </div>
      <div
        style={{
          position: "absolute",
          top: 1712,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 14,
          fontFamily: headingFont,
          fontWeight: 600,
          fontSize: 40,
          color: C.navy,
          opacity: progress(frame, cta + 10, 16),
        }}
      >
        <svg width={40} height={40} viewBox="0 0 40 40">
          <circle cx={20} cy={20} r={17} fill="none" stroke={C.red} strokeWidth={3} />
          <path d="M 3 20 H 37 M 20 3 Q 8 20 20 37 Q 32 20 20 3" fill="none" stroke={C.red} strokeWidth={3} />
        </svg>
        onehouse-eg.web.app
      </div>

      <Sfx name="whoosh" at={0} volume={0.1} />
      {Array.from({ length: 7 }, (_, i) => (
        <Sfx key={i} name="pop" at={brick - 6 + i * 5} volume={0.18} />
      ))}
      <Sfx name="keys" at={key} volume={0.35} />
      <Sfx name="pop" at={cta - 4} volume={0.4} />
      <Sfx name="blip" at={cta + 28} volume={0.45} />
      <Sfx name="chime" at={right - 4} volume={0.3} />
    </AbsoluteFill>
  );
};
