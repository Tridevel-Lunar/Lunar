import type { Block, Workspace } from "blockly";

import type { AstNode, ProgramAst } from "@/ast/types";

const TYPE_TO_OP: Record<string, string> = {
  m01_on_start: "on_start",
  m01_await_phase: "await_phase",
  m01_power_bus_on: "power_bus_on",
  m01_read_power: "read_power",
  m01_payload_set: "payload_set",
  m01_sensor_enable: "sensor_enable",
  m01_sensor_read: "sensor_read",
  m01_begin_ascent: "begin_ascent",
  m01_orbit_stability: "orbit_stability",
  m01_until_stable: "until_stable",
  m01_confirm_leo: "confirm_leo",
  m01_if: "if",
  m01_compare: "compare",
  m01_safe_mode_payload_off: "safe_mode_payload_off",
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
    case "m01_on_start": {
      node.body = statementChain(block.getInputTargetBlock("BODY"));
      break;
    }
    case "m01_await_phase": {
      node.args = { phase: "ready_for_release" };
      break;
    }
    case "m01_payload_set": {
      node.args = { on: block.getFieldValue("ON") === "true" };
      break;
    }
    case "m01_sensor_enable":
    case "m01_sensor_read": {
      node.args = { sensor: block.getFieldValue("SENSOR") };
      break;
    }
    case "m01_until_stable": {
      node.args = {
        threshold: Number(block.getFieldValue("THRESHOLD")),
        maxTries: Number(block.getFieldValue("MAX_TRIES")),
      };
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
    case "m01_compare": {
      const leftBlock = block.getInputTargetBlock("LEFT");
      const left = leftBlock ? blockToAst(leftBlock) : null;
      node.args = {
        left: left ?? { op: "read_power" },
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
