import type { EntryType } from "@/components/studio/data/studio-data";
import { LAIKA_AVATAR_URL } from "@/lib/constants";

/** Reusable Studio UI primitives (cards, badges, LAIKA avatar). */

export function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-white/10 bg-white/[0.04] shadow-[0_6px_24px_rgba(0,0,0,0.3)] backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

export function TypeBadge({ type }: { type: EntryType }) {
  return (
    <span
      className={`font-mono rounded-full border px-2 py-0.5 text-[0.55rem] tracking-wider ${
        type === "idea"
          ? "border-amber/40 bg-amber/10 text-amber"
          : type === "learn"
            ? "border-violet-400/40 bg-violet-500/10 text-violet-300"
            : "border-teal/40 bg-teal/10 text-teal"
      }`}
    >
      {type === "idea" ? "IDEA" : type === "learn" ? "LEARN" : "NOTE"}
    </span>
  );
}

export function LaikaAvatar({ size = "md" }: { size?: "md" | "lg" }) {
  const dim = size === "lg" ? "h-30 w-30" : "h-10 w-10";
  return (
    <div
      className={`relative shrink-0 overflow-hidden ${dim}`}
    >
      <img
        src={LAIKA_AVATAR_URL}
        alt="LAIKA"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
    </div>
  );
}

export function formatStudioDate(iso: string) {
  return new Date(iso).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

