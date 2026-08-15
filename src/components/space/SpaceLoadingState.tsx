import { Loader2 } from "lucide-react";

type Props = {
  label?: string;
};

/** Full-panel wait state while Space shell / path session data loads. */
export default function SpaceLoadingState({ label = "กำลังโหลด…" }: Props) {
  return (
    <div
      className="flex h-full min-h-0 flex-col items-center justify-center gap-3 px-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative flex size-12 items-center justify-center">
        <span className="absolute inset-0 rounded-full border border-cyan/15" aria-hidden />
        <Loader2 className="size-7 animate-spin text-cyan" aria-hidden />
      </div>
      <p className="font-mono text-[0.72rem] tracking-[0.14em] text-muted uppercase">{label}</p>
    </div>
  );
}
