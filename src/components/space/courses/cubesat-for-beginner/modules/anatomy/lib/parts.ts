export type AnatomyPartId =
  | "overview"
  | "structure"
  | "obc"
  | "eps"
  | "comm"
  | "payload";

export type AnatomyViewMode = "assembled" | "flatsat";

export interface AnatomyPart {
  id: AnatomyPartId;
  label: string;
  labelEn: string;
  accent: string;
  summary: string;
  details: string[];
  flatsatRole: string;
}

export const ANATOMY_PARTS: AnatomyPart[] = [
  {
    id: "overview",
    label: "ภาพรวม 1U",
    labelEn: "Overview",
    accent: "#00e5ff",
    summary:
      "CubeSat 1U มีขนาดประมาณ 10×10×11 ซม. — โครงเล็กแต่ประกอบด้วยระบบครบเหมือนดาวเทียมขนาดใหญ่",
    details: [
      "มาตรฐาน U ทำให้ปล่อยด้วย deployer เดียวกันได้",
      "เริ่มจากมองทั้งดวงก่อน แล้วค่อยกางดูทีละระบบ",
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
      "โครงอลูมิเนียมและแผ่นผนัง — รับแรงปล่อย ยึดบอร์ด และกำหนดปริมาตรภายใน",
    details: [
      "ราง (rails) สัมผัส deployer ตามมาตรฐาน CubeSat",
      "แผ่นด้านข้างยึดแผงโซลาร์ / เสาอากาศ",
      "ฐานและฝาปิดกำหนดช่องวางบอร์ดแบบ stack",
    ],
    flatsatRole: "กรอบนอกของ FlatSat board",
  },
  {
    id: "obc",
    label: "คอมพิวเตอร์",
    labelEn: "OBC",
    accent: "#7dd3fc",
    summary:
      "On-Board Computer — สมองของดาวเทียม สั่งงาน เก็บข้อมูล และรัน flight software",
    details: [
      "รับ telemetry จากเซ็นเซอร์",
      "สั่ง EPS / Comm / Payload ตามตารางเวลา",
      "มักอยู่กลาง stack เพื่อสายสั้นและเย็นลงง่าย",
    ],
    flatsatRole: "บอร์ดกลางของ FlatSat",
  },
  {
    id: "eps",
    label: "พลังงาน",
    labelEn: "EPS",
    accent: "#fbbf24",
    summary:
      "Electrical Power System — โซลาร์เซลล์ แบตเตอรี่ และวงจรแปลงไฟ",
    details: [
      "เก็บพลังงานจากแผงโซลาร์",
      "แจกจ่ายแรงดันให้บอร์ดอื่นอย่างปลอดภัย",
      "ต้องกัน over-discharge และ short circuit",
    ],
    flatsatRole: "โซนพลังงานบนแผ่นแบน",
  },
  {
    id: "comm",
    label: "สื่อสาร",
    labelEn: "Comm",
    accent: "#34d399",
    summary:
      "Communications — วิทยุและเสาอากาศ ติดต่อสถานีพื้นโลก",
    details: [
      "อัปลิงก์คำสั่ง / ดาวน์ลิงก์ telemetry",
      "แบนด์ที่ใช้บ่อย เช่น UHF / VHF / S-band",
      "ต้องวางเสาไม่บังโซลาร์และไม่ชน deployer",
    ],
    flatsatRole: "โมดูลวิทยุ + สายเสา",
  },
  {
    id: "payload",
    label: "เพย์โหลด",
    labelEn: "Payload",
    accent: "#c084fc",
    summary:
      "ของที่ทำภารกิจจริง — กล้อง เซ็นเซอร์ทดลอง หรือวงจรสาธิตเทคโนโลยี",
    details: [
      "กำหนดโดยภารกิจ ไม่ใช่มาตรฐานเดียวทุกดวง",
      "กินพลังงานและแบนด์วิดท์จากระบบอื่น",
      "มักอยู่มุมที่มองออกนอกกล่องได้",
    ],
    flatsatRole: "โซนภารกิจบน FlatSat",
  },
];

export function getPart(id: AnatomyPartId): AnatomyPart {
  return ANATOMY_PARTS.find((p) => p.id === id) ?? ANATOMY_PARTS[0];
}
