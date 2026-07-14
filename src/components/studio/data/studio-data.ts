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
  updatedAt?: string;
  parentId?: string;
  laikaIntent?: LaikaIntent;
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
  "ยินดีต้อนรับสู่ Studio — พื้นที่สำหรับจดโน้ตและไอเดียของคุณหลังเรียนรู้จาก Space และ Arena เริ่มจากสร้าง collection แรกด้านล่างเลย แล้ว LAIKA จะช่วยสรุป อธิบาย และต่อยอดให้";

/** Rotated on landing when the user returns after several days away. */
export const STUDIO_HERO_GREETINGS_AWAY = [
  "กลับมาแล้ว ดีใจที่ได้เจอกันอีกครั้ง โน้ตกับไอเดียยังอยู่ครบ — เปิดต่อจากที่ค้างไว้ได้เลย",
  "หายไปนานเลยนะ ยินดีต้อนรับกลับมา อยากให้ช่วยทบทวนของเก่าหรือเริ่มอะไรใหม่ดี?",
  "กลับมาแล้ว LAIKA ยังจำทุกการสนทนาของคุณได้ — กด collection ด้านล่างแล้วไปต่อกันเลย",
  "ไม่ได้เจอกันสักพัก หวังว่าทุกอย่างจะราบรื่นดีนะ กลับมาคิดเรื่องอวกาศกันต่อไหม?",
  "ยินดีที่ได้พบคุณอีกครั้ง ไม่ว่าหายไปนานแค่ไหน Studio ก็ยังรอคุณอยู่เสมอ",
] as const;

/** Rotated on landing during regular visits. */
export const STUDIO_HERO_GREETINGS_CASUAL = [
  "กลับมาแล้วนะ อยากสำรวจเรื่องอะไรต่อ — เปิด collection แล้วมาคุยกันได้เลย",
  "มีอะไรให้ LAIKA ช่วยคิดวันนี้? ทบทวนของเดิมหรือเริ่มไอเดียใหม่ก็ได้ทั้งนั้น",
  "โน้ตกับไอเดียของคุณยังอยู่ดี — กด collection ด้านล่างแล้วคุยต่อจากจุดเดิมเลย",
  "วันนี้รู้สึกอยากเรียนรู้อะไร? LAIKA พร้อมช่วยอธิบายและต่อยอดให้เสมอ",
  "ถ้ามีไอเดียใหม่โผล่มาระหว่างวัน สร้าง collection แล้วมาลองคิดไปด้วยกันนะ",
  "จัดระเบียบความคิดให้ชัดขึ้น — LAIKA ช่วยสรุปให้ได้ ทุกโน้ตมีประเด็นที่พัฒนาต่อได้",
  "ไม่ต้องรีบ ค่อยๆ คิดทีละเรื่องก็ได้ เลือก collection ด้านล่างหรือเริ่มใหม่ตามจังหวะของคุณ",
  "คุณรู้ไหมว่าแชทเดียวมีได้หลาย branch — ลองแยกทางความคิดแล้วดูว่าทางไหนน่าสนใจกว่า",
  "อยากลองถามคำถามที่ยังไม่เคยถามไหม? LAIKA ชอบเวลาได้เรียนรู้ไปด้วยกัน",
  "พร้อมเมื่อไหร่ก็เริ่มเลย — กด collection หรือสร้างใหม่ด้านล่างได้ทุกเมื่อ",
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

