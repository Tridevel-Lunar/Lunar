import type { Block, Workspace } from "blockly";

import type { AstNode, ProgramAst } from "@/ast/types";

const TYPE_TO_OP: Record<string, string> = {
  obc_on_start: "setup", // container; compileProgram remaps
  obc_repeat_orbit: "repeat_until_end",
  obc_if: "if",
  obc_when: "when",
  obc_compare: "compare",
  obc_yield: "wait_1_tick",
  obc_sim_sec: "sim_sec",
  obc_orbit_phase: "orbit_phase",
  obc_comment: "log",
  eps_battery_level: "battery_level",
  eps_is_in_sunlight: "is_in_sunlight",
  eps_is_in_eclipse: "is_in_eclipse",
  eps_temperature: "temperature",
  eps_turn_heater: "turn_heater",
  eps_enter_safe_mode: "enter_safe_mode",
  eps_exit_safe_mode: "exit_safe_mode",
  payload_turn: "turn_payload",
  payload_is_on: "payload_is_on",
  payload_capture: "payload_capture",
  comm_is_pass_window: "is_comm_pass",
  comm_seconds_until_pass: "seconds_until_pass",
  comm_queue_downlink: "queue_downlink",
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
  if (block.type === "obc_comment") {
    return null; // comments are UI-only
  }
  const op = TYPE_TO_OP[block.type];
  if (!op) return null;

  const id = block.id;
  const node: AstNode = { id, op };

  switch (block.type) {
    case "obc_on_start":
    case "obc_repeat_orbit": {
      node.body = statementChain(block.getInputTargetBlock("BODY"));
      break;
    }
    case "eps_turn_heater":
    case "payload_turn": {
      node.args = { on: block.getFieldValue("ON") === "true" };
      break;
    }
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
    case "obc_when": {
      node.args = { event: block.getFieldValue("EVENT") };
      node.body = statementChain(block.getInputTargetBlock("BODY"));
      break;
    }
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
    case "comm_queue_downlink": {
      node.args = { mode: block.getFieldValue("MODE") };
      break;
    }
    default:
      break;
  }

  return node;
}

/**
 * Compile OBC workspace → program AST.
 * Statements before `obc_repeat_orbit` → setup; body of repeat → main_loop.
 */
export function compileProgram(workspace: Workspace): ProgramAst {
  const tops = workspace.getTopBlocks(true);
  let onStart: Block | null = null;
  for (const top of tops) {
    if (!top.isShadow() && top.type === "obc_on_start") {
      onStart = top;
      break;
    }
  }

  if (!onStart) {
    // Fallback: treat any top-level statements as main_loop
    const body: AstNode[] = [];
    for (const top of tops) {
      if (top.isShadow()) continue;
      const node = blockToAst(top);
      if (node) body.push(node);
    }
    return {
      type: "program",
      body: [
        { id: "setup_auto", op: "setup", body: [] },
        { id: "main_auto", op: "main_loop", body },
      ],
    };
  }

  const chain = statementChain(onStart.getInputTargetBlock("BODY"));
  const setupBody: AstNode[] = [];
  let mainBody: AstNode[] = [];
  let foundRepeat = false;

  for (const node of chain) {
    if (node.op === "repeat_until_end" && !foundRepeat) {
      foundRepeat = true;
      mainBody = node.body ?? [];
    } else if (!foundRepeat) {
      setupBody.push(node);
    } else {
      // After repeat: ignored for M01 single-file mode (keep deterministic)
    }
  }

  if (!foundRepeat) {
    mainBody = setupBody;
    return {
      type: "program",
      body: [
        { id: `${onStart.id}_setup`, op: "setup", body: [] },
        { id: `${onStart.id}_main`, op: "main_loop", body: mainBody },
      ],
    };
  }

  return {
    type: "program",
    body: [
      { id: `${onStart.id}_setup`, op: "setup", body: setupBody },
      { id: `${onStart.id}_main`, op: "main_loop", body: mainBody },
    ],
  };
}

/** @deprecated Use compileProgram — kept for imports that expect workspaceToAst. */
export function workspaceToAst(workspace: Workspace): ProgramAst {
  return compileProgram(workspace);
}
