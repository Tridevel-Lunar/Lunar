/** Canonical Space route builders — use these instead of string interpolation. */

export function spaceHomePath(): string {
  return "/space";
}

export function spaceExplorePath(): string {
  return "/space/explore";
}

/** Saved learning-path map tab (not the LAIKA chat session). */
export function spacePathTabPath(): string {
  return "/space/path";
}

/** LAIKA path-planning session (chat + live draft map). */
export function spacePathSessionPath(): string {
  return "/space/path/session";
}

export function spaceCoursePath(courseId: string): string {
  return `/space/course/${courseId}`;
}

export function spaceModulePath(courseId: string, moduleId: string): string {
  return `/space/course/${courseId}/module/${moduleId}`;
}

export type SpaceShellTab = "home" | "path" | "explore";

export function spaceTabFromPath(pathname: string): SpaceShellTab {
  if (pathname.startsWith("/space/explore")) return "explore";
  if (pathname === "/space/path" || pathname.startsWith("/space/path?")) return "path";
  return "home";
}

export function spacePathForTab(tab: SpaceShellTab): string {
  if (tab === "explore") return spaceExplorePath();
  if (tab === "path") return spacePathTabPath();
  return spaceHomePath();
}
