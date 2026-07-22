import type * as Blockly from "blockly";

export const COMM_TOOLBOX_CATEGORY: Blockly.utils.toolbox.CategoryInfo = {
  kind: "category",
  name: "COMM",
  categorystyle: "lunar_comm_category",
  contents: [
    { kind: "block", type: "comm_is_pass_window" },
    { kind: "block", type: "comm_seconds_until_pass" },
    { kind: "block", type: "comm_queue_downlink" },
  ],
};
