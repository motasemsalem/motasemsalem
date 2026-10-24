import { shine } from "@remotion/effects/shine";
import { useContext } from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { backOut, C, clamp, cue, easeInOut, easeOut, pop, ramp, TOTAL } from "../cues";
import { Title } from "../overlay/Cine";
import { bodyFont, headingFont, SHADOW } from "../theme";
import { ArtOnly, P, Scene } from "./kit";

// ---------- Engineer review + photo updates ----------
const STAGES = ["الأساس", "الأعمدة", "السقف", "الخرسانة"];

export const Review: React.FC = () => {
  const frame = useCurrentFrame();
  const from = C.review;
  const to = C.studio;
  const phone = pop(frame, C.follow - 4, 16, easeOut);
  const board = 1 - 0.35 * phone;
  return (
    <>
      <Scene from={from} to={to - 1} zoom={[1, 1.03]}>
        {/* Clipboard with the four stages ticked, a signature and a stamp. */}
        <div
          dir="rtl"
          style={{
            position: "absolute",
            left: 150,
            top: 470,
            width: 780,
            height: 760,
            borderRadius: 34,
            background: "#f8fafc",
            boxShadow: "0 40px 90px rgba(0,0,0,0.5)",
            transform: `translate(${phone * -150}px, ${phone * -60}px) scale(${board}) rotate(${phone * -6}deg)`,
            transformOrigin: "50% 30%",
            opacity: pop(frame, from - 2, 12),
            padding: "46px 56px",
            boxSizing: "border-box",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: headingFont, fontWeight: 800, fontSize: 46, color: P.navy }}>
            <svg width={64} height={64} viewBox="0 0 64 64">
              <path d="M 8 40 A 24 24 0 0 1 56 40 Z" fill="#ffd166" stroke={P.navy} strokeWidth={3} />
              <rect x={4} y={40} width={56} height={8} rx={4} fill="#ffd166" stroke={P.navy} strokeWidth={3} />
            </svg>
            مراجعة المهندس
          </div>
          <div style={{ height: 3, background: "#e2e8f0", margin: "22px 0 18px" }} />
          {STAGES.map((s, i) => {
            const at = from + 4 + i * 7;
            const p = pop(frame, at, 8, backOut);
            return (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 22, padding: "16px 0", borderBottom: "2px dashed #e2e8f0" }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, border: `4px solid ${P.navy}`, display: "flex", alignItems: "center", justifyContent: "center", background: p > 0 ? P.ok : "white", borderColor: p > 0 ? P.ok : P.navy }}>
                  <svg width={36} height={36} viewBox="0 0 36 36" style={{ transform: `scale(${p})` }}>
                    <path d="M 7 19 L 15 27 L 29 10" stroke="white" strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div style={{ fontFamily: headingFont, fontWeight: 700, fontSize: 48, color: P.ink }}>{s}</div>
                <div style={{ marginRight: "auto", fontFamily: bodyFont, fontWeight: 600, fontSize: 30, color: p > 0 ? P.ok : "#94a3b8" }}>{p > 0 ? "تمت" : "—"}</div>
              </div>
            );
          })}
          <svg width={668} height={150} viewBox="0 0 668 150" style={{ marginTop: 10 }}>
            <line x1={330} x2={640} y1={120} y2={120} stroke="#cbd5e1" strokeWidth={3} />
            <text x={640} y={146} textAnchor="end" fontFamily={bodyFont} fontSize={26} fill="#64748b">
              توقيع المهندس
            </text>
            <path
              d="M 620 100 C 600 40, 580 40, 570 95 C 560 130, 545 60, 530 70 C 515 80, 520 115, 500 100 C 480 85, 470 40, 455 80 C 445 110, 430 105, 410 90 C 395 80, 380 95, 350 92"
              stroke={P.navy}
              strokeWidth={5}
              fill="none"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - ramp(frame, C.sign - 2, C.sign + 14)}
            />
            <g transform={`translate(150 80) rotate(-12) scale(${interpolate(pop(frame, C.sign + 10, 8, easeOut), [0, 1], [2.4, 1])})`} opacity={pop(frame, C.sign + 10, 6)}>
              <rect x={-130} y={-50} width={260} height={100} rx={14} fill="none" stroke={P.red} strokeWidth={7} />
              <text y={16} textAnchor="middle" fontFamily={headingFont} fontWeight={900} fontSize={44} fill={P.red}>
                تمت المراجعة
              </text>
            </g>
          </svg>
        </div>
        {/* Phone receiving photo updates. */}
        {phone > 0 && (
          <div style={{ position: "absolute", left: 470, top: 640, width: 470, height: 860, borderRadius: 64, background: "#0b1626", border: "10px solid #1c2636", boxShadow: "0 50px 100px rgba(0,0,0,0.6)", transform: `translateY(${(1 - phone) * 1100}px) rotate(${(1 - phone) * 10}deg)`, overflow: "hidden" }}>
            <div style={{ height: 120, background: P.navy, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 18, boxSizing: "border-box" }}>
              <div dir="rtl" style={{ fontFamily: headingFont, fontWeight: 800, fontSize: 32, color: "white" }}>
                ون هاوس · موقعك
              </div>
            </div>
            {STAGES.map((s, i) => {
              const p = pop(frame, C.photos - 6 + i * 6, 10, backOut);
              return (
                <div key={s} dir="rtl" style={{ margin: "18px 22px 0", display: "flex", gap: 14, alignItems: "center", opacity: interpolate(p, [0, 0.3], [0, 1], clamp), transform: `translateX(${(1 - p) * 120}px)` }}>
                  <Thumb k={i} />
                  <div>
                    <div style={{ fontFamily: headingFont, fontWeight: 700, fontSize: 30, color: "white" }}>{s}</div>
                    <div style={{ fontFamily: bodyFont, fontWeight: 600, fontSize: 24, color: "#94a3b8" }}>صورة جديدة من الموقع</div>
                  </div>
                </div>
              );
            })}
            <div style={{ position: "absolute", bottom: 40, left: 30, right: 30 }}>
              <div style={{ height: 14, borderRadius: 7, background: "rgba(255,255,255,0.15)" }}>
                <div style={{ height: 14, borderRadius: 7, background: P.red, width: `${ramp(frame, C.steps - 4, C.steps + 20) * 100}%`, marginLeft: "auto" }} />
              </div>
            </div>
          </div>
        )}
      </Scene>
      <Title from={from} to={C.follow - 3} kicker="وكل مرحلة" kickerAt={from} text="مهندس يراجع ويمضي" accent="ويمضي" size={78} top={230} />
      <Title from={C.follow} to={to - 4} kicker="وإنت متابع بالصور" kickerAt={C.follow} text="خطوة بخطوة" accent="خطوة بخطوة" size={110} top={210} />
    </>
  );
};

