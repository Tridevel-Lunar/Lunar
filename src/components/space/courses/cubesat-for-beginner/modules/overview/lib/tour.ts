import { OrbitBand } from "./types";
import { MissionType } from "./missions";

export const TOUR_BANDS: OrbitBand[] = ["GEO", "MEO", "LEO"];

export type TourStepId = "overview" | "types" | "GEO" | "MEO" | "LEO";

export const TOUR_PATH: TourStepId[] = [
  "overview",
  "types",
  "GEO",
  "MEO",
  "LEO",
];

export const TOUR_TOTAL = TOUR_PATH.length;

export interface TourStepContent {
  id: TourStepId;
  stepLabel: string;
  tabLabel: string;
  title: string;
  /** Short Laika line — keep under ~90 chars */
  tip: string;
  fitOneLiner: string;
}

export const STEP_CONTENT: Record<TourStepId, TourStepContent> = {
  overview: {
    id: "overview",
    stepLabel: `1 / ${TOUR_TOTAL}`,
    tabLabel: "Intro",
    title: "ดาวเทียมใกล้ตัวคุณ",
    tip: "ตื่นมาเช็คอากาศ · Maps · โอนเงิน — เบื้องหลังมีดาวเทียมทำงานอยู่",
    fitOneLiner: "ลอยวนรอบโลกตลอดเวลาโดยไม่ตกลงมา",
  },
  types: {
    id: "types",
    stepLabel: `2 / ${TOUR_TOTAL}`,
    tabLabel: "Types",
    title: "ทำหน้าที่อะไร",
    tip: "ไม่ต้องใหญ่เท่ารถบัส — หลายดวงเล็กเท่ากล่องรองเท้า",
    fitOneLiner: "กดเพื่อดูตัวอย่างในชีวิตจริง",
  },
  GEO: {
    id: "GEO",
    stepLabel: `3 / ${TOUR_TOTAL}`,
    tabLabel: "GEO",
    title: "GEO · ลอยนิ่ง",
    tip: "วิ่งตามการหมุนของโลก — จากพื้นดูเหมือนค้างฟ้า",
    fitOneLiner: "35,786 กม. · ทีวี · สื่อสาร · อากาศ",
  },
  MEO: {
    id: "MEO",
    stepLabel: `4 / ${TOUR_TOTAL}`,
    tabLabel: "MEO",
    title: "MEO · นำทาง",
    tip: "สูงพอเห็นพื้นที่กว้าง — GPS ใช้ ~24–30 ดวงต่อระบบ",
    fitOneLiner: "~20,000 กม. · บ้านของ GNSS",
  },
  LEO: {
    id: "LEO",
    stepLabel: `5 / ${TOUR_TOTAL}`,
    tabLabel: "LEO",
    title: "LEO · ใกล้โลก",
    tip: "ใกล้ = คมชัด · และเป็นบ้านของ CubeSat",
    fitOneLiner: "300–2,000 กม. · EO · Starlink · CubeSat",
  },
};

export const TOUR_CONTENT: Record<"GEO" | "MEO" | "LEO" | "HEO", TourStepContent> =
  {
    GEO: STEP_CONTENT.GEO,
    MEO: STEP_CONTENT.MEO,
    LEO: STEP_CONTENT.LEO,
    HEO: {
      id: "LEO",
      stepLabel: "",
      tabLabel: "HEO",
      title: "HEO",
      tip: "bonus",
      fitOneLiner: "",
    },
  };

export const OVERVIEW = STEP_CONTENT.overview;

export function contentForStep(step: number): TourStepContent {
  return STEP_CONTENT[stepIdFromIndex(step)];
}

export function stepIdFromIndex(step: number): TourStepId {
  return TOUR_PATH[Math.max(0, Math.min(TOUR_PATH.length - 1, step))];
}

export function tourIndexForBand(band: OrbitBand): number {
  if (band === "HEO") return tourIndexForId("LEO");
  const i = TOUR_PATH.indexOf(band as TourStepId);
  return i >= 0 ? i : 0;
}

export function tourIndexForId(id: TourStepId): number {
  return Math.max(0, TOUR_PATH.indexOf(id));
}

export function shortAltitude(band: OrbitBand): string {
  if (band === "HEO") return "วงรี";
  if (band === "GEO") return "35,786 กม.";
  if (band === "LEO") return "300–2,000 กม.";
  return "~20,000 กม.";
}

export const TOUR_MISSION_FOCUS: Record<OrbitBand, MissionType[]> = {
  GEO: ["meteorology", "communications"],
  MEO: ["navigation"],
  LEO: ["earth_observation", "broadband", "science_demo"],
  HEO: ["polar_coverage"],
};

