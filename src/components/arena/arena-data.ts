export interface MissionGradeOutcome {
  grade: string;
  summary: string;
  conditions: string[];
}

export type ArenaMissionStatus = "playable" | "coming_soon";

export type ArenaSpaceBranchId =
  | "AROUND_US"
  | "ACCESS"
  | "FLIGHT"
  | "GROUND"
  | "FOR_EARTH"
  | "MISSION";

export type ArenaMissionFamily =
  | "orbit-bus"
  | "ground-ops"
  | "earth-data"
  | "access"
  | "mission-design"
  | "other";

export interface ArenaBranch {
  id: ArenaSpaceBranchId;
  en: string;
  th: string;
}

export interface ArenaMission {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  level: string;
  status: ArenaMissionStatus;
  spaceBranch: ArenaSpaceBranchId;
  spaceAnchor: string;
  missionFamily: ArenaMissionFamily;
  /** Space catalog course ids that should surface this mission on Recommend. */
  relatedCourseIds: string[];
  reusesOrbitEngine: boolean;
  playerOneLiner: string;
  teachingGoal: string;
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
    "ลงมือฝึกตามเนื้อหาใน SPACE — วงโคจร ขึ้นฟ้า ของบิน ภาคพื้น และงานบนโลก ไม่จำกัดแค่ดาวเทียม",
};

export const ARENA_BRANCHES: ArenaBranch[] = [
  { id: "AROUND_US", en: "AROUND US", th: "อวกาศรอบตัว" },
  { id: "ACCESS", en: "ACCESS", th: "ขึ้นสู่อวกาศ" },
  { id: "FLIGHT", en: "FLIGHT", th: "ของที่บิน" },
  { id: "GROUND", en: "GROUND", th: "ภาคพื้น" },
  { id: "FOR_EARTH", en: "FOR EARTH", th: "ใช้บนโลก" },
  { id: "MISSION", en: "MISSION", th: "ออกแบบภารกิจ" },
];

export const MISSION_FAMILY_LABELS: Record<ArenaMissionFamily, string> = {
  "orbit-bus": "Orbit bus",
  "ground-ops": "Ground ops",
  "earth-data": "Earth data",
  access: "Access",
  "mission-design": "Mission design",
  other: "Other",
};

const COMING_SOON_CTA = {
  ctaPrompt: "ภารกิจนี้ยังไม่เปิดให้เล่น",
  ctaHint: "ดูภาพรวมได้ก่อน เนื้อหาและเกณฑ์จะมาภายหลัง",
  ctaLabel: "ดูภาพรวม",
};

export const ORBIT_SENSE_MISSION: ArenaMission = {
  id: "orbit-sense",
  code: "AROUND 01",
  title: "ORBIT SENSE",
  subtitle: "เลือกชนิดวงโคจรให้งานบนโลก ไม่ใช่จำชื่อวง",
  level: "BEGINNER",
  status: "coming_soon",
  spaceBranch: "AROUND_US",
  spaceAnchor: "ORBIT SENSE",
  missionFamily: "other",
  relatedCourseIds: ["orbit-sense"],
  reusesOrbitEngine: false,
  playerOneLiner: "เลือก LEO / MEO / GEO ให้ตรงกับงานที่กำหนด",
  teachingGoal: "เห็นว่าความสูงต่างกัน งานต่างกัน และหน้าต่างผ่านไม่เท่ากัน",
  details:
    "คุณจะได้สถานการณ์บนโลก เช่น สื่อสารต่อเนื่อง ถ่ายภาพซ้ำจุดเดิม หรือนำทาง แล้วเลือกวงโคจรที่เหมาะ — ไม่ต้องประกอบดาวเทียมก่อน",
  hint: "งานที่ต้องเห็นจุดเดิมบ่อย มักอยู่ใกล้โลก งานที่ต้องคุยตลอดเวลา มักจอดสูง",
  objectiveLead: "เป้าหมายคือ",
  objectiveHighlight: "จับคู่ชนิดวงโคจรกับงานให้ถูก",
  objectiveCheckWhen: "เกณฑ์ผ่านจะมาเมื่อเปิดภารกิจนี้",
  objectiveMetrics: [],
  objectiveOutcomes: [],
  youWillDoIntro: "เมื่อเปิดแล้ว คุณจะ",
  youWillDo: [
    "อ่านงานบนโลกสั้น ๆ",
    "เลือกชนิดวงโคจรและอธิบายทำไม",
    "เทียบหน้าต่างผ่านกับความครอบคลุม",
  ],
  ...COMING_SOON_CTA,
};

