import type { LaikaSource } from "@/lib/api";

/** Shared types and constants for Studio (notes, ideas, LAIKA intents, conversation tree). */

export type EntryType = "note" | "idea" | "learn";

export type NoteIntent = "summarize" | "explain" | "next-step";
export type IdeaIntent = "analyze" | "innovation-path" | "more-ideas" | "career-path";
export type LearnIntent = "ask-anything";

export type LaikaIntent = NoteIntent | IdeaIntent | LearnIntent;

export type ChatNode = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  parentId?: string;
  laikaIntent?: LaikaIntent;
  laikaSources?: LaikaSource[];
};

export type ConversationTree = {
  nodes: Record<string, ChatNode>;
  rootIds: string[];
  selectedChildByParent: Record<string, string>;
};

export type CollectionEntry = {
  id: string;
  type: EntryType;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tree: ConversationTree;
  streamingNodeId?: string;
  laikaStreaming?: boolean;
  laikaIntent?: LaikaIntent;
  laikaSources?: LaikaSource[];
  /** Set on list summaries from API; omitted on full entry loads */
  hasLaika?: boolean;
};

/** Studio landing hero: shown when the user has no collections yet. */
export const STUDIO_HERO_GREETING_FIRST_TIME =
  "สวัสดี ยินดีต้อนรับสู่ Studio ที่นี่คือพื้นที่สำหรับบันทึกโน้ตและไอเดียของคุณหลังเรียน ลองสร้าง collection แรกด้านล่างได้เลย เมื่อเปิดแชท LAIKA จะช่วยสรุป อธิบาย และชี้ทางต่อยอดให้";

/** Rotated on landing when the user returns after several days away. */
export const STUDIO_HERO_GREETINGS_AWAY = [
  "หายไปหลายวันแล้ว ยินดีต้อนรับกลับ Studio โน้ตและไอเดียของคุณยังรออยู่ที่เดิม",
  "กลับมาแล้ว ดีใจที่ได้พบอีกครั้ง เปิด collection ที่ค้างไว้แล้วไปต่อกับ LAIKA ได้เลย",
  "ยินดีต้อนรับกลับ ช่วงที่หายไปไม่เป็นไร เริ่มทบทวนหรือขยายไอเดียจาก collection ด้านล่างได้ทันที",
  "หลายวันที่ไม่ได้เจอ ยินดีต้อนรับกลับ LAIKA พร้อมช่วยคิดต่อจากจุดเดิม",
  "กลับมาแล้ว Studio ยังพร้อมสำหรับคุณ เลือก collection ด้านล่างแล้วคุยต่อได้เลย",
] as const;

/** Rotated on landing during regular visits — no greeting opener every time. */
export const STUDIO_HERO_GREETINGS_CASUAL = [
  "เลือก collection ด้านล่างเพื่อคุยต่อกับ LAIKA หรือสร้าง collection ใหม่เมื่อมีเรื่องที่อยากสำรวจเพิ่ม",
  "โน้ตและไอเดียของคุณยังอยู่ที่นี่ เปิด collection ที่ต้องการแล้วคุยต่อจากจุดที่ค้างไว้ได้เลย",
  "Studio ใช้จัดระเบียบสิ่งที่ได้จาก Space และ Arena กลับมาจัดความคิดหรือขยายไอเดียกับ LAIKA ได้ทุกเมื่อ",
  "หากมีไอเดียใหม่ เริ่มจาก collection ใหม่ หรือเปิดแชทเดิมเพื่อพัฒนาความคิดต่อได้",
  "วันนี้อยากบันทึกโน้ตจากบทเรียน หรือต่อยอดไอเดียที่ค้างไว้ ลองเริ่มจาก collection ด้านล่างได้",
  "LAIKA พร้อมช่วยสรุป อธิบาย และชี้ทางต่อยอด เปิดแชทใน collection ที่อยากทำต่อได้เลย",
  "แม้ในแชทเดียวจะมีหลาย branch คุณสลับเส้นทางแล้วให้ LAIKA ช่วยคิดต่อได้ตามลำดับ",
  "เก็บทั้งโน้ตเรียนและไอเดียไว้ที่เดียว กลับมาทบทวนเมื่อใดก็ได้ตามจังหวะของคุณ",
  "หากมีความคิดใหม่ระหว่างทาง สร้าง collection ใหม่แล้วให้ LAIKA ช่วยจัดให้เป็นระบบและอ่านง่ายขึ้น",
  "เมื่อพร้อมแล้ว เลือก collection ด้านล่าง หรือเริ่มแชทใหม่สำหรับคำถามล่าสุดของคุณได้",
] as const;

export const NOTE_INTENTS: { id: NoteIntent; label: string; description: string }[] = [
  {
    id: "summarize",
    label: "สรุปและจัดระเบียบ",
    description: "ให้ LAIKA ช่วยจัดโน้ตให้อ่านง่ายขึ้น",
  },
  {
    id: "explain",
    label: "อธิบายจากบทเรียน",
    description: "เชื่อมกับสิ่งที่เรียนใน Space",
  },
  {
    id: "next-step",
    label: "แนะนำขั้นตอนถัดไป",
    description: "ควรลองทำอะไรใน Arena หรือเรียนต่อ",
  },
];

export const LEARN_INTENTS: { id: LearnIntent; label: string; description: string }[] = [
  {
    id: "ask-anything",
    label: "ถามได้ทุกเรื่อง",
    description: "เปิดให้ LAIKA อธิบาย code, คณิตศาสตร์, ฟิสิกส์ หรือความรู้ทั่วไป",
  },
];

export const IDEA_INTENTS: { id: IdeaIntent; label: string; description: string }[] = [
  {
    id: "analyze",
    label: "วิเคราะห์ไอเดีย",
    description: "ความเป็นไปได้ ข้อจำกัด และจุดที่ควรพัฒนา",
  },
  {
    id: "innovation-path",
    label: "แนวทางสู่นวัตกรรมจริง",
    description: "จาก concept สู่ prototype / TRL",
  },
  {
    id: "more-ideas",
    label: "แนะนำแนวคิดเพิ่มเติม",
    description: "ทางเลือกที่ต่อยอดจากไอเดียเดิม",
  },
  {
    id: "career-path",
    label: "เส้นทางอาชีพที่เกี่ยวข้อง",
    description: "บทบาทและทักษะที่ควรสะสมต่อ",
  },
];

