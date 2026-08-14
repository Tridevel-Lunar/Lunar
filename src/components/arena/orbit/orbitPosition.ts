import * as THREE from "three";

/**
 * Point on a circular orbit. Visual only — does not recompute physics.
 * Phase 0 sits on +X (subsolar if the sun is also on +X).
 */
export function orbitPosition(
  phase: number,
  radius: number,
  inclinationDeg: number,
  target = new THREE.Vector3(),
): THREE.Vector3 {
  const theta = phase * Math.PI * 2;
  const i = THREE.MathUtils.degToRad(inclinationDeg);
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);
  return target.set(
    radius * cosT,
    radius * sinT * Math.sin(i),
    radius * sinT * Math.cos(i),
  );
}

export function orbitRingPoints(
  radius: number,
  inclinationDeg: number,
  segments = 64,
): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i += 1) {
    points.push(orbitPosition(i / segments, radius, inclinationDeg, new THREE.Vector3()));
  }
  return points;
}
