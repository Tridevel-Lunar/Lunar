import { formatChatDateDivider } from "@/lib/chat-timestamp";

/** Discord-style horizontal rule with centered date pill between message groups. */

type ChatDateDividerProps = {
  createdAt: string;
};

export default function ChatDateDivider({ createdAt }: ChatDateDividerProps) {
  const label = formatChatDateDivider(createdAt);

  return (
    <div
      className="relative flex items-center py-1"
      role="separator"
      aria-label={label}
    >
      <div className="h-px flex-1 bg-white/10" aria-hidden />
      <span className="mx-3 shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-3 py-0.5 font-mono text-[0.58rem] tracking-[0.06em] text-muted-foreground">
        {label}
      </span>
      <div className="h-px flex-1 bg-white/10" aria-hidden />
    </div>
  );
}
