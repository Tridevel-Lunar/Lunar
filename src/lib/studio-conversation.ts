import type {
  StudioBranchMap,
  StudioConversation,
  StudioConversationMessage,
} from "@/lib/api";
import type { ChatNode, CollectionEntry, ConversationTree, LaikaIntent } from "@/components/studio/data/studio-data";

/** Map Studio conversation API responses to chat UI types. */

export type StudioChatSession = {
  collectionId: string;
  type: CollectionEntry["type"];
  title: string;
  content: string;
  laikaIntent?: LaikaIntent;
  createdAt: string;
  updatedAt: string;
  atUserNodeId: string;
  messages: ChatNode[];
  userSpotsById: Record<
    string,
    {
      siblingIndex: number;
      siblingCount: number;
      siblingIds: string[];
      canCreateBranch: boolean;
    }
  >;
  hasLaika: boolean;
  laikaStreaming?: boolean;
  streamingNodeId?: string;
};

function toChatNode(message: StudioConversationMessage): ChatNode {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    createdAt: message.created_at,
    updatedAt: message.updated_at ?? undefined,
    parentId: message.parent_id ?? undefined,
    laikaIntent: message.laika_intent as LaikaIntent | undefined,
  };
}

export function conversationToSession(
  conversation: StudioConversation,
  extras?: Pick<StudioChatSession, "laikaStreaming" | "streamingNodeId">,
): StudioChatSession {
  const userSpotsById: StudioChatSession["userSpotsById"] = {};
  for (const spot of conversation.user_spots) {
    userSpotsById[spot.user_node_id] = {
      siblingIndex: spot.sibling_index,
      siblingCount: spot.sibling_count,
      siblingIds: spot.sibling_ids,
      canCreateBranch: spot.can_create_branch,
    };
  }

  return {
    collectionId: conversation.collection_id,
    type: conversation.type,
    title: conversation.title,
    content: conversation.content,
    laikaIntent: conversation.laika_intent as LaikaIntent | undefined,
    createdAt: conversation.created_at,
    updatedAt: conversation.updated_at,
    atUserNodeId: conversation.at_user_node_id,
    messages: conversation.messages.map(toChatNode),
    userSpotsById,
    hasLaika: conversation.has_laika,
    laikaStreaming: extras?.laikaStreaming,
    streamingNodeId: extras?.streamingNodeId,
  };
}

/** Minimal path-only tree for composer context estimates and mutation helpers. */
export function pathMessagesToTree(messages: ChatNode[]): ConversationTree {
  const nodes: Record<string, ChatNode> = {};
  const selectedChildByParent: Record<string, string> = {};
  const rootIds: string[] = [];

  for (const node of messages) {
    nodes[node.id] = node;
    if (!node.parentId && node.role === "user") {
      rootIds.push(node.id);
    }
  }

  for (let i = 0; i < messages.length - 1; i += 1) {
    selectedChildByParent[messages[i].id] = messages[i + 1].id;
  }

  const firstUser = messages.find((m) => m.role === "user");
  if (firstUser) {
    selectedChildByParent.__root__ = firstUser.id;
  }

  return { nodes, rootIds, selectedChildByParent };
}

export function sessionToComposerEntry(session: StudioChatSession): CollectionEntry {
  return {
    id: session.collectionId,
    type: session.type,
    title: session.title,
    content: session.content,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    tree: pathMessagesToTree(session.messages),
    laikaIntent: session.laikaIntent,
    laikaStreaming: session.laikaStreaming,
    streamingNodeId: session.streamingNodeId,
  };
}

export function branchMapToGraphInput(map: StudioBranchMap) {
  const userNodes: ChatNode[] = map.user_nodes.map((n) => ({
    id: n.id,
    role: "user" as const,
    content: n.label,
    createdAt: n.created_at,
    updatedAt: n.updated_at ?? undefined,
  }));
  const edges = map.edges.map((e) => ({ from: e.from_id, to: e.to_id }));
  return {
    userNodes,
    edges,
    activeUserNodeIds: new Set(map.active_user_node_ids),
    activeEdgeKeys: new Set(map.active_edge_keys),
  };
}
