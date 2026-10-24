import { shine } from "@remotion/effects/shine";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { backOut, C, clamp, easeOut, pop, ramp, TOTAL } from "../cues";
import { bodyFont, BRAND, headingFont, SHADOW } from "../theme";

// Anamorphic lens flare: a horizontal streak and a soft bloom at (x, y).
export const Flare: React.FC<{ readonly x: number; readonly y: number; readonly strength: number }> = ({ x, y, strength }) => (
  <AbsoluteFill style={{ mixBlendMode: "screen", opacity: strength, pointerEvents: "none" }}>
    <div style={{ position: "absolute", left: x - 700, top: y - 5, width: 1400, height: 10, borderRadius: 10, background: "linear-gradient(90deg, transparent, rgba(255,190,120,0.9), white, rgba(255,190,120,0.9), transparent)", filter: "blur(3px)" }} />
    <div style={{ position: "absolute", left: x - 260, top: y - 260, width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,230,190,0.9), rgba(255,140,60,0.35) 35%, transparent 70%)" }} />
    <div style={{ position: "absolute", left: 1080 - x - 70, top: 1920 - y - 70, width: 140, height: 140, borderRadius: "50%", border: "3px solid rgba(255,170,90,0.35)" }} />
    <div style={{ position: "absolute", left: (x + 540) / 2 - 40, top: (y + 960) / 2 - 40, width: 80, height: 80, borderRadius: "50%", background: "rgba(120,180,255,0.18)" }} />
  </AbsoluteFill>
);

// The logo lands on the impact over the sunset site: blur-to-sharp, a shine sweep, a flare from the sun.
export const BrandReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const from = C.brand;
  const until = C.start;
  if (frame < from - 2 || frame > until + 4) return null;
  const p = pop(frame, from, 16, backOut);
  const out = pop(frame, until - 8, 8);
  const sharp = pop(frame, from, 10, easeOut);
  const tag = pop(frame, C.brand + 36, 12);
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(2,13,28,0.15), rgba(2,13,28,0.6) 75%)" }} />
      <Flare x={360} y={1180} strength={interpolate(frame, [from, from + 6, from + 40], [0, 1, 0.55], clamp)} />
      <div style={{ position: "absolute", left: 140, top: 520, width: 800, transform: `scale(${1.25 - 0.25 * p})`, opacity: interpolate(p, [0, 0.4], [0, 1], clamp), filter: `blur(${(1 - sharp) * 18}px) drop-shadow(0 18px 50px rgba(0,0,0,0.6))` }}>
        <Img
          src={staticFile("brand/logo-white.png")}
          style={{ width: 800 }}
          effects={[shine({ progress: interpolate(frame, [from + 8, from + 34], [0, 1], clamp), angle: 25, haloIntensity: 0.5, coreIntensity: 1.2 })]}
        />
      </div>
      <div
        dir="rtl"
        style={{
          position: "absolute",
          top: 980,
          left: 60,
          right: 60,
          textAlign: "center",
          fontFamily: bodyFont,
          fontWeight: 600,
          fontSize: 50,
          color: "white",
          textShadow: SHADOW,
          opacity: tag,
          transform: `translateY(${(1 - tag) * 20}px)`,
        }}
      >
        وده اللي بنعمله كل يوم
      </div>
    </AbsoluteFill>
  );
};

// Closing: logo, promise, call to action and website over the last shots.
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const start = cueEnd();
  if (frame < start - 4) return null;
  const logo = pop(frame, start, 18, backOut);
  const button = pop(frame, C.cta - 6, 14, backOut);
  const pulse = ((frame - C.cta) % 36) / 36;
  const fade = 1 - ramp(frame, TOTAL - 8, TOTAL);
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(2,13,28,0.7) 0%, rgba(2,13,28,0.1) 40%, rgba(2,13,28,0.15) 60%, rgba(2,13,28,0.85) 100%)", opacity: logo }} />
      <div style={{ position: "absolute", left: 190, top: 200, width: 700, transform: `scale(${0.85 + 0.15 * logo})`, opacity: logo }}>
        <Img src={staticFile("brand/logo-white.png")} style={{ width: 700 }} effects={[shine({ progress: interpolate(frame, [start + 6, start + 36], [0, 1], clamp), angle: 25 })]} />
      </div>
      <div style={{ position: "absolute", top: 1240, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ position: "relative", transform: `scale(${0.6 + 0.4 * button})`, opacity: interpolate(button, [0, 0.3], [0, 1], clamp) }}>
          <div style={{ position: "absolute", inset: -12 - pulse * 28, borderRadius: 999, border: `3px solid ${BRAND.red}`, opacity: frame > C.cta ? 1 - pulse : 0 }} />
          <div dir="rtl" style={{ padding: "28px 58px", borderRadius: 999, background: BRAND.red, boxShadow: "0 24px 60px rgba(224,7,26,0.5)", fontFamily: headingFont, fontWeight: 800, fontSize: 56, color: "white" }}>
            احجز استشارتك المجانية
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 1400, left: 0, right: 0, textAlign: "center", fontFamily: headingFont, fontWeight: 500, fontSize: 42, color: "white", textShadow: SHADOW, opacity: pop(frame, C.cta + 10, 14), direction: "ltr" }}>
        onehouse-eg.web.app
      </div>
    </AbsoluteFill>
  );
};

// The end card arrives with the last line ("احجز…").
const cueEnd = () => C.cta - 10;
