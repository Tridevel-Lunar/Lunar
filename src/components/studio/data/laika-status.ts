/** Human-readable labels for LAIKA streaming status phases. */

export type LaikaStatusPhase =
  | "embedding"
  | "searching"
  | "searching_web"
  | "reasoning"
  | "tool_searching"
  | "tool_searching_web"
  | "generating";

export const LAIKA_STATUS_MESSAGES: Record<LaikaStatusPhase, string> = {
  embedding: "กำลังวิเคราะห์คำถาม…",
  searching: "กำลังค้นหาเอกสารอ้างอิง…",
  searching_web: "กำลังค้นหาข้อมูลจากอินเทอร์เน็ต…",
  reasoning: "LAIKA กำลังคิดว่าจะค้นหาอะไรเพิ่ม…",
  tool_searching: "กำลังค้นหาในคลังความรู้…",
  tool_searching_web: "กำลังค้นหาจากอินเทอร์เน็ต…",
  generating: "กำลังสร้างคำตอบ…",
};

export function laikaStatusLabel(phase: LaikaStatusPhase): string {
  return LAIKA_STATUS_MESSAGES[phase];
}
