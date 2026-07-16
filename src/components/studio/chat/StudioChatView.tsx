import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { micromark } from "micromark";
import { gfm, gfmHtml } from "micromark-extension-gfm";
import { math, mathHtml } from "micromark-extension-math";
import { Link, useNavigate, useParams } from "react-router-dom";
import { HiOutlineArrowLeft, } from "react-icons/hi2";
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
import LaikaTypingStatus from "@/components/studio/chat/LaikaTypingStatus";
import { LaikaAvatar, TypeBadge } from "@/components/studio/shared/studio-shared";
import { isSameChatCalendarDay } from "@/lib/chat-timestamp";
import {
  ApiError,
  getLaikaHealth,
  getStudioBranchMap,
  getStudioConversation,
  selectStudioBranch,
  streamLaikaAssist,
  type LaikaHealth,
  type StudioBranchMap,
  type User,
} from "@/lib/api";
import { getCollection } from "@/lib/studio-storage";
import {
  conversationToSession,
  sessionToComposerEntry,
  type StudioChatSession,
} from "@/lib/studio-conversation";
import { buildContextUsageEstimate, type ContextUsageEstimate } from "@/lib/laika-context";
import { resolveDeepestVisibleUserNodeId, scrollChatToBottom, scrollUserBubbleToTop } from "@/lib/studio-visible-focus";
import {
  buildActivePath,
  defaultIntentForEntry,
  getActiveLeaf,
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
  const followStreamRef = useRef(true);

  const [session, setSession] = useState<StudioChatSession | null>(null);
  const [entryLoading, setEntryLoading] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [branchMap, setBranchMap] = useState<StudioBranchMap | null>(null);
  const [branchMapLoading, setBranchMapLoading] = useState(false);
  const [branchMapError, setBranchMapError] = useState<string | null>(null);
  const [branchSwitching, setBranchSwitching] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [laikaLoading, setLaikaLoading] = useState(false);
  const [laikaError, setLaikaError] = useState<string | null>(null);
  const [laikaStatus, setLaikaStatus] = useState<string | null>(null);
  const [stopNotice, setStopNotice] = useState(false);
  const [branchMapOpen, setBranchMapOpen] = useState(false);
  const [userCompose, setUserCompose] = useState<{
    nodeId: string;
    mode: "edit" | "branch";
  } | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [scrollToUserNodeId, setScrollToUserNodeId] = useState<string | null>(null);
  const [mapFocusUserId, setMapFocusUserId] = useState<string | null>(null);
  const [webSearch, setWebSearch] = useState(false);
  const [laikaMode, setLaikaMode] = useState<"standard" | "extra">("standard");
  const [laikaHealth, setLaikaHealth] = useState<LaikaHealth | null>(null);

  // Memoised context usage estimate — stable reference unless deps change
  const contextUsage = useMemo<ContextUsageEstimate>(() => {
    const msg = session?.messages ?? [];
    const entry = entryRef.current;
    return buildContextUsageEstimate({
      health: laikaHealth,
      intent: (session?.laikaIntent as LaikaIntent) ?? "ask-anything",
      entryContent: entry?.content ?? "",
      currentContent: streamingText,
      draft: editDraft,
      historyMessages: msg as ChatNode[],
      topK: 5,
      webSearch,
      mode: laikaMode,
    });
  }, [laikaHealth, session?.messages, session?.laikaIntent, streamingText, editDraft, webSearch, laikaMode]);

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

  useEffect(() => {
    getLaikaHealth().then(setLaikaHealth).catch(() => setLaikaHealth(null));
  }, []);

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
    entryRef.current = null;
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

    let frame = 0;

    const scheduleMapFocus = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateMapFocusUser);
    };

    const onScroll = () => {
      scheduleMapFocus();
    };

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY < 0) {
        followStreamRef.current = false;
        setShowScrollButton(true);
      }
    };

    let touchY: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY;
      if (touchY != null && y != null && y > touchY + 4) {
        followStreamRef.current = false;
        setShowScrollButton(true);
      }
      if (y != null) touchY = y;
    };

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
  }, [collectionId, updateMapFocusUser, entryLoading]);

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
    setShowScrollButton(true);
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





  // Open chat / switch collection — jump to latest messages (no smooth follow during stream).
  useLayoutEffect(() => {
    if (!collectionId || session?.collectionId !== collectionId) return;
    const container = chatScrollRef.current;
    if (!container) return;

    followStreamRef.current = true;
    setShowScrollButton(false);
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
      abortRef.current = null;
      streamingDivRef.current = null;
      entryRef.current = null;
      sessionRef.current = null;
    };
  }, []);

  // Clear refs on collection change to free stale references.
  useEffect(() => {
    return () => {
      entryRef.current = null;
      sessionRef.current = null;
    };
  }, [collectionId]);

  const streamingDivRef = useRef<HTMLDivElement | null>(null);

  function scheduleStreamingUi(text: string) {
    if (streamingDivRef.current) {
      streamingDivRef.current.innerHTML = micromark(text, {
        allowDangerousHtml: false,
        extensions: [gfm(), math()],
        htmlExtensions: [gfmHtml(), mathHtml()],
      });
    } else {
      setStreamingText(micromark(text, {
        allowDangerousHtml: false,
        extensions: [gfm(), math()],
        htmlExtensions: [gfmHtml(), mathHtml()],
      }));
    }
  }

  function clearStreamingUi() {
    streamingDivRef.current = null;
    setStreamingText("");
  }

  function handleStopGeneration() {
    abortRef.current?.abort();
    setStopNotice(true);
    setTimeout(() => setStopNotice(false), 2500);
  }

  function handleScrollToBottom() {
    const container = chatScrollRef.current;
    if (!container) return;
    followStreamRef.current = true;
    setShowScrollButton(false);
    scrollChatToBottom(container, "smooth");
  }

  async function runLaikaAssist(params: {
    mode: "new" | "follow_up" | "edit" | "retry" | "branch";
    userContent: string;
    intent: LaikaIntent;
    nodeId?: string;
    parentNodeId?: string;
    webSearch?: boolean;
  }) {
    const { mode, userContent, intent, nodeId, parentNodeId, webSearch } = params;

    setLaikaLoading(true);
    setLaikaError(null);
    clearStreamingUi();

    let responseText = "";
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

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
          collection_id: collectionId!,
          content: userContent,
          intent,
          mode,
          node_id: nodeId,
          parent_node_id: parentNodeId,
          web_search: webSearch ?? false,
          laika_mode: laikaMode,
        },
        {
          onMeta: (meta) => {
            // Avoid race with onDone's refreshConversation() — update session
            // locally with placeholder nodes instead of fetching from backend.
            setSession((prev) => {
              if (!prev) return prev;
              const now = new Date().toISOString();

              if (mode === "edit") {
                // Update existing user node content + clear its assistant
                const messages = prev.messages.map((n) => {
                  if (n.id === nodeId) return { ...n, content: userContent, updatedAt: now };
                  if (nodeId && n.parentId === nodeId && n.role === "assistant")
                    return { ...n, content: "" };
                  return n;
                });
                return { ...prev, laikaStreaming: true, streamingNodeId: meta.assistant_node_id, messages };
              }

              if (mode === "retry") {
                const messages = prev.messages.map((n) =>
                  n.id === meta.assistant_node_id ? { ...n, content: "" } : n,
                );
                return { ...prev, laikaStreaming: true, streamingNodeId: meta.assistant_node_id, messages };
              }

              if (mode === "branch") {
                // Cut off conversation from the branch point, then append new branch
                const cutIdx = nodeId ? prev.messages.findIndex((n) => n.id === nodeId) : -1;
                const kept = cutIdx >= 0 ? prev.messages.slice(0, cutIdx) : prev.messages;
                const userNode: ChatNode = {
                  id: meta.user_node_id,
                  role: "user",
                  content: userContent,
                  createdAt: now,
                  updatedAt: now,
                };
                const assistantNode: ChatNode = {
                  id: meta.assistant_node_id,
                  role: "assistant",
                  content: "",
                  createdAt: now,
                  updatedAt: now,
                };
                return {
                  ...prev,
                  laikaStreaming: true,
                  streamingNodeId: meta.assistant_node_id,
                  messages: [...kept, userNode, assistantNode],
                  hasLaika: true,
                };
              }

              // new / follow_up: append placeholder user+assistant
              const userNode: ChatNode = {
                id: meta.user_node_id,
                role: "user",
                content: userContent,
                createdAt: now,
                updatedAt: now,
              };
              const assistantNode: ChatNode = {
                id: meta.assistant_node_id,
                role: "assistant",
                content: "",
                createdAt: now,
                updatedAt: now,
              };
              return {
                ...prev,
                laikaStreaming: true,
                streamingNodeId: meta.assistant_node_id,
                messages: [...prev.messages, userNode, assistantNode],
                hasLaika: true,
              };
            });
            followStreamRef.current = true;
            setShowScrollButton(false);
            requestAnimationFrame(() => {
              const c = chatScrollRef.current;
              if (c) scrollChatToBottom(c, "smooth");
            });
          },
          onStatus: (_phase, message) => {
            setLaikaStatus((prev) => (prev === message ? prev : message));
            if (followStreamRef.current) {
              const c = chatScrollRef.current;
              if (c) scrollChatToBottom(c, "auto");
            }
          },
          onToken: (delta) => {
            responseText += delta;
            scheduleStreamingUi(responseText);
            if (followStreamRef.current) {
              const c = chatScrollRef.current;
              if (c) scrollChatToBottom(c, "auto");
            }
          },
          onDone: () => {
            setLaikaStatus(null);
            clearStreamingUi();
            refreshConversation();
            requestAnimationFrame(() => {
              if (followStreamRef.current) {
                const c = chatScrollRef.current;
                if (c) scrollChatToBottom(c, "auto");
              }
            })
          },
        },
        controller.signal,
      );

      if (!completed) {
        if (controller.signal.aborted) {
          clearStreamingUi();
          setLaikaStatus(null);
          setStopNotice(true);
          setTimeout(() => setStopNotice(false), 2500);
          refreshConversation();
        } else if (responseText.trim()) {
          refreshConversation();
        } else {
          throw new ApiError(503, "LAIKA stream ended before completion");
        }
      }
    } catch (err) {
      if (controller.signal.aborted) {
        clearStreamingUi();
        setLaikaStatus(null);
        setStopNotice(true);
        setTimeout(() => setStopNotice(false), 2500);
        refreshConversation();
      } else {
        setLaikaError(err instanceof ApiError ? err.message : "ไม่สามารถเชื่อมต่อ LAIKA ได้");
        setLaikaStatus(null);
        refreshConversation();
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

    await runLaikaAssist({
      mode: "new",
      userContent: rootUser?.content || entry.content || "",
      intent,
      parentNodeId: undefined,
      webSearch,
    });
  }

  async function handleSend(text: string) {
    if (!session || laikaLoading) return;
    if (!hasLaikaConversation(session) || !text) return;

    const entry = await ensureFullEntry();
    const intent = defaultIntentForEntry(entry.type, entry.laikaIntent);
    const leaf = getActiveLeaf(entry.tree);
    if (!leaf) return;

    await runLaikaAssist({
      mode: "follow_up",
      userContent: text,
      intent,
      parentNodeId: leaf.id,
      webSearch,
    });
  }

  async function handleRetry(assistantNodeId: string) {
    if (!session || laikaLoading) return;
    const entry = await ensureFullEntry();
    const assistant = entry.tree.nodes[assistantNodeId];
    if (!assistant) return;

    const intent = assistant.laikaIntent ?? defaultIntentForEntry(entry.type, entry.laikaIntent);

    await runLaikaAssist({
      mode: "retry",
      userContent: "",
      intent,
      nodeId: assistantNodeId,
      webSearch,
    });
  }

  async function handleSaveUserCompose(userNodeId: string) {
    if (!session || laikaLoading) return;
    const trimmed = editDraft.trim();
    if (!trimmed) return;

    const entry = await ensureFullEntry();
    const node = entry.tree.nodes[userNodeId];
    if (!node || node.role !== "user") return;

    setUserCompose(null);
    setEditDraft("");

    if (userCompose?.mode === "edit") {
      await runLaikaAssist({
        mode: "edit",
        userContent: trimmed,
        intent: defaultIntentForEntry(entry.type, entry.laikaIntent),
        nodeId: userNodeId,
        webSearch,
      });
      return;
    }

    // Branch mode
    const spot = session.userSpotsById[userNodeId];
    if (spot && !spot.canCreateBranch) return;

    await runLaikaAssist({
      mode: "branch",
      userContent: trimmed,
      intent: defaultIntentForEntry(entry.type, entry.laikaIntent),
      nodeId: userNodeId,
      parentNodeId: node.parentId,
      webSearch,
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
  const canType = hasLaikaConversation(session) && !branchSwitching;

  const lastUserIdx = (() => {
    for (let i = session.messages.length - 1; i >= 0; i--) {
      if (session.messages[i].role === "user") return i;
    }
    return -1;
  })();
  const lastAssistantIdx = (() => {
    for (let i = session.messages.length - 1; i >= 0; i--) {
      if (session.messages[i].role === "assistant") return i;
    }
    return -1;
  })();

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
          <div className="relative mx-auto flex w-full max-w-[80%] flex-col gap-4">
            {session.messages.map((node, index) => {
              const prevMessage = index > 0 ? session.messages[index - 1] : null;
              const showDateDivider =
                !prevMessage || !isSameChatCalendarDay(prevMessage.createdAt, node.createdAt);
              const isStreaming = session.laikaStreaming && node.id === session.streamingNodeId;
              const assistantContent = isStreaming ? streamingText : node.content;

              if (node.role === "user") {
                const spot = session.userSpotsById[node.id];
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
                            <UserMessageTimestamp node={node} />
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
                              onEdit={index === lastUserIdx ? () => openUserCompose(node.id, "edit") : undefined}
                              onCreateBranch={() => openUserCompose(node.id, "branch")}
                              canCreateBranch={spot?.canCreateBranch ?? false}
                              disabled={branchSwitching}
                              streaming={laikaLoading}
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
                      {stopNotice && (
                        <p className="font-section-thai mb-1 text-[0.78rem] text-muted-foreground/70">
                          ถูกหยุดแล้ว
                        </p>
                      )}
                      {isStreaming ? (
                        <div
                          ref={streamingDivRef}
                          className="micromark-stream font-section-thai text-[0.88rem] leading-relaxed text-text/85"
                          dangerouslySetInnerHTML={{ __html: assistantContent }}
                        />
                      ) : (
                        <LaikaMarkdown
                          content={assistantContent}
                          size="chat"
                        />
                      )}
                    </div>
                      {!isStreaming && (
                        <div className="mt-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                          <AssistantMessageActions
                            onCopy={() => copyText(node.content)}
                            onRetry={index === lastAssistantIdx ? () => handleRetry(node.id) : undefined}
                            disabled={false}
                            streaming={laikaLoading}
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
                    ว่าไง อยากให้ LAIKA ช่วยเรื่องอะไร?
                  </p>
                  <p className="font-mono text-[0.52rem] tracking-wider text-muted">
                    เลือกคำสั่งด้านล่าง แล้วมาเริ่มกันเลย
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <StudioChatComposer
          entry={sessionToComposerEntry(session)}
          laikaLoading={laikaLoading}
          laikaError={laikaError}
          awaitingLaika={awaitingLaika}
          canType={canType}
          webSearch={webSearch}
          laikaMode={laikaMode}
          contextUsage={contextUsage}
          onOpenBranchMap={() => setBranchMapOpen(true)}
          onLaikaIntent={handleLaikaIntent}
          onSend={handleSend}
          onStop={handleStopGeneration}
          onWebSearchChange={setWebSearch}
          onModeChange={setLaikaMode}
          showScrollButton={showScrollButton}
          onScrollToBottom={handleScrollToBottom}
        />
      </div>

      <BranchMapDialog
        open={branchMapOpen}
        branchMap={branchMap}
        branchMapLoading={branchMapLoading}
        branchMapError={branchMapError}
        focusUserId={mapFocusUserId}
        onClose={() => { setBranchMapOpen(false); setBranchMap(null); }}
        onRetry={() => void loadBranchMap()}
        onSelectNode={handleBranchMapSelect}
      />
    </div>
  );
}
