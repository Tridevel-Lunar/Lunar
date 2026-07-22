import { useEffect, useRef, useState } from "react";
import {
  HiOutlineExclamationTriangle,
  HiOutlineSignal,
} from "react-icons/hi2";
import {
  IoBatteryHalfOutline,
  IoCubeOutline,
  IoThermometerOutline,
  IoTrophyOutline,
} from "react-icons/io5";

import type { ArenaRunResponse } from "@/lib/api";
import { gradeLabel } from "@/components/arena/grade-label";
import MissionTimeline from "@/components/arena/timeline/MissionTimeline";
import { getMissionOrbitTimelineConfig } from "@/components/arena/timeline/mission-timeline-config";

const PLAYBACK_MS = 120;

/** Mission Feedback panel for one-orbit run results. */
export default function MissionFeedbackMock({
  missionId,
  runResult,
}: {
  missionId: string;
  runResult: ArenaRunResponse | null;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [playbackIndex, setPlaybackIndex] = useState<number | null>(null);
  const playbackRef = useRef<number | null>(null);

  const timelineConfig = getMissionOrbitTimelineConfig(missionId);
  const trace = runResult?.trace ?? [];
  const display = trace[selectedIndex] ?? trace.at(-1);
  const battery = display?.battery ?? (runResult ? 0 : null);
  const temperature = display?.temperature ?? (runResult ? 0 : null);
  const grade = runResult?.result.grade;
  const isSuccess = grade === "perfect";
  const overrun = runResult?.timing?.overrunCount ?? 0;

  useEffect(() => {
    if (!runResult?.trace.length) {
      setSelectedIndex(0);
      setPlaybackIndex(null);
      return;
    }

    let step = 0;
    const samples = runResult.trace;
    // Step through a subset for snappy replay (~40 frames max)
    const stride = Math.max(1, Math.floor(samples.length / 40));

    const advance = () => {
      if (step >= samples.length) {
        setPlaybackIndex(null);
        setSelectedIndex(samples.length - 1);
        playbackRef.current = null;
        return;
      }
      setPlaybackIndex(step);
      setSelectedIndex(step);
      step += stride;
      playbackRef.current = window.setTimeout(advance, PLAYBACK_MS);
    };

    setSelectedIndex(0);
    setPlaybackIndex(0);
    playbackRef.current = window.setTimeout(advance, PLAYBACK_MS);

    return () => {
      if (playbackRef.current !== null) {
        window.clearTimeout(playbackRef.current);
        playbackRef.current = null;
      }
    };
  }, [runResult]);

  function handleSelectIndex(index: number) {
    if (playbackRef.current !== null) {
      window.clearTimeout(playbackRef.current);
      playbackRef.current = null;
    }
    setPlaybackIndex(null);
    setSelectedIndex(index);
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden p-3">
      {timelineConfig ? (
        <MissionTimeline
          className="min-h-0 flex-[3]"
          config={
            runResult
              ? {
                  ...timelineConfig,
                  eclipseEnterSec: runResult.orbitSummary.eclipseEnterSec,
                  eclipseExitSec: runResult.orbitSummary.eclipseExitSec,
                  orbitPeriodSec: runResult.orbitPeriodSec,
                }
              : timelineConfig
          }
          trace={runResult?.trace}
          selectedIndex={selectedIndex}
          onSelectIndex={handleSelectIndex}
          playbackIndex={playbackIndex}
          preview={!runResult}
        />
      ) : (
        <div className="min-h-0 flex-[2]" aria-hidden />
      )}

      <section className="flex shrink-0 flex-col overflow-hidden rounded-lg border border-white/10 bg-[#060e1c]/80">
        <header className="shrink-0 border-b border-white/[0.06] px-3 py-2">
          <h3 className="font-display text-[0.65rem] font-semibold tracking-[0.14em] text-text/70">
            SATELLITE DASHBOARD
          </h3>
        </header>
        <div className="grid grid-cols-3 gap-2 p-3">
          <div className="flex min-w-0 items-center gap-2 rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
            <IoBatteryHalfOutline className="shrink-0 text-lg text-emerald-400/80" aria-hidden />
            <div className="min-w-0">
              <p className="font-mono text-[0.5rem] tracking-wider text-muted">BATTERY</p>
              <p className="font-display text-[0.85rem] text-text/90">
                {battery !== null ? `${battery}%` : "—"}
              </p>
            </div>
          </div>
          <div className="flex min-w-0 items-center gap-2 rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
            <IoThermometerOutline className="shrink-0 text-lg text-orange-300/80" aria-hidden />
            <div className="min-w-0">
              <p className="font-mono text-[0.5rem] tracking-wider text-muted">TEMP</p>
              <p className="font-display text-[0.85rem] text-text/90">
                {temperature !== null ? `${temperature}°C` : "—"}
              </p>
            </div>
          </div>
          <div className="flex min-w-0 items-center gap-2 rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
            <HiOutlineSignal className="shrink-0 text-lg text-cyan/70" aria-hidden />
            <div className="min-w-0">
              <p className="font-mono text-[0.5rem] tracking-wider text-muted">SIGNAL</p>
              <p
                className="font-display text-[0.85rem] tracking-widest text-text/90"
                aria-label="สัญญาณจากผลภารกิจ"
              >
                {!runResult
                  ? "—"
                  : runResult.result.comms === "full"
                    ? "■■■■"
                    : runResult.result.comms === "partial"
                      ? "■■□"
                      : "□"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex shrink-0 flex-col overflow-hidden rounded-lg border border-white/10 bg-[#060e1c]/80">
        <header className="flex shrink-0 items-center gap-2 border-b border-white/[0.06] px-3 py-2">
          {runResult && isSuccess ? (
            <IoTrophyOutline className="text-base text-amber-400/90" aria-hidden />
          ) : runResult ? (
            <HiOutlineExclamationTriangle className="text-base text-amber-400/90" aria-hidden />
          ) : null}
          <h3 className="font-display text-[0.65rem] font-semibold tracking-[0.14em] text-text/70">
            MISSION OUTCOME
          </h3>
        </header>
        <div className="flex items-start gap-3 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10">
            <IoCubeOutline className="text-xl text-amber-300" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="font-section-thai text-[0.9rem] font-medium leading-snug text-amber-200/95">
              {runResult
                ? `${gradeLabel(grade)} • Comms ${runResult.result.comms}`
                : "ยังไม่มีผลลัพธ์ภารกิจ"}
            </p>
            {runResult ? (
              <ul className="font-section-thai space-y-1 text-[0.82rem] leading-relaxed text-text/70">
                <li>
                  ดาวเทียมอยู่รอด:{" "}
                  <span
                    className={
                      runResult.result.satellite_survived
                        ? "font-medium text-emerald-400"
                        : "font-medium text-red-400"
                    }
                  >
                    {runResult.result.satellite_survived ? "ใช่" : "ไม่ใช่"}
                  </span>
                </li>
                <li>
                  ส่งข้อมูลกลับโลกได้:{" "}
                  <span
                    className={
                      runResult.result.sent_to_earth
                        ? "font-medium text-emerald-400"
                        : "font-medium text-red-400"
                    }
                  >
                    {runResult.result.sent_to_earth ? "ใช่" : "ไม่ใช่"}
                  </span>
                </li>
                <li>
                  Payload data:{" "}
                  <span className="text-text/90">{runResult.result.payload_data}</span>
                </li>
                <li>
                  แบตต่ำสุดตอน eclipse:{" "}
                  <span className="text-text/90">
                    {runResult.orbitSummary.minBatteryDuringEclipse}%
                  </span>
                </li>
                {overrun > 0 ? (
                  <li className="text-amber-200/80">
                    CPU overrun: {overrun} วินาที (ไม่ทำให้ Fail ใน M01)
                  </li>
                ) : null}
              </ul>
            ) : (
              <p className="font-section-thai text-[0.82rem] leading-relaxed text-text/55">
                กดปุ่มส่งภารกิจเพื่อดูผลลัพธ์หลังครบ 1 วงโคจร
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Absorbs leftover height so outcome stays content-sized */}
      <div
        className="min-h-0 flex-1 rounded-lg border border-dashed border-white/[0.06] bg-white/[0.01]"
        aria-hidden
      />
    </div>
  );
}