// Tiny site-photo thumbnails for the phone feed, drawn in the same style as the scenes.
const Thumb: React.FC<{ readonly k: number }> = ({ k }) => (
  <svg width={130} height={130} viewBox="0 0 130 130" style={{ borderRadius: 18, background: "#163556", flexShrink: 0 }}>
    {k === 0 && (
      <>
        <rect x={0} y={80} width={130} height={50} fill={P.soilL} />
        <rect x={30} y={62} width={70} height={22} fill={P.concreteL} />
      </>
    )}
    {k === 1 &&
      [40, 55, 75, 90].map((x) => <line key={x} x1={x} x2={x} y1={20} y2={115} stroke={P.steel} strokeWidth={6} strokeLinecap="round" />)}
    {k === 1 && [35, 55, 75, 95].map((y) => <rect key={y} x={34} y={y} width={62} height={6} rx={3} fill="none" stroke={P.line} strokeWidth={3} />)}
    {k === 2 && (
      <>
        <rect x={10} y={40} width={110} height={18} fill={P.wood} />
        {[25, 65, 105].map((x) => (
          <rect key={x} x={x - 3} y={58} width={6} height={60} fill={P.woodL} />
        ))}
      </>
    )}
    {k === 3 && (
      <>
        <rect x={15} y={70} width={100} height={30} fill={P.concreteL} />
        {[30, 55, 80, 100].map((x) => (
          <ellipse key={x} cx={x} cy={45} rx={4} ry={9} fill={P.water} />
        ))}
      </>
    )}
  </svg>
);

