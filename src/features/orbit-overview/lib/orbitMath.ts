import * as THREE from "three";

/** Scene units for Earth's mean radius (matches <Earth /> visual size). */
export const EARTH_RADIUS = 2;

/** Mean Earth radius in km — used to map real altitudes into scene space. */
export const EARTH_RADIUS_KM = 6371;

export type OrbitPathParams = {
  band: string;
  altitudeKm: number;
  inclinationDeg: number;
  perigeeKm?: number;
  apogeeKm?: number;
};

/**
 * Convert altitude above the surface (km) into an orbital radius in scene units.
 */
export function altitudeToSceneRadius(altitudeKm: number): number {
  return EARTH_RADIUS * (1 + altitudeKm / EARTH_RADIUS_KM);
}

/** Convert geocentric radius (km) into scene units. */
export function geocentricKmToScene(rKm: number): number {
  return EARTH_RADIUS * (rKm / EARTH_RADIUS_KM);
}

/**
 * Point on a circular (or fixed-radius) orbit with inclination.
 * Orbit in equatorial XZ, tilted around +X.
 */
export function orbitPosition(
  theta: number,
  radius: number,
  inclinationDeg: number,
  target = new THREE.Vector3()
): THREE.Vector3 {
  const i = THREE.MathUtils.degToRad(inclinationDeg);
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);
  return target.set(
    radius * cosT,
    radius * sinT * Math.sin(i),
    radius * sinT * Math.cos(i)
  );
}

/**
 * Elliptical orbit (HEO): true anomaly θ, Earth at one focus.
 * r = a(1−e²)/(1+e cos θ)
 */
export function ellipticalOrbitPosition(
  trueAnomaly: number,
  perigeeAltKm: number,
  apogeeAltKm: number,
  inclinationDeg: number,
  target = new THREE.Vector3()
): THREE.Vector3 {
  const rp = EARTH_RADIUS_KM + perigeeAltKm;
  const ra = EARTH_RADIUS_KM + apogeeAltKm;
  const a = (rp + ra) / 2;
  const e = (ra - rp) / (ra + rp);
  const rKm = (a * (1 - e * e)) / (1 + e * Math.cos(trueAnomaly));
  const radius = geocentricKmToScene(rKm);
  return orbitPosition(trueAnomaly, radius, inclinationDeg, target);
}

export function sampleOrbitPoints(
  radius: number,
  inclinationDeg: number,
  segments = 256
): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    pts.push(orbitPosition(theta, radius, inclinationDeg));
  }
  return pts;
}

export function sampleOrbitDefinition(
  orbit: OrbitPathParams,
  segments = 256
): THREE.Vector3[] {
  if (
    orbit.band === "HEO" &&
    orbit.perigeeKm != null &&
    orbit.apogeeKm != null
  ) {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      pts.push(
        ellipticalOrbitPosition(
          theta,
          orbit.perigeeKm,
          orbit.apogeeKm,
          orbit.inclinationDeg
        )
      );
    }
    return pts;
  }
  return sampleOrbitPoints(
    altitudeToSceneRadius(orbit.altitudeKm),
    orbit.inclinationDeg,
    segments
  );
}

/** Place a satellite given its parent orbit definition. */
export function satelliteWorldPosition(
  theta: number,
  orbit: OrbitPathParams,
  satAltitudeKm: number,
  satInclinationDeg: number,
  radiusJitter = 0,
  target = new THREE.Vector3()
): THREE.Vector3 {
  if (
    orbit.band === "HEO" &&
    orbit.perigeeKm != null &&
    orbit.apogeeKm != null
  ) {
    return ellipticalOrbitPosition(
      theta,
      orbit.perigeeKm,
      orbit.apogeeKm,
      satInclinationDeg,
      target
    );
  }
  const radius = altitudeToSceneRadius(satAltitudeKm) + radiusJitter;
  return orbitPosition(theta, radius, satInclinationDeg, target);
}
