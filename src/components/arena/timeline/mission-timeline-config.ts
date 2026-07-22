export interface MissionOrbitBand {
  name: string;
  label: string;
  /** Phase start inclusive 0..1 */
  startPhase: number;
  /** Phase end exclusive 0..1 */
  endPhase: number;
  sunlit: boolean;
}

export interface MissionOrbitTimelineConfig {
  orbitPeriodSec: number;
  eclipseFraction: number;
  eclipseEnterSec: number;
  eclipseExitSec: number;
  passSimSec: number;
  bands: MissionOrbitBand[];
}

/** Preview schedule for leo-orbit-one-lap (matches backend eclipse model). */
export const LEO_ORBIT_ONE_LAP_TIMELINE: MissionOrbitTimelineConfig = {
  orbitPeriodSec: 5550,
  eclipseFraction: 0.35,
  eclipseEnterSec: 1804,
  eclipseExitSec: 3746,
  passSimSec: 5400,
  bands: [
    { name: "Sunlit A", label: "แดด", startPhase: 0, endPhase: 0.325, sunlit: true },
    { name: "Eclipse", label: "eclipse", startPhase: 0.325, endPhase: 0.675, sunlit: false },
    { name: "Sunlit B", label: "แดด", startPhase: 0.675, endPhase: 1, sunlit: true },
  ],
};

export const MISSION_ORBIT_TIMELINE_BY_ID: Record<string, MissionOrbitTimelineConfig> = {
  "leo-orbit-one-lap": LEO_ORBIT_ONE_LAP_TIMELINE,
};

export function getMissionOrbitTimelineConfig(
  missionId: string,
): MissionOrbitTimelineConfig | null {
  return MISSION_ORBIT_TIMELINE_BY_ID[missionId] ?? null;
}

/** @deprecated Use getMissionOrbitTimelineConfig */
export function getMissionTimelineConfig(missionId: string) {
  return getMissionOrbitTimelineConfig(missionId);
}
