import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, progress} from '../anim';
import {bodyFont, C, headingFont} from '../theme';
import {Backdrop} from './Backdrop';
import {Words} from './Words';

const STEM_X = 520;
const STEM_BOTTOM = 900;
const TODAY_Y = 130;

// Branches leave the stem at `from` and die out at `to`; higher means closer to today.
const BRANCHES = [
  {name: 'أرديبيثيكوس', from: 840, to: 730, dx: -300},
  {name: 'أسترالوبيثيكوس', from: 790, to: 600, dx: 320},
  {name: 'بارانثروبوس', from: 700, to: 480, dx: 300},
  {name: 'الإنسان الماهر', from: 650, to: 520, dx: -330},
  {name: 'الإنسان المنتصب', from: 560, to: 300, dx: -360},
  {name: 'إنسان هايدلبرغ', from: 430, to: 330, dx: 230},
  {name: 'إنسان فلوريس', from: 410, to: 210, dx: -210},
  {name: 'النياندرتال', from: 330, to: 190, dx: 330},
  {name: 'الدينيسوفان', from: 300, to: 250, dx: 140},
];

export const Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const stem = progress(frame, 0, 90);
  const fadeExtinct = progress(frame, 110, 30);
  const sapiens = progress(frame, 120, 30);
  const out = interpolate(frame, [durationInFrames - 25, durationInFrames], [1, 0], clamp);
  const stemTop = interpolate(stem, [0, 1], [STEM_BOTTOM, TODAY_Y]);
  return (
    <AbsoluteFill style={{opacity: out}}>
      <Backdrop />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <line x1={120} x2={960} y1={TODAY_Y} y2={TODAY_Y} stroke={C.line} strokeWidth={2} strokeDasharray="8 10" opacity={sapiens} />
        <text x={130} y={TODAY_Y - 18} textAnchor="start" direction="ltr" fontFamily={bodyFont} fontSize={28} fill={C.dim} opacity={sapiens}>
          اليوم
        </text>
        {BRANCHES.map((b, i) => {
          const p = progress(frame, 10 + i * 8, 34);
          const x = STEM_X + b.dx;
          const color = interpolate(fadeExtinct, [0, 1], [1, 0.32]);
          return (
            <g key={b.name} opacity={stemTop <= b.from ? color : 0}>
              <path
                d={`M ${STEM_X} ${b.from} C ${STEM_X} ${b.from - 60} ${x} ${b.to + 80} ${x} ${b.to}`}
                fill="none"
                stroke={C.muted}
                strokeWidth={7}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray="1 1"
                strokeDashoffset={1 - p}
              />
              <circle cx={x} cy={b.to} r={10 * progress(frame, 34 + i * 8, 12)} fill={C.muted} />
              <text
                x={x}
                y={b.to - 26}
                textAnchor="middle"
                direction="rtl"
                fontFamily={bodyFont}
                fontWeight={600}
                fontSize={28}
                fill={C.text}
                opacity={progress(frame, 34 + i * 8, 12)}
              >
                {b.name}
              </text>
            </g>
          );
        })}
        <line x1={STEM_X} x2={STEM_X} y1={STEM_BOTTOM} y2={stemTop} stroke={sapiens > 0.5 ? C.accent : C.muted} strokeWidth={12} strokeLinecap="round" />
        <circle cx={STEM_X} cy={TODAY_Y} r={22 * sapiens} fill={C.accent} style={{filter: `drop-shadow(0 0 24px ${C.accent})`}} />
        <text x={STEM_X} y={TODAY_Y - 44} textAnchor="middle" direction="rtl" fontFamily={headingFont} fontWeight={800} fontSize={48} fill={C.accent} opacity={sapiens}>
          الإنسان العاقل
        </text>
      </svg>
      <AbsoluteFill dir="rtl" lang="ar" style={{padding: '0 130px', justifyContent: 'center'}}>
        <div style={{width: 760, display: 'flex', flexDirection: 'column', gap: 28}}>
          <Words text="التطور ليس سُلّمًا مستقيمًا" start={10} style={{fontFamily: headingFont, fontWeight: 800, fontSize: 88, lineHeight: 1.25, color: C.text}} />
          <Words text="بل شجرة كثيرة الفروع" start={40} style={{fontFamily: headingFont, fontWeight: 500, fontSize: 60, color: C.accent2}} />
          <Words
            text="عاشت أنواع كثيرة من البشر، وبعضها في الزمن نفسه، ونحن الفرع الوحيد الذي بقي."
            start={130}
            stagger={3}
            style={{fontFamily: bodyFont, fontSize: 42, lineHeight: 1.6, color: C.muted}}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
