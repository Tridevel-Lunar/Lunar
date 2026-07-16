import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { HiOutlineClock } from "react-icons/hi2";
import { IoArrowBack, IoGameControllerOutline } from "react-icons/io5";

import ModuleSidebar from "@/components/app/ModuleSidebar";
import { ARENA_MISSIONS } from "@/components/arena/arena-data";
import MissionActivity from "@/components/arena/mission/MissionActivity";
import { useAuthUser } from "@/routes/useAuthUser";

const TIMER_START_SEC = 90 * 60;

function formatTimer(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function ArenaMission() {
  const user = useAuthUser();
  const { missionId } = useParams<{ missionId: string }>();
  const mission = ARENA_MISSIONS.find((m) => m.id === missionId);
  const playable = mission?.id === "leo-orbital-launch";
  const [timerSec, setTimerSec] = useState(TIMER_START_SEC);

  useEffect(() => {
    document.title = mission ? `${mission.title} | Arena` : "Arena Mission";
  }, [mission]);

  useEffect(() => {
    if (!playable) return;
    const id = window.setInterval(() => {
      setTimerSec((s) => (s <= 0 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [playable]);

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-text">
      <ModuleSidebar user={user} activeModule="arena" />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/arena"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.03] text-text/50 no-underline transition hover:border-cyan/30 hover:text-cyan"
              aria-label="กลับ Arena"
            >
              <IoArrowBack className="text-base" />
            </Link>
            <IoGameControllerOutline className="shrink-0 text-xl text-cyan" />
            <div className="min-w-0">
              <h1 className="font-display text-[1.1rem] font-bold tracking-[0.16em] text-text sm:text-[1.35rem] sm:tracking-[0.18em]">
                {mission?.code ?? "MISSION"}
                {mission?.title && (
                  <span className="ml-1 font-normal text-text/70">
                     : {mission.title}
                  </span>
                )}
              </h1>
            </div>
          </div>

          {playable && (
            <div
              className={`flex shrink-0 items-center gap-1.5 font-mono text-[0.95rem] tracking-wider ${
                timerSec <= 300 ? "text-orange-300" : "text-text/80"
              }`}
              aria-live="polite"
              aria-label="เวลาที่เหลือ"
            >
              <HiOutlineClock className="text-lg" />
              {formatTimer(timerSec)}
            </div>
          )}
        </header>

        {mission && playable ? (
          <MissionActivity mission={mission} />
        ) : (
          <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="font-section-thai text-[1rem] text-text/70">
              {mission
                ? "ภารกิจนี้ยังไม่พร้อมสำหรับการปฏิบัติ"
                : "ไม่พบภารกิจที่ระบุ"}
            </p>
            <Link
              to="/arena"
              className="font-section-thai text-[0.9rem] text-cyan no-underline hover:underline"
            >
              กลับไป Arena
            </Link>
          </main>
        )}
      </div>
    </div>
  );
}
