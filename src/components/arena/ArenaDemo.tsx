import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  HiOutlineBell,
  HiOutlineCalendar,
  HiOutlineCheckCircle,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineMagnifyingGlass,
  HiOutlinePlusCircle,
} from "react-icons/hi2";
import {
  IoArrowDownCircleOutline,
  IoArrowForward,
  IoGameControllerOutline,
  IoRocketOutline,
} from "react-icons/io5";

import ModuleSidebar from "@/components/app/ModuleSidebar";
import type { User } from "@/lib/api";
import { ARENA_MISSIONS, ARENA_PAGE, type ArenaMission } from "./arena-data";

const ARENA_BG = "/space-hero-earth.png";
const TRANSITION_MS = 220;

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

function MissionCard({ mission }: { mission: ArenaMission }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-cyan/40 bg-[#060e1c]/78 shadow-[0_0_40px_rgba(0,229,255,0.12),0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <div className="grid gap-0 lg:grid-cols-[minmax(240px,0.9fr)_1.2fr]">
        <div className="flex flex-col border-b border-white/10 p-5 lg:border-b-0 lg:border-r lg:border-white/10 lg:p-6">
          <p className="font-mono text-[0.78rem] tracking-[0.18em] text-cyan text-glow-cyan-sm">
            {mission.code}
          </p>
          <h3 className="font-display mt-1 text-[clamp(1.35rem,2.4vw,1.85rem)] font-bold tracking-[0.06em] text-text">
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
            <p className="font-section-thai mt-2 text-[0.82rem] leading-relaxed text-text/80">
              <span className="font-display font-semibold tracking-[0.16em] text-cyan">
                HINT:
              </span>{" "}
              {mission.hint}
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
              <span className="mt-1 block text-[0.95rem] font-medium text-cyan text-glow-cyan-sm">
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

        <Link
          to={`/arena/mission/${mission.id}`}
          className="group inline-flex items-center justify-center gap-2 rounded-lg border border-cyan/60 bg-gradient-to-r from-cyan to-[#4df0ff] px-6 py-3 font-section-thai text-[0.95rem] font-medium text-bg no-underline shadow-[0_0_28px_rgba(0,229,255,0.45)] transition hover:brightness-110"
        >
          {mission.ctaLabel}
          <IoArrowForward className="text-base transition group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}

function MissionNavButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = direction === "prev" ? HiOutlineChevronLeft : HiOutlineChevronRight;
  const label = direction === "prev" ? "ภารกิจก่อนหน้า" : "ภารกิจถัดไป";

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cyan/40 bg-cyan/10 text-cyan shadow-[0_0_18px_rgba(0,229,255,0.12)] transition hover:border-cyan/60 hover:bg-cyan/20 hover:shadow-[0_0_24px_rgba(0,229,255,0.25)] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-text/25 disabled:shadow-none"
    >
      <Icon className="text-xl" />
    </button>
  );
}

export default function ArenaDemo({ user }: { user: User }) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"idle" | "out" | "in">("idle");
  const [slideDir, setSlideDir] = useState<"left" | "right">("right");

  const total = ARENA_MISSIONS.length;
  const mission = ARENA_MISSIONS[index];
  const canPrev = index > 0;
  const canNext = index < total - 1;
  const isBusy = phase !== "idle";

  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
    if (phase !== "out") return;

    const timer = window.setTimeout(() => {
      setIndex((current) => {
        if (slideDir === "right") return Math.min(current + 1, total - 1);
        return Math.max(current - 1, 0);
      });
      setPhase("in");
    }, TRANSITION_MS);

    return () => window.clearTimeout(timer);
  }, [phase, slideDir, total]);

  useEffect(() => {
    if (phase !== "in") return;

    // Let the incoming card paint at opacity-0 first, then ease in.
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setPhase("idle"));
    });
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  function goPrev() {
    if (!canPrev || isBusy) return;
    setSlideDir("left");
    setPhase("out");
  }

  function goNext() {
    if (!canNext || isBusy) return;
    setSlideDir("right");
    setPhase("out");
  }

  const slidingOut = phase === "out";
  const slidingIn = phase === "in";
  const offset =
    slideDir === "right"
      ? slidingOut
        ? "-translate-x-4"
        : slidingIn
          ? "translate-x-4"
          : "translate-x-0"
      : slidingOut
        ? "translate-x-4"
        : slidingIn
          ? "-translate-x-4"
          : "translate-x-0";

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
          <div className="mx-auto max-w-[980px] space-y-5">
            <div>
              <h2 className="font-section-thai text-[clamp(1.35rem,2.5vw,1.75rem)] font-medium tracking-wide text-text">
                {ARENA_PAGE.title}
              </h2>
              <p className="font-section-thai mt-1 max-w-2xl text-[0.88rem] text-text/65">
                {ARENA_PAGE.subtitle}
              </p>
            </div>

            <p className="font-mono text-center text-[0.68rem] tracking-[0.16em] text-cyan/80">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </p>

            <div className="flex items-center gap-3 sm:gap-4">
              <MissionNavButton
                direction="prev"
                disabled={!canPrev || isBusy}
                onClick={goPrev}
              />

              <div className="min-w-0 flex-1 overflow-hidden">
                <div
                  key={mission.id}
                  className={`transition-all ease-out ${
                    slidingOut || slidingIn ? "opacity-0" : "opacity-100"
                  } ${offset}`}
                  style={{ transitionDuration: `${TRANSITION_MS}ms` }}
                >
                  <MissionCard mission={mission} />
                </div>
              </div>

              <MissionNavButton
                direction="next"
                disabled={!canNext || isBusy}
                onClick={goNext}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
