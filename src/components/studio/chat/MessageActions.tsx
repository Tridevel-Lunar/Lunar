import { HiArrowPath, HiOutlineClipboard, HiOutlinePencilSquare } from "react-icons/hi2";
import { TbGitBranch } from "react-icons/tb";

import { HintTooltip } from "@/components/ui/tooltip";

/** Copy / edit / branch actions under user bubbles. */

type UserMessageActionsProps = {
  onCopy: () => void;
  onEdit?: () => void;
  onCreateBranch?: () => void;
  canCreateBranch?: boolean;
  disabled?: boolean;
  streaming?: boolean;
};

export function UserMessageActions({
  onCopy,
  onEdit,
  onCreateBranch,
  canCreateBranch = true,
  disabled,
  streaming,
}: UserMessageActionsProps) {
  return (
    <div className="flex justify-end gap-0.5">
      <IconActionButton label="Copy" onClick={onCopy} disabled={disabled}>
        <HiOutlineClipboard />
      </IconActionButton>
      {onEdit && (
        <IconActionButton label="Edit" onClick={onEdit} disabled={disabled || streaming}>
          <HiOutlinePencilSquare />
        </IconActionButton>
      )}
      {canCreateBranch && onCreateBranch && (
        <IconActionButton label="Create Branch" onClick={onCreateBranch} disabled={disabled || streaming}>
          <TbGitBranch />
        </IconActionButton>
      )}
    </div>
  );
}

type AssistantMessageActionsProps = {
  onCopy: () => void;
  onRetry?: () => void;
  disabled?: boolean;
  streaming?: boolean;
};

export function AssistantMessageActions({
  onCopy,
  onRetry,
  disabled,
  streaming,
}: AssistantMessageActionsProps) {
  return (
    <div className="flex gap-0.5">
      <IconActionButton label="Copy" onClick={onCopy} disabled={disabled}>
        <HiOutlineClipboard />
      </IconActionButton>
      {onRetry && (
        <IconActionButton label="Retry" onClick={onRetry} disabled={disabled || streaming}>
          <HiArrowPath />
        </IconActionButton>
      )}
    </div>
  );
}

function IconActionButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <HintTooltip content={label}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-muted transition hover:bg-white/[0.06] hover:text-text disabled:cursor-not-allowed disabled:opacity-40 [&_svg]:size-5"
      >
        {children}
      </button>
    </HintTooltip>
  );
}
