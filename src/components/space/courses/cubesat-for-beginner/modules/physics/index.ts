import { lazy } from "react";

import type { SpaceModuleDefinition } from "@/components/space/core/types";

export const physicsModule: SpaceModuleDefinition = {
  id: "physics",
  title: "PHYSICS FOR SPACE",
  titleTh: "ฟิสิกส์ในอวกาศ",
  description: "เรียนพื้นฐานฟิสิกส์ที่เกี่ยวข้องกับการทำงานของดาวเทียมในวงโคจร",
  accent: "#a78bfa",
  icon: "physics",
  Component: lazy(() => import("./PhysicsModule")),
};
