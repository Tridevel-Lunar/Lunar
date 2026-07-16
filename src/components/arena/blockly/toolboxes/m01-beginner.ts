import type * as Blockly from "blockly";

/** Mission 01 beginner toolbox — flat categories (style via CSS + theme). */
export const M01_BEGINNER_TOOLBOX: Blockly.utils.toolbox.ToolboxDefinition = {
  kind: "categoryToolbox",
  contents: [
    {
      kind: "category",
      name: "เริ่มต้น",
      categorystyle: "lunar_start_category",
      contents: [
        { kind: "block", type: "m01_on_start" },
        { kind: "block", type: "m01_await_phase" },
      ],
    },
    {
      kind: "category",
      name: "พลังงาน",
      categorystyle: "lunar_power_category",
      contents: [
        { kind: "block", type: "m01_power_bus_on" },
        { kind: "block", type: "m01_read_power" },
        { kind: "block", type: "m01_payload_set" },
      ],
    },
    {
      kind: "category",
      name: "เซนเซอร์",
      categorystyle: "lunar_sensor_category",
      contents: [
        { kind: "block", type: "m01_sensor_enable" },
        { kind: "block", type: "m01_sensor_read" },
      ],
    },
    {
      kind: "category",
      name: "วงโคจร",
      categorystyle: "lunar_orbit_category",
      contents: [
        { kind: "block", type: "m01_begin_ascent" },
        { kind: "block", type: "m01_orbit_stability" },
        { kind: "block", type: "m01_until_stable" },
        { kind: "block", type: "m01_confirm_leo" },
      ],
    },
    {
      kind: "category",
      name: "เงื่อนไข",
      categorystyle: "lunar_logic_category",
      contents: [
        { kind: "block", type: "m01_if" },
        { kind: "block", type: "m01_compare" },
      ],
    },
    {
      kind: "category",
      name: "ความปลอดภัย",
      categorystyle: "lunar_safety_category",
      contents: [{ kind: "block", type: "m01_safe_mode_payload_off" }],
    },
  ],
};
