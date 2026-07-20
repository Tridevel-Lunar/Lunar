import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HiOutlineBell,
  HiOutlineCalendar,
  HiOutlineMagnifyingGlass,
} from "react-icons/hi2";
import { IoPlanetOutline } from "react-icons/io5";

import ModuleSidebar from "@/components/app/ModuleSidebar";
import type { User } from "@/lib/api";
import { listCourses } from "@/components/space/core/registry";
import { spaceCoursePath } from "@/components/space/core/routes";

type SpaceTab = "home" | "courses";

export default function SpaceHome({ user }: { user: User }) {
  const location = useLocation();
  const initialTab = (location.state as { tab?: SpaceTab } | null)?.tab ?? "home";
  const [tab, setTab] = useState<SpaceTab>(initialTab);
  const courses = listCourses();

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

        <div className="flex gap-6 border-b border-white/[0.06] px-5">
          {(["home", "courses"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`cursor-pointer border-b-2 pb-2 pt-3 font-mono text-[0.72rem] tracking-[0.15em] uppercase transition ${
                tab === t
                  ? "border-cyan text-cyan"
                  : "border-transparent text-text/40 hover:text-text/70"
              }`}
            >
              {t === "home" ? "Home" : "My Courses"}
            </button>
          ))}
        </div>

        <main className="relative min-h-0 flex-1 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="h-full transition-transform duration-700 ease-in-out"
              style={{
                width: "200%",
                transform: `translateX(${tab === "home" ? "0%" : "-50%"})`,
              }}
            >
              <img src="/earth-center.jpg" alt="" className="h-full w-full object-cover" />
            </div>
            <div
              className="absolute inset-0 transition-opacity duration-700 ease-in-out"
              style={{
                background:
                  "linear-gradient(to right, rgba(3,8,18,0.94) 0%, rgba(3,8,18,0.7) 30%, rgba(3,8,18,0.15) 60%, transparent 80%)",
                opacity: tab === "home" ? 1 : 0,
              }}
              aria-hidden
            />
            <div
              className="absolute inset-0 transition-opacity duration-700 ease-in-out"
              style={{
                background:
                  "linear-gradient(to left, rgba(3,8,18,0.94) 0%, rgba(3,8,18,0.7) 30%, rgba(3,8,18,0.15) 60%, transparent 80%)",
                opacity: tab === "courses" ? 1 : 0,
              }}
              aria-hidden
            />
          </div>

          <div className="relative z-[1] h-full">
            <div
              className="absolute inset-0 transition-all duration-700 ease-in-out"
              style={{
                transform: tab === "home" ? "translateX(0)" : "translateX(-100%)",
                opacity: tab === "home" ? 1 : 0,
                pointerEvents: tab === "home" ? "auto" : "none",
              }}
            >
              <HomeView onGoToCourses={() => setTab("courses")} />
            </div>
            <div
              className="absolute inset-0 transition-all duration-700 ease-in-out"
              style={{
                transform: tab === "courses" ? "translateX(0)" : "translateX(100%)",
                opacity: tab === "courses" ? 1 : 0,
                pointerEvents: tab === "courses" ? "auto" : "none",
              }}
            >
              <CoursesView courses={courses} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function HomeView({ onGoToCourses }: { onGoToCourses: () => void }) {
  return (
    <div className="flex h-full max-w-xl flex-col justify-center px-8 py-10">
      <p className="font-mono mb-3 text-[0.7rem] tracking-[0.3em] text-cyan/70 uppercase">
        SPACE MODULE
      </p>
      <h2 className="font-display mb-4 text-[clamp(1.8rem,4vw,2.8rem)] font-bold tracking-wide text-text">
        เรียนรู้เทคโนโลยีอวกาศ
      </h2>
      <p className="mb-6 max-w-[480px] text-[0.92rem] leading-relaxed text-text/65">
        ปูพื้นฐานวิศวกรรมอวกาศด้วยบทเรียนแบบ Interactive ตั้งแต่โครงสร้าง CubeSat ระบบฝังตัว
        ฟิสิกส์วงโคจร ไปจนถึงการเขียนโปรแกรมควบคุม autopilot ครบจบในโมดูลเดียว
      </p>
      <div>
        <button
          type="button"
          onClick={onGoToCourses}
          className="btn-clip cursor-pointer border border-cyan/50 bg-cyan/10 px-8 py-3 font-mono text-[0.78rem] tracking-[0.12em] text-cyan uppercase transition hover:bg-cyan hover:text-bg"
        >
          เริ่มเรียน →
        </button>
      </div>
    </div>
  );
}

function CoursesView({
  courses,
}: {
  courses: ReturnType<typeof listCourses>;
}) {
  return (
    <div className="ml-auto flex h-full max-w-xl flex-col justify-center px-8 py-10">
      <h2 className="font-display mb-6 text-[1.2rem] font-bold tracking-wide text-text">
        My Courses
      </h2>

      <div className="space-y-3">
        {courses.map((course) => (
          <Link
            key={course.id}
            to={spaceCoursePath(course.id)}
            className="group flex items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 no-underline backdrop-blur-2xl transition hover:border-cyan/25 hover:bg-white/[0.05]"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-cyan/25 bg-cyan/5">
              <IoPlanetOutline className="text-2xl text-cyan" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-[0.95rem] font-semibold tracking-wide text-text">
                {course.title}
              </p>
              <p className="font-section-thai mt-0.5 text-[0.82rem] text-text/50">
                {course.description}
              </p>
              <div className="mt-3">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-cyan/20 bg-cyan/[0.06] px-2.5 py-1 font-mono text-[0.6rem] tracking-wider text-cyan/80">
                  <IoPlanetOutline className="text-[0.65rem]" />
                  {course.modules.length} Modules
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan to-teal"
                    style={{ width: `${course.progress ?? 0}%` }}
                  />
                </div>
                <span className="font-mono shrink-0 text-[0.6rem] tracking-wider text-cyan">
                  {course.progress ?? 0}%
                </span>
              </div>
            </div>
            <span className="text-xl text-text/25 transition group-hover:text-cyan/70">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
