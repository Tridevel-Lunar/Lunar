/** Generic craft snapshot for the orbit preview — not mission grading. */
export type ArenaOrbitPreviewSample = {
  /** Orbital phase 0..1. Phase 0 = subsolar (full sun). */
  phase: number;
  isSunlit: boolean;
  heaterOn?: boolean;
  payloadOn?: boolean;
  safeMode?: boolean;
};
