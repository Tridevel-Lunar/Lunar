export interface SpaceTopic {
  id: string;
  title: string;
  titleTh: string;
  description: string;
  accent: string;
  icon: "overview" | "anatomy" | "physics" | "programming";
}

export const CURRENT_COURSE = {
  tag: "CUBESAT FOR BEGINNER",
  title: "CUBESAT FOR BEGINNER",
  subtitle: "พื้นฐานดาวเทียม",
  description: "เรียนรู้ส่วนประกอบและการทำงานของดาวเทียม CubeSat",
  totalLessons: 12,
  completedLessons: 7,
  progress: 68,
};

export const SPACE_TOPICS: SpaceTopic[] = [
  {
    id: "overview",
    title: "OVERVIEW OF SATELLITE",
    titleTh: "ภาพรวมดาวเทียม",
    description: "เรียนรู้แนวคิดพื้นฐานของดาวเทียมและบทบาทในชีวิตประจำวัน",
    accent: "#00e5ff",
    icon: "overview",
  },
  {
    id: "anatomy",
    title: "ANATOMY OF CUBESAT",
    titleTh: "โครงสร้าง CubeSat",
    description:
      "ศึกษาส่วนประกอบต่าง ๆ ของ CubeSat และการทำงานร่วมกันของแต่ละระบบ",
    accent: "#7dd3fc",
    icon: "anatomy",
  },
  {
    id: "physics",
    title: "PHYSICS FOR SPACE",
    titleTh: "ฟิสิกส์ในอวกาศ",
    description: "เรียนพื้นฐานฟิสิกส์ที่เกี่ยวข้องกับการทำงานของดาวเทียมในวงโคจร",
    accent: "#a78bfa",
    icon: "physics",
  },
  {
    id: "programming",
    title: "PROGRAMMING FOR CUBESAT",
    titleTh: "การเขียนโปรแกรม",
    description:
      "เรียนการเขียนโปรแกรมแบบบล็อก เพื่อสั่งให้ดาวเทียมทำงาน",
    accent: "#ffab00",
    icon: "programming",
  },
];
