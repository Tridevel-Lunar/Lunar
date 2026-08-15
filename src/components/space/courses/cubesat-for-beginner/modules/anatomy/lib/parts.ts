export type AnatomyPartId =
  | "overview"
  | "structure"
  | "obc"
  | "eps"
  | "comm"
  | "payload";

export type AnatomyViewMode = "assembled" | "flatsat";

/** Core subsystems required for the meet-step checkpoint. */
export const REQUIRED_MEET_PARTS: Exclude<
  AnatomyPartId,
  "overview" | "structure"
>[] = ["obc", "eps", "comm", "payload"];

export interface AnatomyPart {
  id: AnatomyPartId;
  label: string;
  labelEn: string;
  accent: string;
  summary: string;
  details: string[];
  flatsatRole: string;
  /** Short LAIKA tip when this part is selected (Module 2 analogy). */
  laikaTip?: string;
}

export const ANATOMY_PARTS: AnatomyPart[] = [
  {
    id: "overview",
    label: "ภาพรวม 1U",
    labelEn: "Overview",
    accent: "#00e5ff",
    summary:
      "CubeSat 1U มีขนาดประมาณ 10×10×11 ซม. กล่องเล็กแต่ว่าข้างในไม่มีอะไรทำงานคนเดียวเลยสักส่วน",
    details: [
      "มาตรฐาน U ทำให้ปล่อยด้วย deployer เดียวกันได้",
      "เริ่มจากมองทั้งดวงก่อน แล้วค่อยเปิดดูทีละระบบ",
      "โมเดลภาพรวมจาก NASA 3D Resources",
    ],
    flatsatRole: "มองทั้งกล่องก่อนแยกแผ่น",
  },
  {
    id: "structure",
    label: "โครงสร้าง",
    labelEn: "Structure",
    accent: "#94a3b8",
    summary:
      "โครงอลูมิเนียมและแผ่นผนัง รับแรงปล่อย ยึดบอร์ด และกำหนดปริมาตรภายใน ในโมดูลนี้แตะเบาๆ พอ",
    details: [
      "ราง (rails) สัมผัส deployer ตามมาตรฐาน CubeSat",
      "แผ่นด้านข้างยึดแผงโซลาร์กับเสาอากาศ",
      "ระบบอย่าง ADCS หรือ Thermal จะไปเจาะในโมดูล Physics",
    ],
    flatsatRole: "กรอบนอกของ FlatSat board",
  },
  {
    id: "obc",
    label: "คอมพิวเตอร์",
    labelEn: "OBC",
    accent: "#7dd3fc",
    summary: "สมองกลาง — รับข้อมูล ตัดสินใจ แล้วสั่งงานระบบอื่น",
    details: [
      "ระบบอื่นมักไม่คุยตรงกันเอง ผ่าน OBC เป็นตัวกลาง",
      "รับ [[telemetry|เทเลเมทรี]] แล้วสั่ง EPS COMM หรือ Payload",
      "ของจริงมักเป็นบอร์ดคอมพิวเตอร์ขนาดเล็ก",
    ],
    flatsatRole: "บอร์ดกลางของ FlatSat",
    laikaTip:
      "คิดว่า OBC เหมือนพนักงานรับสายกลางของบริษัท ทุกแผนกส่งเรื่องมาที่นี่ก่อน แล้วค่อยตัดสินใจส่งต่อ",
  },
  {
    id: "eps",
    label: "พลังงาน",
    labelEn: "EPS",
    accent: "#fbbf24",
    summary: "ผลิต เก็บ และจ่ายไฟ จากแผงโซลาร์กับแบตเตอรี่",
    details: [
      "ไม่มีปลั๊กในอวกาศ พึ่งแสงอาทิตย์อย่างเดียว",
      "ต้องเหลือไฟใช้ตอนอยู่ในเงาโลกด้วย",
      "เหมือนพาวเวอร์แบงค์ที่ชาร์จเองแล้วแบ่งไฟหลายชิ้น",
    ],
    flatsatRole: "โซนพลังงานบนแผ่นแบน",
    laikaTip:
      "EPS คือหัวใจที่สูบฉีดพลังงาน ถ้าไฟไม่พอระบบอื่นทำงานไม่ได้เลย",
  },
  {
    id: "comm",
    label: "สื่อสาร",
    labelEn: "COMM",
    accent: "#34d399",
    summary:
      "คุยกับพื้นโลก — [[uplink|อัปลิงก์]] รับคำสั่ง [[downlink|ดาวน์ลิงก์]] ส่งข้อมูล",
    details: [
      "คุยได้แค่ตอนผ่าน [[ground-station|สถานีภาคพื้นดิน]]",
      "ใน [[leo|LEO]] หน้าต่างคุยอาจสั้นแค่ไม่กี่นาทีต่อรอบ",
      "เหมือนวิทยุที่ใช้ได้เฉพาะตอนอยู่ในระยะสัญญาณ",
    ],
    flatsatRole: "โมดูลวิทยุกับสายเสา",
    laikaTip:
      "COMM คือปากกับหูของดาวเทียม แต่พูดได้เฉพาะตอนผ่านสถานีภาคพื้นดิน",
  },
  {
    id: "payload",
    label: "เพย์โหลด",
    labelEn: "Payload",
    accent: "#c084fc",
    summary: "ส่วนทำภารกิจ เช่น กล้อง เซนเซอร์ หรืออุปกรณ์ทดลอง",
    details: [
      "ทำให้แต่ละดาวเทียมเกิดมาทำอะไรต่างกัน",
      "OBC EPS COMM มักคล้ายกัน — Payload เปลี่ยนตามงาน",
      "ต้องคุยผ่าน OBC ไม่ส่งตรงไป COMM",
    ],
    flatsatRole: "โซนภารกิจบน FlatSat",
    laikaTip:
      "ถ้า OBC EPS และ COMM คือแชสซีรถมาตรฐาน Payload ก็คืออุปกรณ์พิเศษตามงาน เช่น กล้อง เซนเซอร์ หรือเครื่องทดลอง",
  },
];

export function getPart(id: AnatomyPartId): AnatomyPart {
  return ANATOMY_PARTS.find((p) => p.id === id) ?? ANATOMY_PARTS[0]!;
}
