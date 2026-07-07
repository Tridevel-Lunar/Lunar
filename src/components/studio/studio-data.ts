export type EntryType = "note" | "idea";

export type NoteIntent = "summarize" | "explain" | "next-step";
export type IdeaIntent = "analyze" | "innovation-path" | "more-ideas" | "career-path";

export type LaikaIntent = NoteIntent | IdeaIntent;

export type CollectionEntry = {
  id: string;
  type: EntryType;
  content: string;
  createdAt: string;
  laikaIntent?: LaikaIntent;
  laikaResponse?: string;
};

/** Demo — สิ่งที่ผู้เรียนน่าจะรู้หลังจบ Space + Arena บางส่วน */
export const DEMO_LEARNING_CONTEXT = {
  course: "CUBESAT 101",
  completedTopics: ["3D Model", "Physics (LEO)", "Programming basics"],
  arenaMissions: ["Stable Orbit Loop — ผ่าน"],
};

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

const CONTEXT_HINT = `บริบท: จบ ${DEMO_LEARNING_CONTEXT.course} · หัวข้อที่เรียนแล้ว ${DEMO_LEARNING_CONTEXT.completedTopics.join(", ")} · ${DEMO_LEARNING_CONTEXT.arenaMissions[0]}`;

export function getLaikaDemoResponse(
  type: EntryType,
  intent: LaikaIntent,
  content: string,
): string {
  const snippet = content.length > 80 ? `${content.slice(0, 80)}…` : content;

  if (type === "note") {
    switch (intent as NoteIntent) {
      case "summarize":
        return `สรุปจากโน้ตของคุณ (“${snippet}”):\n\n• ประเด็นหลัก: การเชื่อม OBC กับ payload ต้องคำนึงถึง power budget\n• คำถามที่ยังเปิด: ช่วง eclipse ใช้พลังงานจากแบตเท่าไร\n• แนะนำ: แยกหัวข้อเป็น “พลังงาน” กับ “สัญญาณข้อมูล” จะตามง่ายขึ้น\n\n${CONTEXT_HINT}`;
      case "explain":
        return `จากบทเรียน Embedded System ใน Space — โน้ตของคุณเกี่ยวกับ “${snippet}” สอดคล้องกับแนวคิด Data Bus: OBC เป็นศูนย์กลางรับ-ส่งคำสั่งไปยัง payload\n\nลองทบทวน: EPS จ่ายไฟ → OBC ประมวลผล → Payload ทำงานตามคำสั่ง\n\n${CONTEXT_HINT}`;
      case "next-step":
        return `ขั้นตอนถัดไปที่เหมาะกับโน้ตนี้:\n\n1. ลองจำลอง power budget ใน Arena (ปรับ duty cycle ของกล้อง)\n2. เรียนต่อหัวข้อ Programming — สร้างบล็อก “ถ่ายภาพเมื่อแบต > 60%”\n3. กลับมาอัปเดตโน้ตหลังทดลอง\n\n${CONTEXT_HINT}`;
    }
  }

  switch (intent as IdeaIntent) {
    case "analyze":
      return `วิเคราะห์ไอเดีย: “${snippet}”\n\nจุดแข็ง: ใช้ประโยชน์จากวงโคจร LEO ที่เรียนไปแล้ว — revisit บ่อย เหมาะกับภาพถ่ายพื้นที่เฉพาะ\nข้อจำกัด CubeSat 1U: พื้นที่ solar panel จำกัด · ความละเอียดภาพขึ้นกับ payload\nควรพิจารณ์: ช่วงเวลาถ่าย (local time) · downlink bandwidth · เก็บภาพ vs ส่ง real-time\n\n${CONTEXT_HINT}`;
    case "innovation-path":
      return `แนวทางสู่นวัตกรรมจริง:\n\nTRL ปัจจุบัน (ประมาณ): 2–3 — มีแนวคิด + ความรู้พื้นฐานจาก LUNAR\nขั้นถัดไป:\n• TRL 4: จำลองภารกิจใน Arena ให้ผ่านเงื่อนไขพลังงาน\n• TRL 5: สร้าง payload mock-up (เช่น camera + OBC dev board)\n• เชื่อมต่อ: ดู case study ดาวเทียมเกษตรในไทย (เช่น THEOS)\n\n${CONTEXT_HINT}`;
    case "more-ideas":
      return `แนวคิดต่อยอดจาก “${snippet}”:\n\n1. ดาวเทียมคู่ — หนึ่งตัวถ่ายภาพ อีกตัว relay สัญญาณ\n2. ใช้ multispectral แทน RGB เพื่อวัดความชื้นดิน\n3. ร่วมมือกับโรงเรียนเกษตร — ground truth เปรียบเทียบภาพดาวเทียม\n\nเลือก 1 แนวแล้วลองเขียน mission block ใน Arena\n\n${CONTEXT_HINT}`;
    case "career-path":
      return `เส้นทางอาชีพที่เกี่ยวข้องกับไอเดียนี้:\n\n• Remote Sensing / GIS Analyst — วิเคราะห์ภาพดาวเทียมเพื่อเกษตร\n• Satellite Systems Engineer — ออกแบบ payload และภารกิจ\n• GNC / Orbital Analyst — วางแผนวงโคจรและ coverage\n\nจากสิ่งที่คุณเรียนใน LUNAR ตอนนี้ แนะนำลึก Physics + Programming ก่อน แล้วฝึกโปรเจกต์จำลองใน Arena\n\n${CONTEXT_HINT}`;
  }

  return "LAIKA demo response";
}

export const SEED_ENTRIES: CollectionEntry[] = [
  {
    id: "seed-1",
    type: "note",
    content: "ยังสับสนเรื่อง power budget ตอน eclipse — แบต 30% พอไหมถ้า payload ทำงาน 5 นาที",
    createdAt: "2026-07-05T10:30:00",
    laikaIntent: "explain",
    laikaResponse: getLaikaDemoResponse(
      "note",
      "explain",
      "ยังสับสนเรื่อง power budget ตอน eclipse",
    ),
  },
];
