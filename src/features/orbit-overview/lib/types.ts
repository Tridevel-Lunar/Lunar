import { altitudeToSceneRadius } from "./orbitMath";
import {
  defaultMissionForBand,
  MISSIONS,
  MissionType,
  OrbitBand,
} from "./missions";

export type { OrbitBand, MissionType };

/** @deprecated Use OrbitBand */
export type OrbitKind = OrbitBand;

export type SimulationSelection =
  | { kind: "satellite"; id: string }
  | { kind: "orbit"; id: string };

export interface OrbitDefinition {
  id: string;
  band: OrbitBand;
  name: string;
  description: string;
  /** Mean altitude above surface (km) — for circular orbits, or semi-major altitude for HEO */
  altitudeKm: number;
  inclinationDeg: number;
  color: string;
  angularSpeed: number;
  /** HEO: perigee altitude (km) */
  perigeeKm?: number;
  /** HEO: apogee altitude (km) */
  apogeeKm?: number;
}

export interface SatelliteDefinition {
  id: string;
  name: string;
  orbitId: string;
  missionType: MissionType;
  description: string;
  altitudeKm: number;
  velocityKmS: number;
  inclinationDeg: number;
  periodMin: number;
  launched: string;
  phase: number;
  radiusJitter?: number;
  /** HEO satellites inherit elliptical path from parent orbit */
  perigeeKm?: number;
  apogeeKm?: number;
}

export const ORBIT_BANDS: OrbitBand[] = ["LEO", "MEO", "GEO", "HEO"];

export const BAND_META: Record<
  OrbitBand,
  {
    label: string;
    subtitle: string;
    subtitleTh: string;
    altitudeMin: number;
    altitudeMax: number;
    defaultAltitude: number;
    defaultInclination: number;
    defaultColor: string;
    description: string;
    descriptionTh: string;
    suitedForTh: string;
    whyTh: string;
  }
> = {
  LEO: {
    label: "LEO",
    subtitle: "Low Earth Orbit",
    subtitleTh: "วงโคจรระดับต่ำ",
    altitudeMin: 400,
    altitudeMax: 2000,
    defaultAltitude: 550,
    defaultInclination: 51.6,
    defaultColor: "#3b82f6",
    description:
      "Closest orbit band — sharp imaging and low-latency links.",
    descriptionTh:
      "วงโคจรใกล้โลก เหมาะถ่ายภาพคมชัดและรับ–ส่งสัญญาณรวดเร็ว",
    suitedForTh:
      "ดาวเทียมสำรวจทรัพยากร · จารกรรม/ลาดตระเวน · อินเทอร์เน็ตบรอดแบนด์ (เช่น Starlink)",
    whyTh:
      "อยู่ใกล้โลก จึงถ่ายภาพได้คมชัดสูง และ latency ต่ำ — แต่ครอบคลุมพื้นที่แคบกว่าจึงมักใช้เป็นกลุ่มดาวเทียม",
  },
  MEO: {
    label: "MEO",
    subtitle: "Medium Earth Orbit",
    subtitleTh: "วงโคจรระดับปานกลาง",
    altitudeMin: 2000,
    altitudeMax: 35786,
    defaultAltitude: 20200,
    defaultInclination: 55,
    defaultColor: "#8b5cf6",
    description:
      "Mid-altitude band balancing coverage and signal strength — home of GNSS.",
    descriptionTh:
      "ระดับกลาง ครอบคลุมกว้างกว่า LEO ด้วยความเร็วโคจรที่แม่นยำ",
    suitedForTh: "ดาวเทียมนำทาง เช่น GPS, Galileo, BeiDou, GLONASS",
    whyTh:
      "ครอบคลุมพื้นที่กว้างกว่า LEO และเคลื่อนที่ด้วยอัตราที่คำนวณตำแหน่งได้แม่นยำ",
  },
  GEO: {
    label: "GEO",
    subtitle: "Geostationary Orbit",
    subtitleTh: "วงโคจรค้างฟ้า",
    altitudeMin: 35700,
    altitudeMax: 35850,
    defaultAltitude: 35786,
    defaultInclination: 0,
    defaultColor: "#f59e0b",
    description:
      "Matches Earth's rotation — appears fixed over one longitude.",
    descriptionTh:
      "ความสูง ~35,786 กม. โคจรเท่ากับหมุนของโลก จึงดูเหมือนหยุดนิ่งบนท้องฟ้า",
    suitedForTh: "ดาวเทียมสื่อสาร · ดาวเทียมอุตุนิยมวิทยา (เช่น GOES)",
    whyTh:
      "อยู่กับที่เทียบพื้นโลก จานรับบนพื้นไม่ต้องหมุนตาม — เหมาะบริการต่อเนื่องเหนือละติจูดกลาง",
  },
  HEO: {
    label: "HEO",
    subtitle: "Highly Elliptical Orbit",
    subtitleTh: "วงโคจรแบบรีสูง",
    altitudeMin: 500,
    altitudeMax: 45000,
    defaultAltitude: 20000,
    defaultInclination: 63.4,
    defaultColor: "#34d399",
    description:
      "Elliptical path dwelling over high latitudes near apogee.",
    descriptionTh:
      "วงรีสูง ใช้เวลานานช่วงอะโพจีเหนือละติจูดสูง — เหมาะขั้วโลก",
    suitedForTh: "ภารกิจครอบคลุมขั้วโลก / ละติจูดสูง (เช่น Molniya)",
    whyTh:
      "วงโคจรอื่น (โดยเฉพาะ GEO) ส่องไม่ถึงขั้วโลกดี HEO จึงเติมช่องว่างนี้",
  },
};

