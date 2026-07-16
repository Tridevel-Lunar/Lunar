import * as Blockly from "blockly";

const EVENT = 200;
const POWER = 160;
const SENSOR = 40;
const ORBIT = 20;
const SAFETY = 0;
const LOGIC = 230;

/** Register Mission 01 custom blocks (idempotent). */
export function registerM01Blocks(): void {
  if ((registerM01Blocks as { done?: boolean }).done) return;
  (registerM01Blocks as { done?: boolean }).done = true;

  Blockly.common.defineBlocksWithJsonArray([
    {
      type: "m01_on_start",
      message0: "เมื่อเริ่มภารกิจ",
      message1: "%1",
      args1: [{ type: "input_statement", name: "BODY" }],
      colour: EVENT,
      tooltip: "จุดเริ่มต้นของโปรแกรมภารกิจ",
      hat: "cap",
    },
    {
      type: "m01_await_phase",
      message0: "รอจนพร้อมปล่อย",
      previousStatement: null,
      nextStatement: null,
      colour: EVENT,
      tooltip: "รอจนเข้าเฟส ready_for_release",
    },
    {
      type: "m01_power_bus_on",
      message0: "เปิดบัสพลังงาน",
      previousStatement: null,
      nextStatement: null,
      colour: POWER,
      tooltip: "เปิดบัสไฟให้แอคชูเอเตอร์",
    },
    {
      type: "m01_read_power",
      message0: "อ่านพลังงานที่เหลือ",
      output: "Number",
      colour: POWER,
      tooltip: "คืนค่าพลังงาน (Wh)",
    },
    {
      type: "m01_payload_set",
      message0: "ตั้ง Payload เป็น %1",
      args0: [
        {
          type: "field_dropdown",
          name: "ON",
          options: [
            ["เปิด", "true"],
            ["ปิด", "false"],
          ],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: POWER,
      tooltip: "เปิดหรือปิด Payload",
    },
    {
      type: "m01_sensor_enable",
      message0: "เปิดเซนเซอร์ %1",
      args0: [
        {
          type: "field_dropdown",
          name: "SENSOR",
          options: [
            ["อุณหภูมิ", "temp"],
            ["IMU", "imu"],
          ],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: SENSOR,
      tooltip: "เปิดเซนเซอร์ที่เลือก",
    },
    {
      type: "m01_sensor_read",
      message0: "อ่านค่าเซนเซอร์ %1",
      args0: [
        {
          type: "field_dropdown",
          name: "SENSOR",
          options: [
            ["อุณหภูมิ", "temp"],
            ["IMU", "imu"],
          ],
        },
      ],
      output: "Number",
      colour: SENSOR,
      tooltip: "อ่านค่าจากเซนเซอร์",
    },
    {
      type: "m01_begin_ascent",
      message0: "เริ่มลำดับขึ้นสู่วงโคจร",
      previousStatement: null,
      nextStatement: null,
      colour: ORBIT,
      tooltip: "เริ่ม ascent (ต้องมี power bus + IMU)",
    },
    {
      type: "m01_orbit_stability",
      message0: "ตรวจเสถียรวงโคจร",
      output: "Number",
      colour: ORBIT,
      tooltip: "คืนค่าความเสถียร 0–1",
    },
    {
      type: "m01_until_stable",
      message0: "ลูป: ตรวจจนเสถียร ≥ %1 สูงสุด %2 ครั้ง",
      args0: [
        { type: "field_number", name: "THRESHOLD", value: 0.7, min: 0, max: 1, precision: 0.1 },
        { type: "field_number", name: "MAX_TRIES", value: 5, min: 1, max: 20, precision: 1 },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: ORBIT,
      tooltip: "วนตรวจความเสถียรจนถึง threshold",
    },
    {
      type: "m01_confirm_leo",
      message0: "ยืนยันเข้า LEO",
      previousStatement: null,
      nextStatement: null,
      colour: ORBIT,
      tooltip: "ยืนยันว่าเข้าสู่วงโคจรต่ำแล้ว",
    },
    {
      type: "m01_if",
      message0: "หาก %1 แล้ว",
      args0: [{ type: "input_value", name: "COND", check: "Boolean" }],
      message1: "%1",
      args1: [{ type: "input_statement", name: "THEN" }],
      message2: "มิฉะนั้น %1",
      args2: [{ type: "input_statement", name: "ELSE" }],
      previousStatement: null,
      nextStatement: null,
      colour: LOGIC,
      tooltip: "เงื่อนไข if / else",
    },
    {
      type: "m01_compare",
      message0: "%1 %2 %3",
      args0: [
        { type: "input_value", name: "LEFT", check: "Number" },
        {
          type: "field_dropdown",
          name: "CMP",
          options: [
            ["≥", "gte"],
            ["<", "lt"],
          ],
        },
        { type: "field_number", name: "RIGHT", value: 4 },
      ],
      output: "Boolean",
      colour: LOGIC,
      tooltip: "เปรียบเทียบตัวเลข",
      inputsInline: true,
    },
    {
      type: "m01_safe_mode_payload_off",
      message0: "โหมดฉุกเฉิน: ปิด payload",
      previousStatement: null,
      nextStatement: null,
      colour: SAFETY,
      tooltip: "ปิด payload และกู้คืนเล็กน้อย",
    },
  ]);
}
