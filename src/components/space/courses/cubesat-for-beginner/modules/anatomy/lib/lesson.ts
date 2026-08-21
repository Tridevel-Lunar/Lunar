import type { AnatomyPartId } from "./parts";
import type { BoardPartId } from "./layout";
import type { ScenarioId } from "./scenarios";
import { TRACE_PASS } from "./trace";

export type AnatomyStep = "intro" | "meet" | "flow" | "trace" | "close";

export type CheckpointKind =
  | "intro-ack"
  | "meet-parts"
  | "flow-scenarios"
  | "trace-pass"
  | "finish";

export type AnatomyJourneyStep = {
  id: AnatomyStep;
  shortLabel: string;
  title: string;
  laikaSays: string;
  body: string;
  tryThis: string;
  checkpoint: {
    kind: CheckpointKind;
    hint: string;
  };
};

export const ANATOMY_STEPS: AnatomyJourneyStep[] = [
  {
    id: "intro",
    shortLabel: "1",
    title: "ทบทวน CubeSat แล้วผ่าดูข้างใน",
    laikaSays:
      "สวัสดีทุกคน! ก่อนผ่ากล่อง มาทบทวนสั้นๆ ก่อนนะ CubeSat คือดาวเทียมขนาดเล็กที่ใช้มาตรฐานหน่วย U ทีมเล็กก็ทำและปล่อยได้ ในโมดูลที่แล้วเราเห็นจากข้างนอก วันนี้จะดูว่าข้างในมีอะไรบ้าง",
    body: "ทบทวนจบแล้ว ค่อยเทียบกับร่างกายมนุษย์ Payload เหมือนประสาทสัมผัสกับมือ EPS เหมือนหัวใจที่สูบฉีดพลังงาน COMM เหมือนปากกับหู และ OBC เหมือนสมองที่ตัดสินใจ\n\nมือจะหยิบของไม่ได้ถ้าสมองไม่สั่ง สมองก็สั่งไม่ได้ถ้าตาไม่ส่งภาพมา ดาวเทียมก็เหมือนกัน ทุกระบบต้องพึ่งพากันถึงจะทำงานครบวงจร",
    tryThis: "อ่านทบทวน CubeSat ด้านล่าง แล้วเปิดการ์ดเปรียบเทียบอย่างน้อยหนึ่งใบ จากนั้นกดเข้าใจแล้วเพื่อไปต่อ",
    checkpoint: {
      kind: "intro-ack",
      hint: "เปิดการ์ดอย่างน้อย 1 ใบ แล้วกดเข้าใจแล้ว",
    },
  },
  {
    id: "meet",
    shortLabel: "2",
    title: "รู้จักทีละระบบ",
    laikaSays:
      "ต่อไปมาดูทีละระบบกัน ลองคลิกป้ายในฉากซ้ายที่มีเส้นชี้ไปยัง OBC EPS COMM และ Payload แล้วอ่านรายละเอียดบน popup",
    body: "ในโมดูลนี้โฟกัสสี่ระบบหลักที่ควรรู้ก่อน ส่วนอย่าง ADCS หรือ Thermal จะไปแตะในโมดูล Physics\n\nจำไว้ว่า Payload คือส่วนที่ทำให้แต่ละภารกิจต่างกัน ส่วน OBC EPS และ COMM มักออกแบบคล้ายกันหลายดวงเหมือนแชสซีมาตรฐาน",
    tryThis: "คลิกป้ายในฉากให้ครบทั้งสี่ระบบ มีตัวนับด้านล่าง",
    checkpoint: {
      kind: "meet-parts",
      hint: "เปิดครบ 4 ระบบ OBC EPS COMM และ Payload",
    },
  },
  {
    id: "flow",
    shortLabel: "3",
    title: "การไหลข้อมูลและพลังงาน",
    laikaSays:
      "มุมมองนี้ย่อเหลือสี่กล่อง OBC อยู่ตรงกลาง เส้นเหลืองคือพลังงานจาก EPS เส้นฟ้าคือข้อมูลที่ต้องผ่าน OBC เสมอ ระบบอื่นไม่คุยตรงกันเองนะ",
    body: "OBC ไม่ได้รู้อะไรเอง มันแค่ตัดสินใจจากข้อมูลที่ระบบอื่นส่งมา แนวคิดนี้จะกลับมาอีกครั้งตอนเรียน Programming เรื่อง if/else\n\nลองเล่นครบสามสถานการณ์ สั่งถ่ายภาพ ส่งภาพลงพื้น และแบตใกล้หมด",
    tryThis:
      "กดเล่นสถานการณ์ทั้งสามปุ่มด้านล่าง แล้วลองกิจกรรมสถานีภาคพื้น สั่งถ่ายภาพแล้วดูลำดับตั้งแต่รับคำสั่งจนภาพส่งกลับมา",
    checkpoint: {
      kind: "flow-scenarios",
      hint: "เล่นครบ 3 สถานการณ์",
    },
  },
  {
    id: "trace",
    shortLabel: "4",
    title: "ตามรอยข้อมูล",
    laikaSays:
      "คราวนี้ลองเรียงลำดับระบบให้ถูกเส้นทางเองนะ จำไว้ว่า Payload ส่งตรงไป COMM ไม่ได้ ต้องผ่าน OBC ก่อน",
    body: "กิจกรรมนี้ไม่ใช่เลือกคำตอบเดียว แต่ให้เรียงลำดับระบบตามสถานการณ์จริง ผ่านอย่างน้อยสองจากสามข้อถึงจะไปขั้นปิดท้ายได้",
    tryThis: `เรียงชิปให้ถูกลำดับ ผ่านอย่างน้อย ${TRACE_PASS} จาก 3 ข้อ`,
    checkpoint: {
      kind: "trace-pass",
      hint: `ผ่านจุดตรวจอย่างน้อย ${TRACE_PASS} จาก 3 ข้อ`,
    },
  },
  {
    id: "close",
    shortLabel: "5",
    title: "สรุปและก้าวต่อไป",
    laikaSays:
      "เกือบครบแล้ว! ตอนนี้บอกได้แล้วว่า OBC EPS COMM และ Payload ทำอะไร และทำไมทุกอย่างต้องคุยผ่านตัวกลาง ก่อนไปโมดูลถัดไปลองคิดต่อหน่อย ทำไมดาวเทียมต้องกลัวความร้อน กลัวรังสี และต้องคอยหันตัวตามสนามแม่เหล็กโลกด้วย?",
    body: "คำถามค้างนั้นจะพาเข้าสู่โมดูล Physics in Space ที่จะสำรวจสิ่งแวดล้อมอวกาศที่กระทบทุกระบบที่เพิ่งรู้จัก\n\nเมื่อพร้อมกดเสร็จโมดูลนี้เพื่อบันทึกความคืบหน้า",
    tryThis: "กดเสร็จโมดูลนี้เพื่อบันทึกว่าเรียน Anatomy ครบแล้ว",
    checkpoint: {
      kind: "finish",
      hint: "กดเสร็จโมดูลนี้เพื่อบันทึกความคืบหน้า",
    },
  },
];

