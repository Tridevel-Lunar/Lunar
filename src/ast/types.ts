/** AST + Arena attempt / RunResult contracts (mirror backend schemas). */

export type AstOp =
  | "on_start"
  | "await_phase"
  | "power_bus_on"
  | "read_power"
  | "payload_set"
  | "sensor_enable"
  | "sensor_read"
  | "begin_ascent"
  | "orbit_stability"
  | "until_stable"
  | "confirm_leo"
  | "if"
  | "compare"
  | "safe_mode_payload_off";

export type AstNode = {
  id: string;
  op: AstOp | string;
  args?: Record<string, unknown>;
  body?: AstNode[];
  cond?: AstNode;
  then?: AstNode[];
  else?: AstNode[];
};

export type ProgramAst = {
  type: "program";
  body: AstNode[];
};

export type MissionLimits = {
  maxBlocks: number;
  maxDepth: number;
  maxSteps: number;
  wallMs: number;
};

export type MissionPack = {
  id: string;
  toolboxId: string;
  title: string;
  code: string;
  level: string;
  playable: boolean;
  allowedOps: string[];
  limits: MissionLimits;
};

export type RunStatus = "passed" | "failed" | "error" | "timeout";

export type RunError = {
  blockId: string;
  code: string;
  messageTh: string;
};

export type OrbitState = {
  altitudeKm: number;
  stability: number;
  inLeo: boolean;
};

export type FinalWorld = {
  powerWh: number;
  payloadOn: boolean;
  payload_safe: boolean;
  phase: string;
  powerBusOn?: boolean;
  inserted_to_leo?: boolean;
  sensors?: Record<string, boolean>;
  orbit: OrbitState;
  faults?: unknown[];
};

export type RunMetrics = {
  peakPowerDraw: number;
  ticks: number;
  stabilityFinal: number;
  insertedToLeo: boolean;
};

export type RunFrame = {
  t: number;
  altitudeKm: number;
  phase: string;
  powerWh: number;
  highlights?: string[];
};

export type RunLogEntry = {
  t: number;
  level: "info" | "warn" | "error";
  messageTh: string;
  blockId?: string;
};

export type RunResult = {
  status: RunStatus;
  passedChecks: string[];
  failedChecks: string[];
  error?: RunError | null;
  finalWorld: FinalWorld;
  metrics: RunMetrics;
  frames: RunFrame[];
  log: RunLogEntry[];
};

export type RunJobStatus = "pending" | "running" | "finished" | "failed";

export type RunJobResponse = {
  job_id: string;
  status: RunJobStatus;
  mission_id: string;
};

export type RunJobStatusResponse = RunJobResponse & {
  result?: RunResult | null;
  error?: string | null;
};

export type MissionAttempt = {
  mission_id: string;
  ast: ProgramAst | Record<string, unknown> | null;
  last_result?: RunResult | null;
};
