import type { ScenarioId } from "./scenarios";

/** Ground-station photo capture walkthrough for anatomy flow step. */

export type PhotoMissionPhase =
  | "idle"
  | "uplink"
  | "comm-to-obc"
  | "obc-to-payload"
  | "capturing"
  | "payload-to-obc"
  | "obc-to-comm"
  | "downlink"
  | "revealed";

export type PhotoMissionStep = {
  phase: PhotoMissionPhase;
  /** Short HUD label in mono */
  label: string;
  /** Thai explanation for learners */
  detail: string;
  /** Which flow scenario edges to highlight, if any */
  scenarioId?: ScenarioId;
  /** Duration before auto-advancing (ms). Last phase is sticky. */
  dwellMs: number;
};

export const PHOTO_MISSION_STEPS: PhotoMissionStep[] = [
  {
    phase: "uplink",
    label: "UPLINK",
    detail: "สถานีภาคพื้นส่งคำสั่งถ่ายภาพขึ้นไปยังดาวเทียมผ่านคลื่นวิทยุ",
    scenarioId: "uplink-photo",
    dwellMs: 1400,
  },
  {
    phase: "comm-to-obc",
    label: "COMM → OBC",
    detail: "COMM รับคำสั่งแล้วส่งต่อให้ OBC ซึ่งเป็นสมองของดาวเทียม",
    scenarioId: "uplink-photo",
    dwellMs: 1300,
  },
  {
    phase: "obc-to-payload",
    label: "OBC → PAYLOAD",
    detail: "OBC ตีความคำสั่ง แล้วสั่ง Payload (กล้อง) ให้เริ่มถ่าย",
    scenarioId: "uplink-photo",
    dwellMs: 1300,
  },
  {
    phase: "capturing",
    label: "CAPTURE",
    detail: "Payload เปิดชัตเตอร์ — ถ่ายภาพคุณจากกล้องจริง แล้วบันทึกข้อมูล",
    dwellMs: 1600,
  },
  {
    phase: "payload-to-obc",
    label: "PAYLOAD → OBC",
    detail: "Payload ส่งไฟล์ภาพกลับไปให้ OBC จัดการต่อ",
    scenarioId: "downlink-image",
    dwellMs: 1300,
  },
  {
    phase: "obc-to-comm",
    label: "OBC → COMM",
    detail: "OBC แพ็กข้อมูลภาพแล้วส่งให้ COMM พร้อมส่งลงพื้น",
    scenarioId: "downlink-image",
    dwellMs: 1300,
  },
  {
    phase: "downlink",
    label: "DOWNLINK",
    detail: "COMM ส่งภาพกลับสถานีภาคพื้น — คุณกำลังรับสัญญาณอยู่",
    scenarioId: "downlink-image",
    dwellMs: 1400,
  },
  {
    phase: "revealed",
    label: "RECEIVED",
    detail: "ภาพถึงสถานีแล้ว! ดูผลในกรอบหน้าต่างสถานีอวกาศด้านล่าง",
    dwellMs: 0,
  },
];

export const PHOTO_MISSION_PIPELINE = [
  "สถานีภาคพื้น",
  "COMM",
  "OBC",
  "Payload",
  "OBC",
  "COMM",
  "สถานีภาคพื้น",
] as const;

/** Index in PHOTO_MISSION_PIPELINE that should glow for each phase. */
export function pipelineActiveIndex(phase: PhotoMissionPhase): number | null {
  switch (phase) {
    case "idle":
      return null;
    case "uplink":
      return 0;
    case "comm-to-obc":
      return 1;
    case "obc-to-payload":
      return 2;
    case "capturing":
      return 3;
    case "payload-to-obc":
      return 3;
    case "obc-to-comm":
      return 4;
    case "downlink":
      return 5;
    case "revealed":
      return 6;
  }
}
