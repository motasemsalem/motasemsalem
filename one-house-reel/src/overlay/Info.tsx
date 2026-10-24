import { interpolate, useCurrentFrame } from "remotion";
import { backOut, clamp, easeInOut, pop } from "../cues";
import { bodyFont, BRAND, headingFont, SHADOW } from "../theme";

// A big number that counts up from `from` to `until`, then settles with a small kick.
export const Counter: React.FC<{
  readonly to: number;
  readonly prefix?: string;
  readonly label: string;
  readonly from: number;
  readonly until: number;
  readonly hide: number;
  readonly top?: number;
}> = ({ to, prefix = "", label, from, until, hide, top = 300 }) => {
  const frame = useCurrentFrame();
  if (frame < from - 4 || frame > hide + 8) return null;
  const p = pop(frame, from - 4, 12, backOut) * (1 - pop(frame, hide, 8));
  const n = Math.round(interpolate(frame, [from, until], [0, to], { ...clamp, easing: easeInOut }));
  const kick = frame >= until ? interpolate(frame - until, [0, 4, 10], [0, 0.06, 0], clamp) : 0;
  return (
    <div dir="rtl" style={{ position: "absolute", top, left: 0, right: 0, textAlign: "center", opacity: interpolate(p, [0, 0.3], [0, 1], clamp), transform: `translateY(${(1 - p) * 60}px) scale(${1 + kick})` }}>
      <div style={{ fontFamily: headingFont, fontWeight: 900, fontSize: 250, lineHeight: 1, color: "white", textShadow: SHADOW }}>
        <span style={{ color: BRAND.redGlow }}>{prefix}</span>
        {n}
      </div>
      <div style={{ fontFamily: headingFont, fontWeight: 700, fontSize: 64, color: "white", textShadow: SHADOW, marginTop: -6 }}>{label}</div>
    </div>
  );
};

// Checklist rows that slide in with a tick that draws itself.
export const Checklist: React.FC<{ readonly items: readonly { readonly at: number; readonly label: string }[]; readonly hide: number; readonly top: number }> = ({ items, hide, top }) => {
  const frame = useCurrentFrame();
  if (frame < items[0].at - 4 || frame > hide + 8) return null;
  return (
    <div dir="rtl" style={{ position: "absolute", top, left: 90, right: 90, display: "flex", flexDirection: "column", gap: 20, opacity: 1 - pop(frame, hide, 8) }}>
      {items.map(({ at, label }) => {
        const p = pop(frame, at - 3, 10, backOut);
        if (frame < at - 3) return null;
        return (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 22,
              padding: "18px 30px",
              borderRadius: 8,
              background: "rgba(2,13,28,0.6)",
              borderRight: `6px solid ${BRAND.red}`,
              backdropFilter: "blur(8px)",
              opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
              transform: `translateX(${(1 - p) * 120}px)`,
            }}
          >
            <svg width={52} height={52} viewBox="0 0 40 40">
              <circle cx={20} cy={20} r={18} fill="none" stroke="white" strokeWidth={2.5} />
              <path d="M 11 21 L 18 28 L 30 13" stroke="white" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - pop(frame, at + 2, 8)} />
            </svg>
            <div style={{ fontFamily: headingFont, fontWeight: 700, fontSize: 52, color: "white" }}>{label}</div>
          </div>
        );
      })}
    </div>
  );
};

// Lifetime-warranty seal, stamped down.
export const Seal: React.FC<{ readonly at: number; readonly hide: number }> = ({ at, hide }) => {
  const frame = useCurrentFrame();
  if (frame < at - 2 || frame > hide + 6) return null;
  const p = pop(frame, at - 2, 9, backOut);
  const out = pop(frame, hide, 6);
  return (
    <div
      style={{
        position: "absolute",
        left: 540 - 200,
        top: 500,
        width: 400,
        transform: `scale(${interpolate(p, [0, 1], [2.4, 1])}) rotate(${-8 + 8 * p}deg)`,
        opacity: interpolate(p, [0, 0.3], [0, 1], clamp) * (1 - out),
        filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.6))",
      }}
    >
      <svg width={400} height={400} viewBox="0 0 400 400">
        <circle cx={200} cy={200} r={190} fill={BRAND.red} />
        <circle cx={200} cy={200} r={170} fill="none" stroke="white" strokeWidth={4} strokeDasharray="6 10" />
        <circle cx={200} cy={200} r={150} fill="none" stroke="white" strokeWidth={2} />
        <path d="M 150 135 L 185 170 L 255 100" stroke="white" strokeWidth={16} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text x={200} y={250} textAnchor="middle" fontFamily={headingFont} fontWeight={900} fontSize={68} fill="white" direction="rtl">
          ضمان
        </text>
        <text x={200} y={315} textAnchor="middle" fontFamily={bodyFont} fontWeight={600} fontSize={46} fill="white" direction="rtl">
          مدى الحياة
        </text>
      </svg>
    </div>
  );
};
