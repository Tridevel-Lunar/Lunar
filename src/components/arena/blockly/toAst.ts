import type { Block, Workspace } from "blockly";

import type { AstNode, ProgramAst } from "@/ast/types";

export { compileProgram, workspaceToAst } from "./compileProgram";

const TYPE_TO_OP: Record<string, string> = {
  obc_on_start: "setup",
  obc_repeat_orbit: "repeat_until_end",
  obc_if: "if",
  obc_when: "when",
  obc_compare: "compare",
  obc_yield: "wait_1_tick",
  obc_sim_sec: "sim_sec",
  obc_orbit_phase: "orbit_phase",
  eps_battery_level: "battery_level",
  eps_is_in_sunlight: "is_in_sunlight",
  eps_is_in_eclipse: "is_in_eclipse",
  eps_temperature: "temperature",
  eps_turn_heater: "turn_heater",
  eps_enter_safe_mode: "enter_safe_mode",
  eps_exit_safe_mode: "exit_safe_mode",
  payload_turn: "turn_payload",
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
  const node: AstNode = { id: block.id, op };
  switch (block.type) {
    case "obc_on_start":
    case "obc_repeat_orbit":
      node.body = statementChain(block.getInputTargetBlock("BODY"));
      break;
    case "eps_turn_heater":
    case "payload_turn":
      node.args = { on: block.getFieldValue("ON") === "true" };
      break;
    case "obc_if": {
      const condBlock = block.getInputTargetBlock("COND");
      if (condBlock) {
        const cond = blockToAst(condBlock);
        if (cond) node.cond = cond;
      }
      node.then = statementChain(block.getInputTargetBlock("THEN"));
      node.else = statementChain(block.getInputTargetBlock("ELSE"));
      break;
    }
    case "obc_when":
      node.args = { event: block.getFieldValue("EVENT") };
      node.body = statementChain(block.getInputTargetBlock("BODY"));
      break;
    case "obc_compare": {
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

/** Low-level serialize (does not apply compileProgram remap). */
export function rawWorkspaceBlocks(workspace: Workspace): AstNode[] {
  const tops = workspace.getTopBlocks(true);
  const body: AstNode[] = [];
  for (const top of tops) {
    if (top.isShadow()) continue;
    const node = blockToAst(top);
    if (node) body.push(node);
  }
  return body;
}

export type { ProgramAst };
