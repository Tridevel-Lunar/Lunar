import * as Blockly from "blockly";

const SETUP = 200;
const SENSOR = 40;
const ACTUATOR = 160;
const CONTROL = 230;
const SAFETY = 0;

/** Register Mission 01 deterministic mission blocks (idempotent). */
export function registerM01Blocks(): void {
  if ((registerM01Blocks as { done?: boolean }).done) return;
  (registerM01Blocks as { done?: boolean }).done = true;

  Blockly.common.defineBlocksWithJsonArray([
    {
      type: "m01_on_start",
      message0: "Setup",
      message1: "%1",
      args1: [{ type: "input_statement", name: "BODY" }],
      colour: SETUP,
      tooltip: "กำหนดค่า threshold ก่อนเริ่มจำลอง",
      hat: "cap",
    },
    {
      type: "m01_main_loop",
      message0: "Main Loop",
      message1: "%1",
      args1: [{ type: "input_statement", name: "BODY" }],
      colour: CONTROL,
      tooltip: "รันซ้ำทุก tick จนจบ window",
    },
    {
      type: "m01_set_battery_threshold_low",
      message0: "set battery threshold low = %1 %",
      args0: [{ type: "field_number", name: "VALUE", value: 20, min: 0, max: 100, precision: 1 }],
      previousStatement: null,
      nextStatement: null,
      colour: SETUP,
      tooltip: "กำหนดระดับแบตต่ำ",
    },
    {
      type: "m01_set_battery_threshold_high",
      message0: "set battery threshold high = %1 %",
      args0: [{ type: "field_number", name: "VALUE", value: 80, min: 0, max: 100, precision: 1 }],
      previousStatement: null,
      nextStatement: null,
      colour: SETUP,
      tooltip: "กำหนดระดับแบตสูง",
    },
    {
      type: "m01_set_temp_threshold",
      message0: "set temp threshold min = %1 max = %2",
      args0: [
        { type: "field_number", name: "MIN", value: 0, min: -120, max: 120, precision: 1 },
        { type: "field_number", name: "MAX", value: 60, min: -120, max: 120, precision: 1 },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: SETUP,
      tooltip: "กำหนดช่วงอุณหภูมิที่ยอมรับได้",
    },
    {
      type: "m01_set_heater_power",
      message0: "set heater power = %1 %",
      args0: [{ type: "field_number", name: "VALUE", value: 30, min: 0, max: 100, precision: 1 }],
      previousStatement: null,
      nextStatement: null,
      colour: SETUP,
      tooltip: "กำหนดกำลัง heater",
    },
    {
      type: "m01_enable_payload_mode",
      message0: "enable payload: %1",
      args0: [
        {
          type: "field_dropdown",
          name: "MODE",
          options: [
            ["camera", "camera"],
            ["science_sensor", "science_sensor"],
            ["off", "off"],
          ],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: SETUP,
      tooltip: "เลือก payload เริ่มต้น",
    },
    {
      type: "m01_battery_level",
      message0: "battery level",
      output: "Number",
      colour: SENSOR,
      tooltip: "อ่านค่าแบตเตอรี่",
    },
    {
      type: "m01_temperature",
      message0: "temperature",
      output: "Number",
      colour: SENSOR,
      tooltip: "อ่านค่าอุณหภูมิ",
    },
    {
      type: "m01_is_daylight",
      message0: "is daylight?",
      output: "Boolean",
      colour: SENSOR,
      tooltip: "บอกสถานะแสงอาทิตย์",
    },
    {
      type: "m01_tick_number",
      message0: "tick number",
      output: "Number",
      colour: SENSOR,
      tooltip: "รอบ tick ปัจจุบัน",
    },
    {
      type: "m01_turn_heater",
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
      colour: ACTUATOR,
      tooltip: "สั่งเปิด/ปิด heater",
    },
    {
      type: "m01_turn_payload",
      message0: "turn payload %1",
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
      colour: ACTUATOR,
      tooltip: "สั่งเปิด/ปิด payload",
    },
    {
      type: "m01_enter_safe_mode",
      message0: "enter safe mode",
      previousStatement: null,
      nextStatement: null,
      colour: SAFETY,
      tooltip: "เข้า safe mode ทันที",
    },
    {
      type: "m01_exit_safe_mode",
      message0: "exit safe mode",
      previousStatement: null,
      nextStatement: null,
      colour: SAFETY,
      tooltip: "ออกจาก safe mode (มีผล tick ถัดไป)",
    },
    {
      type: "m01_if",
      message0: "If %1 then",
      args0: [{ type: "input_value", name: "COND", check: "Boolean" }],
      message1: "%1",
      args1: [{ type: "input_statement", name: "THEN" }],
      message2: "else %1",
      args2: [{ type: "input_statement", name: "ELSE" }],
      previousStatement: null,
      nextStatement: null,
      colour: CONTROL,
      tooltip: "เงื่อนไข if / else",
    },
    {
      type: "m01_when",
      message0: "when %1 do",
      args0: [
        {
          type: "field_dropdown",
          name: "EVENT",
          options: [
            ["battery_low", "battery_low"],
            ["battery_high", "battery_high"],
            ["too_cold", "too_cold"],
            ["too_hot", "too_hot"],
            ["glitch_tick", "glitch_tick"],
          ],
        },
      ],
      message1: "%1",
      args1: [{ type: "input_statement", name: "BODY" }],
      previousStatement: null,
      nextStatement: null,
      colour: CONTROL,
      tooltip: "event-driven block",
    },
    {
      type: "m01_compare",
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
        { type: "field_number", name: "RIGHT", value: 4 },
      ],
      output: "Boolean",
      colour: CONTROL,
      tooltip: "เปรียบเทียบตัวเลข",
      inputsInline: true,
    },
    {
      type: "m01_wait_1_tick",
      message0: "wait 1 tick",
      previousStatement: null,
      nextStatement: null,
      colour: CONTROL,
      tooltip: "จบ tick ทันที",
    },
    {
      type: "m01_repeat_until_end",
      message0: "repeat until end of window",
      message1: "%1",
      args1: [{ type: "input_statement", name: "BODY" }],
      previousStatement: null,
      nextStatement: null,
      colour: CONTROL,
      tooltip: "วนหนึ่งรอบต่อ tick จนจบ window",
    },
  ]);
}