// ---------- The One House 2D studio, simulated to match the real one on the website ----------
// Room sizes and colours come from the studio's code (px × 0.02 = metres).
const ROOMS = [
  { label: "صالة", w: 3.2, h: 2.4, color: "rgba(99,102,241,0.18)", x: 268, y: 170 },
  { label: "غرفة نوم", w: 2.6, h: 2.2, color: "rgba(245,158,11,0.2)", x: 40, y: 170 },
  { label: "مطبخ", w: 2.0, h: 2.0, color: "rgba(16,185,129,0.2)", x: 352, y: 352 },
  { label: "حمام", w: 1.4, h: 1.6, color: "rgba(6,182,212,0.2)", x: 124, y: 354 },
];
const PX = 76; // pixels per metre on the phone canvas
const AREA = ROOMS.reduce((a, r) => a + r.w * r.h, 0);

const Tap: React.FC<{ readonly at: number; readonly x: number; readonly y: number }> = ({ at, x, y }) => {
  const frame = useCurrentFrame();
  const t = (frame - at) / 14;
  if (t < -0.6 || t > 1) return null;
  const finger = interpolate(t, [-0.6, 0, 1], [0, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: x, top: y, pointerEvents: "none" }}>
      {t > 0 && <div style={{ position: "absolute", left: -60 * t - 20, top: -60 * t - 20, width: 40 + 120 * t, height: 40 + 120 * t, borderRadius: "50%", border: "4px solid rgba(227,30,36,0.7)", opacity: 1 - t }} />}
      <div style={{ position: "absolute", left: -6, top: -6, width: 62, height: 62, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: `4px solid ${P.navy}`, opacity: finger, transform: `scale(${0.8 + 0.2 * finger}) translate(${(1 - finger) * 60}px, ${(1 - finger) * 80}px)` }} />
    </div>
  );
};

const StudioScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const sheet = pop(frame, C.draw - 2, 8, easeOut) * (1 - pop(frame, C.draw + 6, 8));
  const exportTap = C.exportPdf + 2;
  return (
    <div style={{ position: "absolute", inset: 0, background: "#f8fafc", overflow: "hidden" }}>
      {/* Header, as on the site: back link, title, explain, red PDF button. */}
      <div dir="rtl" style={{ height: 118, background: P.navy, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "26px 22px 0", boxSizing: "border-box" }}>
        <div style={{ fontFamily: bodyFont, fontWeight: 600, fontSize: 22, color: "rgba(255,255,255,0.7)" }}>→ الرئيسية</div>
        <div style={{ fontFamily: headingFont, fontWeight: 800, fontSize: 28, color: "white", textAlign: "center", lineHeight: 1.1 }}>
          مصمم الشقق
          <br />
          2D
        </div>
        <div style={{ padding: "10px 16px", borderRadius: 12, background: P.red, fontFamily: headingFont, fontWeight: 800, fontSize: 22, color: "white", transform: `scale(${1 - 0.08 * interpolate(frame, [exportTap - 2, exportTap, exportTap + 4], [0, 1, 0], clamp)})` }}>
          تصدير PDF ⤓
        </div>
      </div>
      <div style={{ position: "absolute", top: 118, left: 0, right: 0, bottom: 0, backgroundImage: "radial-gradient(#cbd5e1 1.6px, transparent 1.8px)", backgroundSize: "20px 20px" }} />
      {/* Rooms dropping into the plan. */}
      <div style={{ position: "absolute", top: 118, left: 0, right: 0, bottom: 0 }}>
        {ROOMS.map((r, i) => {
          const at = C.draw + 10 + i * 7;
          const p = pop(frame, at, 10, backOut);
          if (p <= 0) return null;
          const dragging = i === 1;
          const drag = dragging ? ramp(frame, at + 4, at + 18) : 1;
          const x = dragging ? interpolate(drag, [0, 1], [190, r.x]) : r.x;
          const y = dragging ? interpolate(drag, [0, 1], [420, r.y]) : r.y;
          return (
            <div
              key={r.label}
              dir="rtl"
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: r.w * PX,
                height: r.h * PX,
                background: r.color,
                border: `3px solid ${dragging && drag < 1 ? P.red : "#334155"}`,
                borderRadius: 4,
                transform: `scale(${interpolate(p, [0, 1], [0.6, 1])})`,
                opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: dragging && drag < 1 ? "0 16px 30px rgba(0,0,0,0.25)" : undefined,
              }}
            >
              <div style={{ fontFamily: headingFont, fontWeight: 800, fontSize: 26, color: P.navy }}>{r.label}</div>
              <div style={{ fontFamily: bodyFont, fontWeight: 600, fontSize: 20, color: "#475569", direction: "ltr" }}>
                {r.w.toFixed(2)} × {r.h.toFixed(2)} م
              </div>
            </div>
          );
        })}
        <div dir="rtl" style={{ position: "absolute", top: 560, left: 0, right: 0, textAlign: "center", fontFamily: headingFont, fontWeight: 700, fontSize: 26, color: P.navy, opacity: pop(frame, C.draw + 40, 10) }}>
          📐 المساحة: {AREA.toFixed(2)} م²
        </div>
      </div>
      {/* Empty-canvas hint, as in the studio, until the first room lands. */}
      <div dir="rtl" style={{ position: "absolute", top: 420, left: 0, right: 0, textAlign: "center", opacity: 1 - pop(frame, C.draw + 8, 6) }}>
        <div style={{ fontSize: 90 }}>🏗️</div>
        <div style={{ fontFamily: headingFont, fontWeight: 700, fontSize: 32, color: "#94a3b8", marginTop: 10 }}>اضغط + لإضافة غرف</div>
        <div style={{ fontFamily: bodyFont, fontWeight: 600, fontSize: 24, color: "#94a3b8", marginTop: 8 }}>اسحب الغرف لترتيبها</div>
      </div>
      {/* Room picker sheet after the + tap. */}
      {sheet > 0 && (
        <div dir="rtl" style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 360, background: "white", borderRadius: "32px 32px 0 0", boxShadow: "0 -20px 40px rgba(0,0,0,0.15)", transform: `translateY(${(1 - sheet) * 380}px)`, padding: 26, boxSizing: "border-box", display: "flex", flexWrap: "wrap", gap: 14, alignContent: "flex-start" }}>
          <div style={{ width: "100%", fontFamily: headingFont, fontWeight: 800, fontSize: 28, color: P.navy }}>أضف للمخطط</div>
          {["صالة", "غرفة نوم", "مطبخ", "حمام", "غرفة إضافية", "مدخل / ممر", "باب"].map((l) => (
            <div key={l} style={{ padding: "12px 18px", borderRadius: 14, background: "#f1f5f9", fontFamily: headingFont, fontWeight: 700, fontSize: 24, color: P.navy }}>
              {l}
            </div>
          ))}
        </div>
      )}
      {/* The red + button. */}
      <div style={{ position: "absolute", left: 30, bottom: 34, width: 96, height: 96, borderRadius: "50%", background: `linear-gradient(135deg, ${P.red}, ${P.redDeep})`, boxShadow: "0 12px 30px rgba(227,30,36,0.5)", color: "white", fontSize: 64, fontWeight: 300, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: bodyFont }}>
        +
      </div>
      <Tap at={C.draw - 2} x={50} y={830} />
      <Tap at={C.draw + 26} x={190} y={450} />
      <Tap at={exportTap} x={60} y={58} />
    </div>
  );
};

