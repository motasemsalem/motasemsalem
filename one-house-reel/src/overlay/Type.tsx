import { interpolate, useCurrentFrame } from "remotion";
import { backOut, clamp, easeOut, pop } from "../cues";
import { bodyFont, BRAND, headingFont } from "../theme";

// A headline beat: kicker above, a big title with one word on a red block, optional line below.
// It slides in on `from` and out on `to`.
export const Beat: React.FC<{
  readonly from: number;
  readonly to: number;
  readonly kicker?: string;
  readonly title: string;
  readonly accent?: string;
  readonly sub?: string;
  readonly subAt?: number;
  readonly size?: number;
  readonly top?: number;
}> = ({ from, to, kicker, title, accent, sub, subAt, size = 104, top = 250 }) => {
  const frame = useCurrentFrame();
  if (frame < from - 2 || frame > to + 8) return null;
  const inP = pop(frame, from - 2, 12, backOut);
  const out = pop(frame, to, 8);
  const block = pop(frame, from + 4, 10, easeOut);
  const parts = accent ? title.split(accent) : [title];
  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        top,
        left: 70,
        right: 70,
        textAlign: "center",
        opacity: interpolate(inP, [0, 0.3], [0, 1], clamp) * (1 - out),
        transform: `translateY(${(1 - inP) * 60 - out * 50}px)`,
      }}
    >
      {kicker && (
        <div style={{ fontFamily: bodyFont, fontWeight: 600, fontSize: 46, color: "rgba(255,255,255,0.9)", textShadow: SHADOW, marginBottom: 6 }}>{kicker}</div>
      )}
      <div style={{ fontFamily: headingFont, fontWeight: 900, fontSize: size, lineHeight: 1.18, color: "white", textShadow: SHADOW }}>
        {parts[0]}
        {accent && (
          <span style={{ position: "relative", display: "inline-block", padding: "0 18px" }}>
            <span
              style={{
                position: "absolute",
                inset: "8% 0 4% 0",
                background: BRAND.red,
                borderRadius: 14,
                transform: `scaleX(${block})`,
                transformOrigin: "right",
                boxShadow: "0 16px 50px rgba(224,7,26,0.55)",
              }}
            />
            <span style={{ position: "relative", textShadow: "none" }}>{accent}</span>
          </span>
        )}
        {parts[1]}
      </div>
      {sub && (
        <div
          style={{
            marginTop: 8,
            fontFamily: headingFont,
            fontWeight: 700,
            fontSize: size * 0.55,
            color: "white",
            textShadow: SHADOW,
            opacity: pop(frame, subAt ?? from + 10, 10),
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
};

export const SHADOW = "0 6px 30px rgba(0,0,0,0.65), 0 2px 6px rgba(0,0,0,0.5)";

// "01 · الأساس" chapter marker at the top.
export const Chapter: React.FC<{ readonly num: string; readonly label: string; readonly from: number; readonly to: number }> = ({ num, label, from, to }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to + 8) return null;
  const p = pop(frame, from, 12) * (1 - pop(frame, to, 8));
  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        top: 110,
        right: 70,
        display: "flex",
        alignItems: "center",
        gap: 16,
        opacity: p,
        transform: `translateX(${(1 - p) * 60}px)`,
      }}
    >
      <div style={{ fontFamily: headingFont, fontWeight: 900, fontSize: 44, color: "white", background: BRAND.red, borderRadius: 12, padding: "2px 16px" }}>{num}</div>
      <div style={{ fontFamily: headingFont, fontWeight: 700, fontSize: 40, color: "white", textShadow: SHADOW }}>{label}</div>
      <div style={{ width: 160 * p, height: 4, background: "rgba(255,255,255,0.7)", borderRadius: 2 }} />
    </div>
  );
};

// A checklist line that pops in with a tick.
export const Tick: React.FC<{ readonly at: number; readonly label: string; readonly active?: boolean }> = ({ at, label, active }) => {
  const frame = useCurrentFrame();
  const p = pop(frame, at - 3, 10, backOut);
  if (frame < at - 3) return null;
  return (
    <div
      dir="rtl"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "14px 28px",
        borderRadius: 20,
        background: active ? BRAND.red : "rgba(4,16,34,0.72)",
        border: "2px solid rgba(255,255,255,0.22)",
        backdropFilter: "blur(8px)",
        fontFamily: headingFont,
        fontWeight: 800,
        fontSize: 50,
        color: "white",
        opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
        transform: `translateX(${(1 - p) * 140}px) scale(${0.85 + 0.15 * p})`,
      }}
    >
      <svg width={50} height={50} viewBox="0 0 40 40">
        <circle cx={20} cy={20} r={19} fill={active ? "white" : BRAND.red} />
        <path
          d="M 11 21 L 18 28 L 30 13"
          stroke={active ? BRAND.red : "white"}
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - pop(frame, at + 3, 8)}
        />
      </svg>
      {label}
    </div>
  );
};
