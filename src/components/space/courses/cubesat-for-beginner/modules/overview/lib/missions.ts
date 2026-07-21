/** Keep local to avoid circular import with types.ts */
export type OrbitBand = "LEO" | "MEO" | "GEO" | "HEO";

/**
 * Module 1 mission types — paired with orbit trade-offs.
 */
export type MissionType =
  | "earth_observation"
  | "reconnaissance"
  | "broadband"
  | "navigation"
  | "communications"
  | "meteorology"
  | "science_demo"
  | "polar_coverage";

export interface MissionMeta {
  id: MissionType;
  labelTh: string;
  labelEn: string;
  suitableBands: OrbitBand[];
  examples: string;
  whyFit: string;
  designNote: string;
}

export const MISSIONS: Record<MissionType, MissionMeta> = {
  earth_observation: {
    id: "earth_observation",
    labelTh: "สำรวจโลก (EO)",
    labelEn: "Earth observation",
    suitableBands: ["LEO"],
    examples: "ไทยโชต, THEOS-2, NAPA-1",
    whyFit:
      "ใกล้โลก → ภาพคมชัด (เหมือนถ่ายใกล้ๆ) แต่บินผ่านไว ต้องใช้หลายดวงถ้าอยากได้ภาพบ่อย",
    designNote:
      "กล้องออกแบบสำหรับระยะสั้น — ถ้าขึ้น GEO จะไม่เห็นรายละเอียดพื้นผิว",
  },
  reconnaissance: {
    id: "reconnaissance",
    labelTh: "ลาดตระเวน / ภาพละเอียดสูง",
    labelEn: "Reconnaissance",
    suitableBands: ["LEO"],
    examples: "Imaging recon sats",
    whyFit: "ต้องการความละเอียดสูงและตอบสนองเร็ว → ต้องโคจรต่ำใกล้เป้าหมาย",
    designNote: "เซ็นเซอร์และลิ้งก์ข้อมูลออกแบบตามระยะ LEO",
  },
  broadband: {
    id: "broadband",
    labelTh: "อินเทอร์เน็ต (คอมมูนิเคชัน LEO)",
    labelEn: "Broadband internet",
    suitableBands: ["LEO"],
    examples: "Starlink, OneWeb",
    whyFit:
      "Latency ต่ำเพราะใกล้โลก · ใช้กลุ่มดาวเทียมจำนวนมากคลุมพื้นที่",
    designNote: "เสาอากาศและครอสลิงก์คำนวณจากระยะ/มุมแบบ LEO",
  },
  navigation: {
    id: "navigation",
    labelTh: "นำทาง (GNSS)",
    labelEn: "Navigation",
    suitableBands: ["MEO"],
    examples: "GPS ในมือถือ, Galileo",
    whyFit:
      "MEO เห็นพื้นที่กว้างหลายจุดพร้อมกัน · ใช้ ~24–30 ดวงต่อระบบก็คุ้มทั้งโลก",
    designNote: "นาฬิกาอะตอมและรูปทรงกลุ่มดาวออกแบบที่ระดับ MEO",
  },
  communications: {
    id: "communications",
    labelTh: "สื่อสาร / ทีวี",
    labelEn: "Communications",
    suitableBands: ["GEO"],
    examples: "ไทยคม, Intelsat",
    whyFit:
      "GEO ค้างฟ้า · จานที่บ้านตั้งครั้งเดียวไม่ต้องหมุนตาม — ถ้าอยู่ LEO จานต้องตามตลอด",
    designNote: "เครื่องส่งกำลังสูงเพราะอยู่ไกล ~35,786 กม.",
  },
  meteorology: {
    id: "meteorology",
    labelTh: "อุตุนิยมวิทยา",
    labelEn: "Weather",
    suitableBands: ["GEO"],
    examples: "ภาพเมฆบนข่าว, GOES, Himawari",
    whyFit: "มองพื้นที่เดิมตลอด 24 ชม. — ติดตามพายุต่อเนื่องได้",
    designNote: "เซ็นเซอร์และแบนด์วิธออกแบบสำหรับระยะ GEO",
  },
  science_demo: {
    id: "science_demo",
    labelTh: "วิจัย / ทดลอง (CubeSat)",
    labelEn: "Science & tech demo",
    suitableBands: ["LEO"],
    examples: "KNACKSAT-2, CubeSat มหาวิทยาลัย",
    whyFit:
      "LEO ปล่อยง่ายและถูกที่สุด — rideshare หรือปล่อยจาก ISS ได้ · เหมาะเรียนรู้และทดลอง",
    designNote: "ระบบเรียบง่าย ไม่ต้องสำรองหลายชั้นแบบดาวเทียมพาณิชย์มูลค่าสูง",
  },
  polar_coverage: {
    id: "polar_coverage",
    labelTh: "ครอบคลุมขั้วโลก (HEO)",
    labelEn: "Polar coverage",
    suitableBands: ["HEO"],
    examples: "Molniya",
    whyFit: "อะโพจีสูงอยู่เหนือละติจูดสูงนาน — เติมช่องว่างที่ GEO มองไม่ถึง",
    designNote: "อยู่นอก Module 1 หลัก — สำรวจเพิ่มในฉากได้",
  },
};

export const DESIGN_LOCK_NOTE =
  "ภารกิจกำหนดวงโคจร — กล้อง เสาอากาศ พลังงาน ออกแบบให้เข้ากับระยะนั้น ไม่ย้ายวงได้ตามใจ";

export const SATELLITE_COMMON_PARTS = [
  "พลังงาน (โซลาร์ + แบต)",
  "สื่อสารกับพื้นโลก",
  "ระบบควบคุมตัวเอง",
  "Payload — ของที่ทำภารกิจจริง",
];

export function missionsForBand(band: OrbitBand): MissionMeta[] {
  return (Object.values(MISSIONS) as MissionMeta[]).filter((m) =>
    m.suitableBands.includes(band)
  );
}

export function isMissionAllowedOnBand(
  mission: MissionType,
  band: OrbitBand
): boolean {
  return MISSIONS[mission].suitableBands.includes(band);
}

export function defaultMissionForBand(band: OrbitBand): MissionType {
  return missionsForBand(band)[0]?.id ?? "earth_observation";
}
