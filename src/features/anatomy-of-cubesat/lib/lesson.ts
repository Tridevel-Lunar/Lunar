import type { AnatomyPartId } from "@/features/anatomy-of-cubesat/lib/parts";
import type { BoardPartId } from "@/features/anatomy-of-cubesat/lib/layout";

export type AnatomyStep = "explore" | "flatsat" | "dataflow" | "quiz";

export const ANATOMY_STEPS: {
  id: AnatomyStep;
  label: string;
  labelEn: string;
  blurb: string;
}[] = [
  {
    id: "explore",
    label: "สำรวจ 3D",
    labelEn: "Explore",
    blurb: "หมุนดู CubeSat 1U ทั้งดวง",
  },
  {
    id: "flatsat",
    label: "FlatSat 2D",
    labelEn: "FlatSat",
    blurb: "กางชิ้นส่วนเป็นแผนผังแบน",
  },
  {
    id: "dataflow",
    label: "การไหลข้อมูล",
    labelEn: "Data flow",
    blurb: "ดูว่าแต่ละระบบคุยกันอย่างไร",
  },
  {
    id: "quiz",
    label: "ทบทวน",
    labelEn: "Review",
    blurb: "กิจกรรมตรวจความเข้าใจ",
  },
];

export type FlowKind = "power" | "data" | "rf";

export interface DataFlowEdge {
  id: string;
  from: BoardPartId;
  to: BoardPartId;
  label: string;
  labelTh: string;
  kind: FlowKind;
  why: string;
  /** What physically/logically travels on this link */
  carries: string;
  /** Example packets / signals learners can recognize */
  examples: string[];
  unitHint: string;
}

/** How subsystems talk so the satellite can operate. */
export const DATA_FLOWS: DataFlowEdge[] = [
  {
    id: "eps-obc",
    from: "eps",
    to: "obc",
    label: "Power bus",
    labelTh: "ไฟฟ้า",
    kind: "power",
    why: "OBC ต้องมีไฟจึงจะรัน flight software ได้",
    carries: "กระแสไฟฟ้า (DC) จากแบต/โซลาร์หลังแปลงแรงดัน",
    examples: ["3.3V rail", "5V rail", "battery status"],
    unitHint: "หน่วย: โวลต์ / แอมแปร์",
  },
  {
    id: "eps-comm",
    from: "eps",
    to: "comm",
    label: "Power bus",
    labelTh: "ไฟฟ้า",
    kind: "power",
    why: "วิทยุใช้ไฟมากตอนส่ง — EPS ต้องจ่ายได้พอ",
    carries: "ไฟฟ้าเลี้ยงเครื่องส่ง/รับวิทยุ",
    examples: ["TX power enable", "PA supply", "receiver bias"],
    unitHint: "หน่วย: โวลต์ / วัตต์ตอนส่ง",
  },
  {
    id: "eps-payload",
    from: "eps",
    to: "payload",
    label: "Power bus",
    labelTh: "ไฟฟ้า",
    kind: "power",
    why: "กล้อง/เซ็นเซอร์ทำงานได้เมื่อมีพลังงาน",
    carries: "ไฟฟ้าเลี้ยงเพย์โหลดตามตารางเปิด-ปิด",
    examples: ["camera power", "sensor 3.3V", "heater (ถ้ามี)"],
    unitHint: "หน่วย: โวลต์ / แอมแปร์",
  },
  {
    id: "obc-payload",
    from: "obc",
    to: "payload",
    label: "Command",
    labelTh: "คำสั่ง",
    kind: "data",
    why: "OBC สั่งให้ payload ถ่ายภาพหรือเริ่มวัด",
    carries: "คำสั่งดิจิทัล (digital command) ผ่านบัสเช่น I²C/SPI/UART",
    examples: ["TAKE_PHOTO", "START_SAMPLE", "SET_MODE"],
    unitHint: "ชนิด: คำสั่ง / พารามิเตอร์",
  },
  {
    id: "payload-obc",
    from: "payload",
    to: "obc",
    label: "Telemetry",
    labelTh: "ข้อมูล",
    kind: "data",
    why: "ผลวัด/รูปภาพถูกส่งกลับมาเก็บที่ OBC",
    carries: "ข้อมูลภารกิจ (science data) และสถานะเซ็นเซอร์",
    examples: ["image bytes", "temperature °C", "sensor voltage"],
    unitHint: "ชนิด: ไบต์ข้อมูล / ค่าวัด",
  },
  {
    id: "obc-comm",
    from: "obc",
    to: "comm",
    label: "Downlink frame",
    labelTh: "ข้อมูล+สถานะ",
    kind: "rf",
    why: "OBC ส่ง telemetry ให้ Comm ดาวน์ลิงก์",
    carries: "เฟรมข้อมูลที่พร้อมส่งลงพื้นโลก (telemetry packet)",
    examples: ["HK telemetry", "beacon", "payload downlink"],
    unitHint: "ชนิด: แพ็กเกจ / บิตเรต",
  },
  {
    id: "comm-obc",
    from: "comm",
    to: "obc",
    label: "Uplink command",
    labelTh: "คำสั่งจากพื้น",
    kind: "rf",
    why: "คำสั่งจากสถานีพื้นโลกเข้า Comm แล้วส่งให้ OBC",
    carries: "คำสั่งอัปลิงก์ที่ถอดรหัสจากคลื่นวิทยุแล้ว",
    examples: ["SCHEDULE_PASS", "RESET_PAYLOAD", "SAFE_MODE"],
    unitHint: "ชนิด: คำสั่งภาคพื้น → OBC",
  },
];

