import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  HiOutlineArrowLeft,
} from "react-icons/hi2";
import { IoRocketOutline } from "react-icons/io5";

import ModuleSidebar from "@/components/app/ModuleSidebar";
import BranchMapDialog from "@/components/studio/branch-map/BranchMapDialog";
import ChatDateDivider from "@/components/studio/chat/ChatDateDivider";
import LaikaMarkdown from "@/components/studio/chat/LaikaMarkdown";
import StudioChatComposer from "@/components/studio/chat/StudioChatComposer";
import {
  AssistantMessageActions,
  UserMessageActions,
} from "@/components/studio/chat/MessageActions";
import UserBranchPager from "@/components/studio/chat/UserBranchPager";
import UserMessageTimestamp from "@/components/studio/chat/UserMessageTimestamp";
import {
  type ChatNode,
  type CollectionEntry,
  type LaikaIntent,
} from "@/components/studio/data/studio-data";
import { laikaStatusLabel } from "@/components/studio/data/laika-status";
import LaikaTypingStatus from "@/components/studio/chat/LaikaTypingStatus";
import { LaikaAvatar, TypeBadge } from "@/components/studio/shared/studio-shared";
import { isSameChatCalendarDay } from "@/lib/chat-timestamp";
import {
  ApiError,
  getLaikaHealth,
  getStudioBranchMap,
  getStudioConversation,
  selectStudioBranch,
  shutdownLaikaAssistWs,
  streamLaikaAssist,
  type LaikaHealth,
  type LaikaSource,
  type StudioBranchMap,
  type User,
} from "@/lib/api";
import { getCollection, saveCollection } from "@/lib/studio-storage";
import {
  conversationToSession,
  sessionToComposerEntry,
  type StudioChatSession,
} from "@/lib/studio-conversation";
import { resolveDeepestVisibleUserNodeId, isChatScrolledToBottom, scrollChatToBottom, scrollUserBubbleToTop } from "@/lib/studio-visible-focus";
import {
  addNode,
  buildActivePath,
  createNode,
  defaultIntentForEntry,
  getActiveLeaf,
  getUserNodeForAssistant,
  getHistoryBeforeNode,
  selectSibling,
  toLaikaHistory,
  updateNode,
} from "@/lib/studio-tree";

/**
 * Main Studio chat — conversation tree, LAIKA streaming, branch map, edit/retry/branch actions.
 * Scroll position drives branch-map focus (cyan node); not stored in the tree.
 */

type StudioChatViewProps = {
  user: User;
};

function hasLaikaConversation(session: StudioChatSession): boolean {
  if (session.laikaStreaming) return true;
  return session.hasLaika;
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    /* ignore */
  }
}

