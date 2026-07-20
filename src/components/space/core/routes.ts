/** Canonical Space route builders — use these instead of string interpolation. */

export function spaceHomePath(): string {
  return "/space";
}

export function spaceCoursePath(courseId: string): string {
  return `/space/course/${courseId}`;
}

export function spaceModulePath(courseId: string, moduleId: string): string {
  return `/space/course/${courseId}/module/${moduleId}`;
}
