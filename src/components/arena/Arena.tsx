import { Link } from "react-router-dom";
import {
  HiOutlineBell,
  HiOutlineCalendar,
  HiOutlineMagnifyingGlass,
} from "react-icons/hi2";
import {
  IoArrowForward,
  IoGameControllerOutline,
  IoRocketOutline,
} from "react-icons/io5";

import ModuleSidebar from "@/components/app/ModuleSidebar";
import type { User } from "@/lib/api";
import {
  ARENA_BRANCHES,
  ARENA_PAGE,
  missionsForBranch,
  type ArenaMission,
} from "./arena-data";

const ARENA_BG = "/space-hero-earth.png";

function StatusBadge({ status }: { status: ArenaMission["status"] }) {
  const playable = status === "playable";

  return (
    <span
      className={`font-mono inline-flex w-fit rounded-md border px-2.5 py-1 text-[0.58rem] tracking-[0.14em] ${
        playable
          ? "border-cyan/45 bg-cyan/15 text-cyan"
          : "border-white/15 bg-white/[0.04] text-text/55"
      }`}
    >
      {playable ? "พร้อมเล่น" : "เร็วๆ นี้"}
    </span>
  );
}

function MissionCard({ mission }: { mission: ArenaMission }) {
  const playable = mission.status === "playable";

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-[#060e1c]/78 backdrop-blur-xl ${
        playable
          ? "border-cyan/40 shadow-[0_0_40px_rgba(0,229,255,0.12),0_12px_40px_rgba(0,0,0,0.45)]"
          : "border-white/12 shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
      }`}
    >
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6 lg:p-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-[0.72rem] tracking-[0.18em] text-cyan text-glow-cyan-sm">
              {mission.code}
            </p>
            <StatusBadge status={mission.status} />
          </div>
          <h3 className="font-display mt-1.5 text-[clamp(1.15rem,2vw,1.45rem)] font-bold tracking-[0.06em] text-text">
            {mission.title}
          </h3>
          <p className="font-section-thai mt-1.5 text-[0.85rem] leading-relaxed text-text/75">
            {mission.playerOneLiner}
          </p>
          <p className="font-mono mt-3 text-[0.58rem] tracking-[0.14em] text-text/45">
            SPACE · {mission.spaceAnchor}
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:items-end sm:pt-1">
          <p className="font-section-thai text-[0.78rem] text-text/70 sm:text-right">
            {mission.ctaPrompt}
          </p>
          <p className="font-section-thai text-[0.68rem] text-muted sm:text-right">
            {mission.ctaHint}
          </p>
          <Link
            to={`/arena/mission/${mission.id}`}
            className={`group mt-1 inline-flex items-center justify-center gap-2 rounded-lg border px-5 py-2.5 font-section-thai text-[0.88rem] font-medium no-underline transition ${
              playable
                ? "border-cyan/60 bg-gradient-to-r from-cyan to-[#4df0ff] text-bg shadow-[0_0_28px_rgba(0,229,255,0.45)] hover:brightness-110"
                : "border-white/20 bg-white/[0.04] text-text/80 hover:border-cyan/35 hover:text-cyan"
            }`}
          >
            {mission.ctaLabel}
            <IoArrowForward className="text-base transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function Arena({ user }: { user: User }) {
  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-text">
      <ModuleSidebar user={user} activeModule="arena" />

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <img
            src={ARENA_BG}
            alt=""
            className="h-full w-full object-cover object-[center_35%] opacity-55"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(3,8,18,0.72)_0%,rgba(3,8,18,0.55)_40%,rgba(3,8,18,0.88)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(0,229,255,0.08),transparent_50%)]" />
        </div>

        <header className="relative z-[1] flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] bg-bg/40 px-5 py-3 backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5">
              <IoGameControllerOutline className="text-xl text-cyan drop-shadow-[0_0_10px_rgba(0,229,255,0.55)]" />
              <h1 className="font-display text-[1.35rem] font-bold tracking-[0.18em] text-text">
                ARENA
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 text-text/50">
            {[HiOutlineMagnifyingGlass, HiOutlineCalendar, HiOutlineBell].map(
              (Icon, i) => (
                <button
                  key={i}
                  type="button"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-white/10 bg-white/[0.03] transition hover:border-cyan/30 hover:text-cyan"
                >
                  <Icon className="text-base" />
                </button>
              ),
            )}
            <div className="ml-1 hidden text-right sm:block">
              <p className="font-mono text-[0.58rem] tracking-wider text-muted">
                {today}
              </p>
            </div>
          </div>
        </header>

        <main className="relative z-[1] min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <div className="mx-auto max-w-[980px] space-y-8">
            <div>
              <h2 className="font-section-thai text-[clamp(1.35rem,2.5vw,1.75rem)] font-medium tracking-wide text-text">
                {ARENA_PAGE.title}
              </h2>
              <p className="font-section-thai mt-1 max-w-2xl text-[0.88rem] text-text/65">
                {ARENA_PAGE.subtitle}
              </p>
            </div>

            {ARENA_BRANCHES.map((branch) => {
              const missions = missionsForBranch(branch.id);
              if (missions.length === 0) return null;

              return (
                <section key={branch.id} className="space-y-3">
                  <div className="flex items-baseline gap-2">
                    <IoRocketOutline className="relative top-px text-base text-cyan/70" />
                    <h3 className="font-display text-[0.78rem] font-semibold tracking-[0.16em] text-cyan/90">
                      {branch.en}
                    </h3>
                    <span className="font-section-thai text-[0.8rem] text-text/50">
                      {branch.th}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {missions.map((mission) => (
                      <MissionCard key={mission.id} mission={mission} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
