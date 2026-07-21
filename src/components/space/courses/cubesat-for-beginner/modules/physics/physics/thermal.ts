import * as THREE from "three";
import {
  STEFAN_BOLTZMANN,
  SOLAR_CONSTANT,
  EARTH_IR,
  EARTH_IR_NIGHT,
  EARTH_ALBEDO,
  A_PROJ,
  HEAT_CAPACITY,
  ALPHA,
  EPSILON,
  EARTH_RADIUS,
} from "./constants";

/** Lesson visual range — maps physics temp to full blue→red gradient. */
const COLOR_TEMP_MIN = 170;
const COLOR_TEMP_MAX = 430;

// ──────────────────────────────────────────
// Temperature → Color (Kelvin scale)
// ──────────────────────────────────────────
export function kelvinToColor(temp: number): THREE.Color {
  const c = new THREE.Color();
  const t = THREE.MathUtils.clamp(
    (temp - COLOR_TEMP_MIN) / (COLOR_TEMP_MAX - COLOR_TEMP_MIN),
    0,
    1,
  );
  // Deep blue (shadow) → cyan → warm yellow → orange → red (sunlit)
  const hue = THREE.MathUtils.lerp(0.58, 0.02, t);
  const sat = THREE.MathUtils.lerp(0.9, 1.0, t);
  const light = THREE.MathUtils.lerp(0.2, 0.62, Math.pow(t, 0.82));
  c.setHSL(hue, sat, light);
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

  // In umbra the nadir disk is Earth's night side — less reflected sun + weaker IR.
  const Qalbedo =
    EARTH_ALBEDO * SOLAR_CONSTANT * A_PROJ * visEarth * 0.5 * eclipseFactor;
  const earthIr = THREE.MathUtils.lerp(EARTH_IR_NIGHT, EARTH_IR, eclipseFactor);
  const QIR = earthIr * A_PROJ * visEarth;

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
export function emissiveIntensity(temp: number, max = 1.0): number {
  return THREE.MathUtils.smoothstep(temp, 190, 380) * max;
}

/** Blend thermal tint into the dark solar-panel base colour. */
export function kelvinToPanelColor(temp: number): THREE.Color {
  const thermal = kelvinToColor(temp);
  const base = new THREE.Color("#1a3a5c");
  return thermal.clone().lerp(base, 0.25);
}
