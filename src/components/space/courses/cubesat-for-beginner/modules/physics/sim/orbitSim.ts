import * as THREE from "three";

import { SUN_DIR } from "../physics/constants";
import { computeEclipseFactor } from "../physics/thermal";
import {
  LEO500_MEAN_MOTION,
  LEO500_ORBIT_PERIOD,
  LEO500_ORBIT_RADIUS_RE,
  equatorialOrbitPosition,
} from "./orbit";

export type OrbitSimPhaseId = "sunlit" | "eclipse" | "saa" | "ground-station";

export type OrbitSimPhase = {
  id: OrbitSimPhaseId;
  label: string;
  icon: string;
  desc: string;
  accent: string;
  /** True when the phase timing is illustrative, not ephemeris-accurate. */
  illustrative?: boolean;
};

export const ORBIT_SIM_PHASES: OrbitSimPhase[] = [
  {
    id: "sunlit",
    label: "Sunlit",
    icon: "☀️",
    desc: "EPS ชาร์จไฟจากแผงโซลาร์ · อุณหภูมิสูง",
    accent: "text-amber",
  },
  {
    id: "eclipse",
    label: "Eclipse",
    icon: "🌑",
    desc: "EPS ใช้ไฟจากแบตเตอรี่ · อุณหภูมิต่ำ",
    accent: "text-indigo-300",
  },
  {
    id: "saa",
    label: "SAA",
    icon: "☢️",
    desc: "รังสีสูงขึ้น (South Atlantic Anomaly) — ช่วงเวลาสาธิต",
    accent: "text-red-400",
    illustrative: true,
  },
  {
    id: "ground-station",
    label: "Ground Station",
    icon: "📡",
    desc: "หน้าต่างสื่อสาร ส่ง/รับข้อมูลได้ — ช่วงเวลาสาธิต",
    accent: "text-cyan",
    illustrative: true,
  },
];

const satPos = new THREE.Vector3();

/** Derive the active orbit-sim phase from accumulated simulation time. */
export function getOrbitSimPhase(simTime: number): OrbitSimPhase {
  const orbitFraction =
    ((simTime % LEO500_ORBIT_PERIOD) + LEO500_ORBIT_PERIOD) % LEO500_ORBIT_PERIOD /
    LEO500_ORBIT_PERIOD;

  const { x, z } = equatorialOrbitPosition(simTime, LEO500_ORBIT_RADIUS_RE, LEO500_MEAN_MOTION);
  satPos.set(x, 0, z);
  const eclipseFactor = computeEclipseFactor(satPos, SUN_DIR);

  // Illustrative event windows (no inclination / station ephemeris yet)
  if (orbitFraction > 0.55 && orbitFraction < 0.72) {
    return ORBIT_SIM_PHASES[3];
  }
  if (orbitFraction > 0.22 && orbitFraction < 0.32) {
    return ORBIT_SIM_PHASES[2];
  }
  if (eclipseFactor < 0.45) {
    return ORBIT_SIM_PHASES[1];
  }
  return ORBIT_SIM_PHASES[0];
}

export function orbitSimPhaseIndex(phase: OrbitSimPhase): number {
  return ORBIT_SIM_PHASES.findIndex((p) => p.id === phase.id);
}

/** Format elapsed sim time as mm:ss within one orbit period. */
export function formatOrbitElapsed(simTime: number): string {
  const t = ((simTime % LEO500_ORBIT_PERIOD) + LEO500_ORBIT_PERIOD) % LEO500_ORBIT_PERIOD;
  const mins = Math.floor(t / 60);
  const secs = Math.floor(t % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatOrbitPeriodMinutes(): string {
  return `${Math.round(LEO500_ORBIT_PERIOD / 60)} นาที`;
}
