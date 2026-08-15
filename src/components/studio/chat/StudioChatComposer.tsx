import { useState } from "react";
import { HiOutlinePaperAirplane, HiStop } from "react-icons/hi2";
import { IoGlobeOutline } from "react-icons/io5";
import { TbSitemap } from "react-icons/tb";

import ContextUsageRing from "@/components/studio/chat/ContextUsageRing";
import type { ContextUsageEstimate } from "@/lib/laika-context";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HintTooltip } from "@/components/ui/tooltip";

type StudioChatComposerProps = {
  laikaLoading: boolean;
  laikaError: string | null;
  awaitingLaika: boolean;
  canType: boolean;
  webSearch: boolean;
  laikaMode: "standard" | "extra";
  contextUsage?: ContextUsageEstimate;
  showScrollButton?: boolean;
  onOpenBranchMap: () => void;
  onSend: (text: string) => void;
  onStop: () => void;
  onScrollToBottom?: () => void;
  onWebSearchChange: (value: boolean) => void;
  onModeChange: (mode: "standard" | "extra") => void;
};

/** Composer footer — local draft state so keystrokes do not re-render the message list. */
export default function StudioChatComposer({
  laikaLoading,
  laikaError,
  awaitingLaika,
  canType,
  webSearch,
  laikaMode,
  contextUsage,
  showScrollButton,
  onOpenBranchMap,
  onSend,
  onStop,
  onScrollToBottom,
  onWebSearchChange,
  onModeChange,
}: StudioChatComposerProps) {
  const [draft, setDraft] = useState("");

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
    <footer className="relative shrink-0 border-t border-white/[0.06] bg-[#02060f]/90 px-4 py-2.5 backdrop-blur-md sm:px-6">
      {showScrollButton && (
        <button
          type="button"
          onClick={onScrollToBottom}
          className="absolute -top-12 right-4 z-20 flex size-9 items-center justify-center rounded-full border border-white/15 bg-bg/90 text-text/70 shadow-lg backdrop-blur-sm transition hover:border-amber/40 hover:text-amber cursor-pointer"
          aria-label="เลื่อนไปล่างสุด"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      )}
      <div className="mx-auto w-full max-w-[75%] space-y-2">
        {laikaError && (
          <p className="font-section-thai text-[0.78rem] text-red-400">{laikaError}</p>
        )}
        <div className="flex w-full items-center gap-2">
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
          <div className="flex h-12 grow items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-1.5 focus-within:border-amber/30">
            {!awaitingLaika && laikaMode === "standard" && (
              <HintTooltip content="ค้นหาจากอินเทอร์เน็ต">
                <button
                  type="button"
                  onClick={() => onWebSearchChange(!webSearch)}
                  className={`flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border transition ${
                    webSearch
                      ? "border-cyan/50 bg-cyan/15 text-cyan"
                      : "border-white/10 bg-white/[0.03] text-muted hover:border-cyan/35 hover:text-cyan"
                  }`}
                  aria-label="Web Search"
                >
                  <IoGlobeOutline className="text-lg" />
                </button>
              </HintTooltip>
            )}
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!canType}
              rows={1}
              placeholder={
                awaitingLaika
                  ? "เลือกคำสั่งจากข้อความของ LAIKA เพื่อเริ่มแชท…"
                  : "พิมพ์ข้อความ… (Enter ส่ง, Shift+Enter ขึ้นบรรทัดใหม่)"
              }
              className="grow max-h-28 min-h-8 flex-1 resize-none bg-transparent px-2 py-2 font-section-thai text-[0.85rem] text-text outline-none placeholder:text-muted/70 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Select
              value={laikaMode}
              onValueChange={(value) => onModeChange(value as "standard" | "extra")}
            >
              <SelectTrigger
                className={`h-9 rounded-lg border px-2.5 text-[0.65rem] font-mono tracking-wider ${
                  laikaMode === "extra"
                    ? "border-violet-500/50 bg-violet-500/15 text-violet-300"
                    : "border-white/10 bg-white/[0.03] text-muted"
                }`}
                aria-label="Select LAIKA mode"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                align="center"
                className="min-w-[11rem] rounded-xl border-white/10 bg-[#0a0f1a] text-text ring-1 ring-white/10"
              >
                <SelectItem
                  value="standard"
                  title="Standard"
                  className="flex-col items-start gap-1 pl-8 pr-3 py-2.5 data-highlighted:bg-white/10"
                >
                  <span className="block text-[0.6rem] leading-tight text-muted">
                    คิดเร็ว ตอบไว
                  </span>
                </SelectItem>
                <SelectItem
                  value="extra"
                  title="Extra"
                  className="flex-col items-start gap-1 pl-8 pr-3 py-2.5 data-highlighted:bg-violet-500/15"
                >
                  <span className="block text-[0.6rem] leading-tight text-violet-300/70">
                    ค้นหาข้อมูลให้ลึกขึ้น
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
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
          {contextUsage && (
            <ContextUsageRing usage={contextUsage} />
          )}
        </div>
        <p className="text-center font-section-thai text-[0.7rem] text-muted/50">
          LAIKA เป็น AI และอาจทำผิดพลาดได้
        </p>
      </div>
    </footer>
  );
}