export type CheckpointState = {
  introOpened: number;
  introAck: boolean;
  openedParts: Set<AnatomyPartId>;
  playedScenarios: Set<ScenarioId>;
  tracePassed: number;
};

export const EMPTY_CHECKPOINT: CheckpointState = {
  introOpened: 0,
  introAck: false,
  openedParts: new Set(),
  playedScenarios: new Set(),
  tracePassed: 0,
};

export function isCheckpointMet(
  stepId: AnatomyStep,
  cp: CheckpointState,
  moduleDone: boolean,
): boolean {
  if (moduleDone) return true;
  switch (stepId) {
    case "intro":
      return cp.introAck && cp.introOpened >= 1;
    case "meet":
      return (
        cp.openedParts.has("obc") &&
        cp.openedParts.has("eps") &&
        cp.openedParts.has("comm") &&
        cp.openedParts.has("payload")
      );
    case "flow":
      return cp.playedScenarios.size >= 3;
    case "trace":
      return cp.tracePassed >= TRACE_PASS;
    case "close":
      return false;
    default:
      return false;
  }
}

export function journeyStepAt(index: number): AnatomyJourneyStep {
  return ANATOMY_STEPS[Math.max(0, Math.min(ANATOMY_STEPS.length - 1, index))]!;
}

export type FlowKind = "power" | "data" | "rf";

export interface DataFlowEdge {
  id: string;
  from: BoardPartId;
  to: BoardPartId;
  label: string;
  labelTh: string;
  kind: FlowKind;
  why: string;
  carries: string;
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
    why: "วิทยุใช้ไฟมากตอนส่ง EPS ต้องจ่ายได้พอ",
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

export const INTRO_ANALOGY_CARDS: {
  id: AnatomyPartId;
  title: string;
  body: string;
  accent: string;
}[] = [
  {
    id: "payload",
    title: "Payload = ประสาทสัมผัส",
    body: "ตา หู และมือที่ลงมือทำงาน คือส่วนที่ทำภารกิจจริงของดาวเทียม",
    accent: "#c084fc",
  },
  {
    id: "eps",
    title: "EPS = หัวใจ / พลังงาน",
    body: "เหมือนหัวใจที่สูบฉีดพลังงานไปเลี้ยงทุกส่วน",
    accent: "#fbbf24",
  },
  {
    id: "comm",
    title: "COMM = ปาก + หู",
    body: "คุยกับโลกภายนอกผ่าน [[uplink|uplink]] และ [[downlink|downlink]]",
    accent: "#34d399",
  },
  {
    id: "obc",
    title: "OBC = สมอง",
    body: "ตัดสินใจว่าเมื่อไหร่ต้องทำอะไร จากข้อมูลที่ส่วนอื่นส่งมา",
    accent: "#7dd3fc",
  },
];

/** Short recap block on the Anatomy intro step (from Module 1). */
export const CUBESAT_RECAP = {
  heading: "ทบทวน CubeSat คืออะไร",
  points: [
    "CubeSat คือดาวเทียมขนาดเล็กที่ใช้มาตรฐานหน่วย U เหมือนเลโก้ต่อขยายได้",
    "1U ประมาณ 10×10×10 เซนติเมตร ขยายเป็น 3U 6U หรือใหญ่กว่าได้ โดยหน้าตัดยังประมาณ 10×10 เซนติเมตร",
    "ทีมเล็กและมหาวิทยาลัยเริ่มได้เพราะมีมาตรฐานเดียวกัน และมักปล่อยแบบผู้โดยสารร่วมกับจรวดภารกิจใหญ่",
  ],
};

export function stepToViewMode(
  step: AnatomyStep,
  flatsatPreferred = false,
): "assembled" | "flatsat" {
  if (step === "flow" || step === "trace") return "flatsat";
  if (step === "meet" && flatsatPreferred) return "flatsat";
  return "assembled";
}

export function defaultPartForStep(step: AnatomyStep): AnatomyPartId {
  if (step === "intro" || step === "close") return "overview";
  if (step === "flow" || step === "trace") return "obc";
  return "obc";
}

export function showDataFlowLinks(step: AnatomyStep): boolean {
  return step === "flow" || step === "trace";
}
