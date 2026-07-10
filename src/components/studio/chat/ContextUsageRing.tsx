import type { ContextUsageEstimate } from "@/lib/laika-context";
import { usageRingColor } from "@/lib/laika-context";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
    <Popover>
      <PopoverTrigger
        className={`flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/[0.02] transition hover:border-white/20 hover:bg-white/[0.05] focus-visible:border-cyan/35 focus-visible:ring-2 focus-visible:ring-cyan/20 focus-visible:outline-none ${className}`}
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
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="center"
        sideOffset={8}
        className="w-64 gap-0 rounded-xl border-border bg-popover p-3 text-left shadow-xl ring-1 ring-cyan/10"
      >
        <p className="font-mono text-[0.58rem] tracking-[0.14em] text-muted-foreground uppercase">
          Context window
        </p>
        <p className="font-section-thai mt-1 text-[0.82rem] text-popover-foreground">
          {formatTokenCount(usage.usedInput)} / {formatTokenCount(usage.inputBudget)} input tokens
          <span className="text-muted-foreground"> ({percent}%)</span>
        </p>
        <p className="font-mono mt-1 text-[0.52rem] text-muted-foreground">
          {usage.llmModel} · window {formatTokenCount(usage.contextWindow)} · reserve output{" "}
          {formatTokenCount(usage.reservedOutput)}
        </p>

        <ul className="mt-2.5 space-y-1 border-t border-border pt-2">
          {usage.segments.map((segment) => (
            <li
              key={segment.key}
              className="flex items-center justify-between gap-2 font-section-thai text-[0.72rem] text-popover-foreground/75"
            >
              <span>{segment.label}</span>
              <span className="font-mono text-[0.62rem] text-muted-foreground">{segment.tokens}</span>
            </li>
          ))}
        </ul>

        {usage.historyTrimmedCount > 0 && (
          <p className="font-section-thai mt-2 text-[0.68rem] leading-snug text-amber/90">
            ประวัติแชทบางส่วนถูกตัดออกจาก context — ข้อความเก่าอาจไม่ถูกส่งให้โมเดล
          </p>
        )}

        <p className="font-mono mt-2 text-[0.5rem] leading-relaxed text-muted-foreground/90">
          ประมาณการจากความยาวข้อความ · RAG ~5 chunks
        </p>
      </PopoverContent>
    </Popover>
  );
}
