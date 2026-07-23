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
  id: "leo-orbit-one-lap",
  code: "MISSION 01",
  title: "ONE LAP AROUND EARTH",
  subtitle: "ให้ CubeSat รอดครบ 1 รอบรอบโลก โดยจัดการพลังงานตอนมีแดดและตอนเข้าเงา",
  level: "BEGINNER",
  details:
    "ดาวเทียมจะโคจรครบ 1 รอบ เริ่มตอนโดนแดดเต็มที่ แล้วเข้าเงาโลก (eclipse) ช่วงกลางวง จากนั้นกลับมาเจอแดดอีกครั้ง คุณตั้งค่าพลังงานในแท็บตั้งค่าระบบ แล้วเขียนโปรแกรมบล็อกให้สั่งงานซ้ำทุกวินาที เช่น เปิดฮีตเตอร์ตอนมืด และปิดอุปกรณ์ที่กินไฟเมื่อเข้าเงา",
  hint: "ตอนมีแดดปิดฮีตเตอร์ได้ — ตอนเข้าเงาควรเปิดฮีตเตอร์ และปิด payload เพื่อประหยัดแบต",
  objectiveLead: "เป้าหมายคือให้ดาวเทียม",
  objectiveHighlight: "รอดครบ 1 รอบ และส่งข้อมูลกลับโลกได้",
  objectiveCheckWhen:
    "ระบบจะตัดสินผลเมื่อจบวงโคจร จากแบตและอุณหภูมิช่วงท้าย รวมถึงแบตตอนอยู่ในเงา",
  objectiveMetrics: [
    "แบตเตอรี่ตอนจบวง",
    "อุณหภูมิตอนจบวง",
    "แบตต่ำสุดตอนอยู่ในเงา",
  ],
  objectiveOutcomes: [
    {
      grade: "สมบูรณ์ (Perfect)",
      summary: "รอดครบวง สภาพดี ส่งข้อมูลได้เต็มที่",
      conditions: [
        "แบตเหลือพอ (≥ 40%)",
        "อุณหภูมิอยู่ในช่วงที่ตั้งไว้แบบปลอดภัย",
      ],
    },
    {
      grade: "เสี่ยง (Risky)",
      summary: "รอดครบวง แต่แบตหรืออุณหภูมิใกล้ขอบเขต",
      conditions: [
        "ยังไม่ Fail แต่ยังไม่ถึง Perfect",
      ],
    },
    {
      grade: "ไม่ผ่าน (Fail)",
      summary: "แบตหรืออุณหภูมิหลุดช่วงที่ยอมรับได้",
      conditions: [
        "แบตต่ำเกินไป หรืออุณหภูมินอกช่วง",
        "หรือไม่มีคำสั่งควบคุมที่ทำงานจริง",
      ],
    },
  ],
  objectiveBonus:
    "ถ้าได้ Perfect และ payload ยังเปิดอยู่ตอนจบวง จะได้ข้อมูล payload เพิ่ม",
  youWillDoIntro: "ในภารกิจนี้ คุณจะ",
  youWillDo: [
    "ตั้งค่าแบต อุณหภูมิ และกำลังฮีตเตอร์ (แท็บตั้งค่าระบบ)",
    "เขียนบล็อกให้ตอบสนองแดด / เงา",
    "กดส่งภารกิจ แล้วดูผลจากไทม์ไลน์วงโคจร",
  ],
  ctaPrompt: "พร้อมลองรอดครบ 1 รอบหรือยัง?",
  ctaHint: "ตั้งค่าสั้น ๆ แล้วเริ่มเขียนบล็อกได้เลย",
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

export const ARENA_MISSIONS: ArenaMission[] = [FEATURED_MISSION_1, FEATURED_MISSION_2];
