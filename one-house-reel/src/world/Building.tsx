import { useCurrentFrame } from "remotion";
import * as THREE from "three";
import { buildClock, C, ramp, rand } from "../cues";
import { Boxes, type Item } from "./Instances";
import type { Materials } from "./materials";

// Structural grid (metres-ish): 4 × 3 columns, 5 floors.
export const XS = [-6, -2, 2, 6];
export const ZS = [-4.5, 0, 4.5];
export const H = 3.2;
export const FLOORS = 5;
const COL = 0.6;
const SLAB = 0.35;
export const PIT = { x: 8, z: 6.5, depth: 2 };
const COLUMNS = XS.flatMap((x) => ZS.map((z) => [x, z] as const));
const PROP_XS = Array.from({ length: 11 }, (_, i) => -5.5 + i * 1.1);
const PROP_ZS = Array.from({ length: 8 }, (_, i) => -3.85 + i * 1.1);

// When each upper floor (index 1..4) is built, in construction-clock frames.
const floorSpan = (k: number) => {
  const len = (C.team + 10 - C.floors) / (FLOORS - 1);
  const a = C.floors + (k - 1) * len;
  return [a, a + len] as const;
};

export type BuildState = ReturnType<typeof buildState>;

// Every 0–1 progress value the building reads, from the construction clock `b` and the real frame.
export const buildState = (frame: number) => {
  const b = buildClock(frame);
  const xray = ramp(frame, C.inside, C.steel) * (1 - ramp(frame, C.rewind, C.rewind + 10));
  return {
    b,
    dig: ramp(b, C.dig, C.lean - 4),
    lean: ramp(b, C.lean, C.footings),
    footings: ramp(b, C.footings, C.calc),
    necks: ramp(b, C.calc, C.strong + 10),
    backfill: ramp(b, C.columns - 16, C.columns + 4),
    bars: ramp(b, C.columns, C.rebar + 10),
    stirrups: ramp(b, C.rebar, C.check),
    scan: b >= C.check && b < C.pourColumns + 10 ? (b - C.check) / (C.pourColumns + 10 - C.check) : -1,
    pourColumns: ramp(b, C.pourColumns, C.formwork + 6),
    props: ramp(b, C.props, C.beams, (x) => x),
    beams: ramp(b, C.beams, C.level),
    deck: ramp(b, C.level - 6, C.level + 10),
    laser: b >= C.level && b < C.pourSlab + 4 ? (b - C.level) / (C.pourSlab + 4 - C.level) : -1,
    slab1: ramp(b, C.pourSlab, C.flatSlab + 24),
    upper: [1, 2, 3, 4].map((k) => {
      const [a, z] = floorSpan(k);
      return ramp(b, a, z, (x) => x);
    }),
    strike: ramp(b, C.shell, C.bone),
    crane: ramp(b, C.columns - 30, C.columns) * (1 - ramp(b, C.paint, C.paint + 20)),
    plumbing: ramp(b, C.plumbing - 4, C.plumbing + 12),
    electric: ramp(b, C.electric - 4, C.electric + 12),
    insulation: ramp(b, C.insulation - 4, C.insulation + 14),
    plaster: ramp(b, C.plaster - 4, C.plaster + 16),
    marble: ramp(b, C.marble - 4, C.marble + 14),
    paint: ramp(b, C.paint - 4, C.paint + 22),
    xray,
    xSteel: ramp(frame, C.steel - 4, C.steel + 10) * (1 - ramp(frame, C.rewind, C.rewind + 10)),
    xConcrete: ramp(frame, C.concrete - 4, C.concrete + 10) * (1 - ramp(frame, C.rewind, C.rewind + 10)),
    xBase: ramp(frame, C.base - 4, C.base + 14) * (1 - ramp(frame, C.rewind, C.rewind + 10)),
    holo: ramp(frame, C.design - 2, C.design + 10) * (1 - ramp(frame, C.see, C.see + 16)),
  };
};

const PLASTER = new THREE.Color("#b9b2a6");
const PAINT = new THREE.Color("#efe3cf");

const grow = (p: number) => Math.max(0, Math.min(1, p));

