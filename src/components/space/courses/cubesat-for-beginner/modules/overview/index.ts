import { lazy } from "react";

import type { SpaceModuleDefinition } from "@/components/space/core/types";

export const overviewModule: SpaceModuleDefinition = {
  id: "overview",
  title: "OVERVIEW OF SATELLITE",
  titleTh: "ภาพรวมดาวเทียม",
  description: "เรียนรู้แนวคิดพื้นฐานของดาวเทียมและบทบาทในชีวิตประจำวัน",
  accent: "#00e5ff",
  icon: "overview",
  Component: lazy(() => import("./OverviewModule")),
};
