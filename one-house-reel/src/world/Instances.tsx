import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export type Item = { p: [number, number, number]; s: [number, number, number]; r?: [number, number, number] };

// Many copies of one box, positioned and scaled per frame (a scale of 0 hides an item).
export const Boxes: React.FC<{
  readonly items: Item[];
  readonly material: THREE.Material;
  readonly castShadow?: boolean;
  readonly receiveShadow?: boolean;
  readonly geometry?: "box" | "cylinder" | "sphere";
}> = ({ items, material, castShadow = true, receiveShadow = true, geometry = "box" }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(
    () =>
      geometry === "cylinder"
        ? new THREE.CylinderGeometry(0.5, 0.5, 1, 10)
        : geometry === "sphere"
          ? new THREE.SphereGeometry(0.5, 12, 10)
          : new THREE.BoxGeometry(1, 1, 1),
    [geometry],
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    items.forEach((it, i) => {
      dummy.position.set(...it.p);
      dummy.rotation.set(...(it.r ?? [0, 0, 0]));
      const [x, y, z] = it.s;
      dummy.scale.set(Math.max(x, 1e-4), Math.max(y, 1e-4), Math.max(z, 1e-4));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.count = items.length;
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  });
  return (
    <instancedMesh
      ref={ref}
      args={[geo, material, Math.max(1, items.length)]}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
      frustumCulled={false}
    />
  );
};
