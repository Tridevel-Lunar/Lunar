import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { getSatellitePose } from "../lib/satelliteTracker";

export const HOME_CAMERA_POS = new THREE.Vector3(0, 5, 18);
export const HOME_TARGET = new THREE.Vector3(0, 0, 0);

interface CameraRigProps {
  followSatelliteId: string | null;
  homeToken: number;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}

/**
 * Earth overview, or satellite focus with free OrbitControls (zoom + orbit).
 * Target tracks the craft; camera offset stays fixed (no auto-yaw).
 */
export default function CameraRig({
  followSatelliteId,
  homeToken,
  controlsRef,
}: CameraRigProps) {
  const { camera } = useThree();
  const offset = useRef(new THREE.Vector3());
  const snappedId = useRef<string | null>(null);

  // Return to Earth overview
  useEffect(() => {
    if (followSatelliteId) return;
    snappedId.current = null;

    camera.position.copy(HOME_CAMERA_POS);
    camera.up.set(0, 1, 0);
    camera.near = 0.1;
    camera.updateProjectionMatrix();
    camera.lookAt(HOME_TARGET);

    const controls = controlsRef.current;
    if (controls) {
      controls.target.copy(HOME_TARGET);
      controls.minDistance = 1.2;
      controls.maxDistance = 220;
      controls.enableRotate = true;
      controls.enableZoom = true;
      controls.update();
    }
  }, [homeToken, followSatelliteId, camera, controlsRef]);

  useEffect(() => {
    snappedId.current = null;
  }, [followSatelliteId]);

  useFrame(() => {
    const id = followSatelliteId;
    const controls = controlsRef.current;
    if (!id || !controls) return;

    const pose = getSatellitePose(id);
    if (!pose) return;

    const sat = pose.position;
    const r = Math.max(sat.length(), 0.01);

    if (snappedId.current !== id) {
      const desiredDist = THREE.MathUtils.clamp(r * 0.35, 0.85, 6);
      controls.minDistance = 0.02;
      controls.maxDistance = Math.max(220, r * 14);
      camera.near = 0.02;
      camera.updateProjectionMatrix();

      controls.target.copy(sat);
      offset.current
        .copy(pose.tangent)
        .multiplyScalar(-1)
        .addScaledVector(pose.radial, 0.35)
        .normalize()
        .multiplyScalar(desiredDist);
      if (offset.current.lengthSq() < 1e-8) {
        offset.current.set(0, desiredDist * 0.4, desiredDist);
      }
      camera.position.copy(controls.target).add(offset.current);
      controls.update();
      snappedId.current = id;
      return;
    }

    // Keep orbit center on the moving satellite; preserve user view angle
    const dx = sat.x - controls.target.x;
    const dy = sat.y - controls.target.y;
    const dz = sat.z - controls.target.z;
    controls.target.copy(sat);
    camera.position.x += dx;
    camera.position.y += dy;
    camera.position.z += dz;
    controls.update();
  });

  return null;
}
