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
import { getMissionTimelineConfig } from "@/components/arena/timeline/mission-timeline-config";

const PLAYBACK_MS = 280;

/** Mission Feedback panel for Mission 01 run results. */
export default function MissionFeedbackMock({
  missionId,
  runResult,
}: {
  missionId: string;
  runResult: ArenaRunResponse | null;
}) {
  const [selectedTick, setSelectedTick] = useState(1);
  const [playbackTick, setPlaybackTick] = useState<number | null>(null);
  const playbackRef = useRef<number | null>(null);

  const timelineConfig = getMissionTimelineConfig(missionId);
  const tickLogs = new Map(runResult?.ticks.map((entry) => [entry.tick, entry]) ?? []);
  const displayTickLog = tickLogs.get(selectedTick) ?? runResult?.ticks.at(-1);
  const battery = displayTickLog?.battery ?? (runResult ? 0 : null);
  const temperature = displayTickLog?.temperature ?? (runResult ? 0 : null);
  const grade = runResult?.result.grade;
  const isSuccess = grade === "perfect";

  useEffect(() => {
    if (!runResult?.ticks.length) {
      setSelectedTick(1);
      setPlaybackTick(null);
      return;
    }

    let step = 0;
    const ticks = runResult.ticks;

    const advance = () => {
      const entry = ticks[step];
      if (!entry) {
        setPlaybackTick(null);
        setSelectedTick(ticks[ticks.length - 1]?.tick ?? 1);
        playbackRef.current = null;
        return;
      }
      setPlaybackTick(entry.tick);
      setSelectedTick(entry.tick);
      step += 1;
      playbackRef.current = window.setTimeout(advance, PLAYBACK_MS);
    };

    setSelectedTick(1);
    setPlaybackTick(1);
    playbackRef.current = window.setTimeout(advance, PLAYBACK_MS);

    return () => {
      if (playbackRef.current !== null) {
        window.clearTimeout(playbackRef.current);
        playbackRef.current = null;
      }
    };
  }, [runResult]);

  function handleSelectTick(tick: number) {
    if (playbackRef.current !== null) {
      window.clearTimeout(playbackRef.current);
      playbackRef.current = null;
    }
    setPlaybackTick(null);
    setSelectedTick(tick);
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden p-3">
      {timelineConfig ? (
        <MissionTimeline
          className="min-h-0 flex-[2]"
          config={timelineConfig}
          ticks={runResult?.ticks}
          selectedTick={selectedTick}
          onSelectTick={handleSelectTick}
          playbackTick={playbackTick}
        />
      ) : (
        <div className="min-h-0 flex-[2]" aria-hidden />
      )}

      {/* Satellite Dashboard */}
      <section className="flex min-h-0 flex-[1] flex-col overflow-hidden rounded-lg border border-white/10 bg-[#060e1c]/80">
        <header className="shrink-0 border-b border-white/[0.06] px-3 py-2">
          <h3 className="font-display text-[0.65rem] font-semibold tracking-[0.14em] text-text/70">
            SATELLITE DASHBOARD
          </h3>
        </header>
        <div className="grid min-h-0 flex-1 grid-cols-3 gap-2 p-3">
          <div className="flex h-full min-w-0 items-center gap-2 rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
            <IoBatteryHalfOutline className="shrink-0 text-lg text-emerald-400/80" aria-hidden />
            <div className="min-w-0">
              <p className="font-mono text-[0.5rem] tracking-wider text-muted">BATTERY</p>
              <p className="font-display text-[0.85rem] text-text/90">
                {battery !== null ? `${battery}%` : "—"}
              </p>
            </div>
          </div>
          <div className="flex h-full min-w-0 items-center gap-2 rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
            <IoThermometerOutline className="shrink-0 text-lg text-orange-300/80" aria-hidden />
            <div className="min-w-0">
              <p className="font-mono text-[0.5rem] tracking-wider text-muted">TEMP</p>
              <p className="font-display text-[0.85rem] text-text/90">
                {temperature !== null ? `${temperature}°C` : "—"}
              </p>
            </div>
          </div>
          <div className="flex h-full min-w-0 items-center gap-2 rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
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

      {/* Mission Outcome */}
      <section className="flex min-h-0 flex-[2] flex-col overflow-hidden rounded-lg border border-white/10 bg-[#060e1c]/80">
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
        <div className="flex min-h-0 flex-1 items-start gap-3 overflow-y-auto p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10">
            <IoCubeOutline className="text-xl text-amber-300" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
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
              </ul>
            ) : (
              <p className="font-section-thai text-[0.82rem] leading-relaxed text-text/55">
                กดปุ่มส่งภารกิจเพื่อดูผลลัพธ์
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
