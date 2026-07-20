import { Component, ReactNode, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { MissionType } from "@/features/orbit-overview/lib/missions";
import {
  MISSION_MODEL,
  MODEL_TARGET_SIZE,
  SATELLITE_MODELS,
  SatelliteModelKey,
} from "@/features/orbit-overview/lib/satelliteModels";

const ALL_PATHS = Object.values(SATELLITE_MODELS).map((m) => m.path);
ALL_PATHS.forEach((p) => useGLTF.preload(p));

function forceVisibleMaterials(
  root: THREE.Object3D,
  accent = "#9db0c7"
): void {
  root.traverse((obj) => {
    if (!(obj as THREE.Mesh).isMesh) return;
    const mesh = obj as THREE.Mesh;
    // Drop broken external texture refs (e.g. Terra.fbm/*.tga → 404)
    // and replace with lit materials that read against deep space.
    const visible = new THREE.MeshStandardMaterial({
      color: new THREE.Color(accent).lerp(new THREE.Color("#d8dee8"), 0.55),
      metalness: 0.55,
      roughness: 0.38,
      emissive: new THREE.Color(accent),
      emissiveIntensity: 0.22,
      side: THREE.DoubleSide,
    });
    mesh.material = visible;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.frustumCulled = false;
  });
}

function normalizeModel(
  scene: THREE.Object3D,
  targetSize: number,
  accent?: string
): THREE.Object3D {
  const clone = scene.clone(true);
  forceVisibleMaterials(clone, accent);

  clone.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(clone);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);

  if (!Number.isFinite(maxDim) || maxDim < 1e-6) {
    clone.scale.setScalar(targetSize);
  } else {
    clone.scale.setScalar(targetSize / maxDim);
  }

  clone.updateMatrixWorld(true);
  box.setFromObject(clone);
  const center = box.getCenter(new THREE.Vector3());
  clone.position.sub(center);
  clone.updateMatrixWorld(true);

  return clone;
}

interface SatelliteMeshProps {
  missionType: MissionType;
  selected?: boolean;
  hovered?: boolean;
  accentColor?: string;
}

export default function SatelliteMesh({
  missionType,
  selected,
  hovered,
  accentColor = "#9db0c7",
}: SatelliteMeshProps) {
  const key: SatelliteModelKey = MISSION_MODEL[missionType];
  const path = SATELLITE_MODELS[key].path;
  const { scene } = useGLTF(path);

  const model = useMemo(
    () => normalizeModel(scene, MODEL_TARGET_SIZE[key], accentColor),
    [scene, key, accentColor]
  );

  const scale = selected ? 1.45 : hovered ? 1.2 : 1;

  return (
    <group scale={scale}>
      <primitive object={model} />
      {/* Always-on locator so sats remain findable at orbital scale */}
      <mesh>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshBasicMaterial color={accentColor} />
      </mesh>
      {(selected || hovered) && (
        <mesh>
          <sphereGeometry args={[MODEL_TARGET_SIZE[key] * 0.85, 16, 16]} />
          <meshBasicMaterial
            color={accentColor}
            transparent
            opacity={selected ? 0.14 : 0.08}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

export class SatelliteMeshErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
