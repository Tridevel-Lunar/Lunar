export interface ArenaMission {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  level: string;
  details: string;
  hint: string;
  objectiveLead: string;
  objectiveHighlight: string;
  youWillDoIntro: string;
  youWillDo: string[];
  ctaPrompt: string;
  ctaHint: string;
  ctaLabel: string;
}

export const ARENA_PAGE = {
  title: "สนามประลองความสามารถด้วยการปฏิบัติ",
  subtitle: "ลงมือออกแบบ ควบคุม และพัฒนาระบบดาวเทียมให้ดำเนินการตามเป้าหมายได้าำเร็จด้วยด้วยความรู้ที่ได้จาก SPACE ",
};

export const FEATURED_MISSION_1: ArenaMission = {
  id: "leo-orbital-launch",
  code: "MISSION 01",
  title: "FIRST ORBIT SURVIVAL",
  subtitle: "ควบคุมพลังงานและความร้อนของดาวเทียม ให้อยู่รอดตลอด 10 รอบปฏิบัติการแรกในวงโคจร",
  level: "BEGINNER",
  details:
    "ตั้งค่าเริ่มต้นของระบบก่อนปล่อยดาวเทียม จากนั้นเขียนโปรแกรมควบคุมให้ดาวเทียมบริหารแบตเตอรี่และอุณหภูมิได้ตลอด 10 รอบปฏิบัติการ ระวังสัญญาณรบกวนจากรังสีคอสมิกที่จะเกิดขึ้นกะทันหันในรอบที่ 8 แล้วทำให้ผลลัพธ์ออกมาดีที่สุดในรอบสุดท้าย",
  hint: "ตั้งค่า threshold ให้เผื่อสถานการณ์ฉุกเฉินไว้บ้าง แล้วใช้เงื่อนไข if/when คอยตอบสนองทันทีที่มีเหตุการณ์เกิดขึ้น",
  objectiveLead: "นำดาวเทียมของคุณผ่านภารกิจให้ได้ผลลัพธ์ สมบูรณ์แบบ พร้อมส่งข้อมูลกลับสู่โลกได้สำเร็จ",
  objectiveHighlight: '',
  youWillDoIntro:
    "ในภารกิจนี้ คุณจะได้ลงมือเขียนโปรแกรมด้วยบล็อกคำสั่ง (visual block coding) เพื่อควบคุมระบบพลังงาน ความร้อน และสมองกลของดาวเทียมไปพร้อมกัน โดยคุณจะได้",
  youWillDo: [
    "ตั้งค่าระดับแบตเตอรี่ อุณหภูมิ และกำลังไฟของฮีตเตอร์ก่อนเริ่มภารกิจ",
    "ควบคุมฮีตเตอร์และอุปกรณ์ต่างๆ ไม่ให้แบตเตอรี่หมดหรืออุณหภูมิหลุดช่วงที่ปลอดภัย",
    "เขียนเงื่อนไขรับมือกับสัญญาณรบกวนจากรังสีที่จะเกิดขึ้นกลางภารกิจ",
    "วางแผนล่วงหน้าให้ดาวเทียมจบภารกิจด้วยผลลัพธ์ที่ดีที่สุดเท่าที่จะทำได้",
  ],
  ctaPrompt: "พร้อมออกเดินทางสู่วงโคจรหรือยัง?",
  ctaHint: "ตรวจสอบแผนของคุณอีกครั้ง แล้วเริ่มภารกิจแรกได้เลย!",
  ctaLabel: "เริ่มภารกิจ",
};

export const FEATURED_MISSION_2: ArenaMission = {
  id: "coming-soon",
  code: "MISSION 02",
  title: "COMING SOON",
  subtitle: "ภารกิจนี้ยังไม่พร้อมสำหรับการปฏิบัติ",
  level: "BEGINNER",
  details: "ภารกิจนี้ยังไม่พร้อมสำหรับการปฏิบัติ",
  hint: "ภารกิจนี้ยังไม่พร้อมสำหรับการปฏิบัติ",
  objectiveLead: "ภารกิจนี้ยังไม่พร้อมสำหรับการปฏิบัติ",
  objectiveHighlight: "ภารกิจนี้ยังไม่พร้อมสำหรับการปฏิบัติ",
  youWillDoIntro: "ภารกิจนี้ยังไม่พร้อมสำหรับการปฏิบัติ",
  youWillDo: [],
  ctaPrompt: "ภารกิจนี้ยังไม่พร้อมสำหรับการปฏิบัติ",
  ctaHint: "ภารกิจนี้ยังไม่พร้อมสำหรับการปฏิบัติ",
  ctaLabel: "ภารกิจนี้ยังไม่พร้อมสำหรับการปฏิบัติ",
};

/** Ordered list shown in Arena — one mission per view, navigate with arrows. */
export const ARENA_MISSIONS: ArenaMission[] = [
  FEATURED_MISSION_1,
  FEATURED_MISSION_2,
];
