import type { AnatomyPartId } from "./parts";

/** Module 2.4 tap-to-sequence checkpoint. */

export const TRACE_PASS = 2;

export type TraceChipId = Extract<
  AnatomyPartId,
  "obc" | "eps" | "comm" | "payload"
>;

export type TraceQuestion = {
  id: string;
  prompt: string;
  /** Correct order of subsystem chips. */
  answer: TraceChipId[];
  /** Pool shown to the learner (may include distractors). */
  pool: TraceChipId[];
  explain: string;
  /** Hint shown after a wrong attempt (Socratic). */
  hintWrong: string;
};

export const TRACE_QUESTIONS: TraceQuestion[] = [
  {
    id: "hot-sensor",
    prompt:
      "เซนเซอร์วัดอุณหภูมิใน Payload พบว่าร้อนเกินกำหนด เส้นทางข้อมูลควรเรียงอย่างไร?",
    answer: ["payload", "obc", "comm"],
    pool: ["payload", "obc", "comm", "eps"],
    explain:
      "Payload แจ้ง OBC ก่อน แล้ว OBC อาจส่งต่อ COMM เพื่อแจ้ง [[ground-station|สถานีภาคพื้นดิน]] ไม่ส่งตรงจาก Payload ไป COMM",
    hintWrong:
      "ถ้า Payload อยากบอกอะไรกับพื้นโลก ส่งตรงผ่าน COMM ได้เลยไหม หรือต้องผ่านใครก่อน?",
  },
  {
    id: "take-photo",
    prompt:
      "ทีมภาคพื้นส่งคำสั่งถ่ายภาพขึ้นไป ระบบใดรับก่อน แล้วส่งต่อไปใคร?",
    answer: ["comm", "obc", "payload"],
    pool: ["comm", "obc", "payload", "eps"],
    explain:
      "[[uplink|Uplink]] เข้า COMM แล้วส่งต่อ OBC จากนั้น OBC สั่ง Payload",
    hintWrong:
      "คำสั่งจากพื้นโลกเข้าทางวิทยุก่อน แล้วสมองกลางค่อยสั่งงาน ลองเรียงใหม่ดูนะ",
  },
  {
    id: "safe-mode",
    prompt:
      "แบตเตอรี่ใกล้หมดและดาวเทียมต้องลดภารกิจชั่วคราว ลำดับการคุยกันเป็นอย่างไร?",
    answer: ["eps", "obc", "payload"],
    pool: ["eps", "obc", "payload", "comm"],
    explain:
      "EPS แจ้ง [[telemetry|telemetry]] ไป OBC แล้ว OBC สั่งลดการใช้พลังงานของ Payload",
    hintWrong:
      "ใครรู้สถานะแบตก่อน? แล้วใครเป็นคนตัดสินใจสั่งเซฟโหมด?",
  },
];

export const TRACE_CHIP_LABEL: Record<TraceChipId, string> = {
  obc: "OBC",
  eps: "EPS",
  comm: "COMM",
  payload: "Payload",
};

export function sequencesEqual(a: TraceChipId[], b: TraceChipId[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((id, i) => id === b[i]);
}
