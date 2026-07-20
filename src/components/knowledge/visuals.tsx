import { lazy, type ComponentType, type LazyExoticComponent } from "react";

export type KnowledgeVisualProps = {
  entryId: string;
};

const KNOWLEDGE_VISUALS: Record<string, LazyExoticComponent<ComponentType<KnowledgeVisualProps>>> = {
  "axes-3d": lazy(() => import("./visuals/AxesVisual")),
};

export function getKnowledgeVisual(
  key: string,
): LazyExoticComponent<ComponentType<KnowledgeVisualProps>> | undefined {
  return KNOWLEDGE_VISUALS[key];
}
