/** AST + Arena attempt contracts (mirror backend schemas). */

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

export type MissionAttempt = {
  mission_id: string;
  ast: ProgramAst | Record<string, unknown> | null;
};
