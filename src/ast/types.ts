/** AST + Arena attempt contracts (mirror backend schemas). */

export type AstOp =
  | "setup"
  | "main_loop"
  | "set_battery_threshold_low"
  | "set_battery_threshold_high"
  | "set_temp_threshold"
  | "set_heater_power"
  | "enable_payload_mode"
  | "battery_level"
  | "temperature"
  | "is_daylight"
  | "tick_number"
  | "turn_heater"
  | "turn_payload"
  | "enter_safe_mode"
  | "exit_safe_mode"
  | "if"
  | "when"
  | "compare"
  | "wait_1_tick"
  | "repeat_until_end";

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
