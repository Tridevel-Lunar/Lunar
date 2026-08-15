import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  IoArrowForward,
  IoGameControllerOutline,
  IoRocketOutline,
} from "react-icons/io5";

import ModuleSidebar from "@/components/app/ModuleSidebar";
import SpaceLoadingState from "@/components/space/SpaceLoadingState";
import {
  spacePathSessionPath,
  spacePathTabPath,
} from "@/components/space/core/routes";
import { getLearningPath, type LearningPath, type User } from "@/lib/api";

import {
  ARENA_BRANCHES,
  missionsForBranch,
  type ArenaMission,
  type ArenaSpaceBranchId,
} from "./arena-data";
import { recommendArenaMissions } from "./recommend";
import {
  arenaMissionLinkState,
  arenaMissionPath,
  arenaPathForTab,
  arenaTabFromPath,
  type ArenaShellTab,
} from "./routes";

const ARENA_BG = "/beautiful-shot-stars-night-sky.jpg";

function StatusBadge({ status }: { status: ArenaMission["status"] }) {
  const playable = status === "playable";

  return (
    <span
      className={`font-mono inline-flex w-fit rounded-md border px-2 py-0.5 text-[0.52rem] tracking-wider ${
        playable
          ? "border-cyan/35 bg-cyan/10 text-cyan"
          : "border-white/15 bg-white/[0.04] text-text/45"
      }`}
    >
      {playable ? "พร้อมเล่น" : "เร็วๆ นี้"}
    </span>
  );
}

