import type { LearningPath } from "@/lib/api";

import { ARENA_MISSIONS, type ArenaMission } from "./arena-data";

/** Soft intent-tag → mission id boosts when course ids don't match. */
const INTENT_MISSION_HINTS: Record<string, string[]> = {
  "earth-app": ["space-for-thailand"],
  "earth-observation": ["space-for-thailand"],
  agriculture: ["space-for-thailand"],
  flood: ["space-for-thailand"],
  orientation: ["orbit-sense"],
  beginner: ["orbit-sense", "leo-orbit-one-lap"],
  cubesat: ["leo-orbit-one-lap"],
  flight: ["leo-orbit-one-lap", "ticket-to-fly"],
  access: ["ticket-to-fly"],
  ground: ["catch-the-pass"],
  ops: ["catch-the-pass"],
  mission: ["mission-canvas"],
  design: ["mission-canvas"],
};

export type ArenaRecommendResult = {
  missions: ArenaMission[];
  /** True when at least one mission matched path steps or intent tags. */
  fromPath: boolean;
  matchedCourseIds: string[];
};

function statusRank(status: ArenaMission["status"]): number {
  return status === "playable" ? 0 : 1;
}

function defaultFeatured(): ArenaMission[] {
  return [...ARENA_MISSIONS].sort(
    (a, b) => statusRank(a.status) - statusRank(b.status) || a.code.localeCompare(b.code),
  );
}

/**
 * Rank Arena missions for the Recommend tab from the learner's Space path.
 * Prefer path step order; fall back to intent tags; else featured catalog order.
 */
export function recommendArenaMissions(path: LearningPath | null): ArenaRecommendResult {
  const usable =
    path &&
    (path.status === "active" || path.status === "draft") &&
    path.steps.length > 0;

  if (!usable || !path) {
    return {
      missions: defaultFeatured().slice(0, 4),
      fromPath: false,
      matchedCourseIds: [],
    };
  }

  const courseIds = path.steps.map((s) => s.courseId);
  const courseIndex = new Map(courseIds.map((id, i) => [id, i]));

  const scored: { mission: ArenaMission; stepIndex: number; via: "course" | "intent" }[] = [];

  for (const mission of ARENA_MISSIONS) {
    let bestStep = Number.POSITIVE_INFINITY;
    let via: "course" | "intent" | null = null;

    for (const related of mission.relatedCourseIds) {
      const idx = courseIndex.get(related);
      if (idx !== undefined && idx < bestStep) {
        bestStep = idx;
        via = "course";
      }
    }

    if (via === null && path.intentTags.length > 0) {
      const tagHits = new Set<string>();
      for (const tag of path.intentTags) {
        const key = tag.trim().toLowerCase();
        for (const [hint, missionIds] of Object.entries(INTENT_MISSION_HINTS)) {
          if (key.includes(hint) && missionIds.includes(mission.id)) {
            tagHits.add(mission.id);
          }
        }
      }
      if (tagHits.has(mission.id)) {
        bestStep = 1000 + ARENA_MISSIONS.indexOf(mission);
        via = "intent";
      }
    }

    if (via !== null) {
      scored.push({ mission, stepIndex: bestStep, via });
    }
  }

  if (scored.length === 0) {
    return {
      missions: defaultFeatured().slice(0, 4),
      fromPath: false,
      matchedCourseIds: courseIds,
    };
  }

  scored.sort(
    (a, b) =>
      a.stepIndex - b.stepIndex ||
      statusRank(a.mission.status) - statusRank(b.mission.status) ||
      (a.via === "course" && b.via !== "course" ? -1 : 0),
  );

  return {
    missions: scored.map((s) => s.mission),
    fromPath: true,
    matchedCourseIds: courseIds,
  };
}
