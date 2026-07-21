import * as THREE from "three";

export type SatellitePose = {
  position: THREE.Vector3;
  /** Unit tangent ≈ direction of travel */
  tangent: THREE.Vector3;
  /** Outward from Earth */
  radial: THREE.Vector3;
};

const poses = new Map<string, SatellitePose>();

const _tmpPos = new THREE.Vector3();
const _tmpTan = new THREE.Vector3();
const _tmpRad = new THREE.Vector3();

export function publishSatellitePose(
  id: string,
  position: THREE.Vector3,
  tangent: THREE.Vector3
) {
  let pose = poses.get(id);
  if (!pose) {
    pose = {
      position: new THREE.Vector3(),
      tangent: new THREE.Vector3(),
      radial: new THREE.Vector3(),
    };
    poses.set(id, pose);
  }
  pose.position.copy(position);
  pose.tangent.copy(tangent).normalize();
  pose.radial.copy(position).normalize();
}

export function getSatellitePose(id: string): SatellitePose | null {
  return poses.get(id) ?? null;
}

export function clearSatellitePose(id: string) {
  poses.delete(id);
}

/** Helpers reused when publishing */
export function scratchPoseVectors() {
  return { pos: _tmpPos, tan: _tmpTan, rad: _tmpRad };
}
