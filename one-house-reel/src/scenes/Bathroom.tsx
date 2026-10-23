import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { at, backOut, clamp, easeInOut, progress, rand } from "../anim";
import { Backdrop } from "../components/Backdrop";
import { Captions } from "../components/Captions";
import { ChapterHeader } from "../components/Kit";
import { Sfx } from "../components/Sound";
import { C, headingFont } from "../theme";

// A bathroom vanity unit drawn in line-art, then filled; water bounces off it.
const Vanity: React.FC<{ readonly draw: number; readonly fill: number; readonly frame: number; readonly rain: number }> = ({
  draw,
  fill,
  frame,
  rain,
}) => {
  const line = (p: number) => ({ pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - p });
  const drops = Array.from({ length: 22 }, (_, i) => i);
  return (
    <svg width={900} height={900} viewBox="0 0 900 900">
      <defs>
        <linearGradient id="wood" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f1e6d4" />
          <stop offset="1" stopColor="#d8c6a8" />
        </linearGradient>
        <linearGradient id="mirror" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#bfe3ff" />
          <stop offset="0.5" stopColor="#7fb3e0" />
          <stop offset="1" stopColor="#3f6f9e" />
        </linearGradient>
      </defs>
      {/* mirror */}
      <rect x={250} y={40} width={400} height={250} rx={30} fill="url(#mirror)" fillOpacity={fill} stroke="white" strokeWidth={6} {...line(draw)} />
      <path d={`M ${300 + fill * 40} 80 L ${380 + fill * 40} 80 L ${300 + fill * 40} 200 Z`} fill="white" opacity={0.35 * fill} />
      {/* faucet */}
      <path d="M 450 360 V 320 Q 450 300 470 300 H 500" stroke="white" strokeWidth={10} fill="none" strokeLinecap="round" {...line(draw)} />
      {/* sink bowl */}
      <path d="M 330 380 Q 450 450 570 380 Z" fill="white" fillOpacity={fill} stroke="white" strokeWidth={6} {...line(draw)} />
      {/* countertop */}
      <rect x={150} y={380} width={600} height={40} rx={10} fill={C.paper} fillOpacity={fill} stroke="white" strokeWidth={6} {...line(draw)} />
      {/* cabinet */}
      <rect x={180} y={420} width={540} height={320} rx={16} fill="url(#wood)" fillOpacity={fill} stroke="white" strokeWidth={6} {...line(draw)} />
      <line x1={450} y1={440} x2={450} y2={720} stroke={fill > 0.5 ? "#b89f7c" : "white"} strokeWidth={4} {...line(draw)} />
      <rect x={415} y={560} width={12} height={70} rx={6} fill={C.red} opacity={fill} />
      <rect x={473} y={560} width={12} height={70} rx={6} fill={C.red} opacity={fill} />
      <rect x={200} y={740} width={500} height={24} rx={8} fill="#8a7658" fillOpacity={fill} />
      {/* water: drops fall onto the unit and bounce off */}
      {rain > 0 &&
        drops.map((i) => {
          const period = 26 + rand(i) * 14;
          const t = ((frame + rand(i + 3) * period) % period) / period;
          const x = 200 + rand(i + 7) * 500;
          const surface = x > 330 && x < 570 ? 400 : 380;
          const fall = t < 0.7;
          const y = fall ? -40 + (surface + 40) * (t / 0.7) ** 2 : surface - Math.sin(((t - 0.7) / 0.3) * Math.PI) * 50;
          const dx = fall ? 0 : ((t - 0.7) / 0.3) * (rand(i + 11) > 0.5 ? 60 : -60);
          return (
            <path
              key={i}
              d="M 0 -18 Q 10 0 0 8 Q -10 0 0 -18 Z"
              transform={`translate(${x + dx} ${y}) scale(${fall ? 1 : 0.6})`}
              fill="#7fd0ff"
              opacity={rain * (fall ? 0.9 : 1 - (t - 0.7) / 0.3)}
            />
          );
        })}
    </svg>
  );
};

export const Bathroom: React.FC = () => {
  const frame = useCurrentFrame();
  const unit = at("bathroom", "لوحدات");
  const water = at("bathroom", "مقاومة");
  const warranty = at("bathroom", "وبضمان");
  const stamp = progress(frame, warranty - 2, 10, backOut);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Backdrop />
      <ChapterHeader num="06" kicker="تصنيع ون هاوس" title="مصنعنا الخاص" />
      <div style={{ position: "absolute", left: 90, top: 470, transform: `scale(${interpolate(frame, [0, 170], [0.92, 1.02])})` }}>
        <Vanity
          frame={frame}
          draw={progress(frame, 4, unit, easeInOut)}
          fill={progress(frame, unit, 14)}
          rain={progress(frame, water - 6, 8) * (1 - progress(frame, warranty + 10, 10))}
        />
      </div>
      <div
        dir="rtl"
        style={{
          position: "absolute",
          top: 1210,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          opacity: progress(frame, water, 8) * (1 - progress(frame, warranty, 6)),
        }}
      >
        <div style={{ padding: "14px 34px", borderRadius: 999, background: "rgba(127,208,255,0.18)", border: "3px solid #7fd0ff", fontFamily: headingFont, fontWeight: 800, fontSize: 56, color: "white" }}>
          مقاومة للمية 100%
        </div>
      </div>
      {/* Lifetime warranty stamp */}
      {frame >= warranty - 2 && (
        <div
          style={{
            position: "absolute",
            left: 540 - 230,
            top: 760,
            width: 460,
            height: 520,
            transform: `scale(${interpolate(stamp, [0, 1], [2.6, 1])}) rotate(${-8 + 8 * stamp}deg)`,
            opacity: interpolate(stamp, [0, 0.3], [0, 1], clamp),
            filter: "drop-shadow(0 30px 60px rgba(224,7,26,0.55))",
          }}
        >
          <svg width={460} height={520} viewBox="0 0 460 520">
            <path d="M 230 10 L 440 80 L 420 300 Q 390 450 230 510 Q 70 450 40 300 L 20 80 Z" fill={C.red} stroke="white" strokeWidth={10} />
            <path d="M 230 50 L 400 106 L 384 292 Q 360 416 230 466 Q 100 416 76 292 L 60 106 Z" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={4} />
            <path d="M 150 190 L 205 245 L 315 135" stroke="white" strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <text x={230} y={340} textAnchor="middle" fontFamily={headingFont} fontWeight={900} fontSize={64} fill="white" direction="rtl">
              ضمان
            </text>
            <text x={230} y={415} textAnchor="middle" fontFamily={headingFont} fontWeight={800} fontSize={52} fill="white" direction="rtl">
              مدى الحياة
            </text>
          </svg>
        </div>
      )}
      <Captions id="bathroom" y={1520} />
      <Sfx name="whoosh" at={0} volume={0.1} />
      <Sfx name="typing" at={8} volume={0.15} />
      <Sfx name="pop" at={unit} volume={0.35} />
      <Sfx name="swoosh" at={water - 6} volume={0.3} />
      <Sfx name="stamp" at={warranty + 4} volume={0.6} />
      <Sfx name="impact" at={warranty + 4} volume={0.35} />
      <Sfx name="chime" at={warranty + 12} volume={0.25} />
    </AbsoluteFill>
  );
};
