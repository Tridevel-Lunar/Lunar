import type { LearningPathStep, PathEdge } from "@/lib/api";

export const PATH_NODE_WIDTH = 280;
export const PATH_NODE_HEIGHT = 124;
export const PATH_COLUMN_GAP = 380;
export const PATH_ROW_GAP = 164;
export const PATH_PAD = 28;

export type PathLayoutNode = {
  id: string;
  x: number;
  y: number;
  step: LearningPathStep;
};

export type PathMapLayout = {
  nodes: PathLayoutNode[];
  edges: PathEdge[];
  width: number;
  height: number;
};

function uniqueEdges(edges: PathEdge[]): PathEdge[] {
  const seen = new Set<string>();
  const out: PathEdge[] = [];
  for (const edge of edges) {
    if (edge.from === edge.to) continue;
    const key = `${edge.from}->${edge.to}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(edge);
  }
  return out;
}

/** Use LAIKA edges when present; otherwise chain steps left-to-right. */
export function resolvePathEdges(steps: LearningPathStep[], edges?: PathEdge[]): PathEdge[] {
  const ids = new Set(steps.map((s) => s.courseId));
  const fromModel = uniqueEdges(
    (edges ?? []).filter((e) => ids.has(e.from) && ids.has(e.to)),
  );
  if (fromModel.length > 0) return fromModel;
  return steps.slice(1).map((_, i) => ({
    from: steps[i].courseId,
    to: steps[i + 1].courseId,
  }));
}

function rankNodes(ids: string[], edges: PathEdge[]): Map<string, number> {
  const children = new Map<string, string[]>();
  const indeg = new Map<string, number>(ids.map((id) => [id, 0]));
  for (const edge of edges) {
    const list = children.get(edge.from) ?? [];
    list.push(edge.to);
    children.set(edge.from, list);
    indeg.set(edge.to, (indeg.get(edge.to) ?? 0) + 1);
  }

  const rank = new Map<string, number>(ids.map((id) => [id, 0]));
  const queue = ids.filter((id) => (indeg.get(id) ?? 0) === 0);
  const remaining = new Map(indeg);

  while (queue.length > 0) {
    const node = queue.shift()!;
    for (const child of children.get(node) ?? []) {
      rank.set(child, Math.max(rank.get(child) ?? 0, (rank.get(node) ?? 0) + 1));
      const next = (remaining.get(child) ?? 1) - 1;
      remaining.set(child, next);
      if (next === 0) queue.push(child);
    }
  }

  return rank;
}

export function layoutPathMap(steps: LearningPathStep[], edges?: PathEdge[]): PathMapLayout {
  const resolved = resolvePathEdges(steps, edges);
  const ids = steps.map((s) => s.courseId);
  const ranks = rankNodes(ids, resolved);
  const columns = new Map<number, string[]>();

  for (const id of ids) {
    const rank = ranks.get(id) ?? 0;
    const col = columns.get(rank) ?? [];
    col.push(id);
    columns.set(rank, col);
  }

  const maxCol = Math.max(0, ...columns.keys());
  const maxCount = Math.max(1, ...[...columns.values()].map((col) => col.length));
  const maxColHeight = (maxCount - 1) * PATH_ROW_GAP;
  const stepById = new Map(steps.map((s) => [s.courseId, s]));
  const nodes: PathLayoutNode[] = [];

  for (let rank = 0; rank <= maxCol; rank += 1) {
    const col = columns.get(rank) ?? [];
    const colHeight = Math.max(0, (col.length - 1) * PATH_ROW_GAP);
    const offsetY = (maxColHeight - colHeight) / 2;
    col.forEach((id, index) => {
      const step = stepById.get(id);
      if (!step) return;
      nodes.push({
        id,
        x: PATH_PAD + rank * PATH_COLUMN_GAP,
        y: PATH_PAD + offsetY + index * PATH_ROW_GAP,
        step,
      });
    });
  }

  const width =
    nodes.length === 0
      ? PATH_PAD * 2
      : Math.max(...nodes.map((n) => n.x)) + PATH_NODE_WIDTH + PATH_PAD;
  const height =
    nodes.length === 0
      ? PATH_PAD * 2
      : Math.max(...nodes.map((n) => n.y)) + PATH_NODE_HEIGHT + PATH_PAD;

  return { nodes, edges: resolved, width, height };
}

/** Horizontal run left for the arrowhead so the stroke meets the arrow base. */
export const PATH_ARROW_LEN = 11;
/** Vertical size of the arrowhead (taller than length for a clearer tip). */
export const PATH_ARROW_H = 16;

export function connectorPath(
  from: { x: number; y: number },
  to: { x: number; y: number },
): string {
  const x1 = from.x + PATH_NODE_WIDTH;
  const y1 = from.y + PATH_NODE_HEIGHT / 2;
  // Stroke ends at the back/center of the arrow; tip reaches the target card edge.
  const x2 = to.x - PATH_ARROW_LEN;
  const y2 = to.y + PATH_NODE_HEIGHT / 2;
  const midX = x1 + (x2 - x1) * 0.5;
  return `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
}
