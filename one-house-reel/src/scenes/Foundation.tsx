import { AbsoluteFill, useCurrentFrame } from "remotion";
import { at, easeInOut, progress } from "../anim";
import { Backdrop } from "../components/Backdrop";
import { Captions } from "../components/Captions";
import { Callout, ChapterHeader, PhotoCard } from "../components/Kit";
import { Sfx, Voice } from "../components/Sound";
import { bodyFont, C } from "../theme";

// Blueprint cross-section of a footing: soil, lean concrete, reinforced footing, column neck.
const Section: React.FC<{ readonly pc: number; readonly rc: number; readonly neck: number; readonly frame: number }> = ({
  pc,
  rc,
  neck,
  frame,
}) => {
  const draw = (p: number) => ({ pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - p });
  const labelOpacity = (p: number) => Math.min(1, Math.max(0, (p - 0.6) / 0.4));
  return (
    <svg width={540} height={420} viewBox="0 0 540 420">
      <rect x={0} y={0} width={540} height={420} rx={24} fill="rgba(4,22,45,0.92)" stroke="rgba(95,168,255,0.6)" strokeWidth={2} />
      <text x={510} y={50} textAnchor="end" fontFamily={bodyFont} fontWeight={600} fontSize={30} fill={C.blueprint} direction="rtl">
        قطاع في القاعدة
      </text>
      {/* soil hatch */}
      {Array.from({ length: 16 }, (_, i) => (
        <line key={i} x1={20 + i * 32} y1={380} x2={44 + i * 32} y2={356} stroke="rgba(216,163,90,0.45)" strokeWidth={2} />
      ))}
      <line x1={20} y1={356} x2={520} y2={356} stroke="rgba(216,163,90,0.8)" strokeWidth={2} />
      {/* lean concrete (PC) */}
      <rect x={70} y={330} width={260} height={26} fill={`rgba(185,179,167,${0.35 * pc})`} stroke={C.concrete} strokeWidth={3} {...draw(pc)} />
      {/* reinforced footing (RC) */}
      <rect x={95} y={258} width={210} height={72} fill={`rgba(220,220,230,${0.25 * rc})`} stroke="white" strokeWidth={3} {...draw(rc)} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <circle key={i} cx={115 + i * 34} cy={316} r={5} fill={C.red} opacity={rc} />
      ))}
      {/* column neck */}
      <rect x={175} y={110 + (1 - neck) * 148} width={50} height={148 * neck} fill="rgba(224,7,26,0.25)" stroke={C.red} strokeWidth={3} />
      {neck > 0.2 &&
        [188, 212].map((x) => (
          <line key={x} x1={x} y1={258} x2={x} y2={258 - 170 * neck} stroke={C.red} strokeWidth={4} />
        ))}
      {/* labels */}
      <g fontFamily={bodyFont} fontWeight={600} fontSize={26} fill="white" textAnchor="start">
        <text x={345} y={350} opacity={labelOpacity(pc)}>نضافة</text>
        <text x={320} y={300} opacity={labelOpacity(rc)}>قاعدة مسلحة</text>
        <text x={240} y={150} opacity={labelOpacity(neck)}>رقبة العمود</text>
      </g>
      <circle cx={30} cy={40} r={6} fill={C.red} opacity={Math.floor(frame / 15) % 2 ? 1 : 0.3} />
    </svg>
  );
};

export const Foundation: React.FC = () => {
  const frame = useCurrentFrame();
  const dig = at("foundation", "حفر");
  const pc = at("foundation", "وخرسانة");
  const rc = at("foundation", "وقواعد");
  const calc = at("foundation", "بالحساب");
  const strong = at("foundation", "البيت");
  const sec = progress(frame, dig, 16, easeInOut);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Backdrop />
      <ChapterHeader num="01" kicker="المرحلة الأولى" title="الأساسات" />
      <PhotoCard src="photos/foundation-site.jpg" x={70} y={470} w={940} h={940} start={6} duration={340} panY={-30}>
        <Callout x={600} y={520} lx={820} ly={760} label="قواعد مسلحة" start={rc + 4} />
        <Callout x={540} y={250} lx={220} ly={150} label="شدة الأعمدة" start={strong} />
      </PhotoCard>
      <div
        style={{
          position: "absolute",
          left: 40,
          top: 1010,
          transform: `translateX(${(1 - sec) * -560}px) rotate(${(1 - sec) * -6}deg)`,
          opacity: sec,
          filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.6))",
        }}
      >
        <Section
          frame={frame}
          pc={progress(frame, pc, 26, easeInOut)}
          rc={progress(frame, rc, 30, easeInOut)}
          neck={progress(frame, calc, 30, easeInOut)}
        />
      </div>
      <Captions id="foundation" />
      <Voice id="foundation" />
      <Sfx name="whoosh" at={0} volume={0.3} />
      <Sfx name="hammer" at={dig} volume={0.25} />
      <Sfx name="swoosh" at={dig} volume={0.3} />
      <Sfx name="blip" at={pc} volume={0.3} />
      <Sfx name="blip" at={rc} volume={0.3} />
      <Sfx name="pop" at={rc + 18} volume={0.35} />
      <Sfx name="blip" at={calc} volume={0.3} />
      <Sfx name="pop" at={strong + 14} volume={0.35} />
    </AbsoluteFill>
  );
};
