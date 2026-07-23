import * as Blockly from "blockly";
import type { WorkspaceSvg } from "blockly";

import type { AstNode, ProgramAst } from "@/ast/types";

const OP_TO_TYPE: Record<string, string> = {
  setup: "obc_on_start",
  main_loop: "obc_repeat_orbit",
  repeat_until_end: "obc_repeat_orbit",
  battery_level: "eps_battery_level",
  temperature: "eps_temperature",
  is_in_sunlight: "eps_is_in_sunlight",
  is_in_eclipse: "eps_is_in_eclipse",
  is_daylight: "eps_is_in_sunlight",
  sim_sec: "obc_sim_sec",
  tick_number: "obc_sim_sec",
  orbit_phase: "obc_orbit_phase",
  turn_heater: "eps_turn_heater",
  turn_payload: "payload_turn",
  enter_safe_mode: "eps_enter_safe_mode",
  exit_safe_mode: "eps_exit_safe_mode",
  if: "obc_if",
  when: "obc_when",
  compare: "obc_compare",
  wait_1_tick: "obc_yield",
};

function createBlock(
  workspace: WorkspaceSvg,
  node: AstNode,
): Blockly.BlockSvg | null {
  const type = OP_TO_TYPE[node.op];
  if (!type) return null;

  const block = (
    node.id ? workspace.newBlock(type, node.id) : workspace.newBlock(type)
  ) as Blockly.BlockSvg;

  switch (node.op) {
    case "turn_heater":
    case "turn_payload": {
      const on = Boolean(node.args?.on);
      block.setFieldValue(on ? "true" : "false", "ON");
      break;
    }
    case "compare": {
      const cmp = String(node.args?.cmp ?? "gte");
      block.setFieldValue(cmp, "CMP");
      if (node.args?.right != null) {
        block.setFieldValue(String(node.args.right), "RIGHT");
      }
      const left = node.args?.left as AstNode | undefined;
      if (left && typeof left === "object" && left.op) {
        const leftBlock = createBlock(workspace, left);
        if (leftBlock?.outputConnection) {
          block.getInput("LEFT")?.connection?.connect(leftBlock.outputConnection);
        }
      }
      break;
    }
    case "setup":
    case "main_loop":
    case "repeat_until_end": {
      connectStatements(workspace, block, "BODY", node.body);
      break;
    }
    case "if": {
      if (node.cond) {
        const condBlock = createBlock(workspace, node.cond);
        if (condBlock?.outputConnection) {
          block.getInput("COND")?.connection?.connect(condBlock.outputConnection);
        }
      }
      connectStatements(workspace, block, "THEN", node.then);
      connectStatements(workspace, block, "ELSE", node.else);
      break;
    }
    case "when": {
      const eventName = String(node.args?.event ?? "eclipse_enter");
      try {
        block.setFieldValue(eventName, "EVENT");
      } catch {
        block.setFieldValue("battery_low", "EVENT");
      }
      connectStatements(workspace, block, "BODY", node.body);
      break;
    }
    default:
      break;
  }

  block.initSvg();
  block.render();
  return block;
}

function connectStatements(
  workspace: WorkspaceSvg,
  parent: Blockly.BlockSvg,
  inputName: string,
  nodes: AstNode[] | undefined,
): void {
  if (!nodes?.length) return;
  const input = parent.getInput(inputName);
  if (!input?.connection) return;

  let previous: Blockly.BlockSvg | null = null;
  for (const node of nodes) {
    const child = createBlock(workspace, node);
    if (!child) continue;
    if (!previous) {
      input.connection.connect(child.previousConnection!);
    } else {
      previous.nextConnection?.connect(child.previousConnection!);
    }
    previous = child;
  }
}

/**
 * Load a program AST into an empty workspace as
 * obc_on_start { setup stmts + obc_repeat_orbit { main_loop } }.
 */
export function astToWorkspace(
  workspace: WorkspaceSvg,
  ast: ProgramAst | Record<string, unknown> | null,
): void {
  workspace.clear();
  if (!ast || typeof ast !== "object") return;

  const body = (ast as ProgramAst).body;
  if (!Array.isArray(body) || body.length === 0) return;

  const setupNode = body.find((n) => n.op === "setup");
  const mainNode = body.find((n) => n.op === "main_loop");

  const onStart = workspace.newBlock("obc_on_start") as Blockly.BlockSvg;
  onStart.initSvg();
  onStart.render();
  onStart.moveBy(60, 40);

  const setupStmts = (setupNode?.body ?? []).filter(
    (n) => n.op !== "set_battery_threshold_low" &&
      n.op !== "set_battery_threshold_high" &&
      n.op !== "set_temp_threshold" &&
      n.op !== "set_heater_power" &&
      n.op !== "enable_payload_mode",
  );

  const repeat = workspace.newBlock("obc_repeat_orbit") as Blockly.BlockSvg;
  repeat.initSvg();
  repeat.render();

  const onStartBody = onStart.getInput("BODY")?.connection;
  if (!onStartBody) return;

  let previous: Blockly.BlockSvg | null = null;
  for (const node of setupStmts) {
    const child = createBlock(workspace, node);
    if (!child) continue;
    if (!previous) {
      onStartBody.connect(child.previousConnection!);
    } else {
      previous.nextConnection?.connect(child.previousConnection!);
    }
    previous = child;
  }

  if (!previous) {
    onStartBody.connect(repeat.previousConnection!);
  } else {
    previous.nextConnection?.connect(repeat.previousConnection!);
  }

  connectStatements(workspace, repeat, "BODY", mainNode?.body);
}
