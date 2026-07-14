import type { ChatNode, ConversationTree, LaikaIntent } from "@/components/studio/data/studio-data";

/**
 * Conversation tree model for Studio LAIKA chat.
 * Powers chat rendering, sibling pager, and branch map.
 */

export const ROOT_PARENT_KEY = "__root__";

export type UserBranchEdge = {
  from: string;
  to: string;
};

export type UserBranchGraph = {
  userNodes: ChatNode[];
  edges: UserBranchEdge[];
};

export type LayoutNode = {
  id: string;
  x: number;
  y: number;
  depth: number;
  label: string;
  createdAt: string;
};

export type UserBranchLayout = {
  nodes: LayoutNode[];
  edges: UserBranchEdge[];
  width: number;
  height: number;
};

export const NODE_WIDTH = 160;
export const NODE_HEIGHT = 44;

const COLUMN_GAP = 220;
const ROW_GAP = 76;
const NODE_GAP = 12;

// --- Tree lookup ---

export function getNode(tree: ConversationTree, id: string): ChatNode | undefined {
  return tree.nodes[id];
}

export function getChildren(tree: ConversationTree, parentId: string): ChatNode[] {
  return Object.values(tree.nodes)
    .filter((node) => node.parentId === parentId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

// --- Active path ---

/** Walk `selectedChildByParent` from root to the current leaf (user and assistant nodes). */
export function buildActivePath(tree: ConversationTree): ChatNode[] {
  const path: ChatNode[] = [];
  const rootId =
    tree.selectedChildByParent[ROOT_PARENT_KEY] ??
    tree.rootIds.find((id) => getNode(tree, id)?.role === "user") ??
    tree.rootIds[0];
  if (!rootId) return path;

  let current: ChatNode | undefined = getNode(tree, rootId);
  while (current) {
    path.push(current);
    const nextId = tree.selectedChildByParent[current.id];
    if (nextId) {
      current = getNode(tree, nextId);
      continue;
    }
    const children = getChildren(tree, current.id);
    current = children[0];
  }
  return path;
}

export function getActiveUserPath(tree: ConversationTree): ChatNode[] {
  return buildActivePath(tree).filter((n) => n.role === "user");
}

export function getActiveLeaf(tree: ConversationTree): ChatNode | undefined {
  const path = buildActivePath(tree);
  return path.at(-1);
}

export function hasLaikaInTree(tree: ConversationTree): boolean {
  return Object.values(tree.nodes).some(
    (n) => n.role === "assistant" && n.content.trim().length > 0,
  );
}

// --- Branch map ---

export function buildUserBranchGraph(tree: ConversationTree): UserBranchGraph {
  const userNodes = Object.values(tree.nodes)
    .filter((n) => n.role === "user")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const edges: UserBranchEdge[] = [];
  for (const user of userNodes) {
    const assistants = getChildren(tree, user.id).filter((n) => n.role === "assistant");
    for (const assistant of assistants) {
      const nextUsers = getChildren(tree, assistant.id).filter((n) => n.role === "user");
      for (const nextUser of nextUsers) {
        edges.push({ from: user.id, to: nextUser.id });
      }
    }
  }

  return { userNodes, edges };
}

export function getActiveBranchUserEdgeIds(tree: ConversationTree): Set<string> {
  const activeUsers = getActiveUserPath(tree);
  const ids = new Set<string>();
  for (let i = 0; i < activeUsers.length - 1; i += 1) {
    ids.add(`${activeUsers[i].id}->${activeUsers[i + 1].id}`);
  }
  return ids;
}

export function getActiveBranchUserNodeIds(tree: ConversationTree): Set<string> {
  return new Set(getActiveUserPath(tree).map((n) => n.id));
}

export function layoutUserBranchMap(graph: UserBranchGraph): UserBranchLayout {
  const nodeById = new Map(graph.userNodes.map((n) => [n.id, n]));
  const childrenByParent = new Map<string, string[]>();

  for (const edge of graph.edges) {
    const list = childrenByParent.get(edge.from) ?? [];
    if (!list.includes(edge.to)) list.push(edge.to);
    childrenByParent.set(edge.from, list);
  }

  for (const children of childrenByParent.values()) {
    children.sort((a, b) =>
      (nodeById.get(a)?.createdAt ?? "").localeCompare(nodeById.get(b)?.createdAt ?? ""),
    );
  }

  const depths = new Map<string, number>();
  const roots = graph.userNodes
    .filter((n) => !graph.edges.some((e) => e.to === n.id))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  if (roots.length === 0 && graph.userNodes.length > 0) {
    roots.push(graph.userNodes[0]);
  }

  const depthQueue: { id: string; depth: number }[] = roots.map((r) => ({
    id: r.id,
    depth: 0,
  }));
  while (depthQueue.length > 0) {
    const { id, depth } = depthQueue.shift()!;
    if (depths.has(id)) continue;
    depths.set(id, depth);
    for (const childId of childrenByParent.get(id) ?? []) {
      depthQueue.push({ id: childId, depth: depth + 1 });
    }
  }

  for (const node of graph.userNodes) {
    if (!depths.has(node.id)) depths.set(node.id, 0);
  }

  const positions = new Map<string, { x: number; y: number }>();
  let nextLeafY = 0;

  function layoutSubtree(nodeId: string): { top: number; bottom: number } {
    const depth = depths.get(nodeId) ?? 0;
    const x = depth * COLUMN_GAP;
    const children = childrenByParent.get(nodeId) ?? [];

    if (children.length === 0) {
      const y = nextLeafY;
      nextLeafY += ROW_GAP;
      positions.set(nodeId, { x, y });
      const bottom = y + NODE_HEIGHT;
      return { top: y, bottom };
    }

    const childBounds = children.map((childId) => layoutSubtree(childId));
    const top = Math.min(...childBounds.map((b) => b.top));
    const bottom = Math.max(...childBounds.map((b) => b.bottom));
    const y = (top + bottom - NODE_HEIGHT) / 2;

    positions.set(nodeId, { x, y });
    return {
      top: Math.min(top, y),
      bottom: Math.max(bottom, y + NODE_HEIGHT),
    };
  }

  for (let i = 0; i < roots.length; i += 1) {
    layoutSubtree(roots[i].id);
    if (i < roots.length - 1) nextLeafY += ROW_GAP / 2;
  }

  for (const node of graph.userNodes) {
    if (positions.has(node.id)) continue;
    const depth = depths.get(node.id) ?? 0;
    positions.set(node.id, { x: depth * COLUMN_GAP, y: nextLeafY });
    nextLeafY += ROW_GAP;
  }

  resolveLayoutOverlaps(positions, depths, childrenByParent, graph.userNodes.map((n) => n.id));

  const layoutNodes: LayoutNode[] = graph.userNodes.map((node) => {
    const pos = positions.get(node.id) ?? { x: 0, y: 0 };
    const depth = depths.get(node.id) ?? 0;
    const label =
      node.content.trim().length > 48
        ? `${node.content.trim().slice(0, 45)}…`
        : node.content.trim();
    return {
      id: node.id,
      x: pos.x,
      y: pos.y,
      depth,
      label: label || "(ว่าง)",
      createdAt: node.createdAt,
    };
  });

  const maxX = Math.max(...layoutNodes.map((n) => n.x), 0);
  const maxY = Math.max(...layoutNodes.map((n) => n.y), 0);

  return {
    nodes: layoutNodes,
    edges: graph.edges,
    width: maxX + NODE_WIDTH + 40,
    height: maxY + NODE_HEIGHT + 40,
  };
}

function resolveLayoutOverlaps(
  positions: Map<string, { x: number; y: number }>,
  depths: Map<string, number>,
  childrenByParent: Map<string, string[]>,
  nodeIds: string[],
): void {
  const byDepth = new Map<number, string[]>();
  for (const id of nodeIds) {
    const depth = depths.get(id) ?? 0;
    const list = byDepth.get(depth) ?? [];
    list.push(id);
    byDepth.set(depth, list);
  }

  const minStep = NODE_HEIGHT + NODE_GAP;

  for (const ids of byDepth.values()) {
    ids.sort((a, b) => (positions.get(a)?.y ?? 0) - (positions.get(b)?.y ?? 0));

    for (let i = 1; i < ids.length; i += 1) {
      const prev = positions.get(ids[i - 1]);
      const curr = positions.get(ids[i]);
      if (!prev || !curr) continue;

      const minY = prev.y + minStep;
      if (curr.y < minY) {
        shiftSubtreeY(ids[i], minY - curr.y, positions, childrenByParent);
      }
    }
  }
}

function shiftSubtreeY(
  rootId: string,
  delta: number,
  positions: Map<string, { x: number; y: number }>,
  childrenByParent: Map<string, string[]>,
): void {
  const queue = [rootId];
  while (queue.length > 0) {
    const id = queue.shift()!;
    const pos = positions.get(id);
    if (pos) positions.set(id, { ...pos, y: pos.y + delta });
    for (const childId of childrenByParent.get(id) ?? []) {
      queue.push(childId);
    }
  }
}

// --- Helpers ---

export function defaultIntentForEntry(
  type: "note" | "idea" | "learn",
  laikaIntent?: LaikaIntent,
): LaikaIntent {
  if (type === "learn") return laikaIntent ?? "ask-anything";
  return laikaIntent ?? (type === "idea" ? "analyze" : "explain");
}
