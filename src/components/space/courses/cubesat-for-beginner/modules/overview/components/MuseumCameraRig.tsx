import { useEffect, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";

export type MuseumCameraRigProps = {
  /** World center of the focused craft. */
  focusX: number;
  focusY?: number;
  focusZ?: number;
};

/**
 * Free gallery camera. On focus change, slides camera + orbit target
 * along the gallery (mainly +X) so the view moves to the craft —
 * not merely lookAt from a fixed position.
 */
export default function MuseumCameraRig({
  focusX,
  focusY = 0.7,
  focusZ = 0,
}: MuseumCameraRigProps) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const desired = useRef(new THREE.Vector3(focusX, focusY, focusZ));

  useEffect(() => {
    desired.current.set(focusX, focusY, focusZ);
  }, [focusX, focusY, focusZ]);

  useFrame((_, dt) => {
    const controls = controlsRef.current;
    if (!controls) return;

    // Smooth follow — same delta applied to target AND camera so framing holds
    const k = 1 - Math.exp(-4.2 * dt);
    const dx = (desired.current.x - controls.target.x) * k;
    const dy = (desired.current.y - controls.target.y) * k;
    const dz = (desired.current.z - controls.target.z) * k;

    controls.target.x += dx;
    controls.target.y += dy;
    controls.target.z += dz;
    camera.position.x += dx;
    camera.position.y += dy;
    camera.position.z += dz;
    controls.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      enablePan
      enableRotate
      enableZoom
      minDistance={1.2}
      maxDistance={28}
      maxPolarAngle={Math.PI * 0.92}
    />
  );
}