export default function StudioChatView({ user }: StudioChatViewProps) {
  const { collectionId } = useParams<{ collectionId: string }>();
  const navigate = useNavigate();
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const entryRef = useRef<CollectionEntry | null>(null);
  const sessionRef = useRef<StudioChatSession | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const streamingTextRef = useRef("");
  const streamingFrameRef = useRef<number | null>(null);
  const stickToBottomRef = useRef(true);

  const [session, setSession] = useState<StudioChatSession | null>(null);
  const [entryLoading, setEntryLoading] = useState(true);
  const [branchMap, setBranchMap] = useState<StudioBranchMap | null>(null);
  const [branchMapLoading, setBranchMapLoading] = useState(false);
  const [branchMapError, setBranchMapError] = useState<string | null>(null);
  const [branchSwitching, setBranchSwitching] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [laikaLoading, setLaikaLoading] = useState(false);
  const [laikaError, setLaikaError] = useState<string | null>(null);
  const [laikaStatus, setLaikaStatus] = useState<string | null>(null);
  const [laikaHealth, setLaikaHealth] = useState<LaikaHealth | null>(null);
  const [branchMapOpen, setBranchMapOpen] = useState(false);
  const [userCompose, setUserCompose] = useState<{
    nodeId: string;
    mode: "edit" | "branch";
  } | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [scrollToUserNodeId, setScrollToUserNodeId] = useState<string | null>(null);
  const [scrollToBottomTick, setScrollToBottomTick] = useState(0);
  const [scrollAfterDoneTick, setScrollAfterDoneTick] = useState(0);
  const [mapFocusUserId, setMapFocusUserId] = useState<string | null>(null);

  const loadConversation = useCallback(async () => {
    if (!collectionId) return;
    setEntryLoading(true);
    try {
      const conversation = await getStudioConversation(collectionId);
      const next = conversationToSession(conversation);
      setSession(next);
      sessionRef.current = next;
      entryRef.current = null;
    } catch {
      navigate("/studio", { replace: true });
    } finally {
      setEntryLoading(false);
    }
  }, [collectionId, navigate]);

  useEffect(() => {
    void loadConversation();
  }, [loadConversation]);

  const loadBranchMap = useCallback(async () => {
    if (!collectionId) return;
    setBranchMapLoading(true);
    setBranchMapError(null);
    try {
      const map = await getStudioBranchMap(collectionId);
      setBranchMap(map);
    } catch {
      setBranchMap(null);
      setBranchMapError("ไม่สามารถโหลดแผนผังได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setBranchMapLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    if (!branchMapOpen) return;
    void loadBranchMap();
  }, [branchMapOpen, loadBranchMap]);

  useEffect(() => {
    getLaikaHealth()
      .then(setLaikaHealth)
      .catch(() => setLaikaHealth(null));
  }, []);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  async function ensureFullEntry(): Promise<CollectionEntry> {
    if (!collectionId) throw new Error("missing collection");
    if (entryRef.current) return entryRef.current;
    const full = await getCollection(collectionId);
    if (!full) throw new Error("collection not found");
    entryRef.current = full;
    return full;
  }

  async function refreshConversation(streaming?: {
    laikaStreaming?: boolean;
    streamingNodeId?: string;
  }) {
    if (!collectionId) return;
    const conversation = await getStudioConversation(collectionId);
    const next = conversationToSession(conversation, streaming);
    setSession(next);
    sessionRef.current = next;
  }

  // Scroll-derived focus for branch map (see studio-visible-focus.ts).
  const updateMapFocusUser = useCallback(() => {
    const container = chatScrollRef.current;
    const current = sessionRef.current;
    if (!container || !current) return;
    const users = current.messages.filter((n) => n.role === "user");
    const id = resolveDeepestVisibleUserNodeId(container, users);
    setMapFocusUserId(id ?? null);
  }, []);

  useEffect(() => {
    const container = chatScrollRef.current;
    if (!container) return;

    let lastScrollTop = container.scrollTop;
    let frame = 0;

    const syncStickToBottom = () => {
      const top = container.scrollTop;
      if (top < lastScrollTop - 1) {
        stickToBottomRef.current = false;
      } else if (isChatScrolledToBottom(container)) {
        stickToBottomRef.current = true;
      } else {
        stickToBottomRef.current = false;
      }
      lastScrollTop = top;
    };

    const scheduleMapFocus = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateMapFocusUser);
    };

    const onScroll = () => {
      syncStickToBottom();
      scheduleMapFocus();
    };

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY < 0) {
        stickToBottomRef.current = false;
      }
    };

    let touchY: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY;
      if (touchY != null && y != null && y > touchY + 4) {
        stickToBottomRef.current = false;
      }
      if (y != null) touchY = y;
    };

    syncStickToBottom();
    scheduleMapFocus();
    container.addEventListener("scroll", onScroll, { passive: true });
    container.addEventListener("wheel", onWheel, { passive: true });
    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchmove", onTouchMove, { passive: true });
    const ro = new ResizeObserver(scheduleMapFocus);
    ro.observe(container);

    return () => {
      cancelAnimationFrame(frame);
      container.removeEventListener("scroll", onScroll);
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      ro.disconnect();
    };
  }, [collectionId, updateMapFocusUser]);

  useEffect(() => {
    if (branchMapOpen) {
      updateMapFocusUser();
    }
  }, [branchMapOpen, updateMapFocusUser, session?.messages]);

  // After branch-map / pager navigation, scroll target bubble to top then refresh focus.
  useLayoutEffect(() => {
    if (!scrollToUserNodeId) return;
    const container = chatScrollRef.current;
    if (!container) return;

    const nodeId = scrollToUserNodeId;
    stickToBottomRef.current = false;
    const frame = requestAnimationFrame(() => {
      const el = container.querySelector(`[data-chat-user-node="${nodeId}"]`);
      if (el instanceof HTMLElement) {
        scrollUserBubbleToTop(container, el);
      }
      setScrollToUserNodeId(null);
      window.setTimeout(updateMapFocusUser, 400);
    });
    return () => cancelAnimationFrame(frame);
  }, [scrollToUserNodeId, session, updateMapFocusUser]);

  // One-shot scroll to bottom after composer send (not during LAIKA stream).
  useLayoutEffect(() => {
    if (scrollToBottomTick === 0) return;
    const container = chatScrollRef.current;
    if (!container) return;
    stickToBottomRef.current = true;
    scrollChatToBottom(container);
    window.setTimeout(updateMapFocusUser, 400);
  }, [scrollToBottomTick, updateMapFocusUser]);

  // Follow LAIKA stream while the user is already at the bottom.
  useLayoutEffect(() => {
    if (!session?.laikaStreaming || !stickToBottomRef.current) return;
    const container = chatScrollRef.current;
    if (!container) return;
    if (!isChatScrolledToBottom(container, 96)) {
      stickToBottomRef.current = false;
      return;
    }
    scrollChatToBottom(container, "auto");
  }, [streamingText, laikaStatus, session?.laikaStreaming]);

  // After stream done — scroll once more when references/footer render (if still at bottom).
  useLayoutEffect(() => {
    if (scrollAfterDoneTick === 0) return;
    const container = chatScrollRef.current;
    if (!container) return;
    const jump = () => scrollChatToBottom(container, "auto");
    jump();
    const frame = requestAnimationFrame(() => {
      jump();
      updateMapFocusUser();
    });
    return () => cancelAnimationFrame(frame);
  }, [scrollAfterDoneTick, updateMapFocusUser]);

  // Open chat / switch collection — jump to latest messages (no smooth follow during stream).
  useLayoutEffect(() => {
    if (!collectionId || session?.collectionId !== collectionId) return;
    const container = chatScrollRef.current;
    if (!container) return;

    stickToBottomRef.current = true;
    const jump = () => scrollChatToBottom(container, "auto");
    jump();
    const frame = requestAnimationFrame(() => {
      jump();
      updateMapFocusUser();
    });
    return () => cancelAnimationFrame(frame);
  }, [collectionId, session?.collectionId, updateMapFocusUser]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      shutdownLaikaAssistWs();
    };
  }, []);

  function scheduleStreamingUi(text: string) {
    streamingTextRef.current = text;
    if (streamingFrameRef.current !== null) return;
    streamingFrameRef.current = requestAnimationFrame(() => {
      streamingFrameRef.current = null;
      setStreamingText(streamingTextRef.current);
    });
  }

  function clearStreamingUi() {
    streamingTextRef.current = "";
    if (streamingFrameRef.current !== null) {
      cancelAnimationFrame(streamingFrameRef.current);
      streamingFrameRef.current = null;
    }
    setStreamingText("");
  }

  function bumpScrollAfterDoneIfStuck() {
    if (stickToBottomRef.current) {
      setScrollAfterDoneTick((t) => t + 1);
    }
  }

  async function persistEntry(
    updated: CollectionEntry,
    options?: { save?: boolean; refresh?: boolean },
  ) {
    entryRef.current = updated;
    if (options?.save !== false) {
      await saveCollection(updated);
      entryRef.current = (await getCollection(updated.id)) ?? updated;
    }
    if (options?.refresh !== false) {
      await refreshConversation({
        laikaStreaming: updated.laikaStreaming,
        streamingNodeId: updated.streamingNodeId,
      });
    } else {
      setSession((prev) =>
        prev
          ? {
              ...prev,
              laikaStreaming: updated.laikaStreaming,
              streamingNodeId: updated.streamingNodeId,
              updatedAt: updated.updatedAt,
              laikaIntent: updated.laikaIntent,
            }
          : prev,
      );
    }
  }

  function handleStopGeneration() {
    abortRef.current?.abort();
  }

  function mergeStreamText(accumulated: string, fromServer?: string): string {
    const acc = accumulated.trim();
    const srv = fromServer?.trim() ?? "";
    if (!srv) return acc;
    if (!acc) return srv;
    return srv.length >= acc.length ? srv : acc;
  }

  async function runLaikaAssist(params: {
    assistantNodeId: string;
    userContent: string;
    intent: LaikaIntent;
    baseEntry: CollectionEntry;
    historyBefore: ChatNode[];
  }) {
    const { assistantNodeId, userContent, intent, baseEntry, historyBefore } = params;

    setLaikaLoading(true);
    setLaikaError(null);
    clearStreamingUi();

    let tree = updateNode(baseEntry.tree, assistantNodeId, {
      content: "",
      laikaSources: undefined,
      laikaIntent: intent,
    });

    const streaming: CollectionEntry = {
      ...baseEntry,
      tree,
      laikaIntent: intent,
      laikaStreaming: true,
      streamingNodeId: assistantNodeId,
      updatedAt: new Date().toISOString(),
    };
    await persistEntry(streaming);

    let responseText = "";
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    async function commitAssistantResponse(
      sources: LaikaSource[],
      finalText?: string,
      truncated?: boolean,
    ) {
      clearStreamingUi();
      setLaikaStatus(null);
      const now = new Date().toISOString();
      const current = entryRef.current ?? streaming;
      const trimmed = mergeStreamText(responseText, finalText);
      responseText = trimmed;
      let nextTree = updateNode(current.tree, assistantNodeId, {
        content: trimmed,
        laikaSources: sources.length > 0 ? sources : undefined,
        laikaIntent: intent,
      });

      await persistEntry({
        ...current,
        tree: nextTree,
        laikaStreaming: false,
        streamingNodeId: undefined,
        laikaIntent: intent,
        updatedAt: now,
      });

      if (truncated) {
        setLaikaError(
          "คำตอบถูกตัดเพราะ context เต็ม — ลดประวัติแชท หรือเพิ่ม OLLAMA_NUM_CTX ถ้า VRAM พอ",
        );
      }

      bumpScrollAfterDoneIfStuck();
    }

    async function finalizeAfterAbort() {
      clearStreamingUi();
      setLaikaStatus(null);
      const current = entryRef.current ?? streaming;
      const trimmed = responseText.trim();
      if (trimmed) {
        const nextTree = updateNode(current.tree, assistantNodeId, {
          content: trimmed,
          laikaIntent: intent,
        });
        await persistEntry({
          ...current,
          tree: nextTree,
          laikaStreaming: false,
          streamingNodeId: undefined,
          updatedAt: new Date().toISOString(),
        });
        bumpScrollAfterDoneIfStuck();
        return;
      }

      await persistEntry({
        ...current,
        laikaStreaming: false,
        streamingNodeId: undefined,
      }, { save: false, refresh: true });
    }

    try {
      const health = await getLaikaHealth();
      if (!health.enabled) {
        throw new ApiError(
          503,
          "LAIKA ยังไม่พร้อม — ตั้งค่า provider ใน .env แล้ว restart backend",
        );
      }

      const completed = await streamLaikaAssist(
        {
          entry_type: baseEntry.type,
          content: userContent,
          intent,
          entry_content: baseEntry.content,
          messages: toLaikaHistory(historyBefore),
          client_now: new Date().toISOString(),
        },
        {
          onStatus: (_phase, message) => {
            setLaikaStatus((prev) => (prev === message ? prev : message));
          },
          onToken: (delta) => {
            responseText += delta;
            setLaikaStatus((prev) =>
              prev === laikaStatusLabel("typing") ? prev : laikaStatusLabel("typing"),
            );
            scheduleStreamingUi(responseText);
          },
          onDone: ({ sources, response, truncated }) => {
            void commitAssistantResponse(sources, response, truncated);
          },
        },
        controller.signal,
      );

      if (!completed) {
        if (controller.signal.aborted) {
          await finalizeAfterAbort();
        } else if (responseText.trim()) {
          await commitAssistantResponse([]);
        } else {
          throw new ApiError(503, "LAIKA stream ended before completion");
        }
      }
    } catch (err) {
      if (controller.signal.aborted) {
        await finalizeAfterAbort();
      } else {
        setLaikaError(err instanceof ApiError ? err.message : "ไม่สามารถเชื่อมต่อ LAIKA ได้");
        setLaikaStatus(null);
        await persistEntry({
          ...baseEntry,
          laikaStreaming: false,
          streamingNodeId: undefined,
        }, { save: false, refresh: true });
      }
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
      clearStreamingUi();
      setLaikaLoading(false);
      setLaikaStatus(null);
    }
  }

  async function handleLaikaIntent(intent: LaikaIntent) {
    if (!session || laikaLoading) return;

    const entry = await ensureFullEntry();
    const path = buildActivePath(entry.tree);
    const rootUser = path.find((n) => n.role === "user");
    if (!rootUser) return;

    const assistant = createNode({
      role: "assistant",
      content: "",
      parentId: rootUser.id,
      laikaIntent: intent,
    });
    const tree = addNode(entry.tree, assistant);
    const updated: CollectionEntry = {
      ...entry,
      tree,
      laikaIntent: intent,
      updatedAt: new Date().toISOString(),
    };
    await persistEntry(updated);

    await runLaikaAssist({
      assistantNodeId: assistant.id,
      userContent: rootUser.content,
      intent,
      baseEntry: updated,
      historyBefore: [],
    });
  }

  async function handleSend(text: string) {
    if (!session || laikaLoading) return;
    if (!hasLaikaConversation(session) || !text) return;

    const entry = await ensureFullEntry();
    const intent = defaultIntentForEntry(entry.type, entry.laikaIntent);
    const leaf = getActiveLeaf(entry.tree);
    if (!leaf || leaf.role !== "assistant") return;

    const userNode = createNode({ role: "user", content: text, parentId: leaf.id });
    let tree = addNode(entry.tree, userNode);
    const assistant = createNode({ role: "assistant", content: "", parentId: userNode.id });
    tree = addNode(tree, assistant);

    const historyBefore = getHistoryBeforeNode(tree, userNode.id);

    const withNodes: CollectionEntry = {
      ...entry,
      tree,
      updatedAt: new Date().toISOString(),
    };
    await persistEntry(withNodes);
    setScrollToBottomTick((t) => t + 1);

    await runLaikaAssist({
      assistantNodeId: assistant.id,
      userContent: text,
      intent,
      baseEntry: withNodes,
      historyBefore,
    });
  }

  async function handleRetry(assistantNodeId: string) {
    if (!session || laikaLoading) return;
    const entry = await ensureFullEntry();
    const userNode = getUserNodeForAssistant(entry.tree, assistantNodeId);
    const assistant = entry.tree.nodes[assistantNodeId];
    if (!userNode || !assistant) return;

    const path = buildActivePath(entry.tree);
    const historyBefore = path.slice(0, path.findIndex((n) => n.id === assistantNodeId));
    const intent = assistant.laikaIntent ?? defaultIntentForEntry(entry.type, entry.laikaIntent);

    await runLaikaAssist({
      assistantNodeId,
      userContent: userNode.content,
      intent,
      baseEntry: entry,
      historyBefore,
    });
  }

  async function handleSaveUserCompose(userNodeId: string) {
    if (!session || laikaLoading) return;
    const trimmed = editDraft.trim();
    if (!trimmed) return;

    const entry = await ensureFullEntry();
    const node = entry.tree.nodes[userNodeId];
    if (!node || node.role !== "user") return;
    const spot = session.userSpotsById[userNodeId];
    if (userCompose?.mode === "branch" && spot && !spot.canCreateBranch) {
      return;
    }

    const sibling = createNode({
      role: "user",
      content: trimmed,
      parentId: node.parentId,
    });
    let tree = addNode(entry.tree, sibling);
    tree = selectSibling(tree, node.parentId, sibling.id);

    const assistant = createNode({
      role: "assistant",
      content: "",
      parentId: sibling.id,
    });
    tree = addNode(tree, assistant);

    const updated = {
      ...entry,
      tree,
      updatedAt: new Date().toISOString(),
    };
    await persistEntry(updated);
    setUserCompose(null);
    setEditDraft("");

    const historyBefore = getHistoryBeforeNode(updated.tree, sibling.id);
    const intent = defaultIntentForEntry(entry.type, entry.laikaIntent);

    await runLaikaAssist({
      assistantNodeId: assistant.id,
      userContent: trimmed,
      intent,
      baseEntry: updated,
      historyBefore,
    });
  }

  async function switchBranch(userNodeId: string) {
    if (!session || laikaLoading || !collectionId || branchSwitching) return;
    setBranchSwitching(true);
    try {
      const conversation = await selectStudioBranch(collectionId, userNodeId);
      const next = conversationToSession(conversation);
      setSession(next);
      sessionRef.current = next;
      entryRef.current = null;
      setBranchMap(null);
      setScrollToUserNodeId(userNodeId);
    } catch (err) {
      console.warn("Failed to switch branch:", err);
    } finally {
      setBranchSwitching(false);
    }
  }

  function handleSiblingNav(userNodeId: string, direction: -1 | 1) {
    const spot = session?.userSpotsById[userNodeId];
    if (!spot) return;
    const nextId = spot.siblingIds[spot.siblingIndex + direction];
    if (!nextId) return;
    void switchBranch(nextId);
  }

  function openUserCompose(nodeId: string, mode: "edit" | "branch") {
    if (!session) return;
    const node = session.messages.find((n) => n.id === nodeId && n.role === "user");
    if (!node) return;
    const spot = session.userSpotsById[nodeId];
    if (mode === "branch" && spot && !spot.canCreateBranch) return;
    setUserCompose({ nodeId, mode });
    setEditDraft(node.content);
  }

  function handleBranchMapSelect(nodeId: string) {
    void switchBranch(nodeId);
  }

  function cancelUserCompose() {
    setUserCompose(null);
    setEditDraft("");
  }

  function siblingNodesForDisplay(
    node: ChatNode,
    spot?: StudioChatSession["userSpotsById"][string],
  ): ChatNode[] {
    if (!spot || spot.siblingCount <= 1) return [node];
    return spot.siblingIds.map(
      (id) => session?.messages.find((m) => m.id === id) ?? { ...node, id },
    );
  }

  if (entryLoading || !session) {
    return (
      <div className="flex h-screen overflow-hidden bg-bg text-text">
        <ModuleSidebar user={user} activeModule="studio" />
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <p className="font-mono text-[0.62rem] tracking-wider text-muted">กำลังโหลด…</p>
        </div>
      </div>
    );
  }

  const awaitingLaika = !hasLaikaConversation(session);
  const canType = hasLaikaConversation(session) && !laikaLoading && !branchSwitching;

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-text">
      <ModuleSidebar user={user} activeModule="studio" />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 flex-wrap items-center gap-3 border-b border-white/[0.06] px-5 py-3">
          <Link
            to="/studio"
            className="flex cursor-pointer items-center gap-1.5 font-mono text-[0.62rem] tracking-wider text-text/50 no-underline transition hover:text-amber"
          >
            <HiOutlineArrowLeft />
            Studio
          </Link>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <IoRocketOutline className="shrink-0 text-lg text-amber" />
            <h1 className="font-section-thai truncate text-[0.88rem] text-text">{session.title}</h1>
            <TypeBadge type={session.type} />
          </div>
        </header>

        <div ref={chatScrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          <div className="mx-auto flex w-full max-w-[80%] flex-col gap-4">
            {session.messages.map((node, index) => {
              const prevMessage = index > 0 ? session.messages[index - 1] : null;
              const showDateDivider =
                !prevMessage || !isSameChatCalendarDay(prevMessage.createdAt, node.createdAt);
              const isStreaming = session.laikaStreaming && node.id === session.streamingNodeId;
              const assistantContent = isStreaming ? streamingText : node.content;

              if (node.role === "user") {
                const spot = session.userSpotsById[node.id];
                const siblings = siblingNodesForDisplay(node, spot);
                const sibIdx = spot?.siblingIndex ?? 0;
                const isComposing = userCompose?.nodeId === node.id;

                return (
                  <Fragment key={node.id}>
                    {showDateDivider && <ChatDateDivider createdAt={node.createdAt} />}
                    <div className="flex w-full justify-end scroll-mt-3">
                    <div className="group flex w-full max-w-[min(100%,28rem)] flex-col items-end">
                      {isComposing ? (
                        <div
                          data-chat-user-node={node.id}
                          className="w-full space-y-2"
                        >
                          <textarea
                            value={editDraft}
                            onChange={(e) => setEditDraft(e.target.value)}
                            rows={3}
                            autoFocus
                            className="w-full resize-none rounded-2xl border border-teal/30 bg-teal/10 px-4 py-2.5 font-section-thai text-[0.88rem] text-text outline-none focus:border-teal/50"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={cancelUserCompose}
                              className="cursor-pointer rounded-lg border border-white/10 px-3 py-1 font-mono text-[0.62rem] text-muted"
                            >
                              ยกเลิก
                            </button>
                            <button
                              type="button"
                              disabled={laikaLoading || !editDraft.trim()}
                              onClick={() => handleSaveUserCompose(node.id)}
                              className="cursor-pointer rounded-lg border border-teal/40 bg-teal/15 px-3 py-1 font-mono text-[0.62rem] text-teal disabled:opacity-40"
                            >
                              {userCompose?.mode === "branch"
                                ? "สร้าง branch & ส่ง"
                                : "บันทึก & ส่ง"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-end gap-2">
                            <UserMessageTimestamp node={node} siblings={siblings} />
                            <div
                              data-chat-user-node={node.id}
                              className="rounded-2xl rounded-tr-md border border-teal/25 bg-teal/10 px-4 py-2.5"
                            >
                              <p className="font-section-thai text-[0.88rem] leading-relaxed text-text/90">
                                {node.content}
                              </p>
                            </div>
                          </div>
                          <div className="mt-1 flex w-full items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                            <UserBranchPager
                              index={sibIdx}
                              total={spot?.siblingCount ?? 1}
                              onPrev={() => handleSiblingNav(node.id, -1)}
                              onNext={() => handleSiblingNav(node.id, 1)}
                              disabled={laikaLoading || branchSwitching}
                            />
                            <UserMessageActions
                              onCopy={() => copyText(node.content)}
                              onEdit={() => openUserCompose(node.id, "edit")}
                              onCreateBranch={() => openUserCompose(node.id, "branch")}
                              canCreateBranch={spot?.canCreateBranch ?? false}
                              disabled={laikaLoading || branchSwitching}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  </Fragment>
                );
              }

              return (
                <Fragment key={node.id}>
                  {showDateDivider && <ChatDateDivider createdAt={node.createdAt} />}
                  <div className="flex justify-start">
                  <div className="flex max-w-full gap-2.5">
                    <LaikaAvatar />
                    <div className="group flex min-w-0 flex-1 flex-col items-start">
                      <div className="min-w-0 rounded-2xl rounded-tl-md border border-white/10 bg-white/[0.04] px-4 py-2.5">
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <p className="font-mono text-[0.85rem] tracking-[0.14em] text-amber">LAIKA</p>
                      </div>
                      {isStreaming && !assistantContent && (
                        <LaikaTypingStatus message={laikaStatus} />
                      )}
                      <LaikaMarkdown
                        content={assistantContent}
                        size="chat"
                      />
                      {node.laikaSources && node.laikaSources.length > 0 && !isStreaming && (
                        <div className="mt-3 border-t border-white/10 pt-2.5">
                          <p className="font-mono mb-1.5 text-[0.52rem] tracking-[0.12em] text-muted">
                            อ้างอิง
                          </p>
                          <ul className="space-y-1">
                            {node.laikaSources.map((source) => (
                              <li
                                key={`${source.source_id}-${source.page ?? "na"}`}
                                className="font-section-thai text-[0.78rem] text-text/65"
                              >
                                {source.title}
                                {source.page != null && (
                                  <span className="text-muted"> · หน้า {source.page}</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                      {!isStreaming && (
                        <div className="mt-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                          <AssistantMessageActions
                            onCopy={() => copyText(node.content)}
                            onRetry={() => handleRetry(node.id)}
                            disabled={laikaLoading}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                </Fragment>
              );
            })}

            {awaitingLaika && (
              <div className="flex justify-start gap-2.5">
                <LaikaAvatar />
                <div className="max-w-[min(100%,32rem)] rounded-2xl rounded-tl-md border border-amber/20 bg-amber/[0.04] px-4 py-2.5">
                  <p className="font-section-thai mb-1 text-[0.88rem] text-text">
                    อยากให้ LAIKA ช่วยแนะนำอะไร?
                  </p>
                  <p className="font-mono text-[0.52rem] tracking-wider text-muted">
                    เลือกคำสั่งด้านล่างเพื่อเริ่ม
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <StudioChatComposer
          entry={sessionToComposerEntry(session)}
          laikaHealth={laikaHealth}
          laikaLoading={laikaLoading}
          laikaError={laikaError}
          awaitingLaika={awaitingLaika}
          canType={canType}
          streamingText={streamingText}
          onOpenBranchMap={() => setBranchMapOpen(true)}
          onLaikaIntent={handleLaikaIntent}
          onSend={handleSend}
          onStop={handleStopGeneration}
        />
      </div>

      <BranchMapDialog
        open={branchMapOpen}
        branchMap={branchMap}
        branchMapLoading={branchMapLoading}
        branchMapError={branchMapError}
        focusUserId={mapFocusUserId}
        onClose={() => setBranchMapOpen(false)}
        onRetry={() => void loadBranchMap()}
        onSelectNode={handleBranchMapSelect}
      />
    </div>
  );
}
