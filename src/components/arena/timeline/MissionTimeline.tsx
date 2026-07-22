import { HiOutlineBolt, HiOutlineSignal } from "react-icons/hi2";
import { IoMoonOutline, IoSunnyOutline } from "react-icons/io5";

import type { ArenaTickLog } from "@/lib/api";
import {
  getPhaseForTick,
  isDaylightAtTick,
  type MissionTimelineConfig,
} from "@/components/arena/timeline/mission-timeline-config";

const PHASE_COLORS = [
  "bg-cyan/15 border-cyan/25",
  "bg-orange-400/10 border-orange-400/25",
  "bg-violet-400/10 border-violet-400/25",
  "bg-amber-400/10 border-amber-400/25",
];

export type MissionTimelineProps = {
  config: MissionTimelineConfig;
  ticks?: ArenaTickLog[];
  selectedTick: number;
  onSelectTick: (tick: number) => void;
  /** Brief highlight while stepping through ticks after a run. */
  playbackTick?: number | null;
  className?: string;
};

function tickMarker(config: MissionTimelineConfig, tick: number) {
  if (tick === config.glitchTick) return "glitch";
  if (tick === config.checkTick) return "check";
  return "normal";
}

function dotClassName(
  tick: number,
  selectedTick: number,
  playbackTick: number | null | undefined,
  hasRunData: boolean,
  log: ArenaTickLog | undefined,
  config: MissionTimelineConfig,
): string {
  const isSelected = tick === selectedTick;
  const isPlayback = playbackTick === tick;
  const marker = tickMarker(config, tick);

  const base =
    "relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition";

  if (isSelected || isPlayback) {
    if (marker === "glitch") {
      return `${base} border-amber-400 bg-amber-400/25 shadow-[0_0_10px_rgba(251,191,36,0.35)]`;
    }
    if (marker === "check") {
      return `${base} border-cyan bg-cyan/25 shadow-[0_0_10px_rgba(0,229,255,0.35)]`;
    }
    return `${base} border-cyan bg-cyan/20 shadow-[0_0_8px_rgba(0,229,255,0.25)]`;
  }

  if (hasRunData && log?.glitch_applied) {
    return `${base} border-amber-500/60 bg-amber-500/15`;
  }

  if (hasRunData) {
    return `${base} border-emerald-500/35 bg-emerald-500/10 hover:border-emerald-400/55`;
  }

  if (marker === "glitch") {
    return `${base} border-amber-500/40 bg-amber-500/8 hover:border-amber-400/60`;
  }
  if (marker === "check") {
    return `${base} border-cyan/45 bg-cyan/8 hover:border-cyan/65`;
  }

  return `${base} border-white/20 bg-white/[0.04] hover:border-white/35`;
}

