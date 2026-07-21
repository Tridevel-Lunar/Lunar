import { cubesatForBeginnerCourse } from "../courses/cubesat-for-beginner/course";
import type { SpaceCourseDefinition, SpaceModuleDefinition } from "./types";

/** Explicit course list — add a new course with one import + one array entry. */
const COURSES: SpaceCourseDefinition[] = [cubesatForBeginnerCourse];

const COURSE_MAP = new Map(COURSES.map((c) => [c.id, c]));

export function listCourses(): SpaceCourseDefinition[] {
  return COURSES;
}

export function getCourse(courseId: string): SpaceCourseDefinition | undefined {
  return COURSE_MAP.get(courseId);
}

export function getModule(
  courseId: string,
  moduleId: string,
): SpaceModuleDefinition | undefined {
  return getCourse(courseId)?.modules.find((m) => m.id === moduleId);
}

export function getCourseModules(courseId: string): SpaceModuleDefinition[] {
  return getCourse(courseId)?.modules ?? [];
}
