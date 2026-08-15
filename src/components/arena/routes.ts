/** Canonical Arena route builders. */

export function arenaHomePath(): string {
  return "/arena";
}

export function arenaExplorePath(): string {
  return "/arena/explore";
}

export function arenaMissionPath(missionId: string): string {
  return `/arena/mission/${missionId}`;
}

export type ArenaShellTab = "recommend" | "explore";

export function arenaTabFromPath(pathname: string): ArenaShellTab {
  if (pathname.startsWith("/arena/explore")) return "explore";
  return "recommend";
}

export function arenaPathForTab(tab: ArenaShellTab): string {
  if (tab === "explore") return arenaExplorePath();
  return arenaHomePath();
}

/** Location state when opening a mission so Back can return to the entry surface. */
export type ArenaMissionLocationState = {
  from?: string;
};

const MISSION_BACK_KEY = "lunar.arena.missionBack:";

function isSafeArenaBack(path: string, missionId: string): boolean {
  if (!path.startsWith("/arena")) return false;
  if (path === arenaMissionPath(missionId) || path.startsWith(`${arenaMissionPath(missionId)}/`)) {
    return false;
  }
  return true;
}

/** Remember where the learner opened this mission from. */
export function rememberArenaMissionBack(missionId: string, from: string | undefined): void {
  if (!from || !isSafeArenaBack(from, missionId)) return;
  try {
    sessionStorage.setItem(`${MISSION_BACK_KEY}${missionId}`, from);
  } catch {
    /* private mode / quota */
  }
}

/** Resolve Back target for a mission: stored entry path, else Recommended. */
export function resolveArenaMissionBack(
  missionId: string,
  fallback: string = arenaHomePath(),
): string {
  try {
    const stored = sessionStorage.getItem(`${MISSION_BACK_KEY}${missionId}`);
    if (stored && isSafeArenaBack(stored, missionId)) return stored;
  } catch {
    /* ignore */
  }
  return fallback;
}

export function arenaMissionLinkState(from: string): ArenaMissionLocationState {
  return { from };
}
