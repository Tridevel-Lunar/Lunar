import { lazy } from "react";

import type { SpaceModuleDefinition } from "@/components/space/core/types";

export const programmingModule: SpaceModuleDefinition = {
  id: "programming",
  title: "PROGRAMMING FOR CUBESAT",
  titleTh: "การเขียนโปรแกรม",
  description: "เรียนการเขียนโปรแกรมแบบบล็อก เพื่อสั่งให้ดาวเทียมทำงาน",
  accent: "#ffab00",
  icon: "programming",
  Component: lazy(() => import("../PlaceholderModule")),
};
