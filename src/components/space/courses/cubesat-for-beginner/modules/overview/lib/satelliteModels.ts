import type { MissionType } from "./missions";
import { EARTH_RADIUS, EARTH_RADIUS_KM } from "./orbitMath";

/**
 * Local 3D satellite assets for the overview scene.
 * NASA Science 3D Resources — free per NASA Images and Media Usage Guidelines.
 * Starlink — Sketchfab CC BY 4.0 (Malacodart).
 * THEOS 01 — Sketchfab CC BY 4.0 (rojjanin.cheavy).
 * CubeSat — NASA ICECube 3D resource.
 *
 * `nadirAxis`: which local model axis should point at Earth after lookAt.
 * Default bottom (−Y) toward Earth (THEOS flipped to +Y).
 */
export const SATELLITE_MODELS = {
  terra: {
    path: "/models/sats/terra.glb",
    credit: "NASA Terra Earth Observing System",
    source: "https://science.nasa.gov/3d-resources/terra/",
    nadirAxis: "-y" as const,
  },
  tess: {
    path: "/models/sats/tess.glb",
    credit: "NASA TESS",
    source:
      "https://science.nasa.gov/3d-resources/transiting-exoplanet-survey-satellite-tess-a/",
    nadirAxis: "-y" as const,
  },
  tdrs: {
    path: "/models/sats/tdrs.glb",
    credit: "NASA Tracking and Data Relay Satellite (TDRS)",
    source:
      "https://science.nasa.gov/3d-resources/tracking-and-data-relay-satellites-tdrs-d/",
    nadirAxis: "-y" as const,
  },
  icesat: {
    path: "/models/sats/icesat.glb",
    credit: "NASA ICESat",
    source:
      "https://science.nasa.gov/3d-resources/ice-clouds-and-land-elevation-satellite-icesat-a/",
    nadirAxis: "-y" as const,
  },
  starlink: {
    path: "/models/sats/starlink_spacex_satellite.glb",
    credit: '"Starlink Spacex Satellite" by Malacodart — CC BY 4.0',
    source: "https://skfb.ly/ouZrO",
    license: "https://creativecommons.org/licenses/by/4.0/",
    nadirAxis: "-y" as const,
  },
  theos: {
    path: "/models/sats/theos_01.glb",
    credit: '"THEOS 01" by rojjanin.cheavy — CC BY 4.0',
    source: "https://skfb.ly/oAoZs",
    license: "https://creativecommons.org/licenses/by/4.0/",
    nadirAxis: "+y" as const,
  },
  cubesat: {
    path: "/models/sats/cubesat.glb",
    credit: "NASA CubeSat – ICECube",
    source: "https://science.nasa.gov/3d-resources/cubesat-icecube/",
    nadirAxis: "-y" as const,
  },
} as const;

export type SatelliteModelKey = keyof typeof SATELLITE_MODELS;

/** Map mission types to the closest public 3D asset we ship. */
export const MISSION_MODEL: Record<MissionType, SatelliteModelKey> = {
  earth_observation: "theos",
  reconnaissance: "theos",
  broadband: "starlink",
  navigation: "tess",
  communications: "tdrs",
  meteorology: "tdrs",
  science_demo: "cubesat",
  polar_coverage: "tess",
};

/** Approximate real longest-axis length (meters) for relative sizing. */
export const MODEL_REAL_LENGTH_M: Record<SatelliteModelKey, number> = {
  terra: 6.8,
  tess: 3.7,
  tdrs: 17.4,
  icesat: 2.0,
  starlink: 4.1,
  theos: 2.4,
  cubesat: 0.41,
};

/** Approximate W × L × H (m) for museum labels — teaching order-of-magnitude. */
export type RealDimensionsM = { w: number; l: number; h: number };

export const MODEL_REAL_DIMENSIONS_M: Record<SatelliteModelKey, RealDimensionsM> =
  {
    terra: { w: 6.8, l: 3.5, h: 3.5 },
    tess: { w: 3.7, l: 1.9, h: 1.7 },
    tdrs: { w: 17.4, l: 4.2, h: 4.2 },
    icesat: { w: 2.0, l: 1.0, h: 1.0 },
    starlink: { w: 4.1, l: 1.6, h: 0.3 },
    theos: { w: 2.4, l: 2.0, h: 2.0 },
    cubesat: { w: 0.1, l: 0.1, h: 0.1 },
  };

