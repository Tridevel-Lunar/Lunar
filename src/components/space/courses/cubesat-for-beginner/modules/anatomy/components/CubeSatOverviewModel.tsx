import { useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import * as THREE from "three";
import {
  ANATOMY_MODELS,
  CUBESAT_1U_TOP_OFFSET,
  OVERVIEW_TARGET_SIZE,
} from "../lib/models";

const STL_PATHS = [
  ANATOMY_MODELS.structureBase.path,
  ANATOMY_MODELS.structureTop.path,
] as const;

useLoader.preload(STLLoader, [...STL_PATHS]);

function aluminumMaterial(highlight: boolean) {
  return new THREE.MeshStandardMaterial({
    color: highlight ? "#e2e8f0" : "#8b9aab",
    metalness: highlight ? 0.82 : 0.72,
    roughness: highlight ? 0.22 : 0.32,
    envMapIntensity: 1.15,
    transparent: true,
    opacity: 1,
  });
}

function assembleCad(
  baseGeo: THREE.BufferGeometry,
  topGeo: THREE.BufferGeometry,
  highlight: boolean,
): THREE.Group {
  const group = new THREE.Group();
  const mat = aluminumMaterial(highlight);

  const baseMesh = new THREE.Mesh(baseGeo.clone(), mat);
  const topMesh = new THREE.Mesh(topGeo.clone(), mat.clone());
  for (const mesh of [baseMesh, topMesh]) {
    mesh.geometry.computeVertexNormals();
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  }
  topMesh.position.set(...CUBESAT_1U_TOP_OFFSET);
  group.add(baseMesh, topMesh);

  group.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(group);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  group.scale.setScalar(OVERVIEW_TARGET_SIZE / maxDim);
  group.updateMatrixWorld(true);
  box.setFromObject(group);
  const center = box.getCenter(new THREE.Vector3());
  group.position.sub(center);
  return group;
}

export default function CubeSatOverviewModel({
  highlighted = false,
  structureHighlight = false,
  opacityRef,
}: {
  highlighted?: boolean;
  structureHighlight?: boolean;
  opacityRef: React.MutableRefObject<number>;
}) {
  const [baseGeo, topGeo] = useLoader(STLLoader, [...STL_PATHS]);
  const prepared = useMemo(
    () => assembleCad(baseGeo, topGeo, highlighted || structureHighlight),
    [baseGeo, topGeo, highlighted, structureHighlight],
  );
  const root = useRef<THREE.Group>(null);

  useFrame(() => {
    const opacity = structureHighlight
      ? Math.max(opacityRef.current, 0.88)
      : opacityRef.current;
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
          <boxGeometry args={[1.55, 1.7, 1.55]} />
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
