import { C } from "../theme";

const COS = Math.cos(Math.PI / 6);
const SIN = Math.sin(Math.PI / 6);

type P = [number, number, number];

// An isometric building that assembles floor by floor.
// `built` runs from 0 to `floors`; the fractional part is the floor under construction
// (columns grow first, then the slab, then walls and windows).
export const IsoBuilding: React.FC<{
  readonly cx: number;
  readonly cy: number;
  readonly scale?: number;
  readonly floors: number;
  readonly built: number;
  readonly width?: number;
  readonly depth?: number;
  readonly floorHeight?: number;
  readonly mode?: "wire" | "solid";
  readonly showFoundation?: boolean;
}> = ({
  cx,
  cy,
  scale = 1,
  floors,
  built,
  width = 260,
  depth = 200,
  floorHeight = 70,
  mode = "solid",
  showFoundation = true,
}) => {
  const xy = ([x, y, z]: P) => [
    cx + (x - y) * COS * scale,
    cy + (x + y) * SIN * scale - z * scale,
  ];
  const pt = (p: P) => xy(p).join(",");
  const poly = (pts: P[]) => pts.map(pt).join(" ");
  const stroke = mode === "wire" ? C.blueprint : "rgba(255,255,255,0.55)";
  const W = width;
  const D = depth;
  const H = floorHeight;
  const cols: [number, number][] = [
    [0, 0], [W / 2, 0], [W, 0], [W, D / 2], [W, D], [0, D], [W / 2, D], [0, D / 2],
  ];
  const items: React.ReactNode[] = [];

  if (showFoundation) {
    const f = Math.min(1, Math.max(0, built + 0.3) / 0.3);
    items.push(
      <polygon
        key="base"
        points={poly([[-30, -30, 0], [W + 30, -30, 0], [W + 30, D + 30, 0], [-30, D + 30, 0]])}
        fill={mode === "wire" ? "rgba(95,168,255,0.08)" : "#7d7a73"}
        stroke={stroke}
        strokeWidth={2}
        opacity={f}
      />,
    );
  }

  for (let i = 0; i < floors; i++) {
    const f = Math.min(1, Math.max(0, built - i));
    if (f <= 0) break;
    const z0 = i * H;
    const colP = Math.min(1, f / 0.4);
    const slabP = Math.min(1, Math.max(0, (f - 0.35) / 0.25));
    const wallP = Math.min(1, Math.max(0, (f - 0.6) / 0.4));
    const z1 = z0 + H * colP;

    // Front faces (x = W side and y = D side are towards the viewer).
    if (wallP > 0) {
      const right: P[] = [[W, 0, z0], [W, D, z0], [W, D, z0 + H], [W, 0, z0 + H]];
      const left: P[] = [[0, D, z0], [W, D, z0], [W, D, z0 + H], [0, D, z0 + H]];
      items.push(
        <polygon key={`r${i}`} points={poly(right)} fill={mode === "wire" ? "rgba(95,168,255,0.10)" : "#d9cfbf"} opacity={wallP} stroke={stroke} strokeWidth={1.5} />,
        <polygon key={`l${i}`} points={poly(left)} fill={mode === "wire" ? "rgba(95,168,255,0.16)" : "#efe6d8"} opacity={wallP} stroke={stroke} strokeWidth={1.5} />,
      );
      // Windows: three on each face.
      for (let k = 0; k < 3; k++) {
        const a = (k + 0.3) / 3;
        const b = (k + 0.7) / 3;
        const win: P[] = [[W, D * a, z0 + H * 0.28], [W, D * b, z0 + H * 0.28], [W, D * b, z0 + H * 0.78], [W, D * a, z0 + H * 0.78]];
        const win2: P[] = [[W * a, D, z0 + H * 0.28], [W * b, D, z0 + H * 0.28], [W * b, D, z0 + H * 0.78], [W * a, D, z0 + H * 0.78]];
        const lit = mode === "solid" && (i * 3 + k) % 4 === 1;
        items.push(
          <polygon key={`w${i}${k}`} points={poly(win)} fill={lit ? "#ffd08a" : mode === "wire" ? "none" : "#3a4c66"} stroke={stroke} strokeWidth={1.2} opacity={wallP} />,
          <polygon key={`v${i}${k}`} points={poly(win2)} fill={lit ? "#ffe0a8" : mode === "wire" ? "none" : "#4a5e7b"} stroke={stroke} strokeWidth={1.2} opacity={wallP} />,
        );
      }
    }
    // Columns growing.
    for (const [x, y] of cols) {
      const [x1, y1] = xy([x, y, z0]);
      const [x2, y2] = xy([x, y, z1]);
      items.push(
        <line
          key={`c${i}-${x}-${y}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={mode === "wire" ? C.blueprint : "#9a958c"}
          strokeWidth={mode === "wire" ? 2.5 : 6 * scale}
          strokeLinecap="round"
        />,
      );
    }
    // Slab (top face) pouring in from the back corner.
    if (slabP > 0) {
      const top: P[] = [[0, 0, z0 + H], [W * slabP, 0, z0 + H], [W * slabP, D, z0 + H], [0, D, z0 + H]];
      const edge: P[] = [[0, D, z0 + H - 10], [W * slabP, D, z0 + H - 10], [W * slabP, D, z0 + H], [0, D, z0 + H]];
      items.push(
        <polygon key={`s${i}`} points={poly(top)} fill={mode === "wire" ? "rgba(95,168,255,0.22)" : "#b8b2a6"} stroke={stroke} strokeWidth={2} />,
        <polygon key={`e${i}`} points={poly(edge)} fill={mode === "wire" ? "rgba(95,168,255,0.35)" : "#8f8a80"} />,
      );
    }
  }

  // Roof accent in brand red once the last floor is done.
  if (built >= floors) {
    const z = floors * H;
    const p = Math.min(1, (built - floors) / 0.4);
    items.push(
      <polygon
        key="roof"
        points={poly([[0, 0, z], [W, 0, z], [W, D, z], [0, D, z]])}
        fill={C.red}
        opacity={0.9 * p}
      />,
      <polygon
        key="parapet"
        points={poly([[0, D, z], [W, D, z], [W, D, z + 14 * p], [0, D, z + 14 * p]])}
        fill="#a10414"
      />,
    );
  }
  return <g>{items}</g>;
};
