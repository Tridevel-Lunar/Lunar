/** Space Technology catalog types — mirrors backend `space_catalog` schemas. */

export type CatalogCourseStatus = "published" | "coming_soon" | "later";

export type CatalogOutlineItem = {
  id: string;
  title: string;
  summary: string;
};

export type CatalogCourse = {
  kind: "course";
  id: string;
  title: string;
  titleTh: string;
  summary: string;
  status: CatalogCourseStatus;
  level: string;
  tags: string[];
  teaches: string[];
  audience: string;
  intentHints: string[];
  prerequisites: string[];
  relatedCourseIds: string[];
  recommendWhen: string[];
  doNotConfuseWith: string[];
  arenaHooks: string[];
  outline: CatalogOutlineItem[] | null;
};

export type CatalogFolder = {
  kind: "folder";
  id: string;
  title: string;
  titleTh: string;
  summary: string;
  children: CatalogNode[];
};

export type CatalogNode = CatalogFolder | CatalogCourse;

export type SpaceCatalog = {
  domainId: string;
  title: string;
  titleTh: string;
  summary: string;
  nodes: CatalogNode[];
};

export function isCatalogFolder(node: CatalogNode): node is CatalogFolder {
  return node.kind === "folder";
}

export function isCatalogCourse(node: CatalogNode): node is CatalogCourse {
  return node.kind === "course";
}

export function isEnterable(course: CatalogCourse): boolean {
  return course.status === "published";
}

export function findCourse(
  nodes: CatalogNode[],
  courseId: string,
): CatalogCourse | undefined {
  for (const node of nodes) {
    if (isCatalogCourse(node) && node.id === courseId) return node;
    if (isCatalogFolder(node)) {
      const found = findCourse(node.children, courseId);
      if (found) return found;
    }
  }
  return undefined;
}

export function findNode(
  nodes: CatalogNode[],
  nodeId: string,
): CatalogNode | undefined {
  for (const node of nodes) {
    if (node.id === nodeId) return node;
    if (isCatalogFolder(node)) {
      const found = findNode(node.children, nodeId);
      if (found) return found;
    }
  }
  return undefined;
}

/** Breadcrumb of folder nodes from root to the parent of `nodeId` (or to the folder itself). */
export function breadcrumbTo(
  nodes: CatalogNode[],
  nodeId: string,
  trail: CatalogFolder[] = [],
): CatalogFolder[] | null {
  for (const node of nodes) {
    if (node.id === nodeId) {
      return isCatalogFolder(node) ? [...trail, node] : trail;
    }
    if (isCatalogFolder(node)) {
      const found = breadcrumbTo(node.children, nodeId, [...trail, node]);
      if (found) return found;
    }
  }
  return null;
}

export function statusLabel(status: CatalogCourseStatus): string {
  switch (status) {
    case "published":
      return "พร้อมเรียน";
    case "coming_soon":
      return "เร็ว ๆ นี้";
    case "later":
      return "แผนในอนาคต";
  }
}