function MissionCard({
  mission,
  matchHint,
}: {
  mission: ArenaMission;
  matchHint?: string;
}) {
  const location = useLocation();
  const playable = mission.status === "playable";

  return (
    <Link
      to={arenaMissionPath(mission.id)}
      state={arenaMissionLinkState(location.pathname)}
      className={`group flex w-full flex-col gap-3 rounded-xl border p-4 no-underline backdrop-blur-md transition sm:flex-row sm:items-start sm:gap-4 ${
        playable
          ? "cursor-pointer border-white/[0.1] bg-bg/45 hover:border-cyan/30 hover:bg-cyan/[0.06]"
          : "cursor-pointer border-white/[0.1] bg-bg/45 opacity-85 hover:border-cyan/25 hover:opacity-100"
      }`}
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border ${
          playable
            ? "border-cyan/30 bg-cyan/10 text-cyan"
            : "border-white/10 bg-white/[0.03] text-text/35"
        }`}
      >
        <IoRocketOutline className="text-xl" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-mono text-[0.58rem] tracking-[0.14em] text-cyan/80">
            {mission.code}
          </p>
          <StatusBadge status={mission.status} />
        </div>
        <h3
          className={`font-thai mt-0.5 text-[1rem] font-semibold tracking-wide ${
            playable ? "text-text" : "text-text/70"
          }`}
        >
          {mission.title}
        </h3>
        <p className="font-section-thai mt-1.5 line-clamp-2 text-[0.76rem] leading-relaxed text-text/42">
          {mission.playerOneLiner}
        </p>
        <p className="font-mono mt-2 text-[0.52rem] tracking-wider text-text/40">
          SPACE · {mission.spaceAnchor}
          {matchHint ? ` · ${matchHint}` : ""}
        </p>
      </div>

      <div className="flex shrink-0 flex-col gap-1.5 sm:items-end sm:pt-0.5">
        <p className="font-section-thai text-[0.72rem] text-text/55 sm:max-w-[11rem] sm:text-right">
          {mission.ctaPrompt}
        </p>
        <span
          className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-4 py-2 font-section-thai text-[0.82rem] font-medium transition ${
            playable
              ? "border-cyan/50 bg-cyan/10 text-cyan group-hover:bg-cyan group-hover:text-bg"
              : "border-white/15 bg-white/[0.04] text-text/70 group-hover:border-cyan/30 group-hover:text-cyan"
          }`}
        >
          {mission.ctaLabel}
          <IoArrowForward className="text-sm transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

function RecommendPanel({ path }: { path: LearningPath | null }) {
  const { missions, fromPath } = recommendArenaMissions(path);
  const hasPath =
    path &&
    (path.status === "active" || path.status === "draft") &&
    path.steps.length > 0;

  return (
    <motion.div
      className="mx-auto flex w-full max-w-7xl flex-col"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="shrink-0 border-b border-white/[0.06] pb-4"
      >
        <h2 className="font-thai text-[clamp(1.25rem,3vw,1.75rem)] font-semibold tracking-wide text-text">
          แนะนำสำหรับคุณ
        </h2>
        <p className="font-section-thai mt-1 max-w-xl text-[0.9rem] text-text/55">
          {fromPath
            ? "ด่านตาม Path ที่คุณวางใน Space"
            : hasPath
              ? "ยังไม่มีด่านที่ตรงกับคอร์สใน Path เลย โชว์ด่านเด่นไว้ก่อน"
              : "ยังไม่ได้วาง Path โชว์ด่านเด่นไว้ก่อน หรือไปคุยกับ LAIKA ก็ได้"}
        </p>
      </motion.div>

      <div className="space-y-5 py-6 pb-10">
        {!hasPath && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.1] bg-bg/45 px-4 py-3 backdrop-blur-md"
          >
            <p className="font-section-thai flex-1 text-[0.82rem] text-text/65">
              วาง Path ใน Space แล้ว Arena จะแนะนำด่านที่ตรงกับคอร์สที่สนใจ
            </p>
            <Link
              to={spacePathSessionPath()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-cyan/45 bg-cyan/10 px-3 py-1.5 font-section-thai text-[0.82rem] text-cyan no-underline hover:bg-cyan/15"
            >
              คุยกับ LAIKA
              <IoArrowForward className="text-sm" />
            </Link>
            <Link
              to={spacePathTabPath()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 font-section-thai text-[0.82rem] text-text/75 no-underline hover:border-cyan/35 hover:text-cyan"
            >
              ดู Path
            </Link>
          </motion.div>
        )}

        <div className="space-y-2.5">
          {missions.map((mission, i) => (
            <motion.div
              key={mission.id}
              className="w-full"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.28,
                delay: 0.06 + 0.05 * i,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <MissionCard
                mission={mission}
                matchHint={fromPath ? "จาก Path ของคุณ" : undefined}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

const BRANCH_ACCENT: Record<ArenaSpaceBranchId, string> = {
  AROUND_US: "#00e5ff",
  ACCESS: "#ffab00",
  FLIGHT: "#1de9b6",
  GROUND: "#7eb8ff",
  FOR_EARTH: "#5eead4",
  MISSION: "#fbbf24",
};

function ExploreMissionTile({
  mission,
  accent,
}: {
  mission: ArenaMission;
  accent: string;
}) {
  const location = useLocation();
  const playable = mission.status === "playable";

  return (
    <Link
      to={arenaMissionPath(mission.id)}
      state={arenaMissionLinkState(location.pathname)}
      className={`group relative flex min-h-[168px] w-full flex-col overflow-hidden rounded-2xl border p-5 no-underline backdrop-blur-md transition ${
        playable
          ? "border-white/[0.12] hover:border-white/25"
          : "border-white/[0.08] opacity-90"
      }`}
      style={{
        background: `linear-gradient(145deg, ${accent}18 0%, rgba(6,14,28,0.72) 48%, rgba(3,8,18,0.78) 100%)`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(500px circle at 15% 0%, ${accent}22, transparent 55%)`,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-px opacity-50 transition group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        }}
        aria-hidden
      />

      <div className="relative z-[1] flex h-full flex-col">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span
            className="font-mono text-[0.58rem] tracking-[0.18em]"
            style={{ color: accent }}
          >
            {mission.code}
          </span>
          <StatusBadge status={mission.status} />
        </div>
        <h3 className="font-thai text-[1.05rem] font-semibold tracking-wide text-text">
          {mission.title}
        </h3>
        <p className="font-section-thai mt-2 line-clamp-2 flex-1 text-[0.76rem] leading-relaxed text-text/45">
          {mission.playerOneLiner}
        </p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="font-mono text-[0.5rem] tracking-wider text-text/35">
            {mission.spaceAnchor}
          </span>
          <span
            className="font-section-thai inline-flex items-center gap-1 text-[0.78rem] transition group-hover:translate-x-0.5"
            style={{ color: accent }}
          >
            {mission.ctaLabel}
            <IoArrowForward className="text-sm" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function ExploreBranchTile({
  branch,
  index,
  missionCount,
  playableCount,
  onOpen,
}: {
  branch: (typeof ARENA_BRANCHES)[number];
  index: number;
  missionCount: number;
  playableCount: number;
  onOpen: () => void;
}) {
  const accent = BRANCH_ACCENT[branch.id];
  const code = String(index + 1).padStart(2, "0");

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative flex min-h-[148px] w-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/[0.12] p-5 text-left backdrop-blur-md transition"
      style={{
        background: `linear-gradient(145deg, ${accent}18 0%, rgba(6,14,28,0.72) 48%, rgba(3,8,18,0.78) 100%)`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at 20% 0%, ${accent}22, transparent 55%)`,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-px opacity-60 transition group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        }}
        aria-hidden
      />

      <div className="relative z-[1] flex h-full flex-col">
        <span
          className="font-mono mb-3 text-[0.62rem] tracking-[0.22em]"
          style={{ color: accent }}
        >
          {code}
        </span>
        <h3 className="font-thai text-[1.15rem] font-semibold tracking-wide text-text">
          {branch.en}
        </h3>
        <p className="font-thai mt-1 text-[0.95rem] font-medium text-text/70">
          {branch.th}
        </p>
        <p className="font-mono mt-auto pt-4 text-[0.52rem] tracking-wider text-text/40">
          {missionCount} ด่าน
          {playableCount > 0 ? ` · ${playableCount} พร้อมเล่น` : ""}
        </p>
        <div className="mt-2 flex justify-end">
          <span
            className="text-xl transition group-hover:translate-x-0.5"
            style={{ color: accent }}
            aria-hidden
          >
            →
          </span>
        </div>
      </div>
    </button>
  );
}

function ExplorePanel() {
  const [branchId, setBranchId] = useState<ArenaSpaceBranchId | null>(null);
  const branch = ARENA_BRANCHES.find((b) => b.id === branchId) ?? null;
  const accent = branch ? BRANCH_ACCENT[branch.id] : "#00e5ff";
  const missions = branch ? missionsForBranch(branch.id) : [];
  const viewKey = branchId ?? "root";

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col">
      <AnimatePresence mode="wait">
        <motion.div
          key={`header-${viewKey}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="shrink-0 border-b border-white/[0.06] pb-4"
        >
          {branch ? (
            <button
              type="button"
              onClick={() => setBranchId(null)}
              className="font-mono mb-2 cursor-pointer text-[0.62rem] tracking-wider text-text/40 transition hover:text-cyan"
            >
              ← สำรวจทั้งหมด
            </button>
          ) : null}
          <h2
            className="font-thai text-[clamp(1.25rem,3vw,1.75rem)] font-semibold tracking-wide text-text"
            style={branch ? { color: accent } : undefined}
          >
            {branch ? branch.en : "สำรวจด่าน"}
          </h2>
          {branch ? (
            <p className="font-thai mt-1 text-[1.05rem] font-medium text-text/65">
              {branch.th}
            </p>
          ) : (
            <p className="font-section-thai mt-1 max-w-xl text-[0.9rem] text-text/55">
              เลือกสายภารกิจ จากวงโคจร ขึ้นฟ้า ของบิน ภาคพื้น ใช้บนโลก หรือออกแบบภารกิจ
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="py-6 pb-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={viewKey}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {!branch ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {ARENA_BRANCHES.map((b, i) => {
                  const list = missionsForBranch(b.id);
                  if (list.length === 0) return null;
                  return (
                    <motion.div
                      key={b.id}
                      className="min-h-0 w-full"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.28,
                        delay: 0.04 * i,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      <ExploreBranchTile
                        branch={b}
                        index={i}
                        missionCount={list.length}
                        playableCount={list.filter((m) => m.status === "playable").length}
                        onOpen={() => setBranchId(b.id)}
                      />
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {missions.map((mission, i) => (
                  <motion.div
                    key={mission.id}
                    className="min-h-0 w-full"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.28,
                      delay: 0.05 * i,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <ExploreMissionTile mission={mission} accent={accent} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

const TABS: { id: ArenaShellTab; label: string }[] = [
  { id: "recommend", label: "Recommended" },
  { id: "explore", label: "Explore" },
];

export default function Arena({ user }: { user: User }) {
  const location = useLocation();
  const navigate = useNavigate();
  const tab = arenaTabFromPath(location.pathname);
  const [path, setPath] = useState<LearningPath | null>(null);
  const [shellLoading, setShellLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void getLearningPath()
      .then((learningPath) => {
        if (!cancelled) setPath(learningPath);
      })
      .catch(() => {
        if (!cancelled) setPath(null);
      })
      .finally(() => {
        if (!cancelled) setShellLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function goTab(next: ArenaShellTab) {
    if (shellLoading) return;
    const to = arenaPathForTab(next);
    if (to !== location.pathname) navigate(to);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-text">
      <ModuleSidebar user={user} activeModule="arena" />

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <img
            src={ARENA_BG}
            alt=""
            className="h-full w-full scale-105 object-cover object-center brightness-[0.72] contrast-[1.15] saturate-[1.25] hue-rotate-[-12deg]"
          />
          {/* Depth + readability */}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,8,18,0.55)_0%,rgba(3,8,18,0.28)_38%,rgba(3,8,18,0.62)_72%,rgba(3,8,18,0.88)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(3,8,18,0.5)_0%,rgba(3,8,18,0.15)_40%,transparent_70%)]" />
          {/* Cool cyan atmosphere (Lunar / Arena) */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_55%_40%,rgba(0,229,255,0.1),transparent_55%)] mix-blend-screen" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,rgba(56,120,255,0.12),transparent_55%)]" />
          {/* Soft vignette so cards pop */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(3,8,18,0.55)_100%)]" />
        </div>

        <header className="relative z-[1] flex shrink-0 items-center gap-2.5 border-b border-white/[0.06] px-5 py-3 backdrop-blur-md">
          <IoGameControllerOutline className="text-xl text-cyan" />
          <h1 className="font-display text-[1.35rem] font-bold tracking-[0.18em] text-text">
            ARENA
          </h1>
        </header>

        <div className="relative z-[1] flex gap-6 border-b border-white/[0.06] px-5 backdrop-blur-md">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              disabled={shellLoading}
              onClick={() => goTab(id)}
              className={`border-b-2 pb-2 pt-3 font-mono text-[0.72rem] tracking-[0.15em] uppercase transition ${
                tab === id
                  ? "border-cyan text-cyan"
                  : "border-transparent text-text/40 hover:text-text/70"
              } ${shellLoading ? "cursor-default opacity-40" : "cursor-pointer"}`}
            >
              {label}
            </button>
          ))}
        </div>

        <main className="relative z-[1] min-h-0 flex-1 overflow-y-auto px-5 py-4 lg:px-8">
          {shellLoading ? (
            <SpaceLoadingState label="กำลังโหลด Arena…" />
          ) : tab === "explore" ? (
            <ExplorePanel />
          ) : (
            <RecommendPanel path={path} />
          )}
        </main>
      </div>
    </div>
  );
}
