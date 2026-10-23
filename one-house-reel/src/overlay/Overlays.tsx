import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { backOut, C, clamp, easeInOut, FPS, pop, rand, ramp, TOTAL, WORDS } from "../cues";
import { bodyFont, BRAND, headingFont } from "../theme";
import { SHADOW } from "./Type";

const strip = (w: string) => w.replace(/[.,،:!؟?…]/g, "");

// Subtitles along the bottom: the phrase being spoken, the current word underlined in red.
export const Subtitles: React.FC<{ readonly hidden: (frame: number) => boolean }> = ({ hidden }) => {
  const frame = useCurrentFrame();
  if (hidden(frame)) return null;
  const t = frame / FPS;
  // Phrases end at punctuation or every five words.
  const phrases: { start: number; end: number; words: typeof WORDS }[] = [];
  let cur: typeof WORDS = [];
  for (const w of WORDS) {
    cur.push(w);
    if (/[.,،:!؟?…]$/.test(w.text) || cur.length >= 5) {
      phrases.push({ start: cur[0].start, end: w.end, words: cur });
      cur = [];
    }
  }
  const i = phrases.findIndex((p, k) => t < (phrases[k + 1]?.start ?? p.end + 0.5));
  const phrase = phrases[i];
  if (!phrase || t < phrase.start - 0.1) return null;
  const k = phrase.words.findIndex((w, j) => t < (phrase.words[j + 1]?.start ?? 999));
  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top: 1580,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "4px 16px",
      }}
    >
      {phrase.words.map((w, j) => {
        const on = j === k;
        const seen = t >= w.start - 0.05;
        return (
          <span
            key={j}
            style={{
              position: "relative",
              fontFamily: headingFont,
              fontWeight: 800,
              fontSize: 58,
              lineHeight: 1.35,
              color: on ? "white" : seen ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.4)",
              textShadow: SHADOW,
            }}
          >
            {strip(w.text)}
            <span
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 2,
                height: 8,
                borderRadius: 4,
                background: BRAND.red,
                transform: `scaleX(${on ? 1 : 0})`,
              }}
            />
          </span>
        );
      })}
    </div>
  );
};

// Sky behind the 3D canvas, following the time of day.
export const Sky: React.FC<{ readonly top: string; readonly horizon: string; readonly stars: number }> = ({ top, horizon, stars }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top} 0%, ${horizon} 75%)` }}>
      {stars > 0 && (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: stars }}>
          {Array.from({ length: 90 }, (_, i) => (
            <circle key={i} cx={rand(i) * 1080} cy={rand(i + 50) * 900} r={1 + rand(i + 9) * 2} fill="white" opacity={0.4 + 0.6 * Math.abs(Math.sin(frame / 20 + i))} />
          ))}
        </svg>
      )}
    </AbsoluteFill>
  );
};

// Tape-rewind treatment while the finished building runs back to an empty plot.
export const Rewind: React.FC = () => {
  const frame = useCurrentFrame();
  const on = frame >= C.rewind && frame < C.brand + 4;
  if (!on) return null;
  const p = (frame - C.rewind) / (C.brand - C.rewind);
  const months = Math.max(0, Math.round(18 * (1 - p)));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 6px)", mixBlendMode: "overlay" }} />
      <AbsoluteFill style={{ background: `rgba(30,60,140,${0.18 + 0.1 * Math.sin(frame)})`, mixBlendMode: "multiply" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 400 + ((frame * 53) % 900), height: 26, background: "rgba(255,255,255,0.12)" }} />
      <div dir="rtl" style={{ position: "absolute", top: 1180, left: 0, right: 0, textAlign: "center", fontFamily: headingFont, fontWeight: 900, color: "white", textShadow: SHADOW }}>
        <div style={{ fontSize: 150, letterSpacing: -10 }}>◀◀</div>
        <div style={{ fontSize: 54, fontFamily: bodyFont, fontWeight: 600 }}>
          نرجع <span style={{ color: BRAND.red, fontFamily: headingFont, fontWeight: 900, fontSize: 70 }}>{months}</span> شهر لورا
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Logo over the empty plot, with a light sweep.
export const BrandMark: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < C.brand - 4 || frame > C.start + 10) return null;
  const p = pop(frame, C.brand, 16, backOut) * (1 - pop(frame, C.start - 6, 12));
  const sweep = interpolate(frame, [C.brand + 10, C.brand + 40], [-0.3, 1.3], clamp);
  const flash = interpolate(frame, [C.brand - 2, C.brand, C.brand + 10], [0, 0.85, 0], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 42%, rgba(2,13,28,0.55), rgba(2,13,28,0.15) 60%)", opacity: p }} />
      <div style={{ position: "absolute", left: 120, top: 560, width: 840, transform: `scale(${0.7 + 0.3 * p})`, opacity: p }}>
        <Img src={staticFile("brand/logo-white.png")} style={{ width: 840, filter: "drop-shadow(0 20px 60px rgba(0,0,0,0.6))" }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(100deg, transparent ${sweep * 100 - 10}%, rgba(255,255,255,0.8) ${sweep * 100}%, transparent ${sweep * 100 + 10}%)`,
            WebkitMaskImage: `url(${staticFile("brand/logo-white.png")})`,
            WebkitMaskSize: "100% 100%",
            mixBlendMode: "overlay",
          }}
        />
      </div>
      <AbsoluteFill style={{ background: "white", opacity: flash }} />
    </AbsoluteFill>
  );
};

