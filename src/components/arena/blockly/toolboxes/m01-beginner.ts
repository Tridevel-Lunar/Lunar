import type * as Blockly from "blockly";

/** Mission 01 beginner toolbox — flat categories (style via CSS + theme). */
export const M01_BEGINNER_TOOLBOX: Blockly.utils.toolbox.ToolboxDefinition = {
  kind: "categoryToolbox",
  contents: [
    {
      kind: "category",
      name: "Setup",
      categorystyle: "lunar_start_category",
      contents: [
        { kind: "block", type: "m01_on_start" },
        { kind: "block", type: "m01_set_battery_threshold_low" },
        { kind: "block", type: "m01_set_battery_threshold_high" },
        { kind: "block", type: "m01_set_temp_threshold" },
        { kind: "block", type: "m01_set_heater_power" },
        { kind: "block", type: "m01_enable_payload_mode" },
      ],
    },
    {
      kind: "category",
      name: "Main Loop",
      categorystyle: "lunar_logic_category",
      contents: [
        { kind: "block", type: "m01_main_loop" },
        { kind: "block", type: "m01_if" },
        { kind: "block", type: "m01_when" },
        { kind: "block", type: "m01_compare" },
        { kind: "block", type: "m01_wait_1_tick" },
        { kind: "block", type: "m01_repeat_until_end" },
      ],
    },
    {
      kind: "category",
      name: "Sensors",
      categorystyle: "lunar_sensor_category",
      contents: [
        { kind: "block", type: "m01_battery_level" },
        { kind: "block", type: "m01_temperature" },
        { kind: "block", type: "m01_is_daylight" },
        { kind: "block", type: "m01_tick_number" },
      ],
    },
    {
      kind: "category",
      name: "Actuator",
      categorystyle: "lunar_power_category",
      contents: [
        { kind: "block", type: "m01_turn_heater" },
        { kind: "block", type: "m01_turn_payload" },
      ],
    },
    {
      kind: "category",
      name: "Safe Mode",
      categorystyle: "lunar_safety_category",
      contents: [
        { kind: "block", type: "m01_enter_safe_mode" },
        { kind: "block", type: "m01_exit_safe_mode" },
      ],
    },
  ],
};
