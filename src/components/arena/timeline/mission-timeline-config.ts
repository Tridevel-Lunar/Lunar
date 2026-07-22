export interface MissionPhaseBanner {
  name: string;
  label: string;
  startTick: number;
  endTick: number;
}

export interface MissionTimelineConfig {
  totalTicks: number;
  glitchTick: number;
  checkTick: number;
  daylightByTick: boolean[];
  phases: MissionPhaseBanner[];
}

/** Static schedule aligned with backend leo_orbital_launch world. */
export const LEO_ORBITAL_LAUNCH_TIMELINE: MissionTimelineConfig = {
  totalTicks: 10,
  glitchTick: 8,
  checkTick: 10,
  daylightByTick: [true, true, false, true, false, false, true, false, true, true],
  phases: [
    { name: "Power Phase", label: "พลังงาน", startTick: 1, endTick: 3 },
    { name: "Thermal Phase", label: "ความร้อน", startTick: 4, endTick: 6 },
    { name: "OBC Phase", label: "สมองกล", startTick: 7, endTick: 9 },
    { name: "Comms Check", label: "ส่งข้อมูล", startTick: 10, endTick: 10 },
  ],
};

export const MISSION_TIMELINE_BY_ID: Record<string, MissionTimelineConfig> = {
  "leo-orbital-launch": LEO_ORBITAL_LAUNCH_TIMELINE,
};

export function getMissionTimelineConfig(missionId: string): MissionTimelineConfig | null {
  return MISSION_TIMELINE_BY_ID[missionId] ?? null;
}

export function getPhaseForTick(
  config: MissionTimelineConfig,
  tick: number,
): MissionPhaseBanner | undefined {
  return config.phases.find((phase) => tick >= phase.startTick && tick <= phase.endTick);
}

export function isDaylightAtTick(config: MissionTimelineConfig, tick: number): boolean {
  return config.daylightByTick[tick - 1] ?? false;
}