export const TICKET_TO_FLY_MISSION: ArenaMission = {
  id: "ticket-to-fly",
  code: "ACCESS 01",
  title: "TICKET TO FLY",
  subtitle: "จองที่บนจรวดให้ผ่านข้อจำกัด rideshare",
  level: "BEGINNER",
  status: "coming_soon",
  spaceBranch: "ACCESS",
  spaceAnchor: "TICKET TO FLY",
  missionFamily: "access",
  relatedCourseIds: ["ticket-to-fly"],
  reusesOrbitEngine: false,
  playerOneLiner: "จัดมวล ปริมาตร และความปลอดภัยให้เข้า deployer ได้",
  teachingGoal: "เข้าใจว่าขึ้นวงโคจรไม่ได้แปลว่ามีจรวดเป็นของตัวเอง",
  details:
    "CubeSat ส่วนใหญ่ขึ้นแบบ rideshare คุณต้องจัดของให้เข้ากล่องปล่อย น้ำหนัก ปริมาตร ความถี่ และกฎความปลอดภัย — ไม่ใช่เขียนโปรแกรม OBC",
  hint: "ของที่ใหญ่หรือหนักเกินโควตา จะถูกตัดออกก่อนถึงแท่นปล่อย",
  objectiveLead: "เป้าหมายคือ",
  objectiveHighlight: "จัดชุดขึ้นฟ้าให้ผ่านข้อจำกัดการจองที่",
  objectiveCheckWhen: "เกณฑ์ผ่านจะมาเมื่อเปิดภารกิจนี้",
  objectiveMetrics: [],
  objectiveOutcomes: [],
  youWillDoIntro: "เมื่อเปิดแล้ว คุณจะ",
  youWillDo: [
    "ดูโควตามวลและปริมาตร",
    "เลือกของที่เอาขึ้นได้",
    "ตรวจข้อจำกัดความปลอดภัยและความถี่",
  ],
  ...COMING_SOON_CTA,
};