const MU_EARTH = 398600;
const EARTH_R_KM = 6371;

export function orbitPeriodMin(altitudeKm: number): number {
  const a = EARTH_R_KM + altitudeKm;
  const seconds = 2 * Math.PI * Math.sqrt((a * a * a) / MU_EARTH);
  return seconds / 60;
}

export function orbitVelocityKmS(altitudeKm: number): number {
  const a = EARTH_R_KM + altitudeKm;
  return Math.sqrt(MU_EARTH / a);
}

export function visualAngularSpeed(altitudeKm: number): number {
  const period = orbitPeriodMin(altitudeKm);
  const refPeriod = orbitPeriodMin(550);
  return 0.42 * (refPeriod / period);
}

export function sceneRadiusForOrbit(orbit: OrbitDefinition): number {
  return altitudeToSceneRadius(orbit.altitudeKm);
}

export function clampAltitudeToBand(band: OrbitBand, altitudeKm: number): number {
  const meta = BAND_META[band];
  return Math.min(meta.altitudeMax, Math.max(meta.altitudeMin, altitudeKm));
}

let idCounter = 0;
export function createId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

const ORBIT_PALETTE = [
  "#3b82f6",
  "#22d3ee",
  "#8b5cf6",
  "#a78bfa",
  "#f59e0b",
  "#fbbf24",
  "#34d399",
  "#f472b6",
  "#2dd4bf",
];

