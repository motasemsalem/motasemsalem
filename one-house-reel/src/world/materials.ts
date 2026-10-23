import * as THREE from "three";
import { rand } from "../cues";

// Seeded value-noise texture so concrete, sand and plaster are never flat colour.
const noiseTexture = (seed: number, size = 256, contrast = 0.18, repeat = 4) => {
  const data = new Uint8Array(size * size * 4);
  const cell = 16;
  const grid = (x: number, y: number) => rand(seed * 1000 + (x % (size / cell)) * 97 + (y % (size / cell)) * 13);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const gx = Math.floor(x / cell);
      const gy = Math.floor(y / cell);
      const fx = (x % cell) / cell;
      const fy = (y % cell) / cell;
      const sx = fx * fx * (3 - 2 * fx);
      const sy = fy * fy * (3 - 2 * fy);
      const v =
        grid(gx, gy) * (1 - sx) * (1 - sy) + grid(gx + 1, gy) * sx * (1 - sy) + grid(gx, gy + 1) * (1 - sx) * sy + grid(gx + 1, gy + 1) * sx * sy;
      const grain = rand(seed + x * 7.1 + y * 3.3) * 0.5 + 0.5;
      const value = 255 * (1 - contrast + contrast * (0.7 * v + 0.3 * grain));
      data.set([value, value, value, 255], (y * size + x) * 4);
    }
  }
  const tex = new THREE.DataTexture(data, size, size);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.needsUpdate = true;
  return tex;
};

export const makeMaterials = () => {
  const concreteTex = noiseTexture(1, 256, 0.22, 2);
  const sandTex = noiseTexture(2, 256, 0.25, 40);
  const plasterTex = noiseTexture(3, 256, 0.1, 3);
  return {
    sand: new THREE.MeshStandardMaterial({ color: "#d9c19a", map: sandTex, roughness: 1 }),
    soil: new THREE.MeshStandardMaterial({ color: "#8a6440", map: sandTex, roughness: 1 }),
    concrete: new THREE.MeshStandardMaterial({ color: "#c9c4bb", map: concreteTex, roughness: 0.9 }),
    lean: new THREE.MeshStandardMaterial({ color: "#a9a49b", map: concreteTex, roughness: 1 }),
    steel: new THREE.MeshStandardMaterial({ color: "#8c3b2a", metalness: 0.6, roughness: 0.45 }),
    wood: new THREE.MeshStandardMaterial({ color: "#d6a35c", roughness: 0.8 }),
    plywood: new THREE.MeshStandardMaterial({ color: "#c98f45", roughness: 0.85 }),
    wall: new THREE.MeshStandardMaterial({ color: "#efe3cf", map: plasterTex, roughness: 0.95, transparent: true }),
    glass: new THREE.MeshStandardMaterial({ color: "#1d3557", metalness: 0.9, roughness: 0.15, emissive: "#ffcf7a", emissiveIntensity: 0, transparent: true }),
    red: new THREE.MeshStandardMaterial({ color: "#e0071a", roughness: 0.5 }),
    navy: new THREE.MeshStandardMaterial({ color: "#062448", roughness: 0.6 }),
    pipe: new THREE.MeshStandardMaterial({ color: "#3fa9ff", emissive: "#3fa9ff", emissiveIntensity: 0.8, roughness: 0.3 }),
    wire: new THREE.MeshStandardMaterial({ color: "#ffc23a", emissive: "#ffc23a", emissiveIntensity: 1, roughness: 0.3 }),
    membrane: new THREE.MeshStandardMaterial({ color: "#2f3540", roughness: 0.4, metalness: 0.2 }),
    marble: new THREE.MeshStandardMaterial({ color: "#f4f2ee", roughness: 0.12, metalness: 0.05 }),
    holo: new THREE.MeshBasicMaterial({ color: "#6fd3ff", wireframe: true, transparent: true, opacity: 0.9 }),
    xray: new THREE.MeshBasicMaterial({ color: "#6fd3ff", wireframe: true, transparent: true, opacity: 0.6 }),
    city: new THREE.MeshStandardMaterial({ color: "#e3d2b4", map: plasterTex, roughness: 1 }),
    cityRoof: new THREE.MeshStandardMaterial({ color: "#cdb994", roughness: 1 }),
    hardhat: new THREE.MeshStandardMaterial({ color: "#ffd21f", roughness: 0.4 }),
    vest: new THREE.MeshStandardMaterial({ color: "#ff7a1a", roughness: 0.7 }),
    skin: new THREE.MeshStandardMaterial({ color: "#a8765a", roughness: 0.8 }),
    crane: new THREE.MeshStandardMaterial({ color: "#f2b705", roughness: 0.5, metalness: 0.3 }),
    tape: new THREE.MeshBasicMaterial({ color: "#e0071a" }),
    white: new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.3 }),
    tile: new THREE.MeshStandardMaterial({ color: "#dfe6ec", roughness: 0.2, metalness: 0.05 }),
    cabinet: new THREE.MeshStandardMaterial({ color: "#e9dcc6", roughness: 0.5 }),
    chrome: new THREE.MeshStandardMaterial({ color: "#eef1f5", metalness: 0.7, roughness: 0.25 }),
    water: new THREE.MeshStandardMaterial({ color: "#8fd8ff", transparent: true, opacity: 0.85, roughness: 0.05, emissive: "#3fa9ff", emissiveIntensity: 0.3 }),
    mirror: new THREE.MeshStandardMaterial({ color: "#cfe3f5", metalness: 0.9, roughness: 0.04 }),
  };
};

export type Materials = ReturnType<typeof makeMaterials>;
