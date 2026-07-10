import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

import { HintTooltip } from "@/components/ui/tooltip";

/** Prev/next control when multiple user variants share the same parent. */

type UserBranchPagerProps = {
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  disabled?: boolean;
};

export default function UserBranchPager({
  index,
  total,
  onPrev,
  onNext,
  disabled,
}: UserBranchPagerProps) {
  if (total <= 1) return null;

  return (
    <div className="mt-1 flex items-center justify-end gap-1">
      <HintTooltip content="ข้อความก่อนหน้า">
        <button
          type="button"
          onClick={onPrev}
          disabled={disabled || index <= 0}
          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-white/10 text-muted transition hover:border-white/25 hover:text-text disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="ข้อความก่อนหน้า"
        >
          <HiChevronLeft className="text-sm" />
        </button>
      </HintTooltip>
      <span className="font-mono text-[0.58rem] text-muted">
        {index + 1} / {total}
      </span>
      <HintTooltip content="ข้อความถัดไป">
        <button
          type="button"
          onClick={onNext}
          disabled={disabled || index >= total - 1}
          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-white/10 text-muted transition hover:border-white/25 hover:text-text disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="ข้อความถัดไป"
        >
          <HiChevronRight className="text-sm" />
        </button>
      </HintTooltip>
    </div>
  );
}
