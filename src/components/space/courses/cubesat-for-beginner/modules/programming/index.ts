import { lazy } from "react";

import type { SpaceModuleDefinition } from "@/components/space/core/types";

export const programmingModule: SpaceModuleDefinition = {
  id: "programming",
  title: "PROGRAMMING FOR CUBESAT",
  titleTh: "การเขียนโปรแกรม",
  description:
    "เรียนรู้แนวคิดแดด/eclipse และฝึกสั่งงานดาวเทียมด้วยบล็อกใน Arena",
  accent: "#ffab00",
  icon: "programming",
  Component: lazy(() => import("./ProgrammingModule")),
};
