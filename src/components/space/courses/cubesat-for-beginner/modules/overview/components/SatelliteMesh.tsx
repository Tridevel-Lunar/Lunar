import { Component, ReactNode, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { MissionType } from "../lib/missions";
import {
  displaySizeForMission,
  MISSION_MODEL,
  nadirTiltXForMission,
  SATELLITE_MODELS,
  SatelliteModelKey,
} from "../lib/satelliteModels";

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
      // Transparent pass so we can draw above orbit tubes (also transparent)
      transparent: true,
      opacity: 1,
      depthWrite: true,
    });
    mesh.material = visible;
    mesh.renderOrder = 10;
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
  /** Hide locator beacon while camera is focused on this craft. */
  followed?: boolean;
  accentColor?: string;
  /** Override orbit display size (museum / inspect). */
  displaySize?: number;
  /** When false, hide orbit locator beacon (museum). Default: show unless followed. */
  showBeacon?: boolean;
  /** Apply nadir tilt for orbit lookAt. Museum displays upright. Default true. */
  applyNadirTilt?: boolean;
}

export default function SatelliteMesh({
  missionType,
  selected,
  hovered,
  followed,
  accentColor = "#9db0c7",
  displaySize,
  showBeacon: showBeaconProp,
  applyNadirTilt = true,
}: SatelliteMeshProps) {
  const key: SatelliteModelKey = MISSION_MODEL[missionType];
  const path = SATELLITE_MODELS[key].path;
  const { scene } = useGLTF(path);
  const targetSize = displaySize ?? displaySizeForMission(missionType);
  const nadirTiltX = applyNadirTilt ? nadirTiltXForMission(missionType) : 0;

  const model = useMemo(
    () => normalizeModel(scene, targetSize, accentColor),
    [scene, targetSize, accentColor]
  );

  // Large enough to find & click from Earth overview (model itself stays true-relative)
  const beaconR = Math.max(0.09, Math.min(0.16, targetSize * 1.8));
  const hitR = beaconR * 1.65;
  const showBeacon = showBeaconProp ?? !followed;

  return (
    <group renderOrder={10}>
      {/* Parent lookAt points −Z at Earth; tilt so model nadir axis matches */}
      <group rotation={[nadirTiltX, 0, 0]}>
        <primitive object={model} />
      </group>
      {showBeacon && (
        <>
          <mesh renderOrder={10}>
            <sphereGeometry args={[hitR, 12, 12]} />
            <meshBasicMaterial
              transparent
              opacity={0}
              depthWrite={false}
            />
          </mesh>
          <mesh renderOrder={11}>
            <sphereGeometry args={[beaconR, 16, 16]} />
            <meshBasicMaterial color={accentColor} transparent opacity={0.92} depthWrite />
          </mesh>
        </>
      )}
      {showBeacon && (selected || hovered) && (
        <mesh renderOrder={10}>
          <sphereGeometry args={[beaconR * 1.55, 16, 16]} />
          <meshBasicMaterial
            color={accentColor}
            transparent
            opacity={selected ? 0.18 : 0.1}
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
