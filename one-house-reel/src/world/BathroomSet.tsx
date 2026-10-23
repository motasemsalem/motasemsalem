import { useCurrentFrame } from "remotion";
import { C, ramp, rand } from "../cues";
import { Boxes, type Item } from "./Instances";
import type { Materials } from "./materials";

// Where the bathroom interior sits in the world, away from the building.
export const BATH = { x: 80, y: 0, z: 0 };

// A tiled bathroom with a One House podium vanity unit; water splashes off it without a mark.
export const BathroomSet: React.FC<{ readonly m: Materials }> = ({ m }) => {
  const frame = useCurrentFrame();
  const build = ramp(frame, C.units - 10, C.units + 16);
  const splash = ramp(frame, C.water - 6, C.water) * (1 - ramp(frame, C.warranty + 20, C.warranty + 30));
  const drops: Item[] = Array.from({ length: 60 }, (_, i) => {
    const period = 18 + rand(i) * 14;
    const t = ((frame + rand(i + 3) * period) % period) / period;
    const x = (rand(i + 7) - 0.5) * 2.2;
    const z = (rand(i + 9) - 0.5) * 0.8 + 0.1;
    const top = 1.05;
    const fall = t < 0.65;
    const y = fall ? 2.6 - (2.6 - top) * (t / 0.65) ** 2 : top + Math.sin(((t - 0.65) / 0.35) * Math.PI) * 0.25;
    const out = fall ? 0 : ((t - 0.65) / 0.35) * 0.5 * (rand(i + 11) > 0.5 ? 1 : -1);
    const r = (fall ? 0.05 : 0.035) * splash;
    return { p: [x + out, y, z + out * 0.4], s: [r, r * (fall ? 1.6 : 1), r] };
  });
  const tiles: Item[] = [];
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 7; j++) {
      tiles.push({ p: [-2.4 + i * 0.6, 0.3 + j * 0.6, -1.19], s: [0.58, 0.58, 0.02] });
    }
  }
  return (
    <group position={[BATH.x, BATH.y, BATH.z]}>
      {/* room */}
      <mesh position={[0, -0.05, 0.5]} scale={[6, 0.1, 4]} receiveShadow>
        <boxGeometry />
        <primitive object={m.marble} attach="material" />
      </mesh>
      <mesh position={[0, 2.2, -1.25]} scale={[6, 4.4, 0.1]} receiveShadow>
        <boxGeometry />
        <primitive object={m.tile} attach="material" />
      </mesh>
      <Boxes items={tiles} material={m.white} castShadow={false} />
      <mesh position={[-3, 2.2, 0.5]} scale={[0.1, 4.4, 4]} receiveShadow>
        <boxGeometry />
        <primitive object={m.tile} attach="material" />
      </mesh>
      <group scale={[1, build, 1]}>
        {/* cabinet with two doors and red handles */}
        <mesh position={[0, 0.45, -0.75]} scale={[2.4, 0.8, 0.9]} castShadow receiveShadow>
          <boxGeometry />
          <primitive object={m.cabinet} attach="material" />
        </mesh>
        <mesh position={[0, 0.45, -0.29]} scale={[0.02, 0.72, 0.02]}>
          <boxGeometry />
          <meshStandardMaterial color="#b8a585" />
        </mesh>
        {[-0.12, 0.12].map((x) => (
          <mesh key={x} position={[x, 0.55, -0.28]} scale={[0.04, 0.26, 0.04]}>
            <boxGeometry />
            <primitive object={m.red} attach="material" />
          </mesh>
        ))}
        {/* countertop and basin */}
        <mesh position={[0, 0.9, -0.72]} scale={[2.6, 0.1, 1]} castShadow receiveShadow>
          <boxGeometry />
          <primitive object={m.marble} attach="material" />
        </mesh>
        <mesh position={[0, 1.0, -0.72]} scale={[0.9, 0.12, 0.6]} castShadow>
          <cylinderGeometry args={[0.5, 0.42, 1, 32]} />
          <primitive object={m.white} attach="material" />
        </mesh>
        <mesh position={[0, 1.16, -1.05]} scale={[0.07, 0.22, 0.07]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 1, 12]} />
          <primitive object={m.chrome} attach="material" />
        </mesh>
        <mesh position={[0, 1.43, -0.92]} scale={[0.05, 0.05, 0.3]}>
          <boxGeometry />
          <primitive object={m.chrome} attach="material" />
        </mesh>
        {/* mirror with a red frame */}
        <mesh position={[0, 2.3, -1.17]} scale={[1.8, 1.2, 0.04]}>
          <boxGeometry />
          <primitive object={m.red} attach="material" />
        </mesh>
        <mesh position={[0, 2.3, -1.14]} scale={[1.7, 1.1, 0.04]}>
          <boxGeometry />
          <primitive object={m.mirror} attach="material" />
        </mesh>
      </group>
      <Boxes items={drops} material={m.water} castShadow={false} geometry="sphere" />
      <pointLight position={[0.5, 3.4, 1.5]} intensity={18} distance={10} color="#fff2dc" />
    </group>
  );
};