export const FLOW_KIND_META: Record<
  FlowKind,
  { label: string; color: string; icon: string; short: string }
> = {
  power: {
    label: "ไฟฟ้า / พลังงาน",
    color: "#fbbf24",
    icon: "⚡",
    short: "ไฟฟ้า",
  },
  data: {
    label: "ข้อมูล / คำสั่งดิจิทัล",
    color: "#7dd3fc",
    icon: "💾",
    short: "ข้อมูล",
  },
  rf: {
    label: "วิทยุ (ขึ้น-ลงพื้น)",
    color: "#34d399",
    icon: "📡",
    short: "วิทยุ",
  },
};

export interface QuizQuestion {
  id: string;
  prompt: string;
  choices: { id: string; label: string }[];
  correctId: string;
  explain: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "ระบบใดเป็น “สมอง” ที่สั่งงานบอร์ดอื่น?",
    choices: [
      { id: "eps", label: "EPS — พลังงาน" },
      { id: "obc", label: "OBC — คอมพิวเตอร์" },
      { id: "comm", label: "Comm — สื่อสาร" },
      { id: "payload", label: "Payload — เพย์โหลด" },
    ],
    correctId: "obc",
    explain: "OBC รันซอฟต์แวร์และสั่ง EPS / Comm / Payload",
  },
  {
    id: "q2",
    prompt: "ถ้าต้องการส่ง telemetry ลงพื้นโลก สายข้อมูลหลักไหลจากไหน → ไหน?",
    choices: [
      { id: "a", label: "EPS → Payload" },
      { id: "b", label: "OBC → Comm" },
      { id: "c", label: "Structure → OBC" },
      { id: "d", label: "Comm → EPS" },
    ],
    correctId: "b",
    explain: "OBC จัดข้อมูลแล้วให้ Comm ดาวน์ลิงก์",
  },
  {
    id: "q3",
    prompt: "ระบบใดจ่ายไฟให้บอร์ดอื่นทำงานได้?",
    choices: [
      { id: "eps", label: "EPS" },
      { id: "comm", label: "Comm" },
      { id: "structure", label: "Structure" },
      { id: "payload", label: "Payload" },
    ],
    correctId: "eps",
    explain: "EPS เก็บพลังงานจากโซลาร์และแจกจ่ายไฟ",
  },
  {
    id: "q4",
    prompt: "คำสั่งจากสถานีพื้นโลกเข้าดาวเทียมผ่านทางใดก่อน?",
    choices: [
      { id: "a", label: "Payload แล้วค่อย OBC" },
      { id: "b", label: "Comm (อัปลิงก์) แล้วส่งให้ OBC" },
      { id: "c", label: "EPS โดยตรง" },
      { id: "d", label: "Structure" },
    ],
    correctId: "b",
    explain: "วิทยุรับอัปลิงก์ แล้วส่งคำสั่งต่อให้ OBC",
  },
  {
    id: "q5",
    prompt: "FlatSat ช่วยเรียนรู้อะไรเป็นหลัก?",
    choices: [
      { id: "a", label: "ความเร็ววงโคจร" },
      { id: "b", label: "เห็นชิ้นส่วน/การเชื่อมต่อบนแผ่นแบน" },
      { id: "c", label: "อุณหภูมิพื้นโลก" },
      { id: "d", label: "แรงโน้มถ่วงดวงจันทร์" },
    ],
    correctId: "b",
    explain: "FlatSat กางระบบให้เห็นการวางบอร์ดและการเชื่อมต่อ",
  },
];

export function stepToViewMode(step: AnatomyStep): "assembled" | "flatsat" {
  return step === "explore" ? "assembled" : "flatsat";
}

export function defaultPartForStep(step: AnatomyStep): AnatomyPartId {
  if (step === "explore") return "overview";
  if (step === "dataflow") return "obc";
  return "structure";
}
