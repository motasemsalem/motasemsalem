import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { backOut, clamp, pop } from "../cues";
import { bodyFont, BRAND, headingFont } from "../theme";

// A phone that flies in at `start` and receives One House site-update notifications.
export const Phone: React.FC<{
  readonly start: number;
  readonly updates: readonly string[];
  readonly top?: number;
  readonly hide?: number;
}> = ({ start, updates, top = 500, hide = Infinity }) => {
  const frame = useCurrentFrame();
  const phone = pop(frame, start, 18, backOut);
  if (phone <= 0 || frame > hide + 8) return null;
  const out = pop(frame, hide, 8);
  return (
    <div
      style={{
        position: "absolute",
        left: 540 - 250,
        top,
        width: 500,
        height: 960,
        borderRadius: 70,
        background: "linear-gradient(180deg, #0b2a52, #041327)",
        border: "10px solid #1c2636",
        boxShadow: "0 60px 120px rgba(0,0,0,0.7), inset 0 0 0 2px rgba(255,255,255,0.15)",
        transform: `translateY(${(1 - phone) * 1600}px) rotate(${(1 - phone) * 12}deg)`,
        opacity: 1 - out,
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 22, left: 190, width: 120, height: 32, borderRadius: 16, background: "#000" }} />
      <Img src={staticFile("brand/logo-white.png")} style={{ position: "absolute", top: 120, left: 110, width: 260, opacity: 0.9 }} />
      {updates.map((u, i) => {
        const p = pop(frame, start + 10 + i * 9, 12, backOut);
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
            <div style={{ width: 64, height: 64, borderRadius: 16, background: BRAND.red, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width={40} height={40} viewBox="0 0 40 40">
                <path d="M 4 22 L 20 6 L 36 22 M 10 18 V 34 H 30 V 18" stroke="white" strokeWidth={4} fill="none" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: headingFont, fontWeight: 700, fontSize: 30, color: BRAND.navy }}>ون هاوس</div>
              <div style={{ fontFamily: bodyFont, fontWeight: 600, fontSize: 28, color: "#33445c" }}>{u}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
