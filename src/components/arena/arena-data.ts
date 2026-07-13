export interface ArenaMission {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  level: string;
  details: string;
  objectiveLead: string;
  objectiveHighlight: string;
  youWillDoIntro: string;
  youWillDo: string[];
  ctaPrompt: string;
  ctaHint: string;
  ctaLabel: string;
}

export const ARENA_PAGE = {
  title: "การลงมือปฏิบัติ",
  subtitle: "พัฒนาเทคโนโลยีอวกาศของคุณ",
  tab: "MISSIONS",
  credits: 1200,
};

export const FEATURED_MISSION: ArenaMission = {
  id: "leo-orbital-launch",
  code: "MISSION 01",
  title: "LEO ORBITAL LAUNCH",
  subtitle: "ภารกิจปล่อยดาวเทียมเข้าสู่วงโคจรต่ำรอบโลก",
  level: "BEGINNER",
  details:
    "เรียนรู้ Cubesat 101 ครบแล้ว คุณจะเข้าใจพื้นฐานของดาวเทียม ระบบการทำงาน และหลักการสำคัญที่ทำให้ดาวเทียมทำงานได้จริง",
  objectiveLead: "ออกแบบลำดับคำสั่งให้",
  objectiveHighlight: "ดาวเทียมสามารถเข้าสู่วงโคจรโลกได้สำเร็จ",
  youWillDoIntro:
    "ต่อ Code Block เพื่อควบคุมระบบต่าง ๆ ของดาวเทียมให้ทำงานร่วมกันได้จริง เช่น:",
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
