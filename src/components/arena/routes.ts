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