export const DAILY_HOOKS = [
  { id: "weather", label: "เช็คอากาศ", reveal: "ดาวเทียมอุตุ · มักอยู่ GEO" },
  { id: "maps", label: "Google Maps", reveal: "สัญญาณ GPS จาก MEO" },
  { id: "pay", label: "โอนเงิน", reveal: "นาฬิกา sync ผ่านดาวเทียม" },
] as const;

export const SAT_PARTS = [
  { id: "power", label: "พลังงาน", hint: "โซลาร์ + แบต" },
  { id: "comm", label: "สื่อสาร", hint: "คุยกับพื้นโลก" },
  { id: "control", label: "ควบคุม", hint: "หันตัว / อยู่แนว" },
  { id: "payload", label: "Payload", hint: "ของทำภารกิจจริง" },
] as const;

export const MODULE1_TYPE_CARDS: {
  mission: MissionType;
  short: string;
  everyday: string;
  orbit: OrbitBand;
}[] = [
  {
    mission: "earth_observation",
    short: "สำรวจโลก",
    everyday: "ไทยโชต · เกษตร ภัยพิบัติ",
    orbit: "LEO",
  },
  {
    mission: "communications",
    short: "สื่อสาร / ทีวี",
    everyday: "ไทยคม · จานไม่ต้องหมุน",
    orbit: "GEO",
  },
  {
    mission: "broadband",
    short: "อินเทอร์เน็ต",
    everyday: "Starlink · latency ต่ำ",
    orbit: "LEO",
  },
  {
    mission: "navigation",
    short: "นำทาง",
    everyday: "GPS ในมือถือ",
    orbit: "MEO",
  },
  {
    mission: "meteorology",
    short: "อากาศ",
    everyday: "ภาพเมฆข่าวช่อง 7/3",
    orbit: "GEO",
  },
  {
    mission: "science_demo",
    short: "วิจัย · CubeSat",
    everyday: "KNACKSAT-2 · มหาวิทยาลัย",
    orbit: "LEO",
  },
];

export type CubeSatSize = "1U" | "3U" | "6U" | "12U";

export const CUBESAT_SIZES: {
  id: CubeSatSize;
  unitsAlong: number;
  widthU: number;
  depthU: number;
  dimsCm: string;
  mass: string;
  analogy: string;
  capability: string;
}[] = [
  {
    id: "1U",
    unitsAlong: 1,
    widthU: 1,
    depthU: 1,
    dimsCm: "10×10×10",
    mass: "~1.3 กก.",
    analogy: "กล่องนม 1 ลิตร",
    capability: "ทดลอง 1 ภารกิจ",
  },
  {
    id: "3U",
    unitsAlong: 3,
    widthU: 1,
    depthU: 1,
    dimsCm: "10×10×30",
    mass: "~4 กก.",
    analogy: "รองเท้า ×3",
    capability: "payload หลักชัดขึ้น",
  },
  {
    id: "6U",
    unitsAlong: 3,
    widthU: 2,
    depthU: 1,
    dimsCm: "10×20×30",
    mass: "~8–12 กก.",
    analogy: "กล่องเอกสาร",
    capability: "หลาย payload / กล้องคม",
  },
  {
    id: "12U",
    unitsAlong: 3,
    widthU: 2,
    depthU: 2,
    dimsCm: "20×20×30",
    mass: "~20+ กก.",
    analogy: "กล่องไมโครเวฟ",
    capability: "ภารกิจหลายระบบ",
  },
];

export const CUBESAT_WHYS = [
  { id: "std", title: "มาตรฐาน U", body: "deployer เดียวกันทั่วโลก · เหมือนเลโก้" },
  { id: "cots", title: "COTS", body: "ชิ้นส่วนตลาด ลดราคาลงมาก" },
  { id: "ride", title: "Rideshare", body: "ผู้โดยสารร่วม / ปล่อยจาก ISS" },
] as const;

export const CUBESAT_THAI = [
  { id: "k1", name: "KNACKSAT", note: "2018 · 1U · คนไทย 100%" },
  { id: "k2", name: "KNACKSAT-2", note: "2026 · 3U · ISS/JAXA" },
  { id: "napa", name: "NAPA-1", note: "2020 · 6U · ทอ." },
] as const;

export const MODULE1_CLOSING =
  "ข้างใน CubeSat มีอะไรที่ทำให้ทำงานได้? → โมดูล 2";

export const CUBESAT_EMOTION =
  "จุดเริ่มต้นของ KNACKSAT ก็ไม่ต่างจากพวกเรา — ลงมือทำจนขึ้นอวกาศได้จริง";

export const TOUR_STEPS = TOUR_BANDS;
