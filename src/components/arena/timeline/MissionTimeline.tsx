import { lazy, Suspense } from "react";
import { IoMoonOutline, IoSunnyOutline } from "react-icons/io5";

import type { ArenaOrbitTraceEntry } from "@/lib/api";
import type { MissionOrbitTimelineConfig } from "@/components/arena/timeline/mission-timeline-config";

const ArenaOrbitPreview = lazy(() => import("@/components/arena/orbit/ArenaOrbitPreview"));

export type MissionTimelineProps = {
  config: MissionOrbitTimelineConfig;
  /** Sampled orbit trace from a run (optional). */
  trace?: ArenaOrbitTraceEntry[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  playbackIndex?: number | null;
  className?: string;
  /** Preview-only mode when no trace yet — show band summary. */
  preview?: boolean;
};

function formatSimSec(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function MissionTimeline({
  config,
  trace,
  selectedIndex,
  onSelectIndex,
  playbackIndex = null,
  className,
  preview = false,
}: MissionTimelineProps) {
  const hasRunData = Boolean(trace && trace.length > 0);
  const samples = hasRunData
    ? trace!
    : config.bands.map((band, i) => {
        const mid = (band.startPhase + band.endPhase) / 2;
        return {
          simSec: Math.round(mid * config.orbitPeriodSec),
          phase: mid,
          isSunlit: band.sunlit,
          battery: 0,
          temperature: 0,
          heaterOn: false,
          payloadOn: false,
          safeMode: false,
          _previewLabel: band.label,
          _previewIndex: i,
        };
      });

  const selected = samples[Math.min(selectedIndex, samples.length - 1)];
  const displayCount = Math.min(samples.length, 24);
  const step = Math.max(1, Math.floor(samples.length / displayCount));
  const visibleIndices = Array.from({ length: samples.length }, (_, i) => i).filter(
    (i) => i % step === 0 || i === samples.length - 1,
  );

  return (
    <section
      className={`flex min-h-0 flex-col overflow-hidden rounded-lg border border-white/10 bg-[#060e1c]/80 ${className ?? ""}`}
    >
      <header className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-3 py-2">
        <h3 className="font-display text-[0.65rem] font-semibold tracking-[0.14em] text-text/70">
          วงโคจร 1 รอบ
        </h3>
        <span className="font-mono text-[0.5rem] tracking-wider text-muted">
          {hasRunData ? "REPLAY" : "PREVIEW"} · {config.orbitPeriodSec}s
        </span>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-2.5 p-3">
        {/* Sun / eclipse bands */}
        <div className="flex h-6 overflow-hidden rounded border border-white/10">
          {config.bands.map((band) => {
            const flex = band.endPhase - band.startPhase;
            return (
              <div
                key={band.name}
                className={`flex min-w-0 items-center justify-center ${
                  band.sunlit
                    ? "bg-amber-400/20 text-amber-100/80"
                    : "bg-indigo-500/25 text-indigo-100/70"
                }`}
                style={{ flex: `${flex} 1 0` }}
                title={band.name}
              >
                <span className="truncate font-section-thai text-[0.55rem]">
                  {band.sunlit ? (
                    <IoSunnyOutline className="inline text-[0.7rem]" />
                  ) : (
                    <IoMoonOutline className="inline text-[0.7rem]" />
                  )}{" "}
                  {band.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Sample dots */}
        {!preview || hasRunData ? (
          <div
            className="flex w-full min-w-0 items-center overflow-hidden"
            role="tablist"
            aria-label="ไทม์ไลน์วงโคจร"
          >
            {visibleIndices.map((index) => {
              const entry = samples[index];
              const isSelected = index === selectedIndex;
              const isPlayback = playbackIndex === index;
              return (
                <div
                  key={entry.simSec}
                  className="flex min-w-0 flex-1 items-center justify-center px-px"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    aria-label={`simSec ${entry.simSec}`}
                    title={`${formatSimSec(entry.simSec)} · ${entry.isSunlit ? "แดด" : "eclipse"}`}
                    onClick={() => onSelectIndex(index)}
                    className={`aspect-square w-full max-w-3.5 rounded-full border transition ${
                      isSelected || isPlayback
                        ? "border-cyan bg-cyan/25 shadow-[0_0_8px_rgba(0,229,255,0.25)]"
                        : entry.isSunlit
                          ? "border-amber-400/40 bg-amber-400/10 hover:border-amber-300/60"
                          : "border-indigo-400/40 bg-indigo-500/15 hover:border-indigo-300/60"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        ) : null}

        <div className="relative min-h-[160px] flex-1">
          <Suspense
            fallback={
              <div className="flex h-full min-h-[160px] items-center justify-center rounded-md border border-white/[0.06] bg-[#02060f] font-section-thai text-[0.72rem] text-text/45">
                กำลังโหลดภาพวงโคจร…
              </div>
            }
          >
            <ArenaOrbitPreview
              sample={
                selected
                  ? {
                      phase: selected.phase,
                      isSunlit: selected.isSunlit,
                      heaterOn: selected.heaterOn,
                      payloadOn: selected.payloadOn,
                      safeMode: selected.safeMode,
                    }
                  : null
              }
              className="h-full min-h-[160px]"
            />
          </Suspense>
          {selected ? (
            <div className="pointer-events-none absolute bottom-2 left-2 right-2 rounded-md bg-[#02060f]/75 px-2 py-1.5 backdrop-blur-sm">
              <p className="font-display text-[0.58rem] tracking-[0.12em] text-cyan/80">
                t = {formatSimSec(selected.simSec)}
                <span className="text-muted"> · phase {selected.phase.toFixed(2)}</span>
              </p>
              <p className="font-section-thai mt-0.5 text-[0.72rem] leading-snug text-text/75">
                {selected.isSunlit ? "อยู่ในแสงอาทิตย์" : "อยู่ใน eclipse"}
                {selected.simSec >= config.passSimSec &&
                selected.simSec < config.passSimSec + 30
                  ? " · ใกล้ช่วง pass"
                  : ""}
              </p>
              {hasRunData ? (
                <p className="font-section-thai mt-0.5 text-[0.68rem] text-text/60">
                  แบต {selected.battery}% · อุณหภูมิ {selected.temperature}°C
                  {selected.heaterOn ? " · heater ON" : ""}
                  {selected.payloadOn ? " · payload ON" : ""}
                  {selected.safeMode ? " · safe mode" : ""}
                </p>
              ) : (
                <p className="font-section-thai mt-0.5 text-[0.68rem] text-text/45">
                  เริ่มที่ subsolar → เข้า eclipse กลางวง → กลับสู่แดด
                </p>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
