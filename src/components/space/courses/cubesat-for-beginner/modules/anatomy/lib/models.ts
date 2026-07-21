/**
 * CubeSat anatomy models.
 * Overview: NASA Science 3D Resources — CubeSat 1 RU Generic
 * https://science.nasa.gov/3d-resources/cubesat-1-ru-generic/
 *
 * Structure (optional drop-in): export GrabCAD 1U CubeSat as GLB →
 * public/models/cubesat/structure-1u.glb
 * https://grabcad.com/library/1u-cubesat-model-1
 */

export const ANATOMY_MODELS = {
  overview: {
    path: "/models/cubesat/nasa-1u-generic.glb",
    credit: "NASA / Christopher R. Meaney — CubeSat 1 RU Generic",
    source: "https://science.nasa.gov/3d-resources/cubesat-1-ru-generic/",
  },
  structure: {
    path: "/models/cubesat/structure-1u.glb",
    credit: "GrabCAD 1U CubeSat structure (optional local GLB)",
    source: "https://grabcad.com/library/1u-cubesat-model-1",
  },
} as const;

/** Longest axis in scene units for overview model. */
export const OVERVIEW_TARGET_SIZE = 1.35;