// The exported PDF, modelled on the studio's own export: title, plan, room table, total area.
const PdfSheet: React.FC = () => (
  <div dir="rtl" style={{ width: 520, height: 700, background: "white", borderRadius: 14, boxShadow: "0 40px 90px rgba(0,0,0,0.5)", padding: "34px 34px", boxSizing: "border-box", fontFamily: bodyFont }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `4px solid ${P.red}`, paddingBottom: 14 }}>
      <div style={{ fontFamily: headingFont, fontWeight: 900, fontSize: 34, color: P.navy }}>مخطط الشقة 2D</div>
      <Img src={staticFile("brand/logo-color.png")} style={{ width: 120 }} />
    </div>
    <div style={{ position: "relative", height: 230, margin: "18px 0", background: "#f8fafc", border: "2px solid #e2e8f0" }}>
      {ROOMS.map((r) => (
        <div key={r.label} style={{ position: "absolute", left: r.x * 0.72 + 30, top: (r.y - 160) * 0.72 + 14, width: r.w * PX * 0.72, height: r.h * PX * 0.72, border: "2px solid #334155", background: r.color, fontSize: 16, fontWeight: 600, color: P.navy, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: headingFont }}>
          {r.label}
        </div>
      ))}
    </div>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 20, color: P.ink }}>
      <thead>
        <tr style={{ background: P.navy, color: "white" }}>
          {["اسم الغرفة", "العرض (م)", "الطول (م)", "المساحة"].map((h) => (
            <th key={h} style={{ padding: "8px 6px", fontWeight: 600 }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {ROOMS.map((r) => (
          <tr key={r.label} style={{ borderBottom: "1px solid #e2e8f0", textAlign: "center" }}>
            <td style={{ padding: "7px 4px" }}>{r.label}</td>
            <td>{r.w.toFixed(2)}</td>
            <td>{r.h.toFixed(2)}</td>
            <td>{(r.w * r.h).toFixed(2)} م²</td>
          </tr>
        ))}
        <tr style={{ background: "#fef2f2", color: P.redDeep, fontWeight: 700, textAlign: "center" }}>
          <td colSpan={3} style={{ padding: "9px 4px" }}>
            إجمالي مساحة الوحدة
          </td>
          <td>{AREA.toFixed(2)} م²</td>
        </tr>
      </tbody>
    </table>
  </div>
);

export const Studio: React.FC = () => {
  const frame = useCurrentFrame();
  const from = C.studio;
  const to = C.closing;
  const phoneIn = pop(frame, C.studioName - 6, 16, easeOut);
  const pdf = pop(frame, cue("PDF") - 4, 14, backOut);
  const send = ramp(frame, C.send, C.send + 18, easeInOut);
  const free = pop(frame, C.free - 2, 10, backOut);
  const q = pop(frame, from, 12, easeOut) * (1 - pop(frame, C.studioName - 4, 8));
  return (
    <>
      <Scene from={from} to={to - 1} zoom={[1, 1.03]}>
        {/* The question: an empty dashed plan. */}
        {q > 0 && (
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: q }}>
            <rect x={240} y={620} width={600} height={520} fill="none" stroke={P.line} strokeWidth={6} strokeDasharray="22 16" rx={6} />
            <line x1={540} y1={620} x2={540} y2={900} stroke={P.lineDim} strokeWidth={4} strokeDasharray="14 12" />
            <line x1={240} y1={900} x2={840} y2={900} stroke={P.lineDim} strokeWidth={4} strokeDasharray="14 12" />
            <text x={540} y={960} textAnchor="middle" fontFamily={headingFont} fontWeight={900} fontSize={220} fill="white" opacity={0.5 + 0.5 * Math.abs(Math.sin(frame / 8))}>
              ؟
            </text>
          </svg>
        )}
        {/* Phone running the studio. */}
        {phoneIn > 0 && (
          <div style={{ position: "absolute", left: 230, top: 420, width: 620, height: 1100, borderRadius: 76, background: "#0b1626", border: "12px solid #1c2636", boxShadow: "0 60px 120px rgba(0,0,0,0.6), inset 0 0 0 2px rgba(255,255,255,0.12)", overflow: "hidden", transform: `translateY(${(1 - phoneIn) * 1300}px) rotate(${(1 - phoneIn) * -8}deg) scale(${1 - 0.1 * send})`, opacity: 1 - 0.4 * send }}>
            <StudioScreen />
            <div style={{ position: "absolute", top: 14, left: 240, width: 116, height: 32, borderRadius: 16, background: "#000" }} />
          </div>
        )}
        {/* The PDF flies out, then off to the engineer. */}
        {pdf > 0 && (
          <div
            style={{
              position: "absolute",
              left: 280,
              top: 520,
              transform: `translate(${interpolate(send, [0, 1], [0, -330])}px, ${interpolate(send, [0, 1], [(1 - pdf) * 300, -380])}px) scale(${interpolate(pdf, [0, 1], [0.3, 1]) * interpolate(send, [0, 1], [1, 0.18])}) rotate(${interpolate(pdf, [0, 1], [-14, 4]) - send * 20}deg)`,
              opacity: interpolate(send, [0.85, 1], [1, 0], clamp),
              transformOrigin: "50% 50%",
            }}
          >
            <PdfSheet />
          </div>
        )}
        {send > 0 && (
          <div dir="rtl" style={{ position: "absolute", left: 60, top: 300, display: "flex", alignItems: "center", gap: 16, opacity: pop(frame, C.send + 6, 10), transform: `scale(${interpolate(pop(frame, C.send + 6, 10, backOut), [0, 1], [0.6, 1])})` }}>
            <div style={{ width: 110, height: 110, borderRadius: "50%", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", border: `5px solid ${P.ok}` }}>
              <svg width={70} height={70} viewBox="0 0 64 64">
                <path d="M 8 40 A 24 24 0 0 1 56 40 Z" fill="#ffd166" stroke={P.navy} strokeWidth={3} />
                <rect x={4} y={40} width={56} height={8} rx={4} fill="#ffd166" stroke={P.navy} strokeWidth={3} />
              </svg>
            </div>
            <div style={{ fontFamily: headingFont, fontWeight: 800, fontSize: 44, color: "white", textShadow: SHADOW }}>وصل للمهندس ✓</div>
          </div>
        )}
        {free > 0 && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 1180, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
            <div style={{ padding: "18px 70px", borderRadius: 26, background: P.red, fontFamily: headingFont, fontWeight: 900, fontSize: 120, color: "white", transform: `rotate(-4deg) scale(${interpolate(free, [0, 1], [2, 1])})`, opacity: interpolate(free, [0, 0.3], [0, 1], clamp), boxShadow: "0 30px 70px rgba(227,30,36,0.55)" }}>
              ببلاش!
            </div>
          </div>
        )}
      </Scene>
      <Title from={from} to={C.studioName - 4} text="شقتك هتتقسم إزاي؟" accent="إزاي؟" size={100} top={250} />
      <Title from={C.studioName} to={C.send - 2} kicker="جرّب دلوقتي" kickerAt={C.studioName} text="استوديو ون هاوس 2D" accent="2D" size={84} top={180} />
      <UrlPill from={C.send} to={to - 3} top={180} />
    </>
  );
};

const UrlPill: React.FC<{ readonly from: number; readonly to: number; readonly top: number }> = ({ from, to, top }) => {
  const frame = useCurrentFrame();
  if (useContext(ArtOnly)) return null;
  if (frame < from - 2 || frame > to + 6) return null;
  const p = pop(frame, from, 12, backOut) * (1 - pop(frame, to, 6));
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: p, transform: `translateY(${(1 - p) * -30}px)` }}>
      <div style={{ padding: "16px 34px", borderRadius: 999, background: "white", fontFamily: headingFont, fontWeight: 800, fontSize: 46, color: P.navy, direction: "ltr", boxShadow: "0 20px 50px rgba(0,0,0,0.4)" }}>
        onehouse-eg.web.app<span style={{ color: P.red }}>/studio</span>
      </div>
    </div>
  );
};

