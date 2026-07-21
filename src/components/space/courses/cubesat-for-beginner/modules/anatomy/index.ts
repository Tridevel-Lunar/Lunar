import { lazy } from "react";

import type { SpaceModuleDefinition } from "@/components/space/core/types";

export const anatomyModule: SpaceModuleDefinition = {
  id: "anatomy",
  title: "ANATOMY OF CUBESAT",
  titleTh: "โครงสร้าง CubeSat",
  description: "ศึกษาส่วนประกอบต่าง ๆ ของ CubeSat และการทำงานร่วมกันของแต่ละระบบ",
  accent: "#7dd3fc",
  icon: "anatomy",
  Component: lazy(() => import("./AnatomyModule")),
};
