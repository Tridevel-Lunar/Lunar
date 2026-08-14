import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { IoPlanetOutline } from "react-icons/io5";

import ModuleSidebar from "@/components/app/ModuleSidebar";
import CatalogBrowser from "@/components/space/catalog/CatalogBrowser";
import { listCourses } from "@/components/space/core/registry";
import { spaceCoursePath } from "@/components/space/core/routes";
import { useSpaceProgress } from "@/components/space/hooks/useSpaceProgress";
import type { User } from "@/lib/api";

type SpaceTab = "home" | "explore";

export default function SpaceHome({ user }: { user: User }) {
  const location = useLocation();
  const rawTab = (location.state as { tab?: string } | null)?.tab;
  const initialTab: SpaceTab =
    rawTab === "explore" || rawTab === "courses" ? "explore" : "home";
  const [tab, setTab] = useState<SpaceTab>(initialTab);

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-text">
      <ModuleSidebar user={user} activeModule="space" />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center gap-2.5 border-b border-white/[0.06] px-5 py-3">
          <IoPlanetOutline className="text-xl text-cyan" />
          <h1 className="font-display text-[1.35rem] font-bold tracking-[0.18em] text-text">SPACE</h1>
        </header>

        <div className="flex gap-6 border-b border-white/[0.06] px-5">
          {(
            [
              { id: "home" as const, label: "Home" },
              { id: "explore" as const, label: "Explore" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`cursor-pointer border-b-2 pb-2 pt-3 font-mono text-[0.72rem] tracking-[0.15em] uppercase transition ${
                tab === t.id
                  ? "border-cyan text-cyan"
                  : "border-transparent text-text/40 hover:text-text/70"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <main className="relative min-h-0 flex-1 overflow-hidden">
          {tab === "home" ? (
            <>
              <div className="absolute inset-0 overflow-hidden">
                <img src="/earth-center.jpg" alt="" className="h-full w-full object-cover" />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to right, rgba(3,8,18,0.94) 0%, rgba(3,8,18,0.7) 30%, rgba(3,8,18,0.15) 60%, transparent 80%)",
                  }}
                  aria-hidden
                />
              </div>
              <div className="relative z-[1] h-full">
                <HomeView onGoToExplore={() => setTab("explore")} />
              </div>
            </>
          ) : (
            <div className="relative z-[1] h-full">
              <div className="absolute inset-0 overflow-hidden" aria-hidden>
                <img
                  src="/earth-center.jpg"
                  alt=""
                  className="h-full w-full scale-105 object-cover brightness-[0.8] saturate-90"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(3,8,18,0.72) 0%, rgba(3,8,18,0.55) 40%, rgba(3,8,18,0.78) 100%)",
                  }}
                />
              </div>
              <div className="relative z-[1] h-full">
                <CatalogBrowser />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function HomeView({ onGoToExplore }: { onGoToExplore: () => void }) {
  const courses = listCourses();
  const { courseProgressPercent } = useSpaceProgress();

  return (
    <div className="flex h-full max-w-xl flex-col justify-center px-8 py-10">
      <p className="font-mono mb-3 text-[0.7rem] tracking-[0.3em] text-cyan/70 uppercase">
        SPACE MODULE
      </p>
      <h2 className="font-display mb-4 text-[clamp(1.8rem,4vw,2.8rem)] font-bold tracking-wide text-text">
        เรียนรู้เทคโนโลยีอวกาศ
      </h2>
      <p className="mb-6 max-w-[480px] text-[0.92rem] leading-relaxed text-text/65">
        สำรวจคลังหัวข้อ Space Technology — จากอวกาศรอบตัว การใช้บนโลก ไปจนถึงคอร์สนำร่อง
        CubeSat ที่เรียนได้จริงวันนี้
      </p>
      <div className="mb-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onGoToExplore}
          className="btn-clip cursor-pointer border border-cyan/50 bg-cyan/10 px-8 py-3 font-mono text-[0.78rem] tracking-[0.12em] text-cyan uppercase transition hover:bg-cyan hover:text-bg"
        >
          สำรวจคลัง →
        </button>
      </div>

      {courses.length > 0 ? (
        <div className="space-y-3">
          <p className="font-mono text-[0.58rem] tracking-[0.14em] text-muted">CONTINUE</p>
          {courses.map((course) => {
            const progress = courseProgressPercent(
              course.id,
              course.modules.map((m) => m.id),
            );
            return (
              <Link
                key={course.id}
                to={spaceCoursePath(course.id)}
                className="group flex items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 no-underline backdrop-blur-2xl transition hover:border-cyan/25 hover:bg-white/[0.05]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-cyan/25 bg-cyan/5">
                  <IoPlanetOutline className="text-xl text-cyan" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[0.9rem] font-semibold tracking-wide text-text">
                    {course.title}
                  </p>
                  <p className="font-section-thai mt-0.5 text-[0.78rem] text-text/50">
                    {course.description}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan to-teal"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="font-mono shrink-0 text-[0.6rem] tracking-wider text-cyan">
                      {progress}%
                    </span>
                  </div>
                </div>
                <span className="text-xl text-text/25 transition group-hover:text-cyan/70">→</span>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
