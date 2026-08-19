/**
 * CubeSat anatomy models.
 * Structure CAD: GrabCAD 1U CubeSat snapshot (SolidWorks → STL).
 * Overview previously used NASA CubeSat 1 RU Generic (kept at nasa-1u-generic.glb).
 */

/** Mate top plate onto the 1U rails — STLs were exported in part space, not assembly. */
export const CUBESAT_1U_TOP_OFFSET: [number, number, number] = [
  -141.38646, 105.25306, -2.4488,
];

export const ANATOMY_MODELS = {
  overview: {
    path: "/models/cubesat/cubesat-1u-base.stl",
    credit: "GrabCAD — 1U CubeSat structure (Base + Top)",
    source: "https://grabcad.com/library/1u-cubesat-model-1",
  },
  structureBase: {
    path: "/models/cubesat/cubesat-1u-base.stl",
    credit: "GrabCAD 1U CubeSat — Base",
    source: "https://grabcad.com/library/1u-cubesat-model-1",
  },
  structureTop: {
    path: "/models/cubesat/cubesat-1u-top.stl",
    credit: "GrabCAD 1U CubeSat — Top",
    source: "https://grabcad.com/library/1u-cubesat-model-1",
  },
} as const;

/** Longest axis in scene units for overview model. */
export const OVERVIEW_TARGET_SIZE = 1.35;