// Quick white flashes that cover the cut into the bathroom and back out.
export const CutFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [C.bath + 6, C.bath + 13, C.bath + 20], [0, 1, 0], clamp);
  const b = interpolate(frame, [C.stats - 11, C.stats - 5, C.stats + 2], [0, 1, 0], clamp);
  return <AbsoluteFill style={{ background: "white", opacity: Math.max(a, b), pointerEvents: "none" }} />;
};

export const Counter: React.FC<{ readonly to: number; readonly prefix?: string; readonly label: string; readonly from: number; readonly until: number; readonly x: number }> = ({
  to,
  prefix = "",
  label,
  from,
  until,
  x,
}) => {
  const frame = useCurrentFrame();
  if (frame < from - 4 || frame > C.follow + 6) return null;
  const p = pop(frame, from - 4, 12, backOut) * (1 - pop(frame, C.follow - 6, 10));
  const n = Math.round(interpolate(frame, [from, until], [0, to], { ...clamp, easing: easeInOut }));
  const done = frame >= until;
  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        top: 330,
        left: x,
        width: 460,
        textAlign: "center",
        opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
        transform: `translateY(${(1 - p) * 80}px) scale(${1 + (done ? interpolate(frame - until, [0, 4, 10], [0, 0.08, 0], clamp) : 0)})`,
      }}
    >
      <div style={{ fontFamily: headingFont, fontWeight: 900, fontSize: 170, lineHeight: 1, color: done ? BRAND.red : "white", textShadow: SHADOW }}>
        {prefix}
        {n}
      </div>
      <div style={{ fontFamily: headingFont, fontWeight: 800, fontSize: 60, color: "white", textShadow: SHADOW }}>{label}</div>
    </div>
  );
};

// Lifetime-warranty seal stamped onto the bathroom shot.
export const WarrantySeal: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < C.warranty - 2 || frame > C.stats - 6) return null;
  const p = pop(frame, C.warranty - 2, 10, backOut);
  return (
    <div
      style={{
        position: "absolute",
        left: 540 - 210,
        top: 560,
        width: 420,
        transform: `scale(${interpolate(p, [0, 1], [2.6, 1])}) rotate(${-10 + 10 * p}deg)`,
        opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
        filter: "drop-shadow(0 30px 60px rgba(224,7,26,0.6))",
      }}
    >
      <svg width={420} height={470} viewBox="0 0 460 520">
        <path d="M 230 10 L 440 80 L 420 300 Q 390 450 230 510 Q 70 450 40 300 L 20 80 Z" fill={BRAND.red} stroke="white" strokeWidth={10} />
        <path d="M 150 190 L 205 245 L 315 135" stroke="white" strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text x={230} y={340} textAnchor="middle" fontFamily={headingFont} fontWeight={900} fontSize={64} fill="white" direction="rtl">
          ضمان
        </text>
        <text x={230} y={415} textAnchor="middle" fontFamily={headingFont} fontWeight={800} fontSize={52} fill="white" direction="rtl">
          مدى الحياة
        </text>
      </svg>
    </div>
  );
};

// End card over the night shot: logo, promise, call to action and the website.
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < C.closing - 4) return null;
  const logo = pop(frame, C.closing, 18, backOut);
  const line1 = pop(frame, C.brick - 8, 12);
  const line2 = pop(frame, C.key - 8, 12);
  const button = pop(frame, C.cta - 6, 14, backOut);
  const pulse = ((frame - C.cta) % 36) / 36;
  const fade = 1 - ramp(frame, TOTAL - 6, TOTAL);
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(2,13,28,0.75) 0%, rgba(2,13,28,0.1) 45%, rgba(2,13,28,0.85) 100%)", opacity: logo }} />
      <div style={{ position: "absolute", left: 170, top: 190, width: 740, transform: `scale(${0.8 + 0.2 * logo})`, opacity: logo }}>
        <Img src={staticFile("brand/logo-white.png")} style={{ width: 740 }} />
      </div>
      <div dir="rtl" style={{ position: "absolute", top: 640, left: 60, right: 60, textAlign: "center", fontFamily: headingFont, fontWeight: 900, textShadow: SHADOW }}>
        <div style={{ fontSize: 88, color: "white", opacity: line1, transform: `translateY(${(1 - line1) * 30}px)` }}>من أول طوبة</div>
        <div style={{ fontSize: 88, color: "white", opacity: line2, transform: `translateY(${(1 - line2) * 30}px)` }}>
          لحد ما تستلم <span style={{ color: BRAND.red }}>المفتاح</span>
        </div>
      </div>
      <div style={{ position: "absolute", top: 1290, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ position: "relative", transform: `scale(${0.5 + 0.5 * button})`, opacity: interpolate(button, [0, 0.3], [0, 1], clamp) }}>
          <div style={{ position: "absolute", inset: -14 - pulse * 30, borderRadius: 999, border: `4px solid ${BRAND.red}`, opacity: frame > C.cta ? 1 - pulse : 0 }} />
          <div dir="rtl" style={{ padding: "30px 60px", borderRadius: 999, background: BRAND.red, boxShadow: "0 24px 60px rgba(224,7,26,0.5)", fontFamily: headingFont, fontWeight: 800, fontSize: 58, color: "white" }}>
            احجز استشارتك المجانية
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 1450, left: 0, right: 0, textAlign: "center", fontFamily: headingFont, fontWeight: 600, fontSize: 44, color: "white", textShadow: SHADOW, opacity: pop(frame, C.cta + 10, 14) }}>
        onehouse-eg.web.app
      </div>
    </AbsoluteFill>
  );
};

// Film grain and vignette over everything.
export const Finish: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 58%, rgba(0,0,0,0.45) 100%)" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.07, mixBlendMode: "overlay" }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency={0.9} numOctaves={2} seed={frame % 12} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={1080} height={1920} filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};
