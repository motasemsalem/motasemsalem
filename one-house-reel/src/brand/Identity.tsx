import { AbsoluteFill, Img, staticFile } from "remotion";
import { BRAND, bodyFont, headingFont } from "../theme";
import media from "../posts/photos.json";

// The page's own assets in the "engineer's eye" style (social/BRAND.md):
// the Facebook cover, the profile picture, and Instagram highlight covers.

const MEDIA: Record<string, { file: string }> = media;
const photo = (name: string) => staticFile(MEDIA[name].file);

const Grid: React.FC<{ readonly color: string; readonly step?: number }> = ({ color, step = 54 }) => (
  <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`, backgroundSize: `${step}px ${step}px` }} />
);

// Facebook cover, 1640x924. Facebook crops it to about 1640x624 on desktop and shows the middle on phones,
// so everything that matters sits in the centre band and away from the profile picture (bottom left).
export const COVER_W = 1640;
export const COVER_H = 924;
export const Cover: React.FC = () => (
  <AbsoluteFill style={{ background: BRAND.navy }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: 760, height: COVER_H, overflow: "hidden" }}>
      <Img src={photo("s-frame")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 40%", filter: "contrast(1.08)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(270deg, rgba(6,36,72,1) 0%, rgba(6,36,72,0.35) 40%, rgba(6,36,72,0.15) 100%)" }} />
    </div>
    <div style={{ position: "absolute", left: 760, right: 0, top: 0, bottom: 0 }}>
      <Grid color="rgba(95,168,255,0.1)" />
    </div>
    <div dir="rtl" style={{ position: "absolute", right: 120, top: 230, width: 840 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: bodyFont, fontWeight: 600, fontSize: 32, color: BRAND.steel }}>
        <div style={{ width: 50, height: 3, background: BRAND.red }} />
        مقاولات · تشطيبات · تجديد
      </div>
      <div style={{ marginTop: 22, fontFamily: headingFont, fontWeight: 900, fontSize: 100, lineHeight: 1.15, color: "white", whiteSpace: "nowrap" }}>
        اتبنى <span style={{ color: BRAND.red }}>صح</span>
        <br />
        من أول طوبة
      </div>
      <div style={{ marginTop: 34, display: "flex", alignItems: "center", gap: 26 }}>
        <div style={{ padding: "18px 38px", background: BRAND.red, fontFamily: headingFont, fontWeight: 800, fontSize: 34, color: "white", whiteSpace: "nowrap" }}>احجز معاينتك المجانية</div>
        <div style={{ fontFamily: bodyFont, fontWeight: 600, fontSize: 28, color: "rgba(255,255,255,0.85)", whiteSpace: "nowrap" }}>مع مهندس، برسالة على الصفحة</div>
      </div>
    </div>
    {/* A dimension line along the top edge of the text block. */}
    <div style={{ position: "absolute", right: 120, top: 190, width: 840, height: 2, background: BRAND.blueprint, opacity: 0.55 }} />
    <div style={{ position: "absolute", right: 120, top: 180, width: 2, height: 22, background: BRAND.blueprint, opacity: 0.55 }} />
    <div style={{ position: "absolute", right: 958, top: 180, width: 2, height: 22, background: BRAND.blueprint, opacity: 0.55 }} />
  </AbsoluteFill>
);

// Profile picture, 1080x1080. Shown as a circle, so the logo sits well inside it.
export const Avatar: React.FC = () => (
  <AbsoluteFill style={{ background: BRAND.navy, alignItems: "center", justifyContent: "center" }}>
    <Grid color="rgba(95,168,255,0.09)" step={60} />
    <div style={{ position: "absolute", width: 860, height: 860, borderRadius: 999, border: `3px solid rgba(95,168,255,0.35)` }} />
    <Img src={staticFile("brand/logo-white.png")} style={{ width: 700, position: "relative" }} />
  </AbsoluteFill>
);

// Instagram highlight covers, 1080x1920; Instagram shows a circle from the middle.
type Icon = "services" | "steps" | "visit" | "build" | "finish";
const STROKE = { fill: "none", stroke: "white", strokeWidth: 14, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const ICONS: Record<Icon, React.ReactNode> = {
  // a house with a check mark
  services: (
    <>
      <path d="M60 170 L200 60 L340 170" {...STROKE} />
      <path d="M95 150 V330 H305 V150" {...STROKE} />
      <path d="M150 245 L190 285 L255 210" {...STROKE} stroke={BRAND.red} />
    </>
  ),
  // three numbered steps rising
  steps: (
    <>
      <path d="M60 320 H150 V240 H240 V160 H330 V80" {...STROKE} />
      <circle cx="105" cy="280" r="14" fill={BRAND.red} />
      <circle cx="195" cy="200" r="14" fill={BRAND.red} />
      <circle cx="285" cy="120" r="14" fill={BRAND.red} />
    </>
  ),
  // a clipboard with ticks
  visit: (
    <>
      <rect x="90" y="70" width="220" height="280" rx="18" {...STROKE} />
      <path d="M160 70 V50 H240 V70" {...STROKE} />
      <path d="M130 160 L155 185 L195 140" {...STROKE} stroke={BRAND.red} />
      <path d="M220 165 H275" {...STROKE} />
      <path d="M130 260 L155 285 L195 240" {...STROKE} stroke={BRAND.red} />
      <path d="M220 265 H275" {...STROKE} />
    </>
  ),
  // a column with rebar
  build: (
    <>
      <path d="M140 340 V90 M260 340 V90" {...STROKE} />
      <path d="M140 140 H260 M140 200 H260 M140 260 H260" {...STROKE} stroke={BRAND.red} />
      <path d="M90 340 H310" {...STROKE} />
      <path d="M120 90 H280" {...STROKE} />
    </>
  ),
  // a paint roller
  finish: (
    <>
      <rect x="70" y="70" width="230" height="80" rx="16" {...STROKE} />
      <path d="M300 110 H335 V200 H200 V250" {...STROKE} />
      <rect x="180" y="250" width="40" height="100" rx="10" {...STROKE} stroke={BRAND.red} />
    </>
  ),
};
export const HIGHLIGHTS: Record<string, { readonly icon: Icon; readonly label: string }> = {
  services: { icon: "services", label: "خدماتنا" },
  steps: { icon: "steps", label: "خطوات الشغل" },
  visit: { icon: "visit", label: "معاينة مجانية" },
  build: { icon: "build", label: "مقاولات" },
  finish: { icon: "finish", label: "تشطيبات" },
};
export const Highlight: React.FC<{ readonly id: string }> = ({ id }) => {
  const h = HIGHLIGHTS[id];
  return (
    <AbsoluteFill style={{ background: BRAND.navy, alignItems: "center", justifyContent: "center" }}>
      <Grid color="rgba(95,168,255,0.09)" step={60} />
      <div style={{ position: "absolute", width: 760, height: 760, borderRadius: 999, border: "3px solid rgba(95,168,255,0.35)" }} />
      <svg viewBox="0 0 400 400" width={460} height={460} style={{ position: "relative" }}>
        {ICONS[h.icon]}
      </svg>
    </AbsoluteFill>
  );
};
