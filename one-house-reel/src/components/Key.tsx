import { C } from "../theme";

// A house key whose bow is the One House roof. Drawn in a 400×900 box, bow at the top.
export const Key: React.FC<{ readonly shine?: number }> = ({ shine = 0 }) => (
  <svg width={400} height={900} viewBox="0 0 400 900" style={{ overflow: "visible" }}>
    <defs>
      <linearGradient id="metal" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#8d97a6" />
        <stop offset="0.35" stopColor="#f4f7fb" />
        <stop offset="0.55" stopColor="#c3cad4" />
        <stop offset="1" stopColor="#6d7787" />
      </linearGradient>
      <linearGradient id="shine" x1="0" y1="0" x2="1" y2="1">
        <stop offset={Math.max(0, shine - 0.15)} stopColor="white" stopOpacity={0} />
        <stop offset={shine} stopColor="white" stopOpacity={0.9} />
        <stop offset={Math.min(1, shine + 0.15)} stopColor="white" stopOpacity={0} />
      </linearGradient>
      <clipPath id="keyShape">
        <path d={KEY_PATH} />
      </clipPath>
    </defs>
    <path d={KEY_PATH} fill="url(#metal)" stroke="#4b5566" strokeWidth={4} fillRule="evenodd" />
    {/* Red roof on the bow */}
    <path d="M 60 190 L 200 60 L 340 190 L 310 190 L 200 92 L 90 190 Z" fill={C.red} />
    {/* Window in brand red */}
    <g fill={C.red}>
      <rect x={172} y={200} width={24} height={24} />
      <rect x={204} y={200} width={24} height={24} />
      <rect x={172} y={232} width={24} height={24} />
      <rect x={204} y={232} width={24} height={24} />
    </g>
    <rect x={0} y={0} width={400} height={900} fill="url(#shine)" clipPath="url(#keyShape)" />
  </svg>
);

const KEY_PATH = [
  // Bow: a house outline with a ring hole.
  "M 80 200 L 200 90 L 320 200 L 320 360 Q 320 380 300 380 L 230 380 L 230 400",
  // Shaft down to the tip, with teeth on the right side.
  "L 230 560 L 280 560 L 280 610 L 245 610 L 245 650 L 290 650 L 290 700 L 250 700 L 250 740 L 275 740 L 275 790 L 230 790 L 230 840 L 200 880 L 170 840",
  "L 170 400 L 170 380 L 100 380 Q 80 380 80 360 Z",
  // Ring hole.
  "M 200 300 m -34 0 a 34 34 0 1 0 68 0 a 34 34 0 1 0 -68 0 Z",
].join(" ");
