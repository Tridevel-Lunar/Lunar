import * as Blockly from "blockly";
import type { WorkspaceSvg } from "blockly";

import type { AstNode, ProgramAst } from "@/ast/types";

const OP_TO_TYPE: Record<string, string> = {
  on_start: "m01_on_start",
  await_phase: "m01_await_phase",
  power_bus_on: "m01_power_bus_on",
  read_power: "m01_read_power",
  payload_set: "m01_payload_set",
  sensor_enable: "m01_sensor_enable",
  sensor_read: "m01_sensor_read",
  begin_ascent: "m01_begin_ascent",
  orbit_stability: "m01_orbit_stability",
  until_stable: "m01_until_stable",
  confirm_leo: "m01_confirm_leo",
  if: "m01_if",
  compare: "m01_compare",
  safe_mode_payload_off: "m01_safe_mode_payload_off",
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
    case "payload_set": {
      const on = Boolean(node.args?.on);
      block.setFieldValue(on ? "true" : "false", "ON");
      break;
    }
    case "sensor_enable":
    case "sensor_read": {
      const sensor = String(node.args?.sensor ?? "imu");
      block.setFieldValue(sensor, "SENSOR");
      break;
    }
    case "until_stable": {
      if (node.args?.threshold != null) {
        block.setFieldValue(String(node.args.threshold), "THRESHOLD");
      }
      if (node.args?.maxTries != null) {
        block.setFieldValue(String(node.args.maxTries), "MAX_TRIES");
      }
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
    case "on_start": {
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
