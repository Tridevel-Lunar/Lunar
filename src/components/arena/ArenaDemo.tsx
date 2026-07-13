import {
  HiOutlineBell,
  HiOutlineCalendar,
  HiOutlineCheckCircle,
  HiOutlineMagnifyingGlass,
  HiOutlinePlusCircle,
} from "react-icons/hi2";
import {
  IoArrowDownCircleOutline,
  IoArrowForward,
  IoDiamondOutline,
  IoGameControllerOutline,
  IoRocketOutline,
} from "react-icons/io5";

import ModuleSidebar from "@/components/app/ModuleSidebar";
import type { User } from "@/lib/api";
import { ARENA_PAGE, FEATURED_MISSION } from "./arena-data";

const ARENA_BG = "/space-hero-earth.png";

function CreditsPill({ amount }: { amount: number }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-cyan/35 bg-cyan/10 px-3 py-1.5 shadow-[0_0_18px_rgba(0,229,255,0.12)]">
      <IoDiamondOutline className="text-sm text-cyan" />
      <span className="font-mono text-[0.62rem] tracking-[0.08em] text-text/90">
        {amount.toLocaleString("en-US")} Space Credits
      </span>
    </div>
  );
}

function MissionImagePlaceholder() {
  return (
    <div
      className="relative mt-4 min-h-[200px] flex-1 overflow-hidden rounded-lg border border-white/10 bg-[linear-gradient(160deg,rgba(0,229,255,0.08)_0%,rgba(3,8,18,0.85)_45%,rgba(8,16,32,0.95)_100%)]"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_80%,rgba(255,140,40,0.18),transparent_55%)]" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-text/35">
        <IoRocketOutline className="text-4xl text-cyan/40 drop-shadow-[0_0_16px_rgba(0,229,255,0.35)]" />
        <p className="font-mono text-[0.55rem] tracking-[0.16em] uppercase">
          Mission visual
        </p>
      </div>
    </div>
  );
}

function MissionCard() {
  const mission = FEATURED_MISSION;

  return (
    <article className="overflow-hidden rounded-2xl border border-cyan/40 bg-[#060e1c]/78 shadow-[0_0_40px_rgba(0,229,255,0.12),0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <div className="grid gap-0 lg:grid-cols-[minmax(240px,0.9fr)_1.2fr]">
        <div className="flex flex-col border-b border-white/10 p-5 lg:border-b-0 lg:border-r lg:border-white/10 lg:p-6">
          <p className="font-mono text-[0.65rem] tracking-[0.18em] text-cyan text-glow-cyan-sm">
            {mission.code}
          </p>
          <h3 className="font-display mt-2 text-[clamp(1.35rem,2.4vw,1.85rem)] font-bold tracking-[0.06em] text-text">
            {mission.title}
          </h3>
          <p className="font-section-thai mt-1.5 text-[0.85rem] text-text/70">
            {mission.subtitle}
          </p>
          <span className="font-mono mt-3 inline-flex w-fit rounded-md border border-cyan/45 bg-cyan/15 px-2.5 py-1 text-[0.58rem] tracking-[0.14em] text-cyan">
            {mission.level}
          </span>
          <MissionImagePlaceholder />
        </div>

        <div className="flex flex-col divide-y divide-white/10 p-5 lg:p-6">
          <section className="pb-5">
            <div className="mb-2 flex items-center gap-2">
              <IoArrowDownCircleOutline className="text-lg text-cyan/80" />
              <h4 className="font-display text-[0.72rem] font-semibold tracking-[0.16em] text-cyan/90">
                MISSION DETAILS
              </h4>
            </div>
            <p className="font-section-thai text-[0.82rem] leading-relaxed text-text/80">
              {mission.details}
            </p>
          </section>

          <section className="py-5">
            <div className="mb-2 flex items-center gap-2">
              <HiOutlinePlusCircle className="text-lg text-cyan/80" />
              <h4 className="font-display text-[0.72rem] font-semibold tracking-[0.16em] text-cyan/90">
                MISSION OBJECTIVE
              </h4>
            </div>
            <p className="font-section-thai text-[0.82rem] leading-relaxed text-text/80">
              {mission.objectiveLead}{" "}
              <span className="block mt-1 text-[0.95rem] font-medium text-cyan text-glow-cyan-sm">
                {mission.objectiveHighlight}
              </span>
            </p>
          </section>

          <section className="pt-5">
            <div className="mb-2 flex items-center gap-2">
              <HiOutlineCheckCircle className="text-lg text-cyan/80" />
              <h4 className="font-display text-[0.72rem] font-semibold tracking-[0.16em] text-cyan/90">
                YOU WILL DO
              </h4>
            </div>
            <p className="font-section-thai mb-2 text-[0.82rem] text-text/80">
              {mission.youWillDoIntro}
            </p>
            <ul className="font-section-thai space-y-1.5 text-[0.8rem] leading-snug text-text/75">
              {mission.youWillDo.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan shadow-[0_0_8px_rgba(0,229,255,0.6)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-white/10 bg-black/35 px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-cyan/40 bg-cyan/10 shadow-[0_0_20px_rgba(0,229,255,0.2)]">
            <IoRocketOutline className="text-xl text-cyan" />
          </div>
          <div>
            <p className="font-section-thai text-[0.88rem] text-text/90">
              {mission.ctaPrompt}
            </p>
            <p className="font-section-thai text-[0.72rem] text-muted">
              {mission.ctaHint}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="group inline-flex items-center justify-center gap-2 rounded-lg border border-cyan/60 bg-gradient-to-r from-cyan to-[#4df0ff] px-6 py-3 font-section-thai text-[0.95rem] font-medium text-bg shadow-[0_0_28px_rgba(0,229,255,0.45)] transition hover:brightness-110"
        >
          {mission.ctaLabel}
          <IoArrowForward className="text-base transition group-hover:translate-x-0.5" />
        </button>
      </div>
    </article>
  );
}

export default function ArenaDemo({ user }: { user: User }) {
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
            <CreditsPill amount={ARENA_PAGE.credits} />
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
          <div className="mx-auto max-w-[980px] space-y-5">
            <div>
              <h2 className="font-section-thai text-[clamp(1.35rem,2.5vw,1.75rem)] font-medium tracking-wide text-text">
                {ARENA_PAGE.title}
              </h2>
              <p className="font-section-thai mt-1 max-w-2xl text-[0.88rem] text-text/65">
                {ARENA_PAGE.subtitle}
              </p>
            </div>

            <div className="border-b border-white/10">
              <button
                type="button"
                className="font-display relative -mb-px border-b-2 border-cyan px-1 pb-2 text-[0.72rem] font-semibold tracking-[0.18em] text-cyan text-glow-cyan-sm"
              >
                {ARENA_PAGE.tab}
              </button>
            </div>

            <MissionCard />
          </div>
        </main>
      </div>
    </div>
  );
}
