import { Loader2 } from "lucide-react";

type Props = {
  label?: string;
};

/** Full-panel wait state while Studio shell / chat / collections load. */
export default function StudioLoadingState({ label = "กำลังโหลด…" }: Props) {
  return (
    <div
      className="flex h-full min-h-0 flex-col items-center justify-center gap-3 px-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative h-11 w-11" aria-hidden>
        <div className="absolute inset-0 rounded-full border-2 border-white/10" />
        <div
          className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-amber border-r-amber/60"
        />
      </div>
      <p className="font-mono text-[0.72rem] tracking-[0.14em] text-muted uppercase">{label}</p>
    </div>
  );
}
