import type * as Blockly from "blockly";

export const OBC_TOOLBOX_CATEGORY: Blockly.utils.toolbox.CategoryInfo = {
  kind: "category",
  name: "OBC",
  categorystyle: "lunar_obc_category",
  contents: [
    { kind: "block", type: "obc_on_start" },
    { kind: "block", type: "obc_repeat_orbit" },
    { kind: "block", type: "obc_if" },
    { kind: "block", type: "obc_when" },
    { kind: "block", type: "obc_compare" },
    { kind: "block", type: "obc_yield" },
    { kind: "block", type: "obc_sim_sec" },
    { kind: "block", type: "obc_orbit_phase" },
    { kind: "block", type: "obc_comment" },
  ],
};
