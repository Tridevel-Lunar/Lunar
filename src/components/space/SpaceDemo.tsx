import {
  HiOutlineBell,
  HiOutlineCalendar,
  HiOutlineMagnifyingGlass,
} from "react-icons/hi2";
import { IoPlanetOutline } from "react-icons/io5";
import { GiCube, GiOrbital } from "react-icons/gi";
import { TbBlocks } from "react-icons/tb";
import { IoHardwareChipOutline } from "react-icons/io5";

import ModuleSidebar from "@/components/app/ModuleSidebar";
import type { User } from "@/lib/api";
import { CURRENT_COURSE, SPACE_TOPICS, type SpaceTopic } from "./space-data";

const SPACE_HERO_EARTH = "/space-hero-earth.png";

function ProgressRing({
  value,
  max,
  size = 72,
}: {
  value: number;
  max: number;
  size?: number;
}) {
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = max > 0 ? value / max : 0;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#00e5ff"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
        className="drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]"
      />
    </svg>
  );
}

function TopicIcon({ type, accent }: { type: SpaceTopic["icon"]; accent: string }) {
  const className = "text-[1.9rem]";
  const style = { color: accent, filter: `drop-shadow(0 0 12px ${accent}66)` };

  switch (type) {
    case "model":
      return <GiCube className={className} style={style} />;
    case "embedded":
      return <IoHardwareChipOutline className={className} style={style} />;
    case "physics":
      return <GiOrbital className={className} style={style} />;
    case "programming":
      return <TbBlocks className={className} style={style} />;
  }
}

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-white/10 bg-white/[0.04] shadow-[0_6px_24px_rgba(0,0,0,0.3)] backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

function SpaceHero() {
  return (
    <section className="relative min-h-[240px] overflow-hidden rounded-xl border border-white/10">
      <img
        src={SPACE_HERO_EARTH}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-[65%_center]"
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(3,8,18,0.94)_0%,rgba(3,8,18,0.72)_38%,rgba(3,8,18,0.2)_62%,transparent_85%)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(to_top,rgba(3,8,18,0.85)_0%,transparent_45%)]"
        aria-hidden
      />

      <div className="relative z-[1] grid gap-4 p-4 lg:grid-cols-[1fr_auto] lg:p-5">
        <div className="max-w-sm pt-1">
          <p className="font-section-thai mb-1 text-[0.72rem] text-cyan/80">{CURRENT_COURSE.tag}</p>
          <h2 className="font-display mb-0.5 text-[clamp(1.6rem,3vw,2.2rem)] font-bold tracking-wide text-text">
            {CURRENT_COURSE.title}
          </h2>
          <p className="font-section-thai mb-2 text-[0.88rem] text-text/70">{CURRENT_COURSE.subtitle}</p>
          <p className="font-section-thai text-[0.8rem] leading-relaxed text-muted">
            {CURRENT_COURSE.description}
          </p>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="relative flex items-center justify-center">
            <ProgressRing
              value={CURRENT_COURSE.completedLessons}
              max={CURRENT_COURSE.totalLessons}
            />
            <div className="absolute text-center">
              <p className="font-display text-base font-bold text-cyan">
                {CURRENT_COURSE.completedLessons}/{CURRENT_COURSE.totalLessons}
              </p>
              <p className="font-mono text-[0.5rem] tracking-wider text-muted">Lessons</p>
            </div>
          </div>
        </div>

        <GlassCard className="col-span-full flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:justify-between lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-cyan/25 bg-cyan/5">
              <GiCube className="text-2xl text-cyan drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]" />
            </div>
            <div>
              <p className="font-display text-[0.85rem] font-semibold tracking-wide text-text">
                {CURRENT_COURSE.title}
              </p>
              <p className="font-section-thai text-[0.72rem] text-muted">
                บทเรียนทั้งหมด {CURRENT_COURSE.totalLessons} บท
              </p>
            </div>
          </div>

          <div className="min-w-[180px] flex-1 sm:max-w-[220px]">
            <div className="mb-1.5 flex justify-between font-mono text-[0.6rem] tracking-wider text-muted">
              <span>Progress</span>
              <span className="text-cyan">{CURRENT_COURSE.progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan to-teal shadow-[0_0_12px_rgba(0,229,255,0.45)]"
                style={{ width: `${CURRENT_COURSE.progress}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            className="btn-clip font-mono shrink-0 cursor-pointer border border-cyan/50 bg-cyan/10 px-5 py-2.5 text-[0.62rem] tracking-[0.12em] text-cyan transition hover:bg-cyan hover:text-bg"
          >
            CONTINUE LEARNING →
          </button>
        </GlassCard>
      </div>
    </section>
  );
}

function TopicRow({ topic }: { topic: SpaceTopic }) {
  return (
    <button
      type="button"
      className="group flex w-full cursor-pointer items-center gap-3.5 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-left transition hover:border-white/15 hover:bg-white/[0.05]"
    >
      <div
        className="w-1 shrink-0 self-stretch rounded-full"
        style={{ background: topic.accent, boxShadow: `0 0 12px ${topic.accent}55` }}
      />
      <div
        className="flex h-14 w-[4.5rem] shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/25"
        style={{ boxShadow: `inset 0 0 24px ${topic.accent}15` }}
      >
        <TopicIcon type={topic.icon} accent={topic.accent} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display text-[0.82rem] font-semibold tracking-[0.1em] text-text">
          {topic.title}
        </p>
        <p className="font-section-thai mt-0.5 text-[0.78rem] leading-snug text-muted">
          {topic.description}
        </p>
      </div>
      <span className="pr-2 text-xl text-text/25 transition group-hover:text-cyan/70">›</span>
    </button>
  );
}

export default function SpaceDemo({ user }: { user: User }) {
  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-text">
      <ModuleSidebar user={user} activeModule="space" />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-3">
          <div className="flex items-center gap-2.5">
            <IoPlanetOutline className="text-xl text-cyan" />
            <h1 className="font-display text-[1.35rem] font-bold tracking-[0.18em] text-text">SPACE</h1>
          </div>

          <div className="flex items-center gap-2 text-text/50">
            {[HiOutlineMagnifyingGlass, HiOutlineCalendar, HiOutlineBell].map((Icon, i) => (
              <button
                key={i}
                type="button"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-white/10 bg-white/[0.03] transition hover:border-cyan/30 hover:text-cyan"
              >
                <Icon className="text-base" />
              </button>
            ))}
            <div className="ml-1 hidden text-right sm:block">
              <p className="font-mono text-[0.58rem] tracking-wider text-muted">{today}</p>
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="mx-auto max-w-[920px] space-y-4">
            <SpaceHero />
            <div className="space-y-2">
              {SPACE_TOPICS.map((topic) => (
                <TopicRow key={topic.id} topic={topic} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
