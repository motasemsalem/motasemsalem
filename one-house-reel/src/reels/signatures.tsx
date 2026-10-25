import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { backOut, clamp, easeInOut, easeOut, pop } from "../cues";
import { bodyFont, BRAND, headingFont, SHADOW } from "../theme";

// The one graphic that gives each voiced reel its own look on top of the shared footage grade:
// scan (an inspection viewfinder), stamp (wrong / right stamps), depth (a depth gauge going down),
// stages (a five-step bar lighting up), chat (questions as message bubbles).

const GREEN = "#2ecc71";

const fade = (f: number, from: number, to: number) => pop(f, from - 4, 10) * (1 - pop(f, to - 6, 8, easeInOut));

// Inspection viewfinder: corner brackets, a sweeping scan line, and a tally of checks done.
export const Scan: React.FC<{ readonly from: number; readonly to: number; readonly checks: readonly number[] }> = ({ from, to, checks }) => {
  const f = useCurrentFrame();
  if (f < from - 6 || f > to + 4) return null;
  const o = fade(f, from, to);
  const sweep = ((f - from) % 70) / 70;
  const done = checks.filter((c) => f >= c).length;
  const box = { left: 90, top: 260, right: 90, height: 780 };
  const L = 70;
  const corner = (style: React.CSSProperties) => <div style={{ position: "absolute", width: L, height: L, borderColor: "rgba(255,255,255,0.9)", borderStyle: "solid", borderWidth: 0, ...style }} />;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <div style={{ position: "absolute", left: box.left, right: box.right, top: box.top, height: box.height }}>
        {corner({ left: 0, top: 0, borderLeftWidth: 6, borderTopWidth: 6 })}
        {corner({ right: 0, top: 0, borderRightWidth: 6, borderTopWidth: 6 })}
        {corner({ left: 0, bottom: 0, borderLeftWidth: 6, borderBottomWidth: 6 })}
        {corner({ right: 0, bottom: 0, borderRightWidth: 6, borderBottomWidth: 6 })}
        <div style={{ position: "absolute", left: 12, right: 12, top: `${sweep * 100}%`, height: 3, background: "linear-gradient(90deg, rgba(95,200,255,0), rgba(95,200,255,0.9), rgba(95,200,255,0))", boxShadow: "0 0 24px rgba(95,200,255,0.8)" }} />
      </div>
      <div dir="rtl" style={{ position: "absolute", top: box.top - 74, right: box.right, display: "flex", alignItems: "center", gap: 14, fontFamily: bodyFont, fontWeight: 700, fontSize: 30, color: "white", textShadow: SHADOW }}>
        <div style={{ width: 16, height: 16, borderRadius: 8, background: BRAND.red, opacity: 0.5 + 0.5 * Math.sin(f / 5) }} />
        كشف على الحديد
      </div>
      <div dir="rtl" style={{ position: "absolute", top: box.top - 74, left: box.left, display: "flex", gap: 10 }}>
        {checks.map((c, i) => (
          <div key={i} style={{ width: 40, height: 40, borderRadius: 10, border: "3px solid rgba(255,255,255,0.8)", background: i < done ? GREEN : "rgba(2,10,22,0.4)", transform: `scale(${i < done ? 0.9 + 0.1 * pop(f, c, 10, backOut) : 1})`, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontFamily: headingFont, fontWeight: 800, fontSize: 24 }}>
            {i < done ? "✓" : i + 1}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// A rubber stamp slammed onto the frame: red «غلط» on each mistake, green «الصح» on the fix.
export const Stamp: React.FC<{ readonly at: number; readonly to: number; readonly good?: boolean }> = ({ at, to, good }) => {
  const f = useCurrentFrame();
  if (f < at - 2 || f > to + 4) return null;
  const hit = pop(f, at, 8, backOut);
  const o = 1 - pop(f, to - 6, 8, easeInOut);
  const color = good ? GREEN : BRAND.red;
  return (
    <div
      style={{
        position: "absolute",
        top: 470,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity: o * Math.min(1, hit * 1.4),
        transform: `rotate(${good ? 4 : -8}deg) scale(${2.2 - 1.2 * hit})`,
      }}
    >
      <div dir="rtl" style={{ padding: "18px 54px", border: `9px solid ${color}`, borderRadius: 26, color, fontFamily: headingFont, fontWeight: 900, fontSize: 120, background: "rgba(2,10,22,0.35)", boxShadow: `0 0 50px ${color}55`, textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
        {good ? "الصح ✓" : "غلط ✕"}
      </div>
    </div>
  );
};

// A depth gauge down the left edge: the marker sinks section by section, past the soil layers.
export const Depth: React.FC<{ readonly from: number; readonly to: number; readonly steps: readonly { readonly at: number; readonly depth: number; readonly label: string }[] }> = ({ from, to, steps }) => {
  const f = useCurrentFrame();
  if (f < from - 6 || f > to + 4) return null;
  const o = fade(f, from, to);
  const MAX = 3;
  const top = 250;
  const H = 820;
  let d = 0;
  for (const s of steps) d = interpolate(f, [s.at - 10, s.at + 14], [d, s.depth], { ...clamp, easing: easeOut });
  const y = top + (d / MAX) * H;
  const layers = [
    { from: 0, to: 0.8, color: "rgba(176,134,92,0.55)", name: "ردم" },
    { from: 0.8, to: 1.9, color: "rgba(120,92,64,0.55)", name: "طمي" },
    { from: 1.9, to: 3, color: "rgba(214,184,128,0.55)", name: "رمل" },
  ];
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <div style={{ position: "absolute", left: 50, top, width: 26, height: H, borderRadius: 13, overflow: "hidden", border: "2px solid rgba(255,255,255,0.7)" }}>
        {layers.map((l) => (
          <div key={l.name} style={{ position: "absolute", left: 0, right: 0, top: (l.from / MAX) * H, height: ((l.to - l.from) / MAX) * H, background: l.color }} />
        ))}
      </div>
      {[0, 1, 2, 3].map((m) => (
        <div key={m} style={{ position: "absolute", left: 84, top: top + (m / MAX) * H - 14, fontFamily: bodyFont, fontWeight: 600, fontSize: 24, color: "rgba(255,255,255,0.8)", textShadow: SHADOW }}>
          {m === 0 ? "0.0" : `-${m}.0`} م
        </div>
      ))}
      {layers.map((l) => (
        <div key={l.name} style={{ position: "absolute", left: 84, top: top + (((l.from + l.to) / 2) / MAX) * H - 16, fontFamily: bodyFont, fontWeight: 700, fontSize: 26, color: "white", opacity: d >= l.from ? 1 : 0.35, textShadow: SHADOW }}>
          {l.name}
        </div>
      ))}
      <div style={{ position: "absolute", left: 36, top: y - 4, width: 120, height: 8, borderRadius: 4, background: BRAND.red, boxShadow: "0 0 18px rgba(224,7,26,0.8)" }} />
      <div dir="rtl" style={{ position: "absolute", left: 166, top: y - 26, padding: "4px 16px", borderRadius: 10, background: BRAND.red, fontFamily: headingFont, fontWeight: 800, fontSize: 30, color: "white" }}>
        {steps.filter((s) => f >= s.at - 4).slice(-1)[0]?.label ?? ""}
      </div>
    </AbsoluteFill>
  );
};

// Five stages along the top, each lighting up as the narrator reaches it.
export const Stages: React.FC<{ readonly from: number; readonly to: number; readonly stages: readonly { readonly at: number; readonly label: string }[] }> = ({ from, to, stages }) => {
  const f = useCurrentFrame();
  if (f < from - 6 || f > to + 4) return null;
  const o = fade(f, from, to);
  const current = stages.filter((s) => f >= s.at).length - 1;
  return (
    <div dir="rtl" style={{ position: "absolute", top: 200, left: 50, right: 50, opacity: o, display: "flex", gap: 10 }}>
      {stages.map((s, i) => {
        const on = pop(f, s.at - 2, 12, easeOut);
        const active = i === current;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
            <div style={{ width: "100%", height: 12, borderRadius: 6, background: "rgba(255,255,255,0.25)", overflow: "hidden" }}>
              <div style={{ width: `${on * 100}%`, height: "100%", background: active ? BRAND.red : "#e8c58a" }} />
            </div>
            <div style={{ fontFamily: headingFont, fontWeight: 800, fontSize: active ? 34 : 28, color: on > 0 ? "white" : "rgba(255,255,255,0.45)", textShadow: SHADOW, whiteSpace: "nowrap" }}>
              {i + 1}. {s.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// A question as an incoming message: typing dots, then the bubble with its number.
export const Bubble: React.FC<{ readonly from: number; readonly to: number; readonly n: number; readonly text: string; readonly detail?: string; readonly detailAt?: number }> = ({ from, to, n, text, detail, detailAt }) => {
  const f = useCurrentFrame();
  if (f < from - 6 || f > to + 6) return null;
  const typing = f < from + 8;
  const p = pop(f, from + 6, 14, backOut);
  const out = pop(f, to - 4, 8, easeInOut);
  return (
    <div dir="rtl" style={{ position: "absolute", top: 1080, left: 70, right: 70, opacity: 1 - out, transform: `translateY(${-out * 30}px)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <div style={{ width: 64, height: 64, borderRadius: 32, background: BRAND.red, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: headingFont, fontWeight: 900, fontSize: 34, boxShadow: "0 8px 24px rgba(224,7,26,0.5)" }}>
          {n}
        </div>
        <div style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 30, color: "rgba(255,255,255,0.9)", textShadow: SHADOW }}>سؤال {n} من 5</div>
      </div>
      {typing ? (
        <div style={{ display: "inline-flex", gap: 12, padding: "26px 34px", borderRadius: "40px 40px 40px 12px", background: "white" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ width: 18, height: 18, borderRadius: 9, background: "#9aa4b2", transform: `translateY(${-8 * Math.max(0, Math.sin((f - from) / 3 - i))}px)` }} />
          ))}
        </div>
      ) : (
        <div style={{ transform: `scale(${0.85 + 0.15 * p})`, transformOrigin: "right bottom", opacity: Math.min(1, p * 1.5) }}>
          <div style={{ display: "inline-block", maxWidth: 900, padding: "30px 42px", borderRadius: "44px 44px 44px 12px", background: "white", color: BRAND.deep, fontFamily: headingFont, fontWeight: 800, fontSize: 64, lineHeight: 1.3, boxShadow: "0 20px 60px rgba(0,0,0,0.45)" }}>
            {text}
          </div>
          {detail && detailAt !== undefined && (
            <div style={{ marginTop: 16, opacity: pop(f, detailAt, 10), fontFamily: bodyFont, fontWeight: 600, fontSize: 40, color: "white", textShadow: SHADOW }}>{detail}</div>
          )}
        </div>
      )}
    </div>
  );
};
