import type { SpaceCourseDefinition } from "@/components/space/core/types";

import { anatomyModule } from "./modules/anatomy";
import { overviewModule } from "./modules/overview";
import { physicsModule } from "./modules/physics";
import { programmingModule } from "./modules/programming";

/**
 * CubeSat for Beginner — register modules in display order.
 * Teammates: add one import + one entry in `modules` below.
 */
export const cubesatForBeginnerCourse: SpaceCourseDefinition = {
  id: "cubesat-for-beginner",
  tag: "CUBESAT FOR BEGINNER",
  title: "CUBESAT FOR BEGINNER",
  subtitle: "พื้นฐานดาวเทียม",
  description: "เรียนรู้ส่วนประกอบและการทำงานของดาวเทียม CubeSat",
  modules: [overviewModule, anatomyModule, physicsModule, programmingModule],
};
