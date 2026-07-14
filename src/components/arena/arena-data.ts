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
  title: "LEO ORBITAL LAUNCH",
  subtitle: "ภารกิจปล่อยดาวเทียมเข้าสู่วงโคจรต่ำรอบโลก",
  level: "BEGINNER",
  details:
    "ตอนนี้ดาวเทียม x กำลังเตรียมพร้อมเข้าสู่การปล่อยตัวสู่วงโคจรต่ำของโลก คุณได้รับหน้าที่ออกแบบระบบต่าง ๆ ของดาวเทียมให้สามารถโคจรบนระดับวงโคจรต่ำได้สำเร็จผ่านแบบจำลอง",
  hint: "ต่อยอดความรู้จากบทเรียน Cubesat 101",
  objectiveLead: "ออกแบบลำดับคำสั่งให้",
  objectiveHighlight: "ดาวเทียมสามารถเข้าสู่วงโคจรโลกได้สำเร็จ",
  youWillDoIntro:
    "เขียนโปรแกรมในรูปแบบ visual codeing เพื่อควบคุมระบบต่าง ๆ ของดาวเทียมให้ทำงานร่วมกันได้จริง ได้แก่",
  youWillDo: [
    "ควบคุมระบบพลังงานและ Payload",
    "ตั้งค่าและตรวจเช็คความเสถียรวงโคจร",
    "สั่งการทำงานของเซนเซอร์ตามเงื่อนไข",
    "ทำงานเพื่อพาตัวดาวเทียมขึ้นสู่วงโคจร",
  ],
  ctaPrompt: "พร้อมแล้วหรือยัง?",
  ctaHint: "เตรียมตัวให้พร้อม แล้วเริ่มภารกิจของคุณเลย!",
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
