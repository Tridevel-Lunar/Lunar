import type { AnatomyPartId } from "./parts";

export type Vec3 = [number, number, number];

export interface PartPose {
  position: Vec3;
  rotation: Vec3;
  scale: Vec3;
}

export type BoardPartId = Exclude<AnatomyPartId, "overview" | "structure">;

/** Stacked inside 1U (Y up). */
export const ASSEMBLED_POSES: Record<BoardPartId, PartPose> = {
  eps: {
    position: [0, -0.32, 0],
    rotation: [0, 0, 0],
    scale: [0.78, 0.12, 0.78],
  },
  obc: {
    position: [0, -0.08, 0],
    rotation: [0, 0, 0],
    scale: [0.72, 0.1, 0.72],
  },
  comm: {
    position: [0, 0.14, 0],
    rotation: [0, 0, 0],
    scale: [0.68, 0.1, 0.68],
  },
  payload: {
    position: [0, 0.34, 0],
    rotation: [0, 0, 0],
    scale: [0.55, 0.14, 0.55],
  },
};

/**
 * FlatSat PCB — modules spread OUT FROM CENTER onto one real board.
 * OBC stays near hub; others slide to pads on the FR4 sheet.
 */
export const FLATSAT_POSES: Record<BoardPartId, PartPose> = {
  eps: {
    position: [-1.55, 0.04, 0],
    rotation: [0, 0, 0],
    scale: [1.05, 0.035, 1.35],
  },
  obc: {
    position: [0, 0.045, 0],
    rotation: [0, 0, 0],
    scale: [1.15, 0.04, 1.35],
  },
  comm: {
    position: [1.55, 0.04, 0],
    rotation: [0, 0, 0],
    scale: [1.05, 0.035, 1.35],
  },
  payload: {
    position: [0, 0.04, -1.45],
    rotation: [0, 0, 0],
    // Match the FR4 pad proportions drawn into the board texture.
    // (payload pad is ~440x180 in the 1024x768 canvas)
    scale: [2.1, 0.035, 0.87],
  },
};

/** World size of the mother PCB (XZ). */
export const FLATSAT_BOARD_SIZE = { width: 4.9, depth: 3.7 };

export const BOARD_PART_IDS: BoardPartId[] = ["eps", "obc", "comm", "payload"];

export const PART_COLORS: Record<BoardPartId, string> = {
  eps: "#fbbf24",
  obc: "#7dd3fc",
  comm: "#34d399",
  payload: "#c084fc",
};

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpVec3(a: Vec3, b: Vec3, t: number): Vec3 {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