export function createOrbit(input: {
  band: OrbitBand;
  name?: string;
  altitudeKm?: number;
  inclinationDeg?: number;
  color?: string;
  description?: string;
  perigeeKm?: number;
  apogeeKm?: number;
}): OrbitDefinition {
  const meta = BAND_META[input.band];

  if (input.band === "HEO") {
    const perigeeKm = input.perigeeKm ?? 1000;
    const apogeeKm = input.apogeeKm ?? 39750;
    const meanAlt = (perigeeKm + apogeeKm) / 2;
    return {
      id: createId("orbit"),
      band: "HEO",
      name: input.name?.trim() || "HEO (Molniya-class)",
      description: input.description?.trim() || meta.descriptionTh,
      altitudeKm: meanAlt,
      inclinationDeg: input.inclinationDeg ?? 63.4,
      color: input.color || meta.defaultColor,
      angularSpeed: visualAngularSpeed(meanAlt) * 0.85,
      perigeeKm,
      apogeeKm,
    };
  }

  const altitudeKm = clampAltitudeToBand(
    input.band,
    input.altitudeKm ?? meta.defaultAltitude
  );
  return {
    id: createId("orbit"),
    band: input.band,
    name: input.name?.trim() || `${meta.label} Orbit`,
    description: input.description?.trim() || meta.descriptionTh,
    altitudeKm,
    inclinationDeg: input.inclinationDeg ?? meta.defaultInclination,
    color: input.color || meta.defaultColor,
    angularSpeed: visualAngularSpeed(altitudeKm),
  };
}

export function createSatellite(input: {
  name: string;
  orbitId: string;
  orbit: OrbitDefinition;
  missionType: MissionType;
  altitudeKm?: number;
  inclinationDeg?: number;
  phase?: number;
  description?: string;
  launched?: string;
}): SatelliteDefinition {
  const mission = MISSIONS[input.missionType];
  if (!mission.suitableBands.includes(input.orbit.band)) {
    throw new Error(
      `ภารกิจ「${mission.labelTh}」ไม่เหมาะกับวงโคจร ${input.orbit.band}`
    );
  }

  const isHeo = input.orbit.band === "HEO";
  const altitudeKm = isHeo
    ? input.orbit.altitudeKm
    : clampAltitudeToBand(
        input.orbit.band,
        input.altitudeKm ?? input.orbit.altitudeKm
      );

  return {
    id: createId("sat"),
    name: input.name.trim() || mission.labelTh,
    orbitId: input.orbitId,
    missionType: input.missionType,
    description:
      input.description?.trim() ||
      `${mission.whyFit} ตัวอย่าง: ${mission.examples}`,
    altitudeKm,
    velocityKmS: orbitVelocityKmS(
      isHeo ? (input.orbit.perigeeKm ?? 1000) : altitudeKm
    ),
    inclinationDeg: input.inclinationDeg ?? input.orbit.inclinationDeg,
    periodMin: orbitPeriodMin(altitudeKm),
    launched: input.launched?.trim() || "Custom",
    phase: input.phase ?? Math.random() * Math.PI * 2,
    radiusJitter: (Math.random() - 0.5) * 0.04,
    perigeeKm: input.orbit.perigeeKm,
    apogeeKm: input.orbit.apogeeKm,
  };
}

export const INITIAL_ORBITS: OrbitDefinition[] = [
  {
    id: "orbit-leo-default",
    band: "LEO",
    name: "LEO Band",
    description: BAND_META.LEO.descriptionTh,
    altitudeKm: 550,
    inclinationDeg: 51.6,
    color: "#3b82f6",
    angularSpeed: visualAngularSpeed(550),
  },
  {
    id: "orbit-meo-default",
    band: "MEO",
    name: "MEO / GNSS Band",
    description: BAND_META.MEO.descriptionTh,
    altitudeKm: 20200,
    inclinationDeg: 55,
    color: "#8b5cf6",
    angularSpeed: visualAngularSpeed(20200),
  },
  {
    id: "orbit-geo-default",
    band: "GEO",
    name: "GEO Belt",
    description: BAND_META.GEO.descriptionTh,
    altitudeKm: 35786,
    inclinationDeg: 0,
    color: "#f59e0b",
    angularSpeed: visualAngularSpeed(35786),
  },
  {
    id: "orbit-heo-default",
    band: "HEO",
    name: "HEO Molniya-class",
    description: BAND_META.HEO.descriptionTh,
    altitudeKm: (1000 + 39750) / 2,
    inclinationDeg: 63.4,
    color: "#34d399",
    angularSpeed: visualAngularSpeed(20000) * 0.85,
    perigeeKm: 1000,
    apogeeKm: 39750,
  },
];

