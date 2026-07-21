import * as THREE from "three";

// ──────────────────────────────────────────
// Render Scale (Three.js units)
// EARTH_RADIUS = 1.0 → สัดส่วนจริง: Sun:Earth = 109.2:1, ระยะทาง = 23,481 Rₑ
// ──────────────────────────────────────────
export const EARTH_RADIUS = 1.0;

// Real-world Earth size (needed before displayLengthScene)
export const EARTH_RADIUS_KM = 6_371;
export const EARTH_RADIUS_M = EARTH_RADIUS_KM * 1_000;

/**
 * Uniform magnification vs true scale (same as overview module).
 * At 1× a spacecraft (~few m) is sub-pixel at LEO — unusable on screen.
 */
export const SAT_SCALE_FACTOR = 60_000;

/** TESS longest axis (m) — GLB used in physics gravity + thermal scenes. */
export const PHYSICS_SAT_LENGTH_M = 3.7;

/** True size in scene units (Earth radius = 1). */
export function trueLengthScene(meters: number): number {
  return EARTH_RADIUS * (meters / EARTH_RADIUS_M);
}

/** Display size after {@link SAT_SCALE_FACTOR}. */
export function displayLengthScene(meters: number): number {
  return trueLengthScene(meters) * SAT_SCALE_FACTOR;
}

/** Longest-axis render size for the TESS model in physics lessons. */
export const PHYSICS_SAT_DISPLAY_SIZE = displayLengthScene(PHYSICS_SAT_LENGTH_M);

/** @deprecated Use {@link PHYSICS_SAT_DISPLAY_SIZE} */
export const SAT_SCALE = PHYSICS_SAT_DISPLAY_SIZE / 4;

export const SUN_RADIUS_RENDER = 109.2;  // 109.2 × EARTH_RADIUS
export const SUN_DIST_RENDER = 23_481;    // 23,481 × EARTH_RADIUS

// ──────────────────────────────────────────
// Real-world constants (SI)
// ──────────────────────────────────────────
export const SUN_RADIUS_KM = 696_340;
/** Standard LEO altitude used by thermal / orbit-sim lessons (km). */
export const ORBIT_ALT_KM = 500;
/** Circular orbit radius in Earth radii at ORBIT_ALT_KM. */
export const ORBIT_RADIUS_RE = 1 + ORBIT_ALT_KM / EARTH_RADIUS_KM;
export const SUN_DIST_KM = 149_597_870;

/** Earth gravitational parameter (m³/s²). */
export const MU_EARTH = 3.986_004_418e14;

// ──────────────────────────────────────────
// Thermal physics
// ──────────────────────────────────────────
export const STEFAN_BOLTZMANN = 5.670_374_419e-8; // W·m⁻²·K⁻⁴
export const SOLAR_CONSTANT = 1_361;              // W/m²
export const EARTH_IR = 237;                      // W/m² (daylit disk average)
/** Night-side Earth IR — lower than global average; used when sat is in umbra. */
export const EARTH_IR_NIGHT = 80;                 // W/m²
export const EARTH_ALBEDO = 0.30;

// ──────────────────────────────────────────
// Material properties (solar panel)
// ──────────────────────────────────────────
export const ALPHA = 0.92; // Solar absorptivity
export const EPSILON = 0.85; // Emissivity

// ──────────────────────────────────────────
// Simulation
// ──────────────────────────────────────────
export const A_PROJ = 1.0; // Normalized projected area
/** Lumped thermal inertia (J/K) — reduced for visible colour change in the lesson. */
export const HEAT_CAPACITY = 28;

// ──────────────────────────────────────────
// Sun direction (from Earth toward the Sun)
// Sun is at -X → direction vector points to (-1,0,0)
// ──────────────────────────────────────────
export const SUN_DIR = new THREE.Vector3(-1, 0, 0).normalize();

/** @deprecated Use ORBIT_RADIUS_RE — kept for any stale imports. */
export const ORBIT_RADIUS = ORBIT_RADIUS_RE;
