import { EARTH_RADIUS_KM, EARTH_RADIUS_M, MU_EARTH, ORBIT_ALT_KM } from "../physics/constants";

/** Sidereal Earth spin rate (rad/s) — one turn per ~86 164 s. */
export const EARTH_SIDEREAL_OMEGA = (2 * Math.PI) / 86_164.0905;

/** Orbital radius in Earth radii for a given altitude (km). */
export function orbitRadiusRe(altKm: number): number {
  return 1 + altKm / EARTH_RADIUS_KM;
}

/** Mean motion (rad/s) for a circular orbit at radius r (Earth radii). */
export function meanMotion(rRe: number): number {
  return Math.sqrt(MU_EARTH / (rRe * EARTH_RADIUS_M) ** 3);
}

/** Orbital period (seconds) for a circular orbit at radius r (Earth radii). */
export function orbitPeriod(rRe: number): number {
  return (2 * Math.PI) / meanMotion(rRe);
}

/** ISS-class LEO (~420 km). */
export const GRAVITY_ORBIT_A = 1.07;
export const GRAVITY_ORBIT_B = 1.066;
export const GRAVITY_MEAN_MOTION = meanMotion(GRAVITY_ORBIT_A);
export const GRAVITY_ORBIT_PERIOD = orbitPeriod(GRAVITY_ORBIT_A);

/** Thermal / orbit-sim LEO at 500 km. */
export const LEO500_ORBIT_RADIUS_RE = orbitRadiusRe(ORBIT_ALT_KM);
export const LEO500_MEAN_MOTION = meanMotion(LEO500_ORBIT_RADIUS_RE);
export const LEO500_ORBIT_PERIOD = orbitPeriod(LEO500_ORBIT_RADIUS_RE);

/** Position on equatorial circular orbit from simulation time (seconds). */
export function equatorialOrbitPosition(
  simTime: number,
  rRe: number,
  meanMotionRadPerSec: number,
  phase = 0,
): { x: number; z: number; theta: number } {
  const theta = simTime * meanMotionRadPerSec + phase;
  return {
    x: Math.cos(theta) * rRe,
    z: Math.sin(theta) * rRe,
    theta,
  };
}
