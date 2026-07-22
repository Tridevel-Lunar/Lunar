import * as Blockly from "blockly";

const OBC = "#7dd3fc";

/** Register OBC control / timing blocks (idempotent). */
export function registerObcBlocks(): void {
  if ((registerObcBlocks as { done?: boolean }).done) return;
  (registerObcBlocks as { done?: boolean }).done = true;

  Blockly.common.defineBlocksWithJsonArray([
    {
      type: "obc_on_start",
      message0: "when program starts",
      message1: "%1",
      args1: [{ type: "input_statement", name: "BODY" }],
      colour: OBC,
      tooltip: "OBC program entry point",
      hat: "cap",
    },
    {
      type: "obc_repeat_orbit",
      message0: "repeat every second on orbit",
      message1: "%1",
      args1: [{ type: "input_statement", name: "BODY" }],
      previousStatement: null,
      nextStatement: null,
      colour: OBC,
      tooltip: "Run once per simSec until the orbit ends",
    },
    {
      type: "obc_if",
      message0: "if %1 then",
      args0: [{ type: "input_value", name: "COND", check: "Boolean" }],
      message1: "%1",
      args1: [{ type: "input_statement", name: "THEN" }],
      message2: "else %1",
      args2: [{ type: "input_statement", name: "ELSE" }],
      previousStatement: null,
      nextStatement: null,
      colour: OBC,
      tooltip: "If / else condition",
    },
    {
      type: "obc_when",
      message0: "when %1 do",
      args0: [
        {
          type: "field_dropdown",
          name: "EVENT",
          options: [
            ["eclipse_enter", "eclipse_enter"],
            ["eclipse_exit", "eclipse_exit"],
            ["battery_low", "battery_low"],
            ["battery_high", "battery_high"],
            ["too_cold", "too_cold"],
            ["too_hot", "too_hot"],
            ["comm_pass", "comm_pass"],
          ],
        },
      ],
      message1: "%1",
      args1: [{ type: "input_statement", name: "BODY" }],
      previousStatement: null,
      nextStatement: null,
      colour: OBC,
      tooltip: "Run when an event occurs",
    },
    {
      type: "obc_compare",
      message0: "%1 %2 %3",
      args0: [
        { type: "input_value", name: "LEFT" },
        {
          type: "field_dropdown",
          name: "CMP",
          options: [
            ["<", "lt"],
            ["<=", "lte"],
            [">", "gt"],
            [">=", "gte"],
            ["=", "eq"],
          ],
        },
        { type: "field_number", name: "RIGHT", value: 1 },
      ],
      output: "Boolean",
      colour: OBC,
      tooltip: "Compare values",
      inputsInline: true,
    },
    {
      type: "obc_yield",
      message0: "end this second",
      previousStatement: null,
      nextStatement: null,
      colour: OBC,
      tooltip: "Stop control for this simulated second",
    },
    {
      type: "obc_sim_sec",
      message0: "sim time (sec)",
      output: "Number",
      colour: OBC,
      tooltip: "Current simSec",
    },
    {
      type: "obc_orbit_phase",
      message0: "orbit phase",
      output: "Number",
      colour: OBC,
      tooltip: "Phase 0–1 (0 = subsolar)",
    },
    {
      type: "obc_comment",
      message0: "comment %1",
      args0: [{ type: "field_input", name: "TEXT", text: "" }],
      previousStatement: null,
      nextStatement: null,
      colour: OBC,
      tooltip: "Comment (does not affect grading)",
    },
  ]);
}
