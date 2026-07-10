import { Loader2, MapIcon, RefreshCw } from "lucide-react";

import type { StudioBranchMap } from "@/lib/api";
import BranchMapGraph from "@/components/studio/branch-map/BranchMapGraph";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/** Branch map modal (user nodes only) — shadcn Dialog with LUNAR theme tokens. */

type BranchMapDialogProps = {
  open: boolean;
  branchMap: StudioBranchMap | null;
  branchMapLoading?: boolean;
  branchMapError?: string | null;
  focusUserId?: string | null;
  onClose: () => void;
  onRetry?: () => void;
  onSelectNode: (nodeId: string) => void;
};

const MAP_PANEL_CLASS =
  "relative flex min-h-[280px] h-[min(58vh,520px)] w-full items-center justify-center overflow-hidden rounded-xl border border-white/[0.06] bg-[#060b14]";

function BranchMapLoadingState() {
  return (
    <div className={MAP_PANEL_CLASS}>
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="relative flex size-12 items-center justify-center">
          <span className="absolute inset-0 rounded-full border border-cyan/15" aria-hidden />
          <Loader2 className="size-7 animate-spin text-cyan" aria-hidden />
        </div>
        <p className="font-mono text-[0.62rem] tracking-[0.14em] text-muted-foreground uppercase">
          กำลังโหลดแผนผัง
        </p>
      </div>
    </div>
  );
}

function BranchMapErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className={MAP_PANEL_CLASS}>
      <div className="flex max-w-sm flex-col items-center gap-3 px-6 text-center">
        <div className="flex size-11 items-center justify-center rounded-full border border-red-400/25 bg-red-400/10">
          <MapIcon className="size-5 text-red-400" aria-hidden />
        </div>
        <div className="space-y-1">
          <p className="font-section-thai text-[0.88rem] text-foreground">โหลดแผนผังไม่สำเร็จ</p>
          <p className="font-section-thai text-[0.78rem] leading-relaxed text-muted-foreground">
            {message}
          </p>
        </div>
        {onRetry && (
          <Button type="button" variant="outline" size="sm" onClick={onRetry} className="mt-1">
            <RefreshCw className="size-3.5" data-icon="inline-start" />
            ลองใหม่
          </Button>
        )}
      </div>
    </div>
  );
}

function BranchMapEmptyState() {
  return (
    <div className={MAP_PANEL_CLASS}>
      <div className="flex max-w-sm flex-col items-center gap-2 px-6 text-center">
        <div className="flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
          <MapIcon className="size-5 text-muted-foreground" aria-hidden />
        </div>
        <p className="font-section-thai text-[0.88rem] text-foreground">ยังไม่มี branch</p>
        <p className="font-section-thai text-[0.78rem] leading-relaxed text-muted-foreground">
          สร้าง branch จากข้อความในแชทเพื่อดูแผนผังเส้นทางสนทนา
        </p>
      </div>
    </div>
  );
}

export default function BranchMapDialog({
  open,
  branchMap,
  branchMapLoading = false,
  branchMapError = null,
  focusUserId,
  onClose,
  onRetry,
  onSelectNode,
}: BranchMapDialogProps) {
  const hasNodes = (branchMap?.user_nodes.length ?? 0) > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent
        showCloseButton
        className="flex max-h-[90vh] w-full max-w-[min(90vw,960px)] flex-col gap-0 overflow-hidden border-border bg-popover p-0 text-popover-foreground sm:max-w-[min(90vw,960px)]"
      >
        <DialogHeader className="border-b border-border px-4 py-3 text-left">
          <DialogTitle className="font-mono text-[0.62rem] tracking-[0.14em] text-muted-foreground uppercase">
            Branch map
          </DialogTitle>
          <DialogDescription className="font-section-thai text-[0.85rem] text-foreground">
            แผนผังเส้นทางสนทนา
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-auto p-4">
          {branchMapLoading ? (
            <BranchMapLoadingState />
          ) : branchMapError ? (
            <BranchMapErrorState message={branchMapError} onRetry={onRetry} />
          ) : !hasNodes ? (
            <BranchMapEmptyState />
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

        <p className="border-t border-border px-4 py-2 font-mono text-[0.52rem] text-muted-foreground">
          ลากเพื่อเลื่อน · scroll เพื่อซูม · คลิกกล่องคำถามเพื่อสลับ branch · เส้นขาว = branch
          ปัจจุบัน · กล่องฟ้า = ตำแหน่งที่กำลังดู
        </p>
      </DialogContent>
    </Dialog>
  );
}

