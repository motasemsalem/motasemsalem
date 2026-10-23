import { useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo } from "react";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { interpolate, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { C, clamp, easeInOut, ramp } from "../cues";
import { BATH, BathroomSet } from "./BathroomSet";
import { Building, buildState, FLOORS, H } from "./Building";
import { makeMaterials } from "./materials";
import { City, Site, Workers } from "./Site";

type Key = { f: number; pos: [number, number, number]; look: [number, number, number]; fov?: number };
const B = (x: number, y: number, z: number): [number, number, number] => [BATH.x + x, BATH.y + y, BATH.z + z];

// The camera path, one continuous move through the story (except the cut into the bathroom).
const KEYS: Key[] = [
  { f: 0, pos: [30, 12, 52], look: [0, 9, 0], fov: 42 },
  { f: C.flat - 6, pos: [9, 9, 19], look: [2, 8.6, 4.5], fov: 36 },
  { f: C.flat + 30, pos: [4.5, 9.6, 13], look: [2, 9, 4.5], fov: 32 },
  { f: C.inside, pos: [7, 10.5, 17], look: [1, 8.5, 2], fov: 36 },
  { f: C.steel + 14, pos: [17, 13, 24], look: [0, 7.5, 0], fov: 40 },
  { f: C.base, pos: [16, 9, 22], look: [0, 4, 0], fov: 40 },
  { f: C.base + 28, pos: [10, -0.6, 13], look: [0, -1.5, 0], fov: 46 },
  { f: C.rewind + 6, pos: [12, 4, 16], look: [0, 0, 0], fov: 44 },
  { f: C.brand, pos: [0.5, 46, 14], look: [0, 0, 0], fov: 38 },
  { f: C.start, pos: [-6, 42, 18], look: [0, 0, 0], fov: 38 },
  { f: C.dig + 10, pos: [20, 13, 22], look: [0, -1, 0], fov: 42 },
  { f: C.footings + 20, pos: [13, 6.5, 14], look: [0, -1.4, 0], fov: 42 },
  { f: C.strong, pos: [9, 0.4, 11], look: [0, -0.8, 0], fov: 48 },
  { f: C.columns, pos: [8.5, 2.8, 9.5], look: [0, 1.2, 0], fov: 46 },
  { f: C.check, pos: [-7, 3.4, 9.5], look: [0, 1.6, 0], fov: 44 },
  { f: C.pourColumns + 10, pos: [-11, 6, 13], look: [0, 1.6, 0], fov: 44 },
  { f: C.posts, pos: [3.4, 1.4, 3.6], look: [-1, 2.2, -2.5], fov: 56 },
  { f: C.level, pos: [7, 5, 9], look: [0, 3, 0], fov: 46 },
  { f: C.flatSlab, pos: [13, 9, 15], look: [0, 3, 0], fov: 42 },
  { f: C.floors, pos: [18, 9, 21], look: [0, 6, 0], fov: 42 },
  { f: C.team, pos: [22, 17, 26], look: [0, 9, 0], fov: 42 },
  { f: C.cold, pos: [-18, 14, 26], look: [0, 8, 0], fov: 42 },
  { f: C.bone, pos: [-11, 8, 15], look: [0, 8, 0], fov: 44 },
  { f: C.plumbing, pos: [12, 9, 17], look: [0, 8, 0], fov: 44 },
  { f: C.paint + 20, pos: [18, 8, 20], look: [0, 8, 0], fov: 42 },
  { f: C.design + 10, pos: [24, 15, 14], look: [0, 8, 0], fov: 42 },
  { f: C.see + 14, pos: [10, 12, 28], look: [0, 8, 0], fov: 42 },
  { f: C.bath - 2, pos: [3.2, 7.2, 12], look: [2, 7, 4.5], fov: 40 },
  { f: C.bath + 12, pos: [2.1, 7.0, 6.2], look: [2, 7, 4.5], fov: 34 },
  // Cut into the bathroom here (see below); the overlay covers the jump.
  { f: C.bath + 13, pos: B(1.6, 2.3, 5.2), look: B(0, 1.4, -0.8), fov: 42 },
  { f: C.water, pos: B(0.8, 1.9, 4.2), look: B(0, 1.3, -0.8), fov: 42 },
  { f: C.stats - 6, pos: B(0.3, 1.8, 3.6), look: B(0, 1.4, -0.8), fov: 40 },
  { f: C.stats - 5, pos: [52, 58, 66], look: [0, 0, 0], fov: 44 },
  { f: C.follow, pos: [-44, 62, 70], look: [0, 0, 0], fov: 44 },
  { f: C.closing, pos: [16, 6, 22], look: [0, 8, 0], fov: 42 },
  { f: C.key, pos: [20, 11, 28], look: [0, 9, 0], fov: 42 },
  { f: C.right + 60, pos: [26, 18, 38], look: [0, 10, 0], fov: 42 },
];

const lerp3 = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t) as [number, number, number];

