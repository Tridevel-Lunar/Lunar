/** Human-readable labels for LAIKA streaming status phases. */

export type LaikaStatusPhase = "embedding" | "searching" | "generating" | "typing";

export const LAIKA_STATUS_MESSAGES: Record<LaikaStatusPhase, string> = {
  embedding: "กำลังวิเคราะห์คำถาม…",
  searching: "กำลังค้นหาเอกสารอ้างอิง…",
  generating: "กำลังสร้างคำตอบ…",
  typing: "กำลังพิมพ์…",
};

export function laikaStatusLabel(phase: LaikaStatusPhase): string {
  return LAIKA_STATUS_MESSAGES[phase];
}
