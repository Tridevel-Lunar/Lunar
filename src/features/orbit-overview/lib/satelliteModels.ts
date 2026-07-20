import type { MissionType } from "./missions";

/**
 * Local copies of NASA Science 3D Resources (glTF).
 * Credits: NASA — free per NASA Images and Media Usage Guidelines.
 * Catalog: https://science.nasa.gov/3d-resources/
 */
export const SATELLITE_MODELS = {
  terra: {
    path: "/models/sats/terra.glb",
    credit: "NASA Terra Earth Observing System",
    source: "https://science.nasa.gov/3d-resources/terra/",
  },
  tess: {
    path: "/models/sats/tess.glb",
    credit: "NASA TESS",
    source:
      "https://science.nasa.gov/3d-resources/transiting-exoplanet-survey-satellite-tess-a/",
  },
  tdrs: {
    path: "/models/sats/tdrs.glb",
    credit: "NASA Tracking and Data Relay Satellite (TDRS)",
    source:
      "https://science.nasa.gov/3d-resources/tracking-and-data-relay-satellites-tdrs-d/",
  },
  icesat: {
    path: "/models/sats/icesat.glb",
    credit: "NASA ICESat",
    source:
      "https://science.nasa.gov/3d-resources/ice-clouds-and-land-elevation-satellite-icesat-a/",
  },
} as const;

export type SatelliteModelKey = keyof typeof SATELLITE_MODELS;

/** Map mission types to the closest NASA public 3D asset we ship. */
export const MISSION_MODEL: Record<MissionType, SatelliteModelKey> = {
  earth_observation: "icesat",
  reconnaissance: "icesat",
  broadband: "tess",
  navigation: "tess",
  communications: "tdrs",
  meteorology: "tdrs",
  science_demo: "tess",
  polar_coverage: "tess",
};

/** Target longest axis in scene units (Earth radius ≈ 2). */
export const MODEL_TARGET_SIZE: Record<SatelliteModelKey, number> = {
  // Visually exaggerated vs true scale so sats remain readable from camera
  terra: 0.75,
  tess: 0.55,
  tdrs: 0.85,
  icesat: 0.7,
};

export function modelPathForMission(mission: MissionType): string {
  return SATELLITE_MODELS[MISSION_MODEL[mission]].path;
}
