import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import {
  ANATOMY_MODELS,
  OVERVIEW_TARGET_SIZE,
} from "../lib/models";

useGLTF.preload(ANATOMY_MODELS.overview.path);

function prepareOverview(scene: THREE.Object3D): THREE.Object3D {
  const clone = scene.clone(true);
  clone.traverse((obj) => {
    if (!(obj as THREE.Mesh).isMesh) return;
    const mesh = obj as THREE.Mesh;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    mats.forEach((m) => {
      if (!m || !(m as THREE.MeshStandardMaterial).isMeshStandardMaterial) return;
      const std = m as THREE.MeshStandardMaterial;
      std.transparent = true;
      std.metalness = Math.min(0.85, (std.metalness ?? 0.4) + 0.15);
      std.roughness = Math.max(0.25, (std.roughness ?? 0.45) - 0.05);
      std.envMapIntensity = 1.1;
      std.needsUpdate = true;
    });
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  });

  clone.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(clone);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  clone.scale.setScalar(OVERVIEW_TARGET_SIZE / maxDim);
  clone.updateMatrixWorld(true);
  box.setFromObject(clone);
  const center = box.getCenter(new THREE.Vector3());
  clone.position.sub(center);
  return clone;
}

export default function CubeSatOverviewModel({
  highlighted = false,
  opacityRef,
}: {
  highlighted?: boolean;
  /** 0–1 shell visibility while unfolding */
  opacityRef: React.MutableRefObject<number>;
}) {
  const { scene } = useGLTF(ANATOMY_MODELS.overview.path);
  const prepared = useMemo(() => prepareOverview(scene), [scene]);
  const root = useRef<THREE.Group>(null);

  useFrame(() => {
    const opacity = opacityRef.current;
    if (root.current) root.current.visible = opacity > 0.02;
    prepared.traverse((obj) => {
      if (!(obj as THREE.Mesh).isMesh) return;
      const mesh = obj as THREE.Mesh;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => {
        if (!m || !(m as THREE.MeshStandardMaterial).isMeshStandardMaterial) return;
        const std = m as THREE.MeshStandardMaterial;
        std.opacity = opacity;
        std.transparent = opacity < 0.99;
        std.depthWrite = opacity > 0.85;
      });
    });
  });

  return (
    <group ref={root}>
      <primitive object={prepared} />
      {highlighted && (
        <mesh>
          <boxGeometry args={[1.55, 1.55, 1.7]} />
          <meshBasicMaterial
            color="#00e5ff"
            transparent
            opacity={0.06}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}
