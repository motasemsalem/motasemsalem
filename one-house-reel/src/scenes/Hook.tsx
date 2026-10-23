import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { at, backOut, clamp, easeInOut, progress, rand } from "../anim";
import { Backdrop } from "../components/Backdrop";
import { IsoBuilding } from "../components/IsoBuilding";
import { Key } from "../components/Key";
import { Sfx, Voice } from "../components/Sound";
import { bodyFont, C, headingFont } from "../theme";

const PHOTOS = [
  "photos/foundation-site.jpg",
  "photos/formwork-wide.jpg",
  "photos/aerial-roof.jpg",
  "photos/foundation-columns.jpg",
  "photos/formwork-props.jpg",
  "photos/aerial-sunset.jpg",
];

// Big kinetic Arabic line with an RGB-split glitch while it lands.
const Slam: React.FC<{
  readonly text: string;
  readonly start: number;
  readonly size: number;
  readonly y: number;
  readonly color?: string;
  readonly end?: number;
}> = ({ text, start, size, y, color = C.white, end = 9999 }) => {
  const frame = useCurrentFrame();
  const p = progress(frame, start, 10, backOut);
  const glitch = interpolate(frame - start, [0, 10], [1, 0], clamp);
  const out = progress(frame, end, 8);
  if (frame < start || out >= 1) return null;
  const jx = (rand(frame) - 0.5) * 40 * glitch;
  const jy = (rand(frame + 50) - 0.5) * 20 * glitch;
  const base: React.CSSProperties = {
    position: "absolute",
    left: 0,
    right: 0,
    top: y,
    textAlign: "center",
    fontFamily: headingFont,
    fontWeight: 900,
    fontSize: size,
    lineHeight: 1.1,
  };
  const transform = `translate(${jx}px, ${jy}px) scale(${2.2 - 1.2 * p - out * 0.3})`;
  return (
    <div dir="rtl" style={{ position: "absolute", inset: 0, opacity: interpolate(p, [0, 0.3], [0, 1], clamp) * (1 - out) }}>
      <div style={{ ...base, color: "#00e5ff", transform: `${transform} translate(${-14 * glitch}px, 0)`, opacity: 0.7 * glitch, mixBlendMode: "screen" }}>{text}</div>
      <div style={{ ...base, color: C.red, transform: `${transform} translate(${14 * glitch}px, 0)`, opacity: 0.8 * glitch, mixBlendMode: "screen" }}>{text}</div>
      <div style={{ ...base, color, transform, textShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>{text}</div>
    </div>
  );
};

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const stop = at("hook", "استنّى");
  const key = at("hook", "مفتاح");
  const story = at("hook", "حكاية");
  const unseen = at("hook", "شُفتهاش");
  const dig = at("hook", "حكاية", 1);
  const pit = at("hook", "بحفرة");
  const end = at("hook", "وبتخلص");
  const keyEnd = at("hook", "بالمفتاح");

  // Phase visibility.
  const keyIn = progress(frame, key - 18, 26, backOut);
  const keyOut = progress(frame, story, 14, easeInOut);
  const montage = frame >= story && frame < dig;
  const digP = progress(frame, dig - 6, 16, easeInOut);
  const digOut = progress(frame, end, 14, easeInOut);
  const build = interpolate(frame, [end, keyEnd + 10], [0, 6.4], { ...clamp, easing: easeInOut });
  const finalKey = progress(frame, keyEnd, 18, backOut);

  const flash = Math.max(
    interpolate(frame, [stop - 1, stop, stop + 6], [0, 0.9, 0], clamp),
    interpolate(frame, [dig - 3, dig - 2, dig + 6], [0, 0.6, 0], clamp),
  );
  const shake = interpolate(frame - stop, [0, 14], [1, 0], clamp);
  const camera = `translate(${(rand(frame * 3) - 0.5) * 30 * shake}px, ${(rand(frame * 7) - 0.5) * 30 * shake}px)`;

  return (
    <AbsoluteFill style={{ backgroundColor: "black", overflow: "hidden" }}>
      <AbsoluteFill style={{ opacity: interpolate(frame, [stop, stop + 10], [0, 1], clamp), transform: camera }}>
        <Backdrop glow="rgba(224, 7, 26, 0.22)" />
      </AbsoluteFill>

      {/* 0 – stop: a blinking rec dot and a scan line on black, building suspense. */}
      {frame < stop + 4 && (
        <AbsoluteFill>
          <div style={{ position: "absolute", top: 120, right: 80, width: 26, height: 26, borderRadius: 13, background: C.red, opacity: Math.floor(frame / 6) % 2 ? 1 : 0.2 }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 960 + (rand(frame) - 0.5) * 6, height: 3, background: "rgba(255,255,255,0.6)", transform: `scaleX(${progress(frame, 0, stop)})` }} />
        </AbsoluteFill>
      )}

      <AbsoluteFill style={{ transform: camera }}>
        <Slam text="استنّى!" start={stop} size={250} y={330} color={C.red} end={story} />
        <Slam text="ثانية واحدة" start={at("hook", "ثانية")} size={86} y={640} end={story} />

        {/* The key */}
        <div
          style={{
            position: "absolute",
            left: 540 - 200,
            top: 820,
            transform: `perspective(1400px) translateY(${(1 - keyIn) * 700 - keyOut * 900}px) rotateY(${(1 - keyIn) * 260 + Math.sin(frame / 14) * 14}deg) rotateZ(${-18 + keyIn * 18}deg) scale(${0.78 - keyOut * 0.2})`,
            transformOrigin: "200px 300px",
            opacity: keyIn * (1 - keyOut),
            filter: "drop-shadow(0 40px 60px rgba(0,0,0,0.6))",
          }}
        >
          <Key shine={interpolate(frame, [key, key + 30], [0, 1], clamp)} />
        </div>
        <div
          dir="rtl"
          style={{
            position: "absolute",
            top: 1470,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: headingFont,
            fontWeight: 800,
            fontSize: 92,
            color: C.white,
            opacity: progress(frame, key, 10) * (1 - keyOut),
            transform: `translateY(${(1 - progress(frame, key, 12)) * 40}px)`,
          }}
        >
          قبل ما تستلم <span style={{ color: C.red }}>مفتاح بيتك</span>
        </div>
      </AbsoluteFill>

      {/* Strobe montage of the real sites, hidden behind frosted glass: the story you never saw. */}
      {montage && (
        <AbsoluteFill>
          <Img
            src={staticFile(PHOTOS[Math.floor((frame - story) / 5) % PHOTOS.length])}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${1.25 - progress(frame, story, dig - story) * 0.15})`,
              filter: `blur(${interpolate(frame, [story, unseen, unseen + 12], [26, 18, 0], clamp)}px) saturate(1.2)`,
            }}
          />
          <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(2,13,28,0.55), rgba(2,13,28,0.85))" }} />
          <div dir="rtl" style={{ position: "absolute", top: 640, left: 0, right: 0, textAlign: "center" }}>
            <div style={{ fontFamily: headingFont, fontWeight: 900, fontSize: 120, color: C.white, lineHeight: 1.15, transform: `scale(${0.8 + 0.2 * progress(frame, story, 10, backOut)})` }}>
              حكاية كاملة
            </div>
            <div
              style={{
                display: "inline-block",
                marginTop: 30,
                padding: "16px 44px",
                fontFamily: headingFont,
                fontWeight: 800,
                fontSize: 84,
                color: C.white,
                background: C.red,
                borderRadius: 18,
                transform: `rotate(-4deg) scale(${interpolate(progress(frame, unseen, 8, backOut), [0, 1], [2.4, 1])})`,
                opacity: progress(frame, unseen, 4),
                boxShadow: "0 20px 60px rgba(224,7,26,0.6)",
              }}
            >
              إنت ما شُفتهاش
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* Cross-section: ground line, soil strata, the pit, then the building rises out of it. */}
      {frame >= dig - 6 && (
        <AbsoluteFill style={{ opacity: digP }}>
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            <defs>
              <pattern id="soil" width={40} height={40} patternUnits="userSpaceOnUse">
                <rect width={40} height={40} fill="#6b4a2f" />
                <circle cx={8} cy={10} r={3} fill="#7d5a3c" />
                <circle cx={28} cy={26} r={4} fill="#5a3c25" />
                <circle cx={18} cy={34} r={2} fill="#8a6847" />
              </pattern>
              <clipPath id="pitClip">
                <rect x={540 - 260 * progress(frame, pit, 22, easeInOut)} y={1100} width={520 * progress(frame, pit, 22, easeInOut)} height={330} />
              </clipPath>
            </defs>
            {/* Strata slide up */}
            <g transform={`translate(0 ${(1 - digP) * 500 + digOut * 60})`}>
              <rect x={0} y={1100} width={1080} height={820} fill="url(#soil)" />
              <rect x={0} y={1300} width={1080} height={160} fill="#57391f" opacity={0.8} />
              <rect x={0} y={1460} width={1080} height={460} fill="#3e2815" opacity={0.9} />
              <line x1={0} y1={1100} x2={1080} y2={1100} stroke={C.white} strokeWidth={6} strokeDasharray="30 14" />
              {/* The pit, with the real foundation photo inside it */}
              <g clipPath="url(#pitClip)">
                <image href={staticFile("photos/foundation-site.jpg")} x={280} y={980} width={520} height={600} preserveAspectRatio="xMidYMid slice" />
                <rect x={280} y={1100} width={520} height={330} fill="none" stroke={C.red} strokeWidth={10} />
              </g>
              {/* Depth dimension line */}
              <g opacity={progress(frame, pit + 14, 12)}>
                <line x1={850} y1={1100} x2={850} y2={1430} stroke="white" strokeWidth={3} />
                <path d="M 838 1116 L 850 1100 L 862 1116 M 838 1414 L 850 1430 L 862 1414" stroke="white" strokeWidth={3} fill="none" />
                <text x={880} y={1280} fill="white" fontFamily={bodyFont} fontWeight={600} fontSize={40}>العمق</text>
              </g>
              {/* The building rising from the pit */}
              <g opacity={interpolate(build, [0, 0.2], [0, 1], clamp)}>
                <IsoBuilding cx={540} cy={1060} scale={1.05} floors={6} built={build} mode="solid" showFoundation={false} />
              </g>
            </g>
          </svg>
          <div dir="rtl" style={{ position: "absolute", top: 250, left: 0, right: 0, textAlign: "center", opacity: 1 - digOut }}>
            <div style={{ fontFamily: bodyFont, fontWeight: 600, fontSize: 56, color: C.steel }}>حكاية بتبدأ</div>
            <div style={{ fontFamily: headingFont, fontWeight: 900, fontSize: 100, color: C.white, transform: `scale(${0.85 + 0.15 * progress(frame, pit, 10, backOut)})` }}>
              بحفرة في <span style={{ color: C.red }}>الأرض</span>
            </div>
          </div>
          <div dir="rtl" style={{ position: "absolute", top: 250, left: 0, right: 0, textAlign: "center", opacity: progress(frame, end, 10) }}>
            <div style={{ fontFamily: bodyFont, fontWeight: 600, fontSize: 56, color: C.steel }}>وبتخلص</div>
            <div style={{ fontFamily: headingFont, fontWeight: 900, fontSize: 100, color: C.white }}>
              بالمفتاح <span style={{ color: C.red }}>في إيدك</span>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* The key lands in front of the finished building. */}
      {frame >= keyEnd && (
        <div
          style={{
            position: "absolute",
            left: 870 - 200,
            top: 1240,
            transform: `translateY(${(1 - finalKey) * -900}px) rotate(${(1 - finalKey) * -90 + Math.sin((frame - keyEnd) / 6) * 6 * (1 - progress(frame, keyEnd + 18, 30))}deg) scale(0.42)`,
            transformOrigin: "200px 0px",
            filter: "drop-shadow(0 30px 50px rgba(0,0,0,0.7))",
          }}
        >
          <Key shine={progress(frame, keyEnd + 14, 24)} />
        </div>
      )}

      <AbsoluteFill style={{ backgroundColor: "white", opacity: flash, pointerEvents: "none" }} />

      <Voice id="hook" />
      <Sfx name="subdrop" at={0} volume={0.5} />
      <Sfx name="impact" at={stop} volume={0.7} />
      <Sfx name="glitch" at={stop} volume={0.35} />
      <Sfx name="whoosh" at={key - 16} volume={0.4} />
      <Sfx name="keys" at={key} volume={0.35} />
      <Sfx name="swoosh" at={story} volume={0.35} />
      {Array.from({ length: Math.floor((dig - story) / 5) }, (_, i) => (
        <Sequence key={i} from={story + i * 5} durationInFrames={10} layout="none">
          <Sfx name="shutter" volume={0.12} />
        </Sequence>
      ))}
      <Sfx name="stamp" at={unseen} volume={0.55} />
      <Sfx name="impact" at={dig} volume={0.4} />
      <Sfx name="hammer" at={pit + 4} volume={0.3} />
      <Sfx name="riser" at={end} volume={0.35} />
      <Sfx name="keys" at={keyEnd + 14} volume={0.45} />
    </AbsoluteFill>
  );
};
