/** Discrete time multipliers — 0 = pause, then 0.5× and powers of 2 up to 2¹⁴. */
export const TIME_SCALE_STEPS = [
  0,
  0.5,
  ...Array.from({ length: 15 }, (_, i) => 2 ** i),
] as const; // 0 … 0.5 … 1 … 2 … … 16384

export type TimeScaleStep = (typeof TIME_SCALE_STEPS)[number];

export const DEFAULT_TIME_SCALE = 512; // 2⁹

export function formatTimeScale(scale: number): string {
  if (scale === 0) return "หยุด";
  if (scale < 1) return `${scale}×`;
  if (scale >= 1024) return `${(scale / 1024).toLocaleString("th-TH")}k×`;
  return `${scale.toLocaleString("th-TH")}×`;
}

export function timeScaleIndex(scale: number): number {
  return TIME_SCALE_STEPS.findIndex((s) => s === scale);
}
