import type { SpaceModulePageProps } from "@/components/space/core/types";

import OrbitOverviewLesson from "./OrbitOverviewLesson";

/** Overview of Satellite — orbit simulation module page. */
export default function OverviewModule({ course }: SpaceModulePageProps) {
  return <OrbitOverviewLesson courseId={course.id} />;
}
