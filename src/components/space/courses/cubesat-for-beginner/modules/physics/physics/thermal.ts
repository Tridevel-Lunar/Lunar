import * as THREE from "three";
import {
  STEFAN_BOLTZMANN,
  SOLAR_CONSTANT,
  EARTH_IR,
  EARTH_ALBEDO,
  A_PROJ,
  HEAT_CAPACITY,
  ALPHA,
  EPSILON,
  EARTH_RADIUS,
} from "./constants";

// ──────────────────────────────────────────
// Temperature → Color (Kelvin scale)
// ──────────────────────────────────────────
export function kelvinToColor(temp: number): THREE.Color {
  const c = new THREE.Color();
  if (temp < 220) c.setHSL(0.65, 0.9, 0.15); // Dark Blue
  else if (temp < 240) c.setHSL(0.6, 0.8, 0.3); // Blue
  else if (temp < 260) c.setHSL(0.0, 0.0, 0.7); // White
  else if (temp < 290) c.setHSL(0.12, 0.5, 0.7); // Light Yellow
  else if (temp < 320) c.setHSL(0.08, 0.8, 0.5); // Orange
  else if (temp < 360) c.setHSL(0.0, 0.9, 0.5); // Red
  else c.setHSL(0.05, 1.0, 0.6); // Bright Orange
  return c;
}

// ──────────────────────────────────────────
// Eclipse Detection
// ──────────────────────────────────────────
// Returns 0 (umbra) → 1 (full sun) with smooth penumbra transition.
export function computeEclipseFactor(
  satPos: THREE.Vector3,
  sunDir: THREE.Vector3,
): number {
  // isBehindEarth = dot(satPosition, sunDirection) < 0
  const behindEarth = satPos.dot(sunDir) < 0;
  if (!behindEarth) return 1.0;

  // Perpendicular distance from sun–Earth axis
  const proj = satPos.dot(sunDir);
  const perpVec = satPos.clone().sub(sunDir.clone().multiplyScalar(proj));
  const perpDist = perpVec.length();

  const penumbraWidth = 0.03;
  return THREE.MathUtils.smoothstep(
    perpDist,
    EARTH_RADIUS - penumbraWidth,
    EARTH_RADIUS + penumbraWidth,
  );
}

// ──────────────────────────────────────────
// Heat Flux Calculation
// ──────────────────────────────────────────
export interface HeatFlux {
  Qsolar: number;
  Qalbedo: number;
  QIR: number;
  visEarth: number;
  solarDot: number;
}

export function computeHeatFlux(
  satPos: THREE.Vector3,
  sunDir: THREE.Vector3,
  eclipseFactor: number,
): HeatFlux {
  // Sun-tracking panel: full solar flux when sunlit
  const solarDot = 1;
  const Qsolar = ALPHA * SOLAR_CONSTANT * A_PROJ * solarDot * eclipseFactor;

  // Nadir-facing Earth flux (lumped one-node model — not a full radiator network)
  const orbitR = satPos.length();
  const earthDiskFraction = Math.min(1, (EARTH_RADIUS / orbitR) ** 2);
  const visEarth = earthDiskFraction;

  const Qalbedo = EARTH_ALBEDO * SOLAR_CONSTANT * A_PROJ * visEarth * 0.5;
  const QIR = EARTH_IR * A_PROJ * visEarth;

  return { Qsolar, Qalbedo, QIR, visEarth, solarDot };
}

// ──────────────────────────────────────────
// Radiative Cooling (Stefan–Boltzmann)
// ──────────────────────────────────────────
export function computeRadiativeCooling(temp: number): number {
  return EPSILON * STEFAN_BOLTZMANN * A_PROJ * Math.pow(temp, 4);
}

// ──────────────────────────────────────────
// Thermal Inertia (C · dT/dt = Qin − Qout)
// ──────────────────────────────────────────
export function computeTemperatureDelta(
  Qin: number,
  Qout: number,
  dt: number,
): number {
  return ((Qin - Qout) * dt) / HEAT_CAPACITY;
}

// ──────────────────────────────────────────
// Emissive Intensity Mapping
// ──────────────────────────────────────────
export function emissiveIntensity(temp: number, max = 0.8): number {
  return THREE.MathUtils.smoothstep(temp, 250, 400) * max;
}
