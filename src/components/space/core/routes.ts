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

/** Location state when opening a course so Back can return to the entry surface. */
export type SpaceCourseLocationState = {
  from?: string;
};

const COURSE_BACK_KEY = "lunar.space.courseBack:";

function isSafeSpaceBack(path: string, courseId: string): boolean {
  if (!path.startsWith("/space")) return false;
  // Don't bounce back into the same course overview/module tree.
  if (path === spaceCoursePath(courseId) || path.startsWith(`${spaceCoursePath(courseId)}/`)) {
    return false;
  }
  return true;
}

/** Remember where the learner opened this course from (survives module navigation). */
export function rememberSpaceCourseBack(courseId: string, from: string | undefined): void {
  if (!from || !isSafeSpaceBack(from, courseId)) return;
  try {
    sessionStorage.setItem(`${COURSE_BACK_KEY}${courseId}`, from);
  } catch {
    /* private mode / quota */
  }
}

/** Resolve Back target for a course overview: stored entry path, else fallback. */
export function resolveSpaceCourseBack(
  courseId: string,
  fallback: string = spaceExplorePath(),
): string {
  try {
    const stored = sessionStorage.getItem(`${COURSE_BACK_KEY}${courseId}`);
    if (stored && isSafeSpaceBack(stored, courseId)) return stored;
  } catch {
    /* ignore */
  }
  return fallback;
}

export function spaceCourseLinkState(from: string): SpaceCourseLocationState {
  return { from };
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