export const LEO_ORBIT_ONE_LAP_MISSION: ArenaMission = {
  id: "leo-orbit-one-lap",
  code: "MISSION 01",
  title: "ONE LAP AROUND EARTH",
  subtitle: "ให้ CubeSat รอดครบ 1 รอบรอบโลก โดยจัดการพลังงานตอนมีแดดและตอนเข้าเงา",
  level: "BEGINNER",
  status: "playable",
  spaceBranch: "FLIGHT",
  spaceAnchor: "CUBESAT FOR BEGINNER",
  missionFamily: "orbit-bus",
  relatedCourseIds: [
    "cubesat-for-beginner",
    "why-ten-centimeters",
    "whats-inside-the-box",
    "how-it-stays-alive",
    "who-talks-to-earth",
    "how-it-thinks",
  ],
  reusesOrbitEngine: true,
  playerOneLiner: "ให้ CubeSat รอดครบ 1 วงโคจร LEO",
  teachingGoal: "โปรแกรม OBC ให้ตอบสนองแดดกับ eclipse",
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
      conditions: ["ยังไม่ Fail แต่ยังไม่ถึง Perfect"],
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

export const CATCH_THE_PASS_MISSION: ArenaMission = {
  id: "catch-the-pass",
  code: "GROUND 01",
  title: "CATCH THE PASS",
  subtitle: "จับหน้าต่างผ่านสถานีภาคพื้นให้ทันเริ่มและจบการคุย",
  level: "BEGINNER",
  status: "coming_soon",
  spaceBranch: "GROUND",
  spaceAnchor: "CATCH THE PASS",
  missionFamily: "ground-ops",
  relatedCourseIds: ["catch-the-pass"],
  reusesOrbitEngine: false,
  playerOneLiner: "จับ pass จากพื้น แล้วเริ่ม–จบการคุยให้ทัน",
  teachingGoal: "เข้าใจว่า LEO คุยกับพื้นได้เป็นช่วง ๆ ไม่ใช่ตลอดเวลา",
  details:
    "สถานีภาคพื้นเห็นดาวเทียมเป็นหน้าต่างสั้น คุณต้องอ่านตารางผ่าน เล็งช่วงเวลา และส่ง/รับให้ทันก่อนของหายไปหลังขอบฟ้า",
  hint: "หน้าต่างผ่านสั้น — สิ่งที่ไม่จำเป็นควรตัดออกจากแผนการคุย",
  objectiveLead: "เป้าหมายคือ",
  objectiveHighlight: "จับหน้าต่างผ่านให้คุยสำเร็จอย่างน้อยหนึ่งครั้ง",
  objectiveCheckWhen: "เกณฑ์ผ่านจะมาเมื่อเปิดภารกิจนี้",
  objectiveMetrics: [],
  objectiveOutcomes: [],
  youWillDoIntro: "เมื่อเปิดแล้ว คุณจะ",
  youWillDo: [
    "อ่านตารางผ่าน",
    "เลือกช่วงเริ่ม–จบการคุย",
    "จัดลำดับสิ่งที่จะส่งและรับ",
  ],
  ...COMING_SOON_CTA,
};

export const SPACE_FOR_THAILAND_MISSION: ArenaMission = {
  id: "space-for-thailand",
  code: "EARTH 01",
  title: "SPACE FOR THAILAND",
  subtitle: "ใช้ข้อมูลจากอวกาศกับเคสในไทย โดยไม่ต้องประกอบ CubeSat ก่อน",
  level: "BEGINNER",
  status: "coming_soon",
  spaceBranch: "FOR_EARTH",
  spaceAnchor: "SPACE FOR THAILAND",
  missionFamily: "earth-data",
  relatedCourseIds: ["space-for-thailand"],
  reusesOrbitEngine: false,
  playerOneLiner: "เลือกข้อมูลจากวงโคจรให้ตรงเคสน้ำท่วม นา หรือป่า",
  teachingGoal: "เห็นว่าอวกาศเป็นเครื่องมือบนโลก ไม่ใช่แค่ของที่บิน",
  details:
    "คุณจะได้อ่านภาพหรือสถานการณ์จำลองในไทย แล้วเลือกดัชนีหรือชนิดข้อมูลที่ช่วยตัดสินใจ — คนที่สนใจเกษตรไม่ต้องผ่านด่านดาวเทียมก่อน",
  hint: "งานต่างกันใช้แถบคลื่นและจังหวะถ่ายต่างกัน",
  objectiveLead: "เป้าหมายคือ",
  objectiveHighlight: "จับคู่เคสไทยกับข้อมูลจากวงโคจรให้ถูก",
  objectiveCheckWhen: "เกณฑ์ผ่านจะมาเมื่อเปิดภารกิจนี้",
  objectiveMetrics: [],
  objectiveOutcomes: [],
  youWillDoIntro: "เมื่อเปิดแล้ว คุณจะ",
  youWillDo: [
    "อ่านเคสน้ำท่วม นา หรือป่า",
    "เลือกชนิดข้อมูลหรือดัชนี",
    "อธิบายว่าทำไมข้อมูลนั้นช่วยได้",
  ],
  ...COMING_SOON_CTA,
};

export const MISSION_CANVAS_MISSION: ArenaMission = {
  id: "mission-canvas",
  code: "DESIGN 01",
  title: "MISSION CANVAS",
  subtitle: "บีบปัญหาบนโลกให้เป็นภารกิจหนึ่งหน้า",
  level: "BEGINNER",
  status: "coming_soon",
  spaceBranch: "MISSION",
  spaceAnchor: "MISSION CANVAS",
  missionFamily: "mission-design",
  relatedCourseIds: ["mission-canvas"],
  reusesOrbitEngine: false,
  playerOneLiner: "วาดภารกิจหนึ่งหน้า: ปัญหา วงโคจร เพย์โหลด ของเลี้ยง ภาคพื้น",
  teachingGoal: "ฝึกเลือกข้อจำกัดก่อนคิดของบินสวย",
  details:
    "คุณจะได้ปัญหาบนโลกที่กว้างเกินไป แล้วต้องบีบให้เล็กพอทำ เลือกวงโคจร เพย์โหลด ระบบเลี้ยง และภาคพื้นบนหน้าเดียว",
  hint: "ภารกิจที่ของตายก่อนทำงาน ไม่ผ่าน แม้ภาพรวมจะสวย",
  objectiveLead: "เป้าหมายคือ",
  objectiveHighlight: "ส่งแคนวาสภารกิจที่อยู่รอดได้และตอบปัญหาที่เลือก",
  objectiveCheckWhen: "เกณฑ์ผ่านจะมาเมื่อเปิดภารกิจนี้",
  objectiveMetrics: [],
  objectiveOutcomes: [],
  youWillDoIntro: "เมื่อเปิดแล้ว คุณจะ",
  youWillDo: [
    "เลือกปัญหาให้เล็กพอ",
    "เลือกวงโคจรและเพย์โหลด",
    "ใส่ข้อจำกัดมวล ไฟ และช่องส่งข้อมูล",
  ],
  ...COMING_SOON_CTA,
};

export const ARENA_MISSIONS: ArenaMission[] = [
  ORBIT_SENSE_MISSION,
  TICKET_TO_FLY_MISSION,
  LEO_ORBIT_ONE_LAP_MISSION,
  CATCH_THE_PASS_MISSION,
  SPACE_FOR_THAILAND_MISSION,
  MISSION_CANVAS_MISSION,
];

export function getArenaBranch(id: ArenaSpaceBranchId): ArenaBranch | undefined {
  return ARENA_BRANCHES.find((branch) => branch.id === id);
}

export function missionsForBranch(branchId: ArenaSpaceBranchId): ArenaMission[] {
  return ARENA_MISSIONS.filter((mission) => mission.spaceBranch === branchId);
}
