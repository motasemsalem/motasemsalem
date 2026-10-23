import { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { C, ramp, rand } from "../cues";
import type { BuildState } from "./Building";
import { PIT } from "./Building";
import { Boxes, type Item } from "./Instances";
import type { Materials } from "./materials";

// The plot: ground with the excavation, the soil that comes out of it, stakes and tape, roads.
export const Site: React.FC<{ readonly m: Materials; readonly s: BuildState }> = ({ m, s }) => {
  const frame = useCurrentFrame();
  // Under x-ray the ground turns see-through so the footings show.
  const groundOpacity = 1 - 0.75 * s.xBase;
  m.sand.transparent = groundOpacity < 1;
  m.sand.opacity = groundOpacity;
  m.soil.transparent = groundOpacity < 1;
  m.soil.opacity = groundOpacity;
  const fill = Math.max(1 - s.dig, s.backfill);
  const fillH = PIT.depth * fill;
  const { x, z, depth } = PIT;
  const big = 260;
  // Four ground slabs leave a hole where the pit is.
  const ground: Item[] = [
    { p: [-x - big / 2, -0.25, 0], s: [big, 0.5, big * 2] },
    { p: [x + big / 2, -0.25, 0], s: [big, 0.5, big * 2] },
    { p: [0, -0.25, z + big / 2], s: [2 * x, 0.5, big] },
    { p: [0, -0.25, -z - big / 2], s: [2 * x, 0.5, big] },
  ];
  const walls: Item[] = s.dig > 0
    ? [
        { p: [-x, -depth / 2, 0], s: [0.1, depth, 2 * z] },
        { p: [x, -depth / 2, 0], s: [0.1, depth, 2 * z] },
        { p: [0, -depth / 2, -z], s: [2 * x, depth, 0.1] },
        { p: [0, -depth / 2, z], s: [2 * x, depth, 0.1] },
      ]
    : [{ p: [0, 0, 0], s: [0, 0, 0] }, { p: [0, 0, 0], s: [0, 0, 0] }, { p: [0, 0, 0], s: [0, 0, 0] }, { p: [0, 0, 0], s: [0, 0, 0] }];
  // Spoil heap grows beside the pit as it's dug, then goes back in.
  const heap = s.dig * (1 - s.backfill);
  // Survey stakes and red tape mark the plot from the logo onwards.
  const marks = ramp(frame, C.brand + 10, C.start, (t) => t);
  const stakes: Item[] = [
    [-x, -z], [x, -z], [x, z], [-x, z],
  ].map(([sx, sz]) => ({ p: [sx, 0.6 * marks, sz], s: [0.15, 1.2 * marks, 0.15] }));
  const tape: Item[] = [
    { p: [-x + x * marks, 1.0, -z], s: [2 * x * marks, 0.06, 0.04] },
    { p: [x, 1.0, -z + z * marks], s: [0.04, 0.06, 2 * z * marks] },
    { p: [x - x * marks, 1.0, z], s: [2 * x * marks, 0.06, 0.04] },
    { p: [-x, 1.0, z - z * marks], s: [0.04, 0.06, 2 * z * marks] },
  ];
  return (
    <group>
      <Boxes items={ground} material={m.sand} castShadow={false} />
      <Boxes items={walls} material={m.soil} castShadow={false} />
      <mesh position={[0, -depth - 0.05, 0]} scale={[2 * x, 0.1, 2 * z]} receiveShadow>
        <boxGeometry />
        <primitive object={m.soil} attach="material" />
      </mesh>
      <mesh position={[0, -depth + fillH / 2, 0]} scale={[2 * x - 0.02, Math.max(fillH, 1e-3), 2 * z - 0.02]} receiveShadow>
        <boxGeometry />
        <primitive object={m.sand} attach="material" />
      </mesh>
      <mesh position={[x + 6, 0, -2]} scale={[7 * heap, 3.2 * heap, 6 * heap]} castShadow receiveShadow>
        <coneGeometry args={[0.5, 1, 7]} />
        <primitive object={m.soil} attach="material" />
      </mesh>
      <Boxes items={stakes} material={m.wood} />
      <Boxes items={tape} material={m.tape} castShadow={false} />
      {/* Roads around the block */}
      <mesh position={[0, 0.01, z + 6]} scale={[big, 0.02, 7]} receiveShadow>
        <boxGeometry />
        <meshStandardMaterial color="#5b5750" roughness={0.95} />
      </mesh>
      <mesh position={[x + 9, 0.01, 0]} scale={[7, 0.02, big]} receiveShadow>
        <boxGeometry />
        <meshStandardMaterial color="#5b5750" roughness={0.95} />
      </mesh>
    </group>
  );
};

type Block = { x: number; z: number; w: number; d: number; h: number; project: boolean; order: number };

// Low-rise Cairo-style neighbourhood. Some blocks are One House projects: their roofs light up red
// as the "500+ projects" counter runs.
export const City: React.FC<{ readonly m: Materials; readonly projects: number; readonly night: number }> = ({ m, projects, night }) => {
  const blocks = useMemo(() => {
    const out: Block[] = [];
    for (let gx = -6; gx <= 6; gx++) {
      for (let gz = -6; gz <= 6; gz++) {
        const cx = gx * 13 + (rand(gx * 9 + gz) - 0.5) * 3;
        const cz = gz * 13 + (rand(gx + gz * 7) - 0.5) * 3;
        // Keep a clearing round the plot, deeper on the side the camera works from.
        if (Math.abs(cx) < 36 && cz > -20 && cz < 62) continue;
        const i = out.length;
        out.push({
          x: cx,
          z: cz,
          w: 7 + rand(i * 3) * 4,
          d: 7 + rand(i * 5) * 4,
          h: 6 + rand(i * 11) * 14 + (rand(i * 13) > 0.9 ? 10 : 0),
          project: rand(i * 17) > 0.62,
          order: rand(i * 19),
        });
      }
    }
    return out;
  }, []);
  const bodies: Item[] = blocks.map((b) => ({ p: [b.x, b.h / 2, b.z], s: [b.w, b.h, b.d] }));
  const roofs: Item[] = blocks.map((b) => ({ p: [b.x, b.h + 0.4, b.z], s: [b.w * 0.6, 0.8, b.d * 0.5] }));
  const marks: Item[] = blocks.map((b) => {
    const on = b.project ? Math.max(0, Math.min(1, (projects - b.order * 0.9) / 0.1)) : 0;
    return { p: [b.x, b.h + 0.1 + on * 0.3, b.z], s: [b.w * 1.02 * on, 0.25 + 0.4 * on, b.d * 1.02 * on] };
  });
  m.glass.emissiveIntensity = 0.15 + 1.6 * night;
  return (
    <group>
      <Boxes items={bodies} material={m.city} />
      <Boxes items={roofs} material={m.cityRoof} />
      <Boxes items={marks} material={m.red} castShadow={false} />
    </group>
  );
};

// Site workers in vests and hard hats; they walk short loops while the building goes up.
export const Workers: React.FC<{ readonly m: Materials; readonly visible: number; readonly floorY: number }> = ({ m, visible, floorY }) => {
  const frame = useCurrentFrame();
  if (visible <= 0) return null;
  const crew = Array.from({ length: 7 }, (_, i) => {
    const t = frame / (40 + i * 7) + i;
    const r = 2 + (i % 3) * 1.6;
    const x = Math.cos(t) * r + (i % 2 ? 2 : -2);
    const z = Math.sin(t) * r * 0.7;
    const y = i < 3 ? 0 : floorY;
    const bob = Math.abs(Math.sin(frame / 4 + i)) * 0.06;
    return { x, y: y + bob, z, face: -t };
  });
  return (
    <group scale={visible}>
      {crew.map((c, i) => (
        <group key={i} position={[c.x, c.y, c.z]} rotation={[0, c.face, 0]}>
          <mesh position={[0, 0.45, 0]} scale={[0.32, 0.9, 0.22]} castShadow>
            <boxGeometry />
            <primitive object={m.navy} attach="material" />
          </mesh>
          <mesh position={[0, 1.15, 0]} scale={[0.4, 0.55, 0.28]} castShadow>
            <boxGeometry />
            <primitive object={m.vest} attach="material" />
          </mesh>
          <mesh position={[0, 1.6, 0]} scale={0.26} castShadow>
            <sphereGeometry args={[0.5, 12, 10]} />
            <primitive object={m.skin} attach="material" />
          </mesh>
          <mesh position={[0, 1.72, 0]} scale={[0.32, 0.16, 0.32]} castShadow>
            <sphereGeometry args={[0.5, 12, 8]} />
            <primitive object={m.hardhat} attach="material" />
          </mesh>
        </group>
      ))}
    </group>
  );
};
