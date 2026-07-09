import { useEffect } from "react";
import { HiOutlineXMark } from "react-icons/hi2";

import type { StudioBranchMap } from "@/lib/api";
import BranchMapGraph from "@/components/studio/branch-map/BranchMapGraph";

/** Modal overlay for the conversation branch map (user nodes only). */

type BranchMapDialogProps = {
  open: boolean;
  branchMap: StudioBranchMap | null;
  branchMapLoading?: boolean;
  focusUserId?: string | null;
  onClose: () => void;
  onSelectNode: (nodeId: string) => void;
};

export default function BranchMapDialog({
  open,
  branchMap,
  branchMapLoading = false,
  focusUserId,
  onClose,
  onSelectNode,
}: BranchMapDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-[90vw] overflow-hidden rounded-2xl border border-white/12 bg-[#0a1220] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="branch-map-title"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <p id="branch-map-title" className="font-mono text-[0.62rem] tracking-[0.14em] text-muted">
              BRANCH MAP
            </p>
            <p className="font-section-thai text-[0.85rem] text-text">แผนผังเส้นทางสนทนา</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-white/10 text-muted transition hover:text-text"
            aria-label="ปิด"
          >
            <HiOutlineXMark />
          </button>
        </div>
        <div className="p-4">
          {branchMapLoading ? (
            <p className="font-mono py-16 text-center text-[0.62rem] tracking-wider text-muted">
              กำลังโหลดแผนผัง…
            </p>
          ) : (
            <BranchMapGraph
              open={open}
              branchMap={branchMap}
              focusUserId={focusUserId}
              onSelectNode={(id) => {
                onSelectNode(id);
                onClose();
              }}
            />
          )}
        </div>
        <p className="border-t border-white/10 px-4 py-2 font-mono text-[0.52rem] text-muted">
          ลากเพื่อเลื่อน · scroll เพื่อซูม · คลิกกล่องคำถามเพื่อสลับ branch · เส้นขาว = branch ปัจจุบัน · กล่องฟ้า = ตำแหน่งที่กำลังดู
        </p>
      </div>
    </div>
  );
}
