import { useMemo, useState } from "react";
import { HiOutlinePaperAirplane, HiStop } from "react-icons/hi2";
import { TbSitemap } from "react-icons/tb";

import ContextUsageRing from "@/components/studio/chat/ContextUsageRing";
import { HintTooltip } from "@/components/ui/tooltip";
import {
  IDEA_INTENTS,
  NOTE_INTENTS,
  type CollectionEntry,
  type LaikaIntent,
} from "@/components/studio/data/studio-data";
import { buildContextUsageEstimate } from "@/lib/laika-context";
import { buildActivePath, defaultIntentForEntry } from "@/lib/studio-tree";
import type { LaikaHealth } from "@/lib/api";

type StudioChatComposerProps = {
  entry: CollectionEntry;
  laikaHealth: LaikaHealth | null;
  laikaLoading: boolean;
  laikaError: string | null;
  awaitingLaika: boolean;
  canType: boolean;
  streamingText: string;
  onOpenBranchMap: () => void;
  onLaikaIntent: (intent: LaikaIntent) => void;
  onSend: (text: string) => void;
  onStop: () => void;
};

/** Composer footer — local draft state so keystrokes do not re-render the message list. */
export default function StudioChatComposer({
  entry,
  laikaHealth,
  laikaLoading,
  laikaError,
  awaitingLaika,
  canType,
  streamingText,
  onOpenBranchMap,
  onLaikaIntent,
  onSend,
  onStop,
}: StudioChatComposerProps) {
  const [draft, setDraft] = useState("");

  const intents = entry.type === "idea" ? IDEA_INTENTS : NOTE_INTENTS;

  const contextUsage = useMemo(() => {
    const path = buildActivePath(entry.tree);
    const historyMessages = path.map((n) => ({
      id: n.id,
      role: n.role,
      content:
        entry.laikaStreaming && n.id === entry.streamingNodeId
          ? streamingText || n.content
          : n.content,
      createdAt: n.createdAt,
      laikaIntent: n.laikaIntent,
      laikaSources: n.laikaSources,
    }));
    return buildContextUsageEstimate({
      health: laikaHealth,
      intent: defaultIntentForEntry(entry.type, entry.laikaIntent),
      entryContent: entry.content,
      currentContent: "",
      draft,
      historyMessages,
    });
  }, [draft, entry, laikaHealth, streamingText]);

  function handleSend() {
    const text = draft.trim();
    if (!text || !canType) return;
    setDraft("");
    onSend(text);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <footer className="shrink-0 border-t border-white/[0.06] bg-[#02060f]/90 px-4 py-2.5 backdrop-blur-md sm:px-6">
      <div className="mx-auto w-full max-w-2xl space-y-2">
        {awaitingLaika && (
          <div className="flex flex-wrap gap-1.5">
            {intents.map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={laikaLoading}
                onClick={() => onLaikaIntent(item.id)}
                className="cursor-pointer rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 font-section-thai text-[0.72rem] text-text/80 transition hover:border-amber/35 hover:bg-amber/[0.06] disabled:cursor-wait disabled:opacity-60"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {laikaError && (
          <p className="font-section-thai text-[0.78rem] text-red-400">{laikaError}</p>
        )}
        <div className="flex w-full items-center gap-2">
          {!awaitingLaika && (
            <HintTooltip content="Branch Map">
              <button
                type="button"
                onClick={onOpenBranchMap}
                disabled={laikaLoading}
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-muted transition hover:border-amber/35 hover:text-amber disabled:opacity-40"
                aria-label="Branch Map"
              >
                <TbSitemap className="text-xl" />
              </button>
            </HintTooltip>
          )}
          <div className="flex h-12 grow items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-1.5 focus-within:border-amber/30">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!canType}
              rows={1}
              placeholder={
                awaitingLaika
                  ? "เลือกคำสั่งด้านบนเพื่อเริ่มแชทกับ LAIKA…"
                  : "พิมพ์ข้อความ… (Enter ส่ง, Shift+Enter ขึ้นบรรทัดใหม่)"
              }
              className="max-h-28 min-h-8 flex-1 resize-none bg-transparent px-2 py-2 font-section-thai text-[0.85rem] text-text outline-none placeholder:text-muted/70 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {laikaLoading ? (
              <HintTooltip content="หยุดสร้างคำตอบ">
                <button
                  type="button"
                  onClick={onStop}
                  className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-red-400/40 bg-red-500/15 text-red-300 transition hover:bg-red-500/25"
                  aria-label="หยุดสร้างคำตอบ"
                >
                  <HiStop className="text-base" />
                </button>
              </HintTooltip>
            ) : (
              <HintTooltip content="ส่งข้อความ">
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!canType || !draft.trim()}
                  className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-amber/40 bg-amber/15 text-amber transition hover:bg-amber/25 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="ส่งข้อความ"
                >
                  <HiOutlinePaperAirplane className="text-base" />
                </button>
              </HintTooltip>
            )}
          </div>
          {!awaitingLaika && <ContextUsageRing usage={contextUsage} />}
        </div>
      </div>
    </footer>
  );
}