const CameraRig: React.FC = () => {
  const frame = useCurrentFrame();
  const camera = useThree((st) => st.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    let i = KEYS.findIndex((k) => k.f > frame) - 1;
    if (i < 0) i = frame < KEYS[0].f ? 0 : KEYS.length - 2;
    const a = KEYS[i];
    const b = KEYS[Math.min(i + 1, KEYS.length - 1)];
    const t = b.f === a.f ? 1 : easeInOut(Math.min(1, Math.max(0, (frame - a.f) / (b.f - a.f))));
    const pos = lerp3(a.pos, b.pos, t);
    const look = lerp3(a.look, b.look, t);
    camera.position.set(...pos);
    camera.fov = (a.fov ?? 42) + ((b.fov ?? 42) - (a.fov ?? 42)) * t;
    camera.near = 0.1;
    camera.far = 600;
    camera.lookAt(...look);
    camera.updateProjectionMatrix();
  });
  return null;
};

// Time of day across the film: dusk hook, daylight build, a cool "winter" beat, golden finish, night close.
const LIGHT_KEYS: { f: number; sun: string; sunI: number; sky: string; ground: string; hemiI: number; glow: number; fog: string }[] = [
  { f: 0, sun: "#ff9a5a", sunI: 1.6, sky: "#5c6fa8", ground: "#5a3d2a", hemiI: 0.7, glow: 0.8, fog: "#b48a8a" },
  { f: C.rewind, sun: "#ff9a5a", sunI: 1.6, sky: "#5c6fa8", ground: "#5a3d2a", hemiI: 0.7, glow: 0.8, fog: "#b48a8a" },
  { f: C.brand, sun: "#fff2dc", sunI: 3, sky: "#bcd6f2", ground: "#a08060", hemiI: 1.1, glow: 0, fog: "#dfe4ea" },
  { f: C.heat, sun: "#fff2dc", sunI: 3, sky: "#bcd6f2", ground: "#a08060", hemiI: 1.1, glow: 0, fog: "#dfe4ea" },
  { f: C.heat + 10, sun: "#ffd29a", sunI: 3.8, sky: "#f4d9a8", ground: "#a07850", hemiI: 1.2, glow: 0, fog: "#f0dcbc" },
  { f: C.cold, sun: "#cfe4ff", sunI: 1.7, sky: "#9fb4cc", ground: "#6a7280", hemiI: 1, glow: 0.1, fog: "#b8c4d2" },
  { f: C.shell, sun: "#ffe0b0", sunI: 3, sky: "#c7d9ee", ground: "#a08060", hemiI: 1.1, glow: 0, fog: "#e2e2e0" },
  { f: C.paint + 20, sun: "#ffc27a", sunI: 2.6, sky: "#e8c9a0", ground: "#8a6448", hemiI: 1, glow: 0.2, fog: "#e6c9a8" },
  { f: C.stats, sun: "#ffb066", sunI: 2.4, sky: "#e6b48a", ground: "#7a5440", hemiI: 0.9, glow: 0.4, fog: "#d9a988" },
  { f: C.closing, sun: "#ff8a5a", sunI: 1.2, sky: "#4a5a8c", ground: "#3a2a30", hemiI: 0.6, glow: 1, fog: "#2c3558" },
  { f: C.closing + 90, sun: "#8aa0ff", sunI: 0.4, sky: "#1d2850", ground: "#141824", hemiI: 0.45, glow: 1.2, fog: "#141c38" },
];