// ---------- Closing ----------
export const Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const from = C.closing;
  const logo = pop(frame, from, 16, backOut);
  const line = pop(frame, C.life - 4, 12, easeOut);
  const button = pop(frame, C.cta - 4, 14, backOut);
  const pulse = ((frame - C.cta) % 36) / 36;
  const fade = 1 - ramp(frame, TOTAL - 8, TOTAL);
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 36%, rgba(227,30,36,0.25), transparent 55%)", opacity: logo }} />
      <div style={{ position: "absolute", left: 170, top: 380, width: 740, transform: `scale(${1.2 - 0.2 * logo})`, opacity: interpolate(logo, [0, 0.4], [0, 1], clamp) }}>
        <Img src={staticFile("brand/logo-white.png")} style={{ width: 740 }} effects={[shine({ progress: interpolate(frame, [from + 6, from + 34], [0, 1], clamp), angle: 25 })]} />
      </div>
      <div dir="rtl" style={{ position: "absolute", top: 860, left: 0, right: 0, textAlign: "center", fontFamily: headingFont, fontWeight: 900, fontSize: 92, color: "white", textShadow: SHADOW, opacity: line, transform: `translateY(${(1 - line) * 30}px)` }}>
        بيت يعيش <span style={{ color: P.red }}>العمر كله</span>
      </div>
      <div style={{ position: "absolute", top: 1090, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ position: "relative", transform: `scale(${0.6 + 0.4 * button})`, opacity: interpolate(button, [0, 0.3], [0, 1], clamp) }}>
          <div style={{ position: "absolute", inset: -12 - pulse * 30, borderRadius: 999, border: `4px solid ${P.red}`, opacity: frame > C.cta ? 1 - pulse : 0 }} />
          <div dir="rtl" style={{ padding: "30px 64px", borderRadius: 999, background: P.red, boxShadow: "0 24px 60px rgba(227,30,36,0.5)", fontFamily: headingFont, fontWeight: 800, fontSize: 60, color: "white" }}>
            احجز معاينتك المجانية
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 1260, left: 0, right: 0, textAlign: "center", fontFamily: headingFont, fontWeight: 600, fontSize: 44, color: "white", direction: "ltr", opacity: pop(frame, C.cta + 8, 12) }}>
        onehouse-eg.web.app
      </div>
    </AbsoluteFill>
  );
};