/** Mission overrides when the asset size differs from the mesh stand-in. */
const MISSION_REAL_LENGTH_M: Partial<Record<MissionType, number>> = {
  science_demo: 0.3,
};

const MISSION_REAL_DIMENSIONS_M: Partial<Record<MissionType, RealDimensionsM>> = {
  science_demo: { w: 0.1, l: 0.1, h: 0.3 },
  meteorology: { w: 6.5, l: 3.2, h: 3.2 },
  navigation: { w: 5.2, l: 1.9, h: 1.7 },
  polar_coverage: { w: 6.0, l: 4.0, h: 4.0 },
};

/**
 * Uniform magnification vs true scale.
 * At 1× a CubeSat (~10 cm) is ~3e-8 scene units (Earth radius = 2) and
 * disappears under float / pixel limits — same reason as Physics module.
 */
export const SAT_SCALE_FACTOR = 60_000;

const METERS_PER_EARTH = EARTH_RADIUS_KM * 1000;

/** True size in scene units (Earth radius = {@link EARTH_RADIUS}). */
export function trueLengthScene(meters: number): number {
  return EARTH_RADIUS * (meters / METERS_PER_EARTH);
}

/** Display size in scene units after {@link SAT_SCALE_FACTOR}. */
export function displayLengthScene(meters: number): number {
  return trueLengthScene(meters) * SAT_SCALE_FACTOR;
}

export function realLengthMForMission(mission: MissionType): number {
  return (
    MISSION_REAL_LENGTH_M[mission] ??
    MODEL_REAL_LENGTH_M[MISSION_MODEL[mission]]
  );
}

export function realDimensionsMForMission(mission: MissionType): RealDimensionsM {
  return (
    MISSION_REAL_DIMENSIONS_M[mission] ??
    MODEL_REAL_DIMENSIONS_M[MISSION_MODEL[mission]]
  );
}

function formatDimensionM(meters: number): string {
  if (meters < 1) return `${Math.round(meters * 100)} cm`;
  if (meters < 10) return `${meters.toFixed(1)} m`;
  return `${meters.toFixed(0)} m`;
}

/** Display as W × L × H with adaptive units per axis. */
export function formatDimensionsWxLxH(dims: RealDimensionsM): string {
  const { w, l, h } = dims;
  return `${formatDimensionM(w)} × ${formatDimensionM(l)} × ${formatDimensionM(h)}`;
}

/** Longest-axis target size for mesh normalize (scene units). */
export function displaySizeForMission(mission: MissionType): number {
  return displayLengthScene(realLengthMForMission(mission));
}

/** @deprecated Prefer {@link displaySizeForMission} — kept for inspector previews. */
export const MODEL_TARGET_SIZE: Record<SatelliteModelKey, number> = {
  terra: displayLengthScene(MODEL_REAL_LENGTH_M.terra),
  tess: displayLengthScene(MODEL_REAL_LENGTH_M.tess),
  tdrs: displayLengthScene(MODEL_REAL_LENGTH_M.tdrs),
  icesat: displayLengthScene(MODEL_REAL_LENGTH_M.icesat),
  starlink: displayLengthScene(MODEL_REAL_LENGTH_M.starlink),
  theos: displayLengthScene(MODEL_REAL_LENGTH_M.theos),
  cubesat: displayLengthScene(MODEL_REAL_LENGTH_M.cubesat),
};

export function modelPathForMission(mission: MissionType): string {
  return SATELLITE_MODELS[MISSION_MODEL[mission]].path;
}

export function modelMetaForMission(mission: MissionType) {
  return SATELLITE_MODELS[MISSION_MODEL[mission]];
}

/**
 * Extra X rotation after parent `lookAt(Earth)` (−Z → Earth)
 * so the model's nadir axis points at Earth.
 */
export function nadirTiltXForMission(mission: MissionType): number {
  const axis = SATELLITE_MODELS[MISSION_MODEL[mission]].nadirAxis;
  // lookAt: −Z toward Earth
  // "+y" → Earth: Rx(−π/2) maps +Y → −Z
  // "-y" → Earth: Rx(+π/2) maps −Y → −Z
  return axis === "+y" ? -Math.PI / 2 : Math.PI / 2;
}
