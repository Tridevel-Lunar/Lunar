/** AST + Arena attempt contracts (mirror backend schemas). */

export type AstOp =
  | "setup"
  | "main_loop"
  | "repeat_until_end"
  | "battery_level"
  | "temperature"
  | "is_in_sunlight"
  | "is_in_eclipse"
  | "is_daylight"
  | "sim_sec"
  | "tick_number"
  | "orbit_phase"
  | "turn_heater"
  | "turn_payload"
  | "enter_safe_mode"
  | "exit_safe_mode"
  | "if"
  | "when"
  | "compare"
  | "wait_1_tick"
  | "log"
  | "payload_is_on"
  | "payload_capture"
  | "is_comm_pass"
  | "seconds_until_pass"
  | "queue_downlink";

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

export type MissionSetupPresets = {
  eps?: Record<string, unknown>;
  payload?: Record<string, unknown>;
  comm?: Record<string, unknown>;
};

export type MissionPack = {
  id: string;
  version?: number;
  toolboxId: string;
  title: string;
  code: string;
  level: string;
  playable: boolean;
  allowedOps: string[];
  limits: MissionLimits;
  enabledLibs?: string[];
  payloadModuleId?: string | null;
  commLibVisible?: boolean;
  setupPresets?: MissionSetupPresets | null;
  orbitPeriodSec?: number | null;
  eclipseFraction?: number | null;
};

export type MissionAttempt = {
  mission_id: string;
  ast: ProgramAst | Record<string, unknown> | null;
};
