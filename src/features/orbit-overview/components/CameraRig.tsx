import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { getSatellitePose } from "@/features/orbit-overview/lib/satelliteTracker";

export const HOME_CAMERA_POS = new THREE.Vector3(0, 5, 18);
export const HOME_TARGET = new THREE.Vector3(0, 0, 0);

interface CameraRigProps {
  followSatelliteId: string | null;
  homeToken: number;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}

/**
 * Smooth chase cam behind the craft along orbit tangent,
 * with a slight radial lift for an Earth-limb view.
 */
export default function CameraRig({
  followSatelliteId,
  homeToken,
  controlsRef,
}: CameraRigProps) {
  const { camera } = useThree();
  const desired = useRef(new THREE.Vector3());
  const lookAt = useRef(new THREE.Vector3());
  const side = useRef(new THREE.Vector3());
  const upHint = useRef(new THREE.Vector3());
  const mat = useRef(new THREE.Matrix4());
  const targetQuat = useRef(new THREE.Quaternion());

  useEffect(() => {
    if (followSatelliteId) return;
    camera.position.copy(HOME_CAMERA_POS);
    camera.up.set(0, 1, 0);
    camera.lookAt(HOME_TARGET);
    const controls = controlsRef.current;
    if (controls) {
      controls.target.copy(HOME_TARGET);
      controls.enableRotate = true;
      controls.enableZoom = true;
      controls.update();
    }
  }, [homeToken, followSatelliteId, camera, controlsRef]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.enableRotate = !followSatelliteId;
    controls.enableZoom = !followSatelliteId;
  }, [followSatelliteId, controlsRef]);

  useFrame((_, delta) => {
    const id = followSatelliteId;
    if (!id) return;
    const pose = getSatellitePose(id);
    if (!pose) return;

    side.current.crossVectors(pose.tangent, pose.radial).normalize();
    if (side.current.lengthSq() < 1e-6) {
      side.current.set(0, 1, 0);
    }

    const chaseDist = 1.25;
    const lift = 0.48;
    const sideSlip = 0.28;

    desired.current
      .copy(pose.position)
      .addScaledVector(pose.tangent, -chaseDist)
      .addScaledVector(pose.radial, lift)
      .addScaledVector(side.current, sideSlip);

    lookAt.current
      .copy(pose.position)
      .addScaledVector(pose.tangent, 1.6)
      .addScaledVector(pose.radial, -0.2);

    const k = 1 - Math.exp(-delta * 4.5);
    camera.position.lerp(desired.current, k);

    upHint.current.copy(pose.radial);
    mat.current.lookAt(camera.position, lookAt.current, upHint.current);
    targetQuat.current.setFromRotationMatrix(mat.current);
    camera.quaternion.slerp(targetQuat.current, k);
    camera.up.copy(upHint.current);

    const controls = controlsRef.current;
    if (controls) {
      controls.target.lerp(pose.position, k);
      controls.update();
    }
  });

  return null;
}
