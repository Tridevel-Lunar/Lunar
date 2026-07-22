export interface MissionGradeOutcome {
  grade: string;
  summary: string;
  conditions: string[];
}

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
  /** When and what the simulator grades at the end of the mission window. */
  objectiveCheckWhen: string;
  /** Metrics checked against the player's Setup thresholds. */
  objectiveMetrics: string[];
  /** Perfect / Risky / Fail tiers shown to the player before they run. */
  objectiveOutcomes: MissionGradeOutcome[];
  /** Optional bonus tied to payload or other side goals. */
  objectiveBonus?: string;
  youWillDoIntro: string;
  youWillDo: string[];
  ctaPrompt: string;
  ctaHint: string;
  ctaLabel: string;
}

export const ARENA_PAGE = {
  title: "สนามประลองความสามารถด้วยการปฏิบัติ",
  subtitle:
    "ลงมือออกแบบ ควบคุม และพัฒนาระบบดาวเทียมให้ดำเนินการตามเป้าหมายได้สำเร็จ ด้วยความรู้ที่ได้จาก SPACE",
};

export const FEATURED_MISSION_1: ArenaMission = {
  id: "leo-orbital-launch",
  code: "MISSION 01",
  title: "FIRST ORBIT SURVIVAL",
  subtitle:
    "เขียนโปรแกรมควบคุมชุดเดียว ให้ดาวเทียมอยู่รอดและส่งข้อมูลได้ตลอด 10 รอบปฏิบัติการแรกในวงโคจร",
  level: "BEGINNER",
  details:
    "ภารกิจนี้แบ่งเวลาเป็น 10 รอบปฏิบัติการ แต่ละรอบดาวเทียมจะอ่านค่าเซนเซอร์ ตัดสินใจจากโปรแกรมที่คุณเขียน แล้วสั่งงานอุปกรณ์ จากนั้นสถานะแบตเตอรี่และอุณหภูมิจะเปลี่ยนก่อนเข้าสู่รอบถัดไป — คุณตั้งค่าเริ่มต้นครั้งเดียวก่อนปล่อย จากนั้นเขียนโปรแกรมควบคุมที่ถูกใช้ซ้ำทุกรอบ ไม่ต้องเขียนแยกทีละรอบ ระวังรังสีคอสมิกในรอบที่ 8 ที่จะลดแบตกะทันหัน แล้วทำให้ผลลัพธ์ดีที่สุดในรอบที่ 10 ซึ่งเป็นช่วงส่งข้อมูลกลับโลก",
  hint: "คิดแบบคู่มือประจำรอบ: ตั้ง threshold ให้เผื่อฉุกเฉินไว้ แล้วใช้ if/when ให้ตอบสนองสถานการณ์ที่เปลี่ยนไปทุกรอบ โดยเฉพาะรอบกลางคืนและรอบที่ 8",
  objectiveLead:
    "นำดาวเทียมผ่าน 10 รอบปฏิบัติการให้จบด้วยผลลัพธ์",
  objectiveHighlight: "สมบูรณ์แบบ พร้อมส่งข้อมูลกลับโลกได้สำเร็จ",
  objectiveCheckWhen:
    "ระบบจะตัดสินผลเมื่อจบรอบที่ 10 — ช่วงส่งข้อมูลกลับโลก โดยดูค่าแบตเตอรี่และอุณหภูมิ ณ รอบสุดท้าย เทียบกับ threshold ที่คุณตั้งไว้ใน Setup (ไม่ได้ดูค่าเฉลี่ยตลอดภารกิจ)",
  objectiveMetrics: [
    "แบตเตอรี่ ณ รอบที่ 10 — เปรียบเทียบกับช่วงปลอดภัยและขั้นต่ำ",
    "อุณหภูมิ ณ รอบที่ 10 — เปรียบเทียบกับช่วง min/max ที่คุณตั้งไว้",
    "Comms — ส่งข้อมูลกลับโลกสำเร็จแค่ไหน (ระบบคำนวณจากเกรดโดยอัตโนมัติ)",
  ],
  objectiveOutcomes: [
    {
      grade: "สมบูรณ์ (Perfect)",
      summary: "เป้าหมายหลัก — ดาวเทียมอยู่รอดและส่งข้อมูลได้เต็มที่",
      conditions: [
        "แบตเตอรี่ 40–100% ณ รอบที่ 10",
        "อุณหภูมิอยู่กลางช่วงที่ตั้ง (ห่างจากค่าต่ำสุด/สูงสุดอย่างน้อย 5°C)",
        "Comms: ส่งข้อมูลสำเร็จครบ",
      ],
    },
    {
      grade: "เสี่ยง (Risky)",
      summary: "ผ่านขั้นต่ำ แต่ใกล้ขอบเขต — ยังส่งข้อมูลได้บางส่วน",
      conditions: [
        "แบตเตอรี่ 15–39% ณ รอบที่ 10 (ยังไม่หมด แต่ต่ำ)",
        "อุณหภูมิยังอยู่ในช่วง min–max ที่ตั้งไว้ แต่ไม่ถึงเกณฑ์ Perfect",
        "Comms: ส่งข้อมูลได้บางส่วน",
      ],
    },
    {
      grade: "ไม่ผ่าน (Fail)",
      summary: "ดาวเทียมไม่รอดหรือส่งข้อมูลไม่สำเร็จในรอบนี้",
      conditions: [
        "แบตเตอรี่ต่ำกว่า 15% ณ รอบที่ 10",
        "หรือ อุณหภูมิต่ำกว่า min หรือสูงกว่า max ที่ตั้งไว้",
        "Comms: พลาดช่วงส่งข้อมูล",
      ],
    },
  ],
  objectiveBonus:
    "โบนัส Payload: ถ้าได้เกรด Perfect และเปิด payload อยู่จริงในรอบที่ 10 จะได้ข้อมูล payload เพิ่ม (Comms สำเร็จเต็ม + โบนัส)",
  youWillDoIntro:
    "ในภารกิจนี้ คุณจะเขียนโปรแกรมด้วยบล็อกคำสั่ง เพื่อควบคุมพลังงาน ความร้อน และสมองกลของดาวเทียม โดยโปรแกรมชุดเดียวจะทำงานซ้ำทุกครั้งที่เวลาก้าวไปหนึ่งรอบปฏิบัติการ คุณจะได้",
  youWillDo: [
    "ตั้งค่า threshold ของแบตเตอรี่ อุณหภูมิ และกำลังฮีตเตอร์ก่อนเริ่ม (ครั้งเดียวก่อนปล่อย)",
    "เขียนเงื่อนไขควบคุมฮีตเตอร์และอุปกรณ์ ให้แบตและอุณหภูมิปลอดภัยเมื่อสถานการณ์เปลี่ยนทุกรอบ เช่น กลางวัน/กลางคืน",
    "เตรียมการรับมือรังสีคอสมิกในรอบที่ 8 ด้วยเงื่อนไข if/when หรือ safe mode",
    "วางแผนล่วงหน้าให้รอบที่ 10 ซึ่งเป็นช่วงส่งข้อมูล จบด้วยผลลัพธ์ที่ดีที่สุด",
  ],
  ctaPrompt: "พร้อมออกเดินทางสู่วงโคจรหรือยัง?",
  ctaHint: "ทบทวนแผนประจำรอบอีกครั้ง แล้วเริ่มภารกิจแรกได้เลย",
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
  objectiveCheckWhen: "ภารกิจนี้ยังไม่พร้อมสำหรับการปฏิบัติ",
  objectiveMetrics: [],
  objectiveOutcomes: [],
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
