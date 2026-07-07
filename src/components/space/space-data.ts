export interface SpaceTopic {
  id: string;
  title: string;
  titleTh: string;
  description: string;
  accent: string;
  icon: "model" | "embedded" | "physics" | "programming";
}

export const CURRENT_COURSE = {
  tag: "บทเรียนหัวข้อ",
  title: "CUBESAT 101",
  subtitle: "พื้นฐานดาวเทียม",
  description: "เรียนรู้ส่วนประกอบและการทำงานของดาวเทียม CubeSat",
  totalLessons: 12,
  completedLessons: 7,
  progress: 68,
};

export const SPACE_TOPICS: SpaceTopic[] = [
  {
    id: "model",
    title: "3D MODEL",
    titleTh: "โมเดลสามมิติ",
    description: "เรียนรู้ชิ้นส่วนดาวเทียมเบื้องต้น",
    accent: "#00e5ff",
    icon: "model",
  },
  {
    id: "embedded",
    title: "EMBEDDED SYSTEM",
    titleTh: "ระบบฝังตัว",
    description:
      "เรียนระบบฝังตัวและบอร์ด Payload เบื้องต้น เข้าใจเซนเซอร์ต่าง ๆ โดยรวม",
    accent: "#39ff87",
    icon: "embedded",
  },
  {
    id: "physics",
    title: "PHYSICS",
    titleTh: "ฟิสิกส์",
    description: "เรียนพื้นฐานฟิสิกส์ที่เกี่ยวข้อง",
    accent: "#a78bfa",
    icon: "physics",
  },
  {
    id: "programming",
    title: "PROGRAMMING",
    titleTh: "การเขียนโปรแกรม",
    description:
      "เรียนการเขียนโปรแกรมแบบบล็อก เพื่อสั่งให้ดาวเทียมทำงาน",
    accent: "#ffab00",
    icon: "programming",
  },
];
