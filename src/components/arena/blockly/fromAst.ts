import * as Blockly from "blockly";
import type { WorkspaceSvg } from "blockly";

import type { AstNode, ProgramAst } from "@/ast/types";

const OP_TO_TYPE: Record<string, string> = {
  setup: "m01_on_start",
  main_loop: "m01_main_loop",
  set_battery_threshold_low: "m01_set_battery_threshold_low",
  set_battery_threshold_high: "m01_set_battery_threshold_high",
  set_temp_threshold: "m01_set_temp_threshold",
  set_heater_power: "m01_set_heater_power",
  enable_payload_mode: "m01_enable_payload_mode",
  battery_level: "m01_battery_level",
  temperature: "m01_temperature",
  is_daylight: "m01_is_daylight",
  tick_number: "m01_tick_number",
  turn_heater: "m01_turn_heater",
  turn_payload: "m01_turn_payload",
  enter_safe_mode: "m01_enter_safe_mode",
  exit_safe_mode: "m01_exit_safe_mode",
  if: "m01_if",
  when: "m01_when",
  compare: "m01_compare",
  wait_1_tick: "m01_wait_1_tick",
  repeat_until_end: "m01_repeat_until_end",
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
    case "set_battery_threshold_low":
    case "set_battery_threshold_high":
    case "set_heater_power": {
      if (node.args?.value != null) {
        block.setFieldValue(String(node.args.value), "VALUE");
      }
      break;
    }
    case "set_temp_threshold": {
      if (node.args?.min != null) {
        block.setFieldValue(String(node.args.min), "MIN");
      }
      if (node.args?.max != null) {
        block.setFieldValue(String(node.args.max), "MAX");
      }
      break;
    }
    case "enable_payload_mode": {
      const mode = String(node.args?.mode ?? "off");
      block.setFieldValue(mode, "MODE");
      break;
    }
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
      const eventName = String(node.args?.event ?? "battery_low");
      block.setFieldValue(eventName, "EVENT");
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

/** Load a program AST into an empty workspace. */
export function astToWorkspace(
  workspace: WorkspaceSvg,
  ast: ProgramAst | Record<string, unknown> | null,
): void {
  workspace.clear();
  if (!ast || typeof ast !== "object") return;

  const body = (ast as ProgramAst).body;
  if (!Array.isArray(body) || body.length === 0) return;

  let y = 40;
  for (const node of body) {
    const block = createBlock(workspace, node as AstNode);
    if (!block) continue;
    block.moveBy(40, y);
    y += Math.max(block.getHeightWidth().height + 24, 80);
  }

  Blockly.svgResize(workspace);
}