export const Building: React.FC<{ readonly m: Materials; readonly s: BuildState; readonly holo?: boolean }> = ({ m, s, holo }) => {
  const frame = useCurrentFrame();
  const mat = (x: keyof Materials) => (holo ? m.holo : m[x]);

  // Upper-floor progress p (0..1): columns, then props + deck, then slab.
  const floorProgress = (k: number) => (k === 0 ? 1 : s.upper[k - 1]);
  const colsP = (k: number) => (k === 0 ? s.pourColumns : grow(floorProgress(k) / 0.4));
  const slabP = (k: number) => (k === 0 ? s.slab1 : grow((floorProgress(k) - 0.7) / 0.3));
  const propsP = (k: number) => (k === 0 ? s.props : grow((floorProgress(k) - 0.35) / 0.3));

  const columnItems: Item[] = [];
  const slabItems: Item[] = [];
  const propItems: Item[] = [];
  const beamItems: Item[] = [];
  const deckItems: Item[] = [];
  const barItems: Item[] = [];
  const stirrupItems: Item[] = [];
  const wallItems: Item[] = [];
  const glassItems: Item[] = [];
  const balconyItems: Item[] = [];
  const bandItems: Item[] = [];

  for (let k = 0; k < FLOORS; k++) {
    const y0 = k === 0 ? 0 : k * H;
    const cp = colsP(k);
    const visibleFloor = k === 0 ? s.bars > 0 : floorProgress(k) > 0;
    for (const [x, z] of COLUMNS) {
      const h = (H - SLAB) * cp;
      columnItems.push({ p: [x, y0 + h / 2, z], s: [COL, h, COL] });
      // Rebar: four corner bars per column (the ground floor's also grow as cages before the pour).
      const barH = k === 0 ? (H + 0.6) * s.bars : visibleFloor ? H * grow(floorProgress(k) / 0.3) : 0;
      for (const [dx, dz] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]] as const) {
        barItems.push({ p: [x + dx, y0 + barH / 2, z + dz], s: [0.05, barH, 0.05] });
      }
      if (k === 0) {
        for (let i = 0; i < 12; i++) {
          const on = s.stirrups * 12 - i;
          const ok = on > 0 ? 1 : 0;
          const y = 0.2 + i * 0.27;
          for (const [px, pz, sx, sz] of [[0, -0.22, 0.48, 0.04], [0, 0.22, 0.48, 0.04], [-0.22, 0, 0.04, 0.48], [0.22, 0, 0.04, 0.48]] as const) {
            stirrupItems.push({ p: [x + px, y, z + pz], s: [sx * ok, 0.04 * ok, sz * ok] });
          }
        }
      }
    }
    // Formwork under this floor's slab, struck once the shell is done.
    const pp = propsP(k) * (1 - s.strike);
    PROP_XS.forEach((x, i) =>
      PROP_ZS.forEach((z, j) => {
        const order = rand(i * 31 + j * 7 + k) * 0.85;
        const on = grow((pp - order) / 0.15);
        const h = (H - SLAB - 0.25) * on;
        propItems.push({ p: [x, y0 + h / 2, z], s: [0.12, h, 0.12] });
      }),
    );
    const bp = (k === 0 ? s.beams : grow((floorProgress(k) - 0.55) / 0.15)) * (1 - s.strike);
    PROP_ZS.forEach((z) => beamItems.push({ p: [0, y0 + H - SLAB - 0.18, z], s: [12.4 * bp, 0.16, 0.14] }));
    const dp = (k === 0 ? s.deck : grow((floorProgress(k) - 0.65) / 0.1)) * (1 - s.strike);
    deckItems.push({ p: [0, y0 + H - SLAB - 0.05, 0], s: [12.8 * dp, 0.06, 9.6 * dp] });
    const sp = slabP(k);
    slabItems.push({ p: [-6.6 + (13.2 * sp) / 2, y0 + H - SLAB / 2, 0], s: [13.2 * sp, SLAB, 10] });

    // Envelope: plastered panels between columns with a window in each bay.
    const wp = s.plaster;
    for (let bay = 0; bay < 3; bay++) {
      const cx = (XS[bay] + XS[bay + 1]) / 2;
      for (const z of [-4.5, 4.5]) {
        wallItems.push({ p: [cx, y0 + (H - SLAB) / 2, z], s: [3.4 * wp, (H - SLAB) * wp, 0.22] });
        glassItems.push({ p: [cx, y0 + 1.45, z + Math.sign(z) * 0.13], s: [1.6 * s.paint, 1.5 * s.paint, 0.05] });
      }
    }
    for (let bay = 0; bay < 2; bay++) {
      const cz = (ZS[bay] + ZS[bay + 1]) / 2;
      for (const x of [-6, 6]) {
        wallItems.push({ p: [x, y0 + (H - SLAB) / 2, cz], s: [0.22, (H - SLAB) * wp, 4.1 * wp] });
        glassItems.push({ p: [x + Math.sign(x) * 0.13, y0 + 1.45, cz], s: [0.05, 1.5 * s.paint, 1.6 * s.paint] });
      }
    }
    if (k > 0) {
      for (let bay = 0; bay < 3; bay++) {
        const cx = (XS[bay] + XS[bay + 1]) / 2;
        balconyItems.push({ p: [cx, y0 + 0.05, 5.3], s: [2.6 * wp, 0.18, 1.4 * wp] });
        balconyItems.push({ p: [cx, y0 + 0.6, 5.95], s: [2.6 * wp, 1, 0.08 * wp] });
      }
    }
    bandItems.push({ p: [0, y0 + H - SLAB / 2, 5.02], s: [13.3 * s.paint, 0.36, 0.06] });
  }

  // Walls go up as grey plaster, then take the facade paint.
  if (!holo) m.wall.color.copy(PLASTER).lerp(PAINT, s.paint);
  return (
    <group>
      <Boxes items={columnItems} material={mat("concrete")} />
      <Boxes items={slabItems} material={mat("concrete")} />
      <Boxes items={barItems} material={mat("steel")} castShadow={false} />
      <Boxes items={stirrupItems} material={mat("steel")} castShadow={false} />
      <Boxes items={propItems} material={mat("wood")} />
      <Boxes items={beamItems} material={mat("wood")} />
      <Boxes items={deckItems} material={mat("plywood")} />
      <Boxes items={wallItems} material={mat("wall")} />
      <Boxes items={glassItems} material={mat("glass")} castShadow={false} />
      <Boxes items={balconyItems} material={mat("wall")} />
      <Boxes items={bandItems} material={mat("red")} castShadow={false} />
      <Foundations m={m} s={s} holo={holo} />
      <Services m={m} s={s} holo={holo} />
      {/* Roof: insulation membrane and the red One House parapet */}
      <mesh position={[0, FLOORS * H + 0.03, 0]} scale={[12.8 * s.insulation, 0.06, 9.6 * s.insulation]} receiveShadow>
        <boxGeometry />
        <primitive object={mat("membrane")} attach="material" />
      </mesh>
      <mesh position={[0, FLOORS * H + 0.4, 4.9]} scale={[13 * s.paint, 0.8, 0.25]} castShadow>
        <boxGeometry />
        <primitive object={mat("red")} attach="material" />
      </mesh>
      {/* Marble lobby floor and entrance canopy */}
      <mesh position={[0, 0.06, 2]} scale={[11 * s.marble, 0.1, 6 * s.marble]} receiveShadow>
        <boxGeometry />
        <primitive object={mat("marble")} attach="material" />
      </mesh>
      <mesh position={[0, 3.0, 5.9]} scale={[4 * s.marble, 0.2, 2 * s.marble]} castShadow>
        <boxGeometry />
        <primitive object={mat("navy")} attach="material" />
      </mesh>
      {/* Engineer's check: a green ring climbing each column */}
      {s.scan >= 0 && !holo && (
        <Boxes
          items={COLUMNS.map(([x, z]) => ({ p: [x, 0.2 + s.scan * 3.4, z], s: [0.9, 0.05, 0.9] }))}
          material={m.pipe}
          castShadow={false}
        />
      )}
      {/* Level check: a laser plane sweeping the deck */}
      {s.laser >= 0 && !holo && (
        <mesh position={[-6.4 + 12.8 * s.laser, H - SLAB + 0.02, 0]} scale={[0.08, 0.02, 9.8]}>
          <boxGeometry />
          <meshBasicMaterial color="#ff2a3d" />
        </mesh>
      )}
      {!holo && <Crane m={m} p={s.crane} frame={frame} />}
    </group>
  );
};

