import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { clamp } from "../anim";
import { C } from "../theme";
import timeline from "../timeline.json";

// Navy blueprint paper: a drifting engineering grid with a soft glow.
export const Backdrop: React.FC<{ readonly glow?: string }> = ({
  glow = "rgba(40, 110, 220, 0.35)",
}) => {
  const frame = useCurrentFrame();
  const drift = (frame * 0.4) % 120;
  return (
    <AbsoluteFill style={{ backgroundColor: C.deep }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(1100px 1300px at 50% 38%, ${glow}, transparent 70%), linear-gradient(180deg, ${C.navy} 0%, ${C.deep} 100%)`,
        }}
      />
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", inset: 0, opacity: 0.9 }}
      >
        <defs>
          <pattern
            id="minor"
            width={30}
            height={30}
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(0 ${drift})`}
          >
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke={C.line} strokeWidth={1} opacity={0.45} />
          </pattern>
          <pattern
            id="major"
            width={120}
            height={120}
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(0 ${drift})`}
          >
            <rect width={120} height={120} fill="url(#minor)" />
            <path d="M 120 0 L 0 0 0 120" fill="none" stroke={C.line} strokeWidth={1.6} />
          </pattern>
          <radialGradient id="fadeGrid" cx="50%" cy="45%" r="65%">
            <stop offset="0%" stopColor="white" stopOpacity={1} />
            <stop offset="100%" stopColor="white" stopOpacity={0} />
          </radialGradient>
          <mask id="gridMask">
            <rect width={1080} height={1920} fill="url(#fadeGrid)" />
          </mask>
        </defs>
        <rect width={1080} height={1920} fill="url(#major)" mask="url(#gridMask)" />
      </svg>
    </AbsoluteFill>
  );
};

// Film grain + vignette, laid over everything (the vignette eases off on the white end card).
export const Finish: React.FC = () => {
  const frame = useCurrentFrame();
  const endCard = timeline.starts.closing;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          opacity: interpolate(frame, [endCard, endCard + 20], [1, 0.25], clamp),
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.09, mixBlendMode: "overlay" }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency={0.9} numOctaves={2} seed={frame % 12} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={1080} height={1920} filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};
