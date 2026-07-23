import * as Blockly from "blockly";

const COMM = "#34d399";

/** COMM blocks (M02+; toolbox usually hidden on M01). */
export function registerCommBlocks(): void {
  if ((registerCommBlocks as { done?: boolean }).done) return;
  (registerCommBlocks as { done?: boolean }).done = true;

  Blockly.common.defineBlocksWithJsonArray([
    {
      type: "comm_is_pass_window",
      message0: "in pass window?",
      output: "Boolean",
      colour: COMM,
      tooltip: "True during a ground pass window",
    },
    {
      type: "comm_seconds_until_pass",
      message0: "seconds until pass",
      output: "Number",
      colour: COMM,
      tooltip: "Seconds until the next ground pass",
    },
    {
      type: "comm_queue_downlink",
      message0: "queue downlink %1",
      args0: [
        {
          type: "field_dropdown",
          name: "MODE",
          options: [
            ["full", "full"],
            ["partial", "partial"],
          ],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COMM,
      tooltip: "Queue a downlink",
    },
  ]);
}
