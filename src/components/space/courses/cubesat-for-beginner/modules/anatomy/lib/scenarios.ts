/** Module 2.3 data-flow scenarios through OBC. */

export type ScenarioId = "uplink-photo" | "downlink-image" | "battery-low";

export type FlowScenario = {
  id: ScenarioId;
  title: string;
  caption: string;
  /** DATA_FLOWS edge ids to highlight in order. */
  edgeIds: string[];
};

export const FLOW_SCENARIOS: FlowScenario[] = [
  {
    id: "uplink-photo",
    title: "ทีมภาคพื้นสั่งถ่ายภาพ",
    caption:
      "COMM รับ [[uplink|uplink]] แล้วส่งต่อ OBC จากนั้น OBC สั่ง Payload ทำงาน",
    edgeIds: ["comm-obc", "obc-payload"],
  },
  {
    id: "downlink-image",
    title: "Payload ถ่ายภาพเสร็จ",
    caption:
      "Payload ส่งข้อมูลภาพกลับ OBC แล้ว OBC ส่งต่อ COMM จากนั้น COMM ส่ง [[downlink|downlink]] ลงพื้นโลก",
    edgeIds: ["payload-obc", "obc-comm"],
  },
  {
    id: "battery-low",
    title: "แบตเตอรี่ใกล้หมด",
    caption:
      "EPS แจ้งสถานะ ([[telemetry|telemetry]]) ไป OBC แล้ว OBC สั่งลดการใช้พลังงานของ Payload ชั่วคราว",
    edgeIds: ["eps-obc", "obc-payload"],
  },
];

export function getScenario(id: ScenarioId | null): FlowScenario | undefined {
  if (!id) return undefined;
  return FLOW_SCENARIOS.find((s) => s.id === id);
}
