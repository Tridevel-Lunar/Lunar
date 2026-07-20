import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { EARTH_RADIUS } from "@/features/orbit-overview/lib/orbitMath";

/**
 * NASA VTAD Earth glTF (Solar System Exploration #2393):
 * https://solarsystem.nasa.gov/gltf_embed/2393/
 * Local copy: /models/Earth_1_12756.glb
 */
const EARTH_MODEL = "/models/Earth_1_12756.glb";

useGLTF.preload(EARTH_MODEL);

export default function Earth() {
  const rootRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(EARTH_MODEL);

  const earth = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const mat = mesh.material;
        if (mat && !Array.isArray(mat)) {
          // Clone material so edits don't mutate the GLTF cache.
          const m = (mat as THREE.MeshStandardMaterial).clone();
          m.roughness = 0.82;
          m.metalness = 0.05;
          m.envMapIntensity = 0.35;
          mesh.material = m;
        }
      }
    });

    // Normalize NASA mesh to our scene Earth radius.
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = (EARTH_RADIUS * 2) / maxDim;
    clone.scale.setScalar(scale);
    box.setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    clone.position.sub(center);

    return clone;
  }, [scene]);

  useFrame((_, delta) => {
    if (rootRef.current) rootRef.current.rotation.y += delta * 0.022;
  });

  return (
    <group ref={rootRef}>
      <primitive object={earth} />

      {/* Thin cloud veil */}
      <mesh scale={1.012}>
        <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
        <meshStandardMaterial
          color="#e8f0ff"
          transparent
          opacity={0.08}
          roughness={1}
          depthWrite={false}
        />
      </mesh>

      {/* Atmospheric limb */}
      <mesh scale={1.045}>
        <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
        <meshBasicMaterial
          color="#6eb6ff"
          transparent
          opacity={0.14}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Soft outer glow */}
      <mesh scale={1.12}>
        <sphereGeometry args={[EARTH_RADIUS, 48, 48]} />
        <meshBasicMaterial
          color="#3d7fc4"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
