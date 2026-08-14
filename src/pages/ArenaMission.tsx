import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { HiOutlineClock } from "react-icons/hi2";
import { IoArrowBack, IoGameControllerOutline } from "react-icons/io5";

import {
  ARENA_MISSIONS,
  MISSION_FAMILY_LABELS,
  getArenaBranch,
  type ArenaMission,
} from "@/components/arena/arena-data";
import MissionActivity from "@/components/arena/mission/MissionActivity";

const TIMER_START_SEC = 30 * 60;

function formatTimer(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function ComingSoonOverview({ mission }: { mission: ArenaMission }) {
  const branch = getArenaBranch(mission.spaceBranch);

  return (
    <main className="min-h-0 flex-1 overflow-y-auto px-5 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <p className="font-mono text-[0.72rem] tracking-[0.18em] text-cyan">
            {mission.code}
          </p>
          <h2 className="font-display mt-1 text-[clamp(1.4rem,2.5vw,1.9rem)] font-bold tracking-[0.06em]">
            {mission.title}
          </h2>
          <p className="font-section-thai mt-2 text-[0.95rem] leading-relaxed text-text/80">
            {mission.playerOneLiner}
          </p>
        </div>

        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <dt className="font-display text-[0.62rem] tracking-[0.16em] text-cyan/80">
              SPACE BRANCH
            </dt>
            <dd className="font-section-thai mt-1 text-[0.88rem] text-text/85">
              {branch ? `${branch.en} · ${branch.th}` : mission.spaceBranch}
            </dd>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <dt className="font-display text-[0.62rem] tracking-[0.16em] text-cyan/80">
              SPACE ANCHOR
            </dt>
            <dd className="font-mono mt-1 text-[0.82rem] tracking-wide text-text/85">
              {mission.spaceAnchor}
            </dd>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <dt className="font-display text-[0.62rem] tracking-[0.16em] text-cyan/80">
              MISSION FAMILY
            </dt>
            <dd className="font-section-thai mt-1 text-[0.88rem] text-text/85">
              {MISSION_FAMILY_LABELS[mission.missionFamily]}
            </dd>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <dt className="font-display text-[0.62rem] tracking-[0.16em] text-cyan/80">
              ENGINE
            </dt>
            <dd className="font-section-thai mt-1 text-[0.88rem] text-text/85">
              {mission.reusesOrbitEngine
                ? "ใช้ orbit engine"
                : "ไม่ใช้ orbit engine"}
            </dd>
          </div>
        </dl>

        <section className="space-y-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4">
          <h3 className="font-display text-[0.68rem] font-semibold tracking-[0.16em] text-cyan/90">
            TEACHING GOAL
          </h3>
          <p className="font-section-thai text-[0.88rem] leading-relaxed text-text/80">
            {mission.teachingGoal}
          </p>
        </section>

        <p className="font-section-thai rounded-xl border border-amber-500/25 bg-amber-500/8 px-4 py-3 text-[0.88rem] leading-relaxed text-amber-100/90">
          Logic ยังไม่เปิด — ภารกิจนี้เป็นภาพรวมสำหรับเนื้อหาใน SPACE ที่ยังไม่มีบทเรียนครบ
        </p>

        <Link
          to="/arena"
          className="font-section-thai inline-flex text-[0.9rem] text-cyan no-underline hover:underline"
        >
          กลับไป Arena
        </Link>
      </div>
    </main>
  );
}

export default function ArenaMission() {
  const { missionId } = useParams<{ missionId: string }>();
  const mission = ARENA_MISSIONS.find((m) => m.id === missionId);
  const playable = mission?.status === "playable";
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
        ) : mission ? (
          <ComingSoonOverview mission={mission} />
        ) : (
          <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="font-section-thai text-[1rem] text-text/70">
              ไม่พบภารกิจที่ระบุ
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