const Foundations: React.FC<{ readonly m: Materials; readonly s: BuildState; readonly holo?: boolean }> = ({ m, s, holo }) => {
  const mat = (x: keyof Materials) => (holo ? m.holo : m[x]);
  const leanItems: Item[] = [{ p: [0, -PIT.depth + 0.06, 0], s: [15 * s.lean, 0.12, 12 * s.lean] }];
  const footItems: Item[] = COLUMNS.map(([x, z]) => {
    const h = 0.9 * s.footings;
    return { p: [x, -PIT.depth + 0.12 + h / 2, z], s: [2.4, h, 2.4] };
  });
  const neckItems: Item[] = COLUMNS.map(([x, z]) => {
    const h = 1.0 * s.necks;
    return { p: [x, -PIT.depth + 1.02 + h / 2, z], s: [0.7, h, 0.7] };
  });
  return (
    <group>
      <Boxes items={leanItems} material={mat("lean")} />
      <Boxes items={footItems} material={mat("concrete")} />
      <Boxes items={neckItems} material={mat("concrete")} />
    </group>
  );
};

// Pipes and conduits inside the frame, before the walls close (and again under x-ray).
const Services: React.FC<{ readonly m: Materials; readonly s: BuildState; readonly holo?: boolean }> = ({ m, s, holo }) => {
  if (holo) return null;
  const top = FLOORS * H;
  const pipes: Item[] = [];
  const wires: Item[] = [];
  for (const [x, z] of [[-4, -3.5], [4, -3.5]] as const) {
    pipes.push({ p: [x, (top * s.plumbing) / 2, z], s: [0.16, top * s.plumbing, 0.16] });
  }
  for (let k = 0; k < FLOORS; k++) {
    pipes.push({ p: [0, k * H + 0.4, -3.5], s: [8 * s.plumbing, 0.12, 0.12] });
    wires.push({ p: [0, k * H + 2.5, 3.8], s: [11 * s.electric, 0.06, 0.06] });
    wires.push({ p: [-5.4, k * H + 1.4, 3.8], s: [0.06, 2.4 * s.electric, 0.06] });
    wires.push({ p: [5.4, k * H + 1.4, 3.8], s: [0.06, 2.4 * s.electric, 0.06] });
  }
  return (
    <group>
      <Boxes items={pipes} material={m.pipe} castShadow={false} geometry="cylinder" />
      <Boxes items={wires} material={m.wire} castShadow={false} />
    </group>
  );
};

