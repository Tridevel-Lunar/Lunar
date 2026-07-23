import type * as Blockly from "blockly";

export const EPS_TOOLBOX_CATEGORY: Blockly.utils.toolbox.CategoryInfo = {
  kind: "category",
  name: "EPS",
  categorystyle: "lunar_eps_category",
  contents: [
    { kind: "block", type: "eps_battery_level" },
    { kind: "block", type: "eps_is_in_sunlight" },
    { kind: "block", type: "eps_is_in_eclipse" },
    { kind: "block", type: "eps_temperature" },
    { kind: "block", type: "eps_turn_heater" },
    { kind: "block", type: "eps_enter_safe_mode" },
    { kind: "block", type: "eps_exit_safe_mode" },
  ],
};
