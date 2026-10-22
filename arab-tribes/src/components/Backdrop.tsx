import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { C, H, W } from "../theme";

const SAND = new Array(55).fill(true).map((_, i) => ({
  x: random(`sand-x-${i}`) * W,
  y: random(`sand-y-${i}`) * H,
  r: 1 + random(`sand-r-${i}`) * 2.8,
  speed: 0.6 + random(`sand-s-${i}`) * 1.6,
}));

// A woven Sadu band: triangles and diamonds in Bedouin-textile colours, scrolling sideways.
export const SaduBand: React.FC<{
  readonly y: number;
  readonly dir?: 1 | -1;
}> = ({ y, dir = 1 }) => {
  const frame = useCurrentFrame();
  const tile = 72;
  const shift = (((frame * 1.6 * dir) % tile) + tile) % tile;
  return (
    <svg
      width={W}
      height={44}
      style={{ position: "absolute", top: y, left: 0 }}
    >
      <rect width={W} height={44} fill="#1c120d" />
      <g transform={`translate(${shift - tile} 0)`}>
        {new Array(Math.ceil(W / tile) + 2).fill(true).map((_, i) => (
          <g key={i} transform={`translate(${i * tile} 0)`}>
            <path d="M 0 6 L 18 22 L 0 38 Z" fill={C.red} />
            <path d="M 36 6 L 18 22 L 36 38 Z" fill={C.red} />
            <path d="M 54 8 L 66 22 L 54 36 L 42 22 Z" fill={C.gold} />
            <rect x={51} y={19} width={6} height={6} fill="#1c120d" />
            <rect x={14} y={19} width={8} height={6} fill={C.text} />
          </g>
        ))}
      </g>
      <rect width={W} height={3} fill={C.sand} opacity={0.6} />
      <rect y={41} width={W} height={3} fill={C.sand} opacity={0.6} />
    </svg>
  );
};

export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 90% 55% at 50% 42%, ${C.bgGlow} 0%, ${C.bg} 72%)`,
      }}
    >
      <svg width={W} height={H} style={{ position: "absolute" }}>
        {SAND.map((d, i) => (
          <circle
            key={i}
            cx={(((d.x - frame * d.speed) % W) + W) % W}
            cy={d.y + Math.sin(frame / 25 + i) * 14}
            r={d.r}
            fill={C.sand}
            opacity={0.1 + 0.08 * Math.sin(frame / 12 + i)}
          />
        ))}
      </svg>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.65) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
