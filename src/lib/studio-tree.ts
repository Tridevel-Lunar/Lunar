import type { LaikaChatMessage, LaikaSource } from "@/lib/api";
import type { ChatNode, ConversationTree, LaikaIntent } from "@/components/studio/data/studio-data";

/**
 * Conversation tree model for Studio LAIKA chat.
 *
 * Shape: user → assistant → user → … with `selectedChildByParent` choosing the active
 * branch at each fork. Powers chat rendering, LAIKA history, sibling pager, and branch map.
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
};

export type UserBranchLayout = {
  nodes: LayoutNode[];
  edges: UserBranchEdge[];
  width: number;
  height: number;
};

const COLUMN_GAP = 220;
const ROW_GAP = 76;
const NODE_WIDTH = 160;
const NODE_HEIGHT = 44;
const NODE_GAP = 12;

// --- Tree construction & lookup ---

export function parentKey(parentId: string | undefined): string {
  return parentId ?? ROOT_PARENT_KEY;
}

export function createNode(
  partial: Omit<ChatNode, "id" | "createdAt"> & { id?: string; createdAt?: string },
): ChatNode {
  return {
    id: partial.id ?? crypto.randomUUID(),
    createdAt: partial.createdAt ?? new Date().toISOString(),
    role: partial.role,
    content: partial.content,
    parentId: partial.parentId,
    laikaIntent: partial.laikaIntent,
    laikaSources: partial.laikaSources,
  };
}

export function createEmptyTree(rootContent: string, createdAt?: string): ConversationTree {
  const root = createNode({
    role: "user",
    content: rootContent,
    createdAt,
  });
  return {
    nodes: { [root.id]: root },
    rootIds: [root.id],
    selectedChildByParent: {},
  };
}

export function getNode(tree: ConversationTree, id: string): ChatNode | undefined {
  return tree.nodes[id];
}

export function getChildren(tree: ConversationTree, parentId: string): ChatNode[] {
  return Object.values(tree.nodes)
    .filter((node) => node.parentId === parentId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/** Root user nodes mirror collection `content` — branching from them is not allowed. */
export function canCreateBranchFromUserNode(tree: ConversationTree, nodeId: string): boolean {
  const node = getNode(tree, nodeId);
  if (!node || node.role !== "user") return false;
  return node.parentId !== undefined;
}

export function getUserSiblings(tree: ConversationTree, nodeId: string): ChatNode[] {
  const node = getNode(tree, nodeId);
  if (!node || node.role !== "user") return [];
  const key = parentKey(node.parentId);
  if (key === ROOT_PARENT_KEY) {
    return tree.rootIds
      .map((id) => getNode(tree, id))
      .filter((n): n is ChatNode => n?.role === "user")
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }
  return getChildren(tree, node.parentId!).filter((n) => n.role === "user");
}

// --- Active path (selected branch) ---

export function getSelectedChild(tree: ConversationTree, parentId: string): ChatNode | undefined {
  const selectedId = tree.selectedChildByParent[parentId];
  if (!selectedId) {
    const children = getChildren(tree, parentId);
    return children[0];
  }
  return getNode(tree, selectedId);
}

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

