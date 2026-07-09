import type { ContextUsageEstimate } from "@/lib/laika-context";
import { usageRingColor } from "@/lib/laika-context";

/** Composer ring showing estimated LAIKA input token usage vs context window. */

type ContextUsageRingProps = {
  usage: ContextUsageEstimate;
  className?: string;
};

function formatTokenCount(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(value);
}

export default function ContextUsageRing({ usage, className = "" }: ContextUsageRingProps) {
  const size = 28;
  const stroke = 3;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const fill = Math.min(1, usage.usageRatio);
  const dashOffset = circumference * (1 - fill);
  const color = usageRingColor(fill);
  const percent = Math.round(fill * 100);

  return (
    <div className={`group relative shrink-0 ${className}`}>
      <button
        type="button"
        className="flex h-9 w-9 cursor-default items-center justify-center rounded-lg border border-white/10 bg-white/[0.02] transition hover:border-white/20 hover:bg-white/[0.05]"
        aria-label={`Context ${percent}% — ${usage.usedInput} / ${usage.inputBudget} tokens`}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-white/10"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-[stroke-dashoffset] duration-300"
          />
        </svg>
      </button>

      <div
        role="tooltip"
        className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 hidden w-64 rounded-xl border border-white/12 bg-[#0a1220]/98 p-3 text-left shadow-xl backdrop-blur-md group-hover:block"
      >
        <p className="font-mono text-[0.58rem] tracking-[0.14em] text-muted">CONTEXT WINDOW</p>
        <p className="font-section-thai mt-1 text-[0.82rem] text-text">
          {formatTokenCount(usage.usedInput)} / {formatTokenCount(usage.inputBudget)} input tokens
          <span className="text-muted"> ({percent}%)</span>
        </p>
        <p className="font-mono mt-1 text-[0.52rem] text-muted/90">
          {usage.llmModel} · window {formatTokenCount(usage.contextWindow)} · reserve output{" "}
          {formatTokenCount(usage.reservedOutput)}
        </p>

        <ul className="mt-2.5 space-y-1 border-t border-white/10 pt-2">
          {usage.segments.map((segment) => (
            <li
              key={segment.key}
              className="flex items-center justify-between gap-2 font-section-thai text-[0.72rem] text-text/75"
            >
              <span>{segment.label}</span>
              <span className="font-mono text-[0.62rem] text-muted">{segment.tokens}</span>
            </li>
          ))}
        </ul>

        {usage.historyTrimmedCount > 0 && (
          <p className="font-section-thai mt-2 text-[0.68rem] leading-snug text-amber/90">
            ประวัติแชทบางส่วนถูกตัดออกจาก context — ข้อความเก่าอาจไม่ถูกส่งให้โมเดล
          </p>
        )}

        <p className="font-mono mt-2 text-[0.5rem] leading-relaxed text-muted/80">
          ประมาณการจากความยาวข้อความ · RAG ~5 chunks
        </p>
      </div>
    </div>
  );
}
