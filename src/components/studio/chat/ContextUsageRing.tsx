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

/** Distinct colors per segment key — like disk space analyzer legend. */
const SEGMENT_COLORS: Record<string, string> = {
  system: "#2dd4bf",
  rag: "#a78bfa",
  learning: "#60a5fa",
  entry: "#34d399",
  history: "#fbbf24",
  pending: "#f472b6",
  web: "#f97316",
  tool_loop: "#a855f7",
  reserved: "#334155",
};

function segmentColor(key: string): string {
  return SEGMENT_COLORS[key] ?? "#94a3b8";
}

function formatTokenCount(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(value);
}

function formatPercent(part: number, total: number): string {
  if (total <= 0) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

/** Segments that belong to the System group. */
const SYSTEM_KEYS = new Set(["system", "rag", "tool_loop", "reserved"]);

export default function ContextUsageRing({ usage, className = "" }: ContextUsageRingProps) {
  const size = 28;
  const stroke = 3;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const fill = Math.min(1, usage.usageRatio);
  const dashOffset = circumference * (1 - fill);
  const color = usageRingColor(fill);
  const percent = Math.round(fill * 100);

  const systemSegments = usage.segments.filter((s) => SYSTEM_KEYS.has(s.key));
  const userSegments = usage.segments.filter((s) => !SYSTEM_KEYS.has(s.key));
  const total = usage.inputBudget;

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
        {/* Header */}
        <p className="font-mono text-[0.58rem] tracking-[0.14em] text-muted-foreground uppercase">
          Context window
        </p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-en text-[1.15rem] font-bold text-popover-foreground">
            {percent}%
          </span>
          <span className="font-section-thai text-[0.72rem] text-muted-foreground">
            ({formatTokenCount(usage.usedInput)} / {formatTokenCount(usage.inputBudget)})
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-2 flex h-1.5 w-full overflow-hidden rounded-full bg-white/[0.1]">
          {usage.segments.map((segment) => (
            <div
              key={segment.key}
              className="h-full"
              style={{
                flex: segment.tokens,
                backgroundColor: segmentColor(segment.key),
              }}
            />
          ))}
          <div
            className="h-full"
            style={{
              flex: usage.reservedOutput,
              backgroundColor: segmentColor("reserved"),
            }}
          />
          {usage.remainingInput > 0 && (
            <div
              className="h-full bg-white/[0.04]"
              style={{ flex: usage.remainingInput }}
            />
          )}
        </div>

        {/* Model info */}
        <p className="font-mono mt-1.5 text-[0.52rem] text-muted-foreground">
          {usage.llmModel} · window {formatTokenCount(usage.contextWindow)} · reserve{" "}
          {formatTokenCount(usage.reservedOutput)}
        </p>

        {/* System group */}
        {systemSegments.length > 0 && (
          <div className="mt-2.5 border-t border-border pt-2">
            <p className="font-mono mb-1.5 text-[0.55rem] tracking-[0.1em] text-muted-foreground/60 uppercase">
              System
            </p>
            <ul className="space-y-1">
              {systemSegments.map((segment) => (
                <li
                  key={segment.key}
                  className="flex items-center justify-between gap-2 font-section-thai text-[0.72rem] text-popover-foreground/75"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <span
                      className="block h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: segmentColor(segment.key) }}
                    />
                    <span className="truncate">{segment.label}</span>
                  </span>
                  <span className="font-mono shrink-0 text-[0.6rem] text-muted-foreground">
                    {formatPercent(segment.tokens, total)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* User Context group */}
        {userSegments.length > 0 && (
          <div className="mt-2 border-t border-border pt-2">
            <p className="font-mono mb-1.5 text-[0.55rem] tracking-[0.1em] text-muted-foreground/60 uppercase">
              User Context
            </p>
            <ul className="space-y-1">
              {userSegments.map((segment) => (
                <li
                  key={segment.key}
                  className="flex items-center justify-between gap-2 font-section-thai text-[0.72rem] text-popover-foreground/75"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <span
                      className="block h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: segmentColor(segment.key) }}
                    />
                    <span className="truncate">{segment.label}</span>
                  </span>
                  <span className="font-mono shrink-0 text-[0.6rem] text-muted-foreground">
                    {formatPercent(segment.tokens, total)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Reserved + remaining row */}
        {(usage.reservedOutput > 0 || usage.remainingInput > 0) && (
          <div className="mt-2 border-t border-border pt-2">
            <ul className="space-y-1">
              {usage.reservedOutput > 0 && (
                <li className="flex items-center justify-between gap-2 font-section-thai text-[0.72rem] text-popover-foreground/75">
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="block h-2 w-2 shrink-0 rounded-full bg-[#334155]" />
                    <span className="truncate">Reserved output</span>
                  </span>
                  <span className="font-mono shrink-0 text-[0.6rem] text-muted-foreground">
                    {formatPercent(usage.reservedOutput, total)}
                  </span>
                </li>
              )}
              {usage.remainingInput > 0 && (
                <li className="flex items-center justify-between gap-2 font-section-thai text-[0.72rem] text-popover-foreground/75">
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="block h-2 w-2 shrink-0 rounded-full bg-white/[0.12]" />
                    <span className="truncate">Available</span>
                  </span>
                  <span className="font-mono shrink-0 text-[0.6rem] text-muted-foreground">
                    {formatPercent(usage.remainingInput, total)}
                  </span>
                </li>
              )}
            </ul>
          </div>
        )}

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
