import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { backOut, clamp, easeInOut, easeOut, pop } from "../cues";
import { bodyFont, BRAND, headingFont, SHADOW } from "../theme";
import { Photo } from "./kit";

// On-screen graphics for the finishing reel. Every one takes absolute frames and hides itself outside [from, to].

const GOLD = "#e8c58a";

const useWindow = (from: number, to: number) => {
  const f = useCurrentFrame();
  const visible = f >= from - 2 && f <= to + 10;
  const out = pop(f, to, 10, easeInOut);
  return { f, visible, out };
};

const Check: React.FC<{ readonly p: number; readonly size?: number }> = ({ p, size = 54 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      background: BRAND.red,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      transform: `scale(${p})`,
      boxShadow: "0 6px 22px rgba(224,7,26,0.55)",
    }}
  >
    <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24">
      <path d="M4 12.5l5 5L20 6.5" fill="none" stroke="white" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={26} strokeDashoffset={26 * (1 - p)} />
    </svg>
  </div>
);

// A stack of items that tick in one by one on their words, under an optional heading.
export const Items: React.FC<{
  readonly from: number;
  readonly to: number;
  readonly heading?: string;
  readonly items: readonly { readonly at: number; readonly text: string }[];
  readonly top?: number;
}> = ({ from, to, heading, items, top = 1180 }) => {
  const { f, visible, out } = useWindow(from, to);
  if (!visible) return null;
  return (
    <div dir="rtl" style={{ position: "absolute", top, left: 80, right: 80, opacity: 1 - out, transform: `translateY(${-out * 30}px)` }}>
      {heading && (
        <div style={{ fontFamily: headingFont, fontWeight: 800, fontSize: 80, color: "white", textShadow: SHADOW, marginBottom: 18, opacity: pop(f, from - 2, 10), transform: `translateX(${(1 - pop(f, from - 2, 14)) * -60}px)` }}>
          {heading}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {items.map((it, i) => {
          const p = pop(f, it.at - 2, 12, easeOut);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 22,
                padding: "14px 26px",
                borderRadius: 20,
                background: "rgba(4,22,45,0.62)",
                border: "1.5px solid rgba(255,255,255,0.16)",
                backdropFilter: "blur(10px)",
                opacity: p,
                transform: `translateX(${(1 - p) * -80}px)`,
                alignSelf: "flex-start",
              }}
            >
              <Check p={pop(f, it.at + 2, 10, backOut)} />
              <div style={{ fontFamily: headingFont, fontWeight: 700, fontSize: 56, color: "white" }}>{it.text}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// A trade label for the hidden-work section: "1 من 6", the trade name, and its proof points ticking in.
export const Trade: React.FC<{
  readonly from: number;
  readonly to: number;
  readonly n: number;
  readonly of: number;
  readonly name: string;
  readonly points: readonly { readonly at: number; readonly text: string }[];
}> = ({ from, to, n, of, name, points }) => {
  const { f, visible, out } = useWindow(from, to);
  if (!visible) return null;
  const p = pop(f, from - 2, 14);
  return (
    <div dir="rtl" style={{ position: "absolute", top: 1130, left: 80, right: 80, opacity: 1 - out, transform: `translateY(${-out * 30}px)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: p }}>
        <div style={{ padding: "8px 22px", borderRadius: 12, background: BRAND.red, fontFamily: headingFont, fontWeight: 800, fontSize: 36, color: "white" }}>
          {n} من {of}
        </div>
        <div style={{ height: 3, width: 160 * p, background: "rgba(255,255,255,0.6)" }} />
      </div>
      <div style={{ fontFamily: headingFont, fontWeight: 800, fontSize: 104, lineHeight: 1.2, color: "white", textShadow: SHADOW, marginTop: 10, transform: `translateX(${(1 - p) * -70}px)`, opacity: p }}>
        {name}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
        {points.map((it, i) => {
          const q = pop(f, it.at - 2, 12);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, opacity: q, transform: `translateY(${(1 - q) * 24}px)` }}>
              <Check p={pop(f, it.at + 2, 10, backOut)} size={46} />
              <div style={{ fontFamily: bodyFont, fontWeight: 600, fontSize: 48, color: "white", textShadow: SHADOW }}>{it.text}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// The itemised quote, then the contract with what it fixes, then a stamp.
export const Quote: React.FC<{ readonly from: number; readonly contractAt: number; readonly stampAt: number; readonly to: number }> = ({ from, contractAt, stampAt, to }) => {
  const { f, visible, out } = useWindow(from, to);
  if (!visible) return null;
  const inP = pop(f, from - 2, 16, easeOut);
  const flip = pop(f, contractAt - 4, 14, easeInOut);
  const showContract = flip > 0.5;
  const rows = showContract
    ? ["المواصفات", "الخامات", "معاد التسليم"]
    : ["كهربا", "سباكة", "عزل", "محارة", "أرضيات", "دهانات"];
  const rowStart = showContract ? contractAt + 4 : from + 6;
  const stamp = pop(f, stampAt - 2, 10, backOut);
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <AbsoluteFill style={{ background: "rgba(2,10,22,0.45)", opacity: inP }} />
      <div
        dir="rtl"
        style={{
          position: "absolute",
          left: 120,
          right: 120,
          top: 430,
          padding: "50px 56px",
          borderRadius: 34,
          background: BRAND.paper,
          boxShadow: "0 40px 90px rgba(0,0,0,0.55)",
          transform: `translateY(${(1 - inP) * 160}px) rotateY(${Math.sin(flip * Math.PI) * 70}deg) rotate(-1.5deg)`,
          opacity: inP,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: headingFont, fontWeight: 800, fontSize: 64, color: BRAND.navy }}>{showContract ? "العقد" : "عرض السعر"}</div>
          <Img src={staticFile("brand/logo-color.png")} style={{ height: 70 }} />
        </div>
        <div style={{ fontFamily: bodyFont, fontWeight: 600, fontSize: 34, color: BRAND.dim, marginTop: 4 }}>{showContract ? "مكتوب ومتمضي" : "كل بند بسعره"}</div>
        <div style={{ height: 3, background: BRAND.navy, opacity: 0.15, margin: "26px 0 16px" }} />
        {rows.map((r, i) => {
          const p = pop(f, rowStart + i * 4, 10);
          return (
            <div key={r} style={{ display: "flex", alignItems: "center", gap: 18, padding: "12px 0", opacity: p, transform: `translateX(${(1 - p) * -40}px)` }}>
              <Check p={pop(f, rowStart + i * 4 + 4, 10, backOut)} size={44} />
              <div style={{ fontFamily: headingFont, fontWeight: 700, fontSize: 46, color: BRAND.navy }}>{r}</div>
              <div style={{ flex: 1, borderBottom: "3px dotted rgba(6,36,72,0.25)", margin: "0 10px", transform: "translateY(10px)" }} />
            </div>
          );
        })}
      </div>
      <div
        dir="rtl"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1290,
          display: "flex",
          justifyContent: "center",
          opacity: stamp,
          transform: `scale(${2.2 - 1.2 * stamp}) rotate(-8deg)`,
        }}
      >
        <div style={{ padding: "18px 46px", border: `8px solid ${BRAND.red}`, borderRadius: 22, fontFamily: headingFont, fontWeight: 900, fontSize: 84, color: BRAND.red, background: "rgba(255,255,255,0.92)" }}>
          مفيش مفاجآت
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Pressure test: a gauge whose needle climbs and holds.
export const Gauge: React.FC<{ readonly from: number; readonly to: number; readonly holdAt: number }> = ({ from, to, holdAt }) => {
  const { f, visible, out } = useWindow(from, to);
  if (!visible) return null;
  const p = pop(f, from, 14, backOut);
  const needle = interpolate(f, [from + 4, holdAt], [-120, 60], { ...clamp, easing: easeOut }) + Math.sin(f * 0.9) * 1.2;
  const ok = pop(f, holdAt, 10, backOut);
  return (
    <div style={{ position: "absolute", left: 630, top: 240, width: 360, height: 360, opacity: 1 - out, transform: `scale(${p})` }}>
      <svg width={360} height={360} viewBox="-180 -180 360 360">
        <circle r={170} fill="rgba(4,22,45,0.85)" stroke="white" strokeOpacity={0.85} strokeWidth={8} />
        {Array.from({ length: 13 }, (_, i) => {
          const a = ((-120 + i * 20) * Math.PI) / 180;
          return <line key={i} x1={Math.sin(a) * 130} y1={-Math.cos(a) * 130} x2={Math.sin(a) * 152} y2={-Math.cos(a) * 152} stroke={i > 9 ? BRAND.red : "white"} strokeWidth={i % 3 === 0 ? 6 : 3} />;
        })}
        <path d={describeArc(140, 40, 120)} stroke={BRAND.red} strokeWidth={10} fill="none" />
        <line x1={0} y1={0} x2={Math.sin((needle * Math.PI) / 180) * 118} y2={-Math.cos((needle * Math.PI) / 180) * 118} stroke={BRAND.redGlow} strokeWidth={9} strokeLinecap="round" />
        <circle r={18} fill="white" />
        <text y={92} textAnchor="middle" fill="white" style={{ fontFamily: headingFont, fontWeight: 800, fontSize: 40 }}>
          ضغط
        </text>
      </svg>
      <div style={{ position: "absolute", left: -40, right: -40, top: 372, display: "flex", justifyContent: "center", opacity: ok, transform: `scale(${ok})` }}>
        <Badge text="مفيش تسريب" />
      </div>
    </div>
  );
};

const describeArc = (r: number, a0: number, a1: number) => {
  const p = (a: number) => [Math.sin((a * Math.PI) / 180) * r, -Math.cos((a * Math.PI) / 180) * r];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  return `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`;
};

const Badge: React.FC<{ readonly text: string }> = ({ text }) => (
  <div dir="rtl" style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 28px 12px 16px", borderRadius: 999, background: "white", boxShadow: "0 14px 34px rgba(0,0,0,0.4)" }}>
    <Check p={1} size={46} />
    <div style={{ fontFamily: headingFont, fontWeight: 800, fontSize: 40, color: BRAND.navy, whiteSpace: "nowrap" }}>{text}</div>
  </div>
);

// Flood test: water fills the frame bottom while a clock runs to 48 hours.
export const WaterTest: React.FC<{ readonly from: number; readonly to: number; readonly doneAt: number }> = ({ from, to, doneAt }) => {
  const { f, visible, out } = useWindow(from, to);
  if (!visible) return null;
  const level = interpolate(f, [from, from + 24], [0, 1], { ...clamp, easing: easeOut });
  const hours = Math.round(interpolate(f, [from + 6, doneAt], [0, 48], { ...clamp, easing: easeInOut }));
  const ok = pop(f, doneAt, 10, backOut);
  const y = 1920 - level * 720;
  const wave = (k: number) =>
    Array.from({ length: 13 }, (_, i) => `${i * 90},${y + Math.sin(i * 0.9 + f * 0.18 + k) * 14}`).join(" ");
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#59c3ff" stopOpacity={0.55} />
            <stop offset="1" stopColor="#0a4f9e" stopOpacity={0.75} />
          </linearGradient>
        </defs>
        <polygon points={`0,1920 ${wave(0)} 1080,1920`} fill="url(#water)" />
        <polyline points={wave(0)} fill="none" stroke="white" strokeOpacity={0.7} strokeWidth={4} />
        <polyline points={wave(2)} fill="none" stroke="white" strokeOpacity={0.3} strokeWidth={3} transform="translate(0,22)" />
      </svg>
      <div dir="rtl" style={{ position: "absolute", left: 640, top: 250, width: 360, padding: "22px 26px", borderRadius: 28, background: "rgba(4,22,45,0.85)", border: "2px solid rgba(255,255,255,0.25)", textAlign: "center", opacity: pop(f, from + 4, 10) }}>
        <div style={{ fontFamily: bodyFont, fontWeight: 600, fontSize: 34, color: "rgba(255,255,255,0.8)" }}>اختبار مية</div>
        <div style={{ fontFamily: headingFont, fontWeight: 800, fontSize: 96, color: "white", lineHeight: 1.1 }}>{hours}</div>
        <div style={{ fontFamily: bodyFont, fontWeight: 600, fontSize: 34, color: "rgba(255,255,255,0.8)" }}>ساعة</div>
      </div>
      <div style={{ position: "absolute", left: 600, width: 440, top: 600, display: "flex", justifyContent: "center", opacity: ok, transform: `scale(${ok})` }}>
        <Badge text="مفيش تسريب" />
      </div>
    </AbsoluteFill>
  );
};

// A laser level line across the wall, then "straight as a ruler".
export const Laser: React.FC<{ readonly from: number; readonly to: number; readonly okAt: number; readonly y?: number }> = ({ from, to, okAt, y = 760 }) => {
  const { f, visible, out } = useWindow(from, to);
  if (!visible) return null;
  const draw = pop(f, from + 2, 18, easeInOut);
  const ok = pop(f, okAt, 10, backOut);
  const flicker = 0.85 + Math.sin(f * 1.7) * 0.08;
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <div style={{ position: "absolute", top: y, right: 0, width: 1080 * draw, height: 6, background: "#ff2a3d", boxShadow: "0 0 18px 6px rgba(255,42,61,0.7), 0 0 60px 14px rgba(255,42,61,0.35)", opacity: flicker }} />
      <div style={{ position: "absolute", top: y - 120, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: ok, transform: `scale(${ok})` }}>
        <Badge text="زي المسطرة" />
      </div>
    </AbsoluteFill>
  );
};

// Progress photos arriving on a phone.
export const Phone: React.FC<{ readonly from: number; readonly to: number; readonly messages: readonly { readonly at: number; readonly photo: string; readonly text: string }[] }> = ({ from, to, messages }) => {
  const { f, visible, out } = useWindow(from, to);
  if (!visible) return null;
  const p = pop(f, from - 2, 18, easeOut);
  return (
    <div style={{ position: "absolute", left: 250, top: 220, width: 580, height: 1080, borderRadius: 70, background: "#0b0f17", padding: 18, boxShadow: "0 50px 120px rgba(0,0,0,0.6)", border: "3px solid rgba(255,255,255,0.18)", opacity: (1 - out) * p, transform: `translateY(${(1 - p) * 200}px) rotate(${(1 - p) * -6}deg)` }}>
      <div dir="rtl" style={{ width: "100%", height: "100%", borderRadius: 54, overflow: "hidden", background: "#e9e4dc", position: "relative" }}>
        <div style={{ height: 120, background: BRAND.navy, display: "flex", alignItems: "flex-end", padding: "0 30px 18px", gap: 16 }}>
          <Img src={staticFile("brand/icon-white.png")} style={{ height: 54 }} />
          <div style={{ fontFamily: headingFont, fontWeight: 700, fontSize: 34, color: "white" }}>مهندس الموقع</div>
        </div>
        <div style={{ position: "absolute", left: 22, right: 22, bottom: 30, display: "flex", flexDirection: "column", gap: 18 }}>
          {messages.map((m, i) => {
            const q = pop(f, m.at - 2, 12, backOut);
            if (f < m.at - 2) return null;
            return (
              <div key={i} style={{ alignSelf: "flex-start", width: 400, borderRadius: 24, background: "white", padding: 10, boxShadow: "0 6px 16px rgba(0,0,0,0.12)", transform: `scale(${q})`, transformOrigin: "right bottom" }}>
                <div style={{ position: "relative", width: 380, height: 170, borderRadius: 16, overflow: "hidden" }}>
                  {/* The full 9:16 shot scaled to the bubble's width, centred vertically. */}
                  <div style={{ position: "absolute", left: 0, top: -253, width: 1080, height: 1920, transform: "scale(0.352)", transformOrigin: "0 0" }}>
                    <Photo name={m.photo} move="in" look="site" t={0.5} />
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 6px 2px" }}>
                  <Check p={1} size={34} />
                  <div style={{ fontFamily: headingFont, fontWeight: 700, fontSize: 30, color: BRAND.navy }}>{m.text}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// "Elegant outside, honest inside": the finished room, with a scan band that shows the wiring behind the wall.
export const InsideOut: React.FC<{ readonly from: number; readonly to: number; readonly insideAt: number }> = ({ from, to, insideAt }) => {
  const { f, visible } = useWindow(from, to);
  if (!visible) return null;
  const t = (f - from) / Math.max(1, to - from);
  const band = interpolate(f, [insideAt - 6, insideAt + 10], [0, 1], { ...clamp, easing: easeInOut });
  const scanY = interpolate(f, [from, to], [700, 1200], clamp);
  const top = scanY - 260 * band;
  const bottom = scanY + 260 * band;
  const words = (text: string, at: number, y: number, color = "white") => {
    const p = pop(f, at - 2, 14, easeOut);
    return (
      <div dir="rtl" style={{ position: "absolute", top: y, left: 0, right: 0, textAlign: "center", fontFamily: headingFont, fontWeight: 800, fontSize: 104, color, textShadow: SHADOW, opacity: p, transform: `translateY(${(1 - p) * 40}px)` }}>
        {text}
      </div>
    );
  };
  return (
    <AbsoluteFill>
      <AbsoluteFill>
        <Photo name="luxe-apartment" move="in" look="warm" t={t} />
      </AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `inset(${top}px 0 ${1920 - bottom}px 0)` }}>
        <Photo name="wires-wall" move="out" look="xray" t={t} />
      </AbsoluteFill>
      {band > 0 && (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: top - 2, height: 4, background: "#8fd8ff", boxShadow: "0 0 24px 6px rgba(95,200,255,0.8)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: bottom - 2, height: 4, background: "#8fd8ff", boxShadow: "0 0 24px 6px rgba(95,200,255,0.8)" }} />
        </>
      )}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(2,10,22,0.8) 0%, rgba(2,10,22,0.55) 26%, rgba(2,10,22,0) 40%, rgba(2,10,22,0) 66%, rgba(2,10,22,0.8) 100%)" }} />
      <Img src={staticFile("brand/logo-white.png")} style={{ position: "absolute", left: 390, width: 300, top: 110, opacity: pop(f, from, 14), filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.6))" }} />
      {words("شياكة من بره", from + 24, 420)}
      {words("وضمير من جوّه", insideAt, 1560, GOLD)}
    </AbsoluteFill>
  );
};

// The end card: logo, line, and the free-inspection button.
export const EndCard: React.FC<{ readonly from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  if (f < from - 2) return null;
  const p = pop(f, from, 16, easeOut);
  const pulse = 1 + 0.035 * Math.sin((f - from) * 0.25);
  return (
    <AbsoluteFill style={{ opacity: p }}>
      <AbsoluteFill style={{ filter: "blur(14px) brightness(0.45)", transform: "scale(1.1)" }}>
        <Photo name="kitchen" move="in" look="warm" t={(f - from) / 90} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 42%, rgba(6,36,72,0.35), rgba(2,13,28,0.92) 75%)" }} />
      <div dir="rtl" style={{ position: "absolute", top: 470, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
        <Img src={staticFile("brand/logo-white.png")} style={{ width: 560, transform: `scale(${0.9 + 0.1 * p})` }} />
        <div style={{ fontFamily: headingFont, fontWeight: 800, fontSize: 70, color: "white", textShadow: SHADOW, opacity: pop(f, from + 8, 12) }}>تشطيب على أصوله</div>
        <div style={{ width: 120 * pop(f, from + 10, 14), height: 4, background: GOLD }} />
        <div style={{ marginTop: 40, padding: "30px 64px", borderRadius: 999, background: BRAND.red, boxShadow: "0 24px 60px rgba(224,7,26,0.55)", fontFamily: headingFont, fontWeight: 800, fontSize: 60, color: "white", transform: `scale(${pop(f, from + 12, 14, backOut) * pulse})` }}>
          احجز معاينتك المجانية
        </div>
        <div style={{ fontFamily: bodyFont, fontWeight: 600, fontSize: 40, color: "rgba(255,255,255,0.85)", opacity: pop(f, from + 20, 12) }}>ابعتلنا رسالة على الصفحة</div>
      </div>
    </AbsoluteFill>
  );
};

// The logo in the corner while the footage plays.
export const Watermark: React.FC<{ readonly until: number }> = ({ until }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [4, 16, until - 6, until], [0, 0.95, 0.95, 0], clamp);
  return <Img src={staticFile("brand/logo-white.png")} style={{ position: "absolute", right: 50, top: 60, height: 96, opacity: o, filter: "drop-shadow(0 4px 14px rgba(0,0,0,0.6))" }} />;
};