export const INITIAL_SATELLITES: SatelliteDefinition[] = [
  {
    id: "theos",
    name: "THEOS-class EO",
    orbitId: "orbit-leo-default",
    missionType: "earth_observation",
    description: MISSIONS.earth_observation.whyFit,
    altitudeKm: 822,
    velocityKmS: 7.45,
    inclinationDeg: 98.7,
    periodMin: 101,
    launched: "ไทยโชต / EO",
    phase: 0.2,
  },
  {
    id: "starlink",
    name: "Starlink Satellite",
    orbitId: "orbit-leo-default",
    missionType: "broadband",
    description: MISSIONS.broadband.whyFit,
    altitudeKm: 550,
    velocityKmS: 7.5,
    inclinationDeg: 53,
    periodMin: 95.6,
    launched: "2019 – ongoing",
    phase: 3.6,
  },
  {
    id: "knacksat",
    name: "KNACKSAT (CubeSat 1U)",
    orbitId: "orbit-leo-default",
    missionType: "science_demo",
    description: MISSIONS.science_demo.whyFit,
    altitudeKm: 575,
    velocityKmS: 7.58,
    inclinationDeg: 97.5,
    periodMin: 96,
    launched: "Dec 2018 · มจพ.",
    phase: 1.4,
  },
  {
    id: "gps",
    name: "GPS Satellite (NAVSTAR)",
    orbitId: "orbit-meo-default",
    missionType: "navigation",
    description: MISSIONS.navigation.whyFit,
    altitudeKm: 20200,
    velocityKmS: 3.87,
    inclinationDeg: 55,
    periodMin: 718,
    launched: "1978 – ongoing",
    phase: 0.8,
  },
  {
    id: "galileo",
    name: "Galileo Satellite",
    orbitId: "orbit-meo-default",
    missionType: "navigation",
    description: MISSIONS.navigation.whyFit,
    altitudeKm: 23222,
    velocityKmS: 3.6,
    inclinationDeg: 56,
    periodMin: 843,
    launched: "2011 – ongoing",
    phase: 4.2,
  },
  {
    id: "goes",
    name: "GOES Weather Satellite",
    orbitId: "orbit-geo-default",
    missionType: "meteorology",
    description: MISSIONS.meteorology.whyFit,
    altitudeKm: 35786,
    velocityKmS: 3.07,
    inclinationDeg: 0.1,
    periodMin: 1436,
    launched: "1975 – ongoing",
    phase: 2.1,
  },
  {
    id: "thaicom",
    name: "Thaicom-class Comsat",
    orbitId: "orbit-geo-default",
    missionType: "communications",
    description: MISSIONS.communications.whyFit,
    altitudeKm: 35786,
    velocityKmS: 3.07,
    inclinationDeg: 0,
    periodMin: 1436,
    launched: "ไทยคม / GEO",
    phase: 4.5,
  },
  {
    id: "molniya",
    name: "Molniya-class Coverage",
    orbitId: "orbit-heo-default",
    missionType: "polar_coverage",
    description: MISSIONS.polar_coverage.whyFit,
    altitudeKm: (1000 + 39750) / 2,
    velocityKmS: orbitVelocityKmS(1000),
    inclinationDeg: 63.4,
    periodMin: 718,
    launched: "HEO demo",
    phase: 1.1,
    perigeeKm: 1000,
    apogeeKm: 39750,
  },
];

export function nextOrbitColor(existing: OrbitDefinition[], band: OrbitBand): string {
  const used = new Set(existing.filter((o) => o.band === band).map((o) => o.color));
  return (
    ORBIT_PALETTE.find((c) => !used.has(c)) || BAND_META[band].defaultColor
  );
}

export { defaultMissionForBand };