export default function MissionTimeline({
  config,
  ticks,
  selectedTick,
  onSelectTick,
  playbackTick = null,
  className,
}: MissionTimelineProps) {
  const hasRunData = Boolean(ticks && ticks.length > 0);
  const tickLogs = new Map(ticks?.map((entry) => [entry.tick, entry]) ?? []);
  const selectedPhase = getPhaseForTick(config, selectedTick);
  const selectedLog = tickLogs.get(selectedTick);
  const selectedDaylight = isDaylightAtTick(config, selectedTick);

  return (
    <section
      className={`flex min-h-0 flex-col overflow-hidden rounded-lg border border-white/10 bg-[#060e1c]/80 ${className ?? ""}`}
    >
      <header className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-3 py-2">
        <h3 className="font-display text-[0.65rem] font-semibold tracking-[0.14em] text-text/70">
          รอบปฏิบัติการ
        </h3>
        <span className="font-mono text-[0.5rem] tracking-wider text-muted">
          {hasRunData ? "REPLAY" : "PREVIEW"} · {config.totalTicks} TICKS
        </span>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-2.5 p-3">
        {/* Phase segments */}
        <div className="flex gap-0.5">
          {config.phases.map((phase, index) => {
            const span = phase.endTick - phase.startTick + 1;
            const flex = span / config.totalTicks;
            return (
              <div
                key={phase.name}
                className={`min-w-0 rounded border px-1 py-0.5 text-center ${PHASE_COLORS[index % PHASE_COLORS.length]}`}
                style={{ flex: `${flex} 1 0` }}
                title={phase.name}
              >
                <p className="truncate font-section-thai text-[0.58rem] leading-tight text-text/65">
                  {phase.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Tick dots */}
        <div
          className="flex items-start justify-between gap-0.5"
          role="tablist"
          aria-label="ไทม์ไลน์รอบปฏิบัติการ"
        >
          {Array.from({ length: config.totalTicks }, (_, index) => {
            const tick = index + 1;
            const log = tickLogs.get(tick);
            const daylight = isDaylightAtTick(config, tick);
            const marker = tickMarker(config, tick);
            const label =
              marker === "glitch"
                ? `รอบ ${tick} รังสีคอสมิก`
                : marker === "check"
                  ? `รอบ ${tick} ส่งข้อมูลกลับโลก`
                  : `รอบ ${tick} ${daylight ? "กลางวัน" : "กลางคืน"}`;

            return (
              <div key={tick} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                <button
                  type="button"
                  role="tab"
                  aria-selected={tick === selectedTick}
                  aria-label={label}
                  title={label}
                  onClick={() => onSelectTick(tick)}
                  className={dotClassName(
                    tick,
                    selectedTick,
                    playbackTick,
                    hasRunData,
                    log,
                    config,
                  )}
                >
                  {marker === "glitch" ? (
                    <HiOutlineBolt className="text-[0.55rem] text-amber-300" aria-hidden />
                  ) : marker === "check" ? (
                    <HiOutlineSignal className="text-[0.55rem] text-cyan" aria-hidden />
                  ) : (
                    <span className="sr-only">{tick}</span>
                  )}
                </button>
                <span
                  className={`font-mono text-[0.48rem] leading-none ${
                    tick === selectedTick ? "text-cyan" : "text-muted"
                  }`}
                >
                  {tick}
                </span>
                <span className="text-[0.55rem] leading-none text-text/35" aria-hidden>
                  {daylight ? (
                    <IoSunnyOutline className="text-amber-200/55" />
                  ) : (
                    <IoMoonOutline className="text-indigo-200/45" />
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {/* Selected tick detail */}
        <div className="flex min-h-0 flex-1 flex-col justify-center rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
          <p className="font-display text-[0.58rem] tracking-[0.12em] text-cyan/80">
            รอบ {selectedTick}
            <span className="text-muted"> · tick {selectedTick}</span>
          </p>
          <p className="font-section-thai mt-1 text-[0.78rem] leading-snug text-text/75">
            {selectedPhase?.label ?? "—"}
            {" · "}
            {selectedDaylight ? "กลางวัน" : "กลางคืน"}
            {selectedTick === config.glitchTick ? " · รังสีคอสมิก (-25% แบต)" : ""}
            {selectedTick === config.checkTick ? " · ตัดเกรดและส่งข้อมูล" : ""}
          </p>
          {hasRunData && selectedLog ? (
            <p className="font-section-thai mt-1.5 text-[0.72rem] text-text/60">
              แบต {selectedLog.battery}% · อุณหภูมิ {selectedLog.temperature}°C
              {selectedLog.glitch_applied ? " · glitch เกิดขึ้น" : ""}
              {selectedLog.safe_mode ? " · safe mode" : ""}
            </p>
          ) : (
            <p className="font-section-thai mt-1.5 text-[0.72rem] text-text/45">
              {hasRunData
                ? "ไม่มีข้อมูลรอบนี้"
                : "กดส่งภารกิจเพื่อดูค่าแบต/อุณหภูมิแต่ละรอบ · คลิกจุดเพื่อดูตารางล่วงหน้า"}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