export const lightAt = (frame: number) => {
  let i = LIGHT_KEYS.findIndex((k) => k.f > frame) - 1;
  if (i < 0) i = frame < LIGHT_KEYS[0].f ? 0 : LIGHT_KEYS.length - 2;
  const a = LIGHT_KEYS[i];
  const b = LIGHT_KEYS[Math.min(i + 1, LIGHT_KEYS.length - 1)];
  const t = b.f === a.f ? 1 : Math.min(1, Math.max(0, (frame - a.f) / (b.f - a.f)));
  const col = (x: string, y: string) => new THREE.Color(x).lerp(new THREE.Color(y), t);
  const num = (x: number, y: number) => x + (y - x) * t;
  return {
    sun: col(a.sun, b.sun),
    sunI: num(a.sunI, b.sunI),
    sky: col(a.sky, b.sky),
    ground: col(a.ground, b.ground),
    hemiI: num(a.hemiI, b.hemiI),
    glow: num(a.glow, b.glow),
    fog: col(a.fog, b.fog),
  };
};

const Environment: React.FC = () => {
  const frame = useCurrentFrame();
  const scene = useThree((st) => st.scene);
  const gl = useThree((st) => st.gl);
  const l = lightAt(frame);
  // Soft studio reflections so metal, glass and marble read as real materials.
  const env = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const tex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    return tex;
  }, [gl]);
  useLayoutEffect(() => {
    scene.fog = new THREE.Fog(l.fog, 70, 260);
    scene.environment = env;
    scene.environmentIntensity = 0.08 + 0.06 * l.hemiI;
  });
  const sunAngle = interpolate(frame, [0, C.closing + 90], [0.4, 2.6], clamp);
  return (
    <>
      <hemisphereLight args={[l.sky, l.ground, l.hemiI]} />
      <directionalLight
        position={[Math.cos(sunAngle) * 40, 34, Math.sin(sunAngle) * 30 + 10]}
        color={l.sun}
        intensity={l.sunI}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-camera-near={1}
        shadow-camera-far={140}
        shadow-bias={-0.0004}
      />
    </>
  );
};

export const World: React.FC = () => {
  const frame = useCurrentFrame();
  const m = useMemo(() => makeMaterials(), []);
  const s = buildState(frame);
  const l = lightAt(frame);

  // X-ray in the hook: walls and glass fade, steel glows, concrete turns see-through blue.
  m.wall.opacity = 1 - 0.88 * s.xray;
  m.glass.opacity = 1 - 0.85 * s.xray;
  m.concrete.transparent = s.xray > 0;
  m.concrete.opacity = 1 - 0.7 * s.xSteel + 0.45 * s.xConcrete;
  m.concrete.emissive.set("#2a8cff");
  m.concrete.emissiveIntensity = 0.5 * s.xConcrete + 0.6 * s.xBase;
  m.steel.emissive.set("#ff2a3d");
  m.steel.emissiveIntensity = 1.6 * s.xSteel;
  m.holo.opacity = s.holo;

  const topBuilt = s.upper.filter((u) => u >= 1).length;
  const projects = ramp(frame, C.projects - 6, C.projectsEnd + 14);
  const showMain = frame < C.bath + 13 || frame >= C.stats - 5;
  return (
    <>
      <CameraRig />
      <Environment />
      {showMain && (
        <>
          <Site m={m} s={s} />
          <City m={m} projects={projects} night={l.glow} />
          {s.holo < 0.6 && <Building m={m} s={s} />}
          {s.holo > 0 && <Building m={m} s={s} holo />}
          <Workers
            m={m}
            visible={ramp(s.b, C.dig - 10, C.dig + 6) * (1 - ramp(s.b, C.paint, C.paint + 12))}
            floorY={topBuilt > 0 ? Math.min(topBuilt + 1, FLOORS) * H : 0}
          />
        </>
      )}
      {!showMain && <BathroomSet m={m} />}
    </>
  );
};