export function getActiveUserLeaf(tree: ConversationTree): ChatNode | undefined {
  return getActiveUserPath(tree).at(-1);
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

export function pruneInvalidSelections(tree: ConversationTree): ConversationTree {
  const selectedChildByParent = { ...tree.selectedChildByParent };
  for (const [parentId, childId] of Object.entries(selectedChildByParent)) {
    const child = getNode(tree, childId);
    const validParent = parentId === ROOT_PARENT_KEY ? undefined : parentId;
    if (!child || child.parentId !== validParent) {
      delete selectedChildByParent[parentId];
    }
  }
  return { ...tree, selectedChildByParent };
}

/** Switch to a sibling user variant at the same tree level (pager prev/next). */
export function selectSibling(
  tree: ConversationTree,
  parentId: string | undefined,
  siblingId: string,
): ConversationTree {
  const key = parentKey(parentId);
  const siblings = parentId
    ? getChildren(tree, parentId).filter((n) => n.role === "user")
    : getUserSiblings(tree, siblingId);

  if (!siblings.some((s) => s.id === siblingId)) return tree;

  const next: ConversationTree = {
    ...tree,
    selectedChildByParent: { ...tree.selectedChildByParent, [key]: siblingId },
  };
  if (!parentId) {
    next.rootIds = [
      siblingId,
      ...tree.rootIds.filter((id) => id !== siblingId),
    ];
  }
  return pruneInvalidSelections(next);
}

/** Rewire `selectedChildByParent` so the path root → target user is active (branch map click). */
export function selectPathToNode(tree: ConversationTree, targetNodeId: string): ConversationTree {
  const target = getNode(tree, targetNodeId);
  if (!target || target.role !== "user") return tree;

  const chain: ChatNode[] = [];
  let current: ChatNode | undefined = target;
  while (current) {
    chain.unshift(current);
    current = current.parentId ? getNode(tree, current.parentId) : undefined;
    if (current?.role === "assistant" && current.parentId) {
      current = getNode(tree, current.parentId);
    } else if (current?.role === "assistant") {
      break;
    }
  }

  const selectedChildByParent = { ...tree.selectedChildByParent };
  for (let i = 0; i < chain.length - 1; i += 1) {
    const userNode = chain[i];
    const nextUser = chain[i + 1];
    const assistants = getChildren(tree, userNode.id).filter((n) => n.role === "assistant");
    for (const assistant of assistants) {
      const userChild = getChildren(tree, assistant.id).find((n) => n.id === nextUser.id);
      if (userChild) {
        selectedChildByParent[userNode.id] = assistant.id;
        selectedChildByParent[assistant.id] = nextUser.id;
        break;
      }
    }
  }

  const rootUser = chain[0];
  if (rootUser) {
    selectedChildByParent[ROOT_PARENT_KEY] = rootUser.id;
  }

  return pruneInvalidSelections({
    ...tree,
    selectedChildByParent,
  });
}

// --- Mutations ---

export function addNode(tree: ConversationTree, node: ChatNode): ConversationTree {
  const nodes = { ...tree.nodes, [node.id]: node };
  let rootIds = tree.rootIds;
  if (!node.parentId && node.role === "user" && !rootIds.includes(node.id)) {
    rootIds = [...rootIds, node.id];
  }
  const selectedChildByParent = { ...tree.selectedChildByParent };
  if (node.parentId) {
    selectedChildByParent[node.parentId] = node.id;
  } else if (node.role === "user") {
    selectedChildByParent[ROOT_PARENT_KEY] = node.id;
  }
  return { ...tree, nodes, rootIds, selectedChildByParent };
}

export function updateNode(
  tree: ConversationTree,
  nodeId: string,
  patch: Partial<Pick<ChatNode, "content" | "laikaIntent" | "laikaSources">>,
): ConversationTree {
  const existing = getNode(tree, nodeId);
  if (!existing) return tree;
  return {
    ...tree,
    nodes: {
      ...tree.nodes,
      [nodeId]: { ...existing, ...patch },
    },
  };
}

// --- LAIKA integration ---

export function toLaikaHistory(
  path: ChatNode[],
  upToNodeId?: string,
): LaikaChatMessage[] {
  let nodes = path.filter((n) => n.content.trim().length > 0);
  if (upToNodeId) {
    const idx = nodes.findIndex((n) => n.id === upToNodeId);
    if (idx >= 0) nodes = nodes.slice(0, idx);
  }
  return nodes.map((n) => ({
    role: n.role,
    content: n.content.trim(),
    created_at: n.createdAt,
  }));
}

export function pathToStudioMessages(path: ChatNode[]): ChatNode[] {
  return path;
}

export function getNextUserDepth(tree: ConversationTree, userNodeId: string): number {
  // const userPath = getActiveUserPath(tree);
  const depths = computeUserDepths(tree);
  return (depths.get(userNodeId) ?? 0) + 1;
}

function computeUserDepths(tree: ConversationTree): Map<string, number> {
  const depths = new Map<string, number>();
  const roots = tree.rootIds
    .map((id) => getNode(tree, id))
    .filter((n): n is ChatNode => n?.role === "user");

  const queue: { id: string; depth: number }[] = roots.map((r) => ({
    id: r.id,
    depth: 0,
  }));

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    if (depths.has(id)) continue;
    depths.set(id, depth);

    const assistants = getChildren(tree, id).filter((n) => n.role === "assistant");
    for (const assistant of assistants) {
      const users = getChildren(tree, assistant.id).filter((n) => n.role === "user");
      for (const user of users) {
        queue.push({ id: user.id, depth: depth + 1 });
      }
    }
  }
  return depths;
}

