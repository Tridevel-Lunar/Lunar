import type { SpaceModulePageProps } from "@/components/space/core/types";

import AnatomyLesson from "./AnatomyLesson";

/** Anatomy of CubeSat — interactive 3D module page. */
export default function AnatomyModule({ course }: SpaceModulePageProps) {
  return <AnatomyLesson courseId={course.id} />;
}
