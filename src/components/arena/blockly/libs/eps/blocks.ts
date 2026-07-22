import * as Blockly from "blockly";

const EPS = "#fbbf24";

/** Register EPS sensor / actuator blocks (idempotent). */
export function registerEpsBlocks(): void {
  if ((registerEpsBlocks as { done?: boolean }).done) return;
  (registerEpsBlocks as { done?: boolean }).done = true;

  Blockly.common.defineBlocksWithJsonArray([
    {
      type: "eps_battery_level",
      message0: "battery level",
      output: "Number",
      colour: EPS,
      tooltip: "Read battery level (%)",
    },
    {
      type: "eps_is_in_sunlight",
      message0: "in sunlight?",
      output: "Boolean",
      colour: EPS,
      tooltip: "True when the satellite is sunlit",
    },
    {
      type: "eps_is_in_eclipse",
      message0: "in eclipse?",
      output: "Boolean",
      colour: EPS,
      tooltip: "True when the satellite is in Earth's shadow",
    },
    {
      type: "eps_temperature",
      message0: "temperature",
      output: "Number",
      colour: EPS,
      tooltip: "Read temperature (°C abstract)",
    },
    {
      type: "eps_turn_heater",
      message0: "turn heater %1",
      args0: [
        {
          type: "field_dropdown",
          name: "ON",
          options: [
            ["ON", "true"],
            ["OFF", "false"],
          ],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: EPS,
      tooltip: "Turn heater on/off",
    },
    {
      type: "eps_enter_safe_mode",
      message0: "enter safe mode",
      previousStatement: null,
      nextStatement: null,
      colour: EPS,
      tooltip: "Enter safe mode (disables heater/payload)",
    },
    {
      type: "eps_exit_safe_mode",
      message0: "exit safe mode",
      previousStatement: null,
      nextStatement: null,
      colour: EPS,
      tooltip: "Exit safe mode on the next second",
    },
  ]);
}
