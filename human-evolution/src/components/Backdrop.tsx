import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { C } from "../theme";

const DUST = new Array(40).fill(true).map((_, i) => ({
  x: random(`dust-x-${i}`) * 1920,
  y: random(`dust-y-${i}`) * 1080,
  r: 1 + random(`dust-r-${i}`) * 2.5,
  speed: 0.2 + random(`dust-s-${i}`) * 0.5,
}));

export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 70% 60% at 30% 45%, ${C.bgGlow} 0%, ${C.bg} 70%)`,
      }}
    >
      <svg width={1920} height={1080}>
        {DUST.map((d, i) => (
          <circle
            key={i}
            cx={d.x + Math.sin(frame / 50 + i) * 12}
            cy={(((d.y - frame * d.speed) % 1080) + 1080) % 1080}
            r={d.r}
            fill={C.pale}
            opacity={0.08 + 0.06 * Math.sin(frame / 20 + i)}
          />
        ))}
      </svg>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
