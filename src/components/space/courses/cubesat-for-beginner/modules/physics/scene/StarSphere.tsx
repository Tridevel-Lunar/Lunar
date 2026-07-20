import { useEffect, useRef } from "react";
import * as THREE from "three/webgpu";

import { loadStarmapTexture } from "./textures";

/** Milky-way skysphere (NASA Tycho skymap) — heavy texture, use for hero scenes. */
export default function StarSphere({ radius = 50000 }: { radius?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    const mat = new THREE.MeshBasicMaterial({
      map: loadStarmapTexture(),
      side: THREE.BackSide,
      depthWrite: false,
    });
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 32), mat);
    group.add(sphere);

    return () => {
      group.remove(sphere);
      sphere.geometry.dispose();
      mat.dispose();
    };
  }, [radius]);

  return <group ref={groupRef} />;
}