// --- Branch map graph & layout ---

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

/** Full active branch to leaf — for map white path (not truncated at scroll focus). */
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

export function findAssistantParent(
  tree: ConversationTree,
  assistantId: string,
): ChatNode | undefined {
  const assistant = getNode(tree, assistantId);
  if (!assistant?.parentId) return undefined;
  return getNode(tree, assistant.parentId);
}

export function getUserNodeForAssistant(
  tree: ConversationTree,
  assistantId: string,
): ChatNode | undefined {
  const assistant = getNode(tree, assistantId);
  if (!assistant?.parentId) return undefined;
  return getNode(tree, assistant.parentId);
}

/** Chat history nodes strictly before `nodeId` on the path to that node (for retry/edit). */
export function getHistoryBeforeNode(tree: ConversationTree, nodeId: string): ChatNode[] {
  const focused = selectPathToNode(tree, nodeId);
  const path = buildActivePath(focused);
  const idx = path.findIndex((n) => n.id === nodeId);
  if (idx <= 0) return [];
  return path.slice(0, idx);
}

export function defaultIntentForEntry(
  type: "note" | "idea",
  laikaIntent?: LaikaIntent,
): LaikaIntent {
  return laikaIntent ?? (type === "idea" ? "analyze" : "explain");
}

/** Migrate legacy flat `messages[]` entries into a ConversationTree. */
export function migrateMessagesToTree(
  messages: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: string;
    laikaIntent?: LaikaIntent;
    laikaSources?: LaikaSource[];
    parentId?: string;
  }>,
  entryContent: string,
  laikaResponse?: string,
  laikaIntent?: LaikaIntent,
  laikaSources?: LaikaSource[],
): ConversationTree {
  if (messages.length === 0) {
    return createEmptyTree(entryContent);
  }

  const nodes: Record<string, ChatNode> = {};
  const selectedChildByParent: Record<string, string> = {};
  let prevId: string | undefined;

  for (const msg of messages) {
    const node: ChatNode = {
      id: msg.id,
      role: msg.role,
      content: msg.content,
      createdAt: msg.createdAt,
      parentId: prevId,
      laikaIntent: msg.laikaIntent,
      laikaSources: msg.laikaSources,
    };
    nodes[node.id] = node;
    if (prevId) selectedChildByParent[prevId] = node.id;
    prevId = node.id;
  }

  if (laikaResponse?.trim() && !Object.values(nodes).some((n) => n.role === "assistant")) {
    const lastNode = prevId ? nodes[prevId] : undefined;
    const parentId = lastNode?.role === "user" ? lastNode.id : lastNode?.parentId;
    if (parentId) {
      const assistant = createNode({
        role: "assistant",
        content: laikaResponse.trim(),
        parentId,
        laikaIntent,
        laikaSources,
      });
      nodes[assistant.id] = assistant;
      selectedChildByParent[parentId] = assistant.id;
    }
  }

  const rootIds = Object.values(nodes)
    .filter((n) => !n.parentId && n.role === "user")
    .map((n) => n.id);

  const firstRoot = rootIds[0];
  if (firstRoot) selectedChildByParent[ROOT_PARENT_KEY] = firstRoot;

  return pruneInvalidSelections({
    nodes,
    rootIds: rootIds.length > 0 ? rootIds : [messages[0].id],
    selectedChildByParent,
  });
}

export { NODE_WIDTH, NODE_HEIGHT, COLUMN_GAP, ROW_GAP };
