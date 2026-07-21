import type { ComponentType, LazyExoticComponent } from "react";

import type { User } from "@/lib/api";

/** Props passed to every custom Space module page. */
export type SpaceModulePageProps = {
  user: User;
  course: SpaceCourseDefinition;
  module: SpaceModuleDefinition;
};

/** Listing metadata for a module row on the course page. */
export type SpaceModuleMeta = {
  id: string;
  title: string;
  titleTh: string;
  description: string;
  accent: string;
  icon: string;
};

/**
 * Custom React module — each teammate owns a full page component.
 * Register it on a course with one import line.
 */
export type SpaceModuleDefinition = SpaceModuleMeta & {
  /** Lazy-loaded page component for this module. */
  Component: LazyExoticComponent<ComponentType<SpaceModulePageProps>>;
};

/** Course catalog entry (Home / Course overview). */
export type SpaceCourseDefinition = {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  /** Ordered module definitions for this course. */
  modules: SpaceModuleDefinition[];
};