// Tower crane beside the plot; the jib slews slowly and the hook load bobs.
const Crane: React.FC<{ readonly m: Materials; readonly p: number; readonly frame: number }> = ({ m, p, frame }) => {
  if (p <= 0) return null;
  const mastH = 24 * p;
  const slew = 0.6 + Math.sin(frame / 90) * 0.9;
  return (
    <group position={[-12, 0, -9]}>
      <mesh position={[0, mastH / 2, 0]} scale={[1, mastH, 1]} castShadow>
        <boxGeometry />
        <meshStandardMaterial color="#f2b705" wireframe />
      </mesh>
      <mesh position={[0, mastH / 2, 0]} scale={[0.7, mastH, 0.7]} castShadow>
        <boxGeometry />
        <primitive object={m.crane} attach="material" />
      </mesh>
      {p > 0.95 && (
        <group position={[0, mastH, 0]} rotation={[0, slew, 0]}>
          <mesh position={[8, 0.6, 0]} scale={[22, 0.9, 0.9]} castShadow>
            <boxGeometry />
            <primitive object={m.crane} attach="material" />
          </mesh>
          <mesh position={[-5, 0.4, 0]} scale={[3, 1.6, 1.6]} castShadow>
            <boxGeometry />
            <primitive object={m.concrete} attach="material" />
          </mesh>
          <mesh position={[0, 2.4, 0]} scale={[1.6, 2.4, 1.6]} castShadow>
            <boxGeometry />
            <primitive object={m.red} attach="material" />
          </mesh>
          <mesh position={[13, -4 + Math.sin(frame / 20) * 0.4, 0]} scale={[0.04, 8, 0.04]}>
            <boxGeometry />
            <meshBasicMaterial color="#333" />
          </mesh>
          <mesh position={[13, -8.4 + Math.sin(frame / 20) * 0.4, 0]} scale={[2.4, 0.6, 1.2]} castShadow>
            <boxGeometry />
            <primitive object={m.wood} attach="material" />
          </mesh>
        </group>
      )}
    </group>
  );
};
