import type { Block, Workspace } from "blockly";

import type { AstNode, ProgramAst } from "@/ast/types";

const TYPE_TO_OP: Record<string, string> = {
  m01_on_start: "setup",
  m01_main_loop: "main_loop",
  m01_set_battery_threshold_low: "set_battery_threshold_low",
  m01_set_battery_threshold_high: "set_battery_threshold_high",
  m01_set_temp_threshold: "set_temp_threshold",
  m01_set_heater_power: "set_heater_power",
  m01_enable_payload_mode: "enable_payload_mode",
  m01_battery_level: "battery_level",
  m01_temperature: "temperature",
  m01_is_daylight: "is_daylight",
  m01_tick_number: "tick_number",
  m01_turn_heater: "turn_heater",
  m01_turn_payload: "turn_payload",
  m01_enter_safe_mode: "enter_safe_mode",
  m01_exit_safe_mode: "exit_safe_mode",
  m01_if: "if",
  m01_when: "when",
  m01_compare: "compare",
  m01_wait_1_tick: "wait_1_tick",
  m01_repeat_until_end: "repeat_until_end",
};

function statementChain(block: Block | null): AstNode[] {
  const nodes: AstNode[] = [];
  let current: Block | null = block;
  while (current) {
    const node = blockToAst(current);
    if (node) nodes.push(node);
    current = current.getNextBlock();
  }
  return nodes;
}

function blockToAst(block: Block): AstNode | null {
  const op = TYPE_TO_OP[block.type];
  if (!op) return null;

  const id = block.id;
  const node: AstNode = { id, op };

  switch (block.type) {
    case "m01_on_start":
    case "m01_main_loop":
    case "m01_repeat_until_end": {
      node.body = statementChain(block.getInputTargetBlock("BODY"));
      break;
    }
    case "m01_set_battery_threshold_low":
    case "m01_set_battery_threshold_high":
    case "m01_set_heater_power": {
      node.args = { value: Number(block.getFieldValue("VALUE")) };
      break;
    }
    case "m01_set_temp_threshold": {
      node.args = {
        min: Number(block.getFieldValue("MIN")),
        max: Number(block.getFieldValue("MAX")),
      };
      break;
    }
    case "m01_enable_payload_mode": {
      node.args = { mode: block.getFieldValue("MODE") };
      break;
    }
    case "m01_turn_heater":
    case "m01_turn_payload": {
      node.args = { on: block.getFieldValue("ON") === "true" };
      break;
    }
    case "m01_if": {
      const condBlock = block.getInputTargetBlock("COND");
      if (condBlock) {
        const cond = blockToAst(condBlock);
        if (cond) node.cond = cond;
      }
      node.then = statementChain(block.getInputTargetBlock("THEN"));
      node.else = statementChain(block.getInputTargetBlock("ELSE"));
      break;
    }
    case "m01_when": {
      node.args = { event: block.getFieldValue("EVENT") };
      node.body = statementChain(block.getInputTargetBlock("BODY"));
      break;
    }
    case "m01_compare": {
      const leftBlock = block.getInputTargetBlock("LEFT");
      const left = leftBlock ? blockToAst(leftBlock) : null;
      node.args = {
        left: left ?? { op: "battery_level" },
        cmp: block.getFieldValue("CMP"),
        right: Number(block.getFieldValue("RIGHT")),
      };
      break;
    }
    default:
      break;
  }

  return node;
}

/** Serialize top-level Mission 01 blocks to the JSON AST (design §5). */
export function workspaceToAst(workspace: Workspace): ProgramAst {
  const tops = workspace.getTopBlocks(true);
  const body: AstNode[] = [];

  for (const top of tops) {
    if (top.isShadow()) continue;
    // Prefer hat / on_start as program entry; include other top statements too
    const node = blockToAst(top);
    if (node) body.push(node);
    // Chain following statements that sit after a non-hat top block
    if (top.type !== "m01_on_start") {
      let next = top.getNextBlock();
      while (next) {
        const n = blockToAst(next);
        if (n) body.push(n);
        next = next.getNextBlock();
      }
    }
  }

  return { type: "program", body };
}
