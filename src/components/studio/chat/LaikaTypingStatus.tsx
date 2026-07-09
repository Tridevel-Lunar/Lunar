import { useQueuedTypewriter } from "@/lib/use-queued-typewriter";

type LaikaTypingStatusProps = {
  message: string | null;
};

/** Animated LAIKA status — queued delete-then-type transitions (Claude Code-style). */
export default function LaikaTypingStatus({ message }: LaikaTypingStatusProps) {
  const { display, active } = useQueuedTypewriter(message);

  if (!active && !display) return null;

  return (
    <p
      className="font-section-thai mb-0 flex min-h-[1.35rem] items-center gap-2 text-[0.84rem] text-amber/90"
      aria-live="polite"
    >
      <span className="inline-block h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-amber" />
      {display}
    </p>
  );
}
