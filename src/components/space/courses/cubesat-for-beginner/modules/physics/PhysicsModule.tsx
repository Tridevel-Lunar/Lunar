import { useNavigate } from "react-router-dom";
import { HiOutlineBell, HiOutlineCalendar, HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { IoPlanetOutline } from "react-icons/io5";
import { Suspense, useRef, useState } from "react";

import ModuleSidebar from "@/components/app/ModuleSidebar";
import { KnowledgeProvider } from "@/components/knowledge/KnowledgeProvider";
import KnowledgeDialog from "@/components/knowledge/KnowledgeDialog";
import KnowledgeText from "@/components/knowledge/KnowledgeText";
import { LAIKA_AVATAR_URL } from "@/lib/constants";
import type { SpaceModulePageProps } from "@/components/space/core/types";
import { spaceCoursePath } from "@/components/space/core/routes";

import LessonScene from "./LessonScene";
import { SimulationClockProvider } from "./sim/SimulationClock";
import OrbitSimView from "./sim/OrbitSimView";
import { PHYSICS_SLIDES } from "./slides";

/** Physics for Space — custom module page (slides + WebGPU lessons). */
export default function PhysicsModule({ user, course, module }: SpaceModulePageProps) {
  const navigate = useNavigate();
  const slides = PHYSICS_SLIDES;

  const [slideIdx, setSlideIdx] = useState(0);
  const totalSlides = slides.length;
  const slideElRef = useRef<HTMLDivElement>(null);

  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const slide = slides[slideIdx];

  function goNext() {
    if (slideIdx < totalSlides - 1) setSlideIdx((p) => p + 1);
  }
  function goPrev() {
    if (slideIdx > 0) setSlideIdx((p) => p - 1);
  }

  return (
    <KnowledgeProvider>
      <KnowledgeDialog />
      <SimulationClockProvider resetKey={slideIdx}>
        <div className="flex h-screen overflow-hidden bg-bg text-text">
          <ModuleSidebar user={user} activeModule="space" />

          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-3">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => navigate(spaceCoursePath(course.id))}
                  className="cursor-pointer text-lg text-text/40 transition hover:text-cyan"
                >
                  ←
                </button>
                <IoPlanetOutline className="text-xl text-cyan" />
                <h1 className="font-display text-[1.05rem] font-bold tracking-[0.12em] text-text">
                  {module.title}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSlideIdx(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === slideIdx ? "w-5 bg-cyan" : "w-1.5 bg-white/15 hover:bg-white/30"
                      }`}
                    />
                  ))}
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
              </div>
            </header>

            <main className="flex min-h-0 flex-1 overflow-hidden">
              <div className="relative flex flex-1 flex-col overflow-hidden">
                <div className="flex-1 p-6 pb-2">
                  <div ref={slideElRef} className="relative h-full w-full">
                    <div className="pointer-events-none absolute top-3 left-3 z-10 rounded-lg border border-white/10 bg-black/45 px-3.5 py-2 backdrop-blur-sm">
                      <p className="font-thai text-[0.9rem] font-bold text-text">{slide.heading}</p>
                    </div>
                    {slide.graphic && slide.graphic !== "orbit-sim" ? (
                      <Suspense fallback={<div className="h-full w-full rounded-lg bg-bg" />}>
                        <LessonScene
                          type={
                            slide.graphic as
                              | "gravity-well"
                              | "magnet"
                              | "thermal"
                              | "radiation"
                              | "vacuum"
                          }
                        />
                      </Suspense>
                    ) : slide.graphic === "orbit-sim" ? (
                      <OrbitSimView />
                    ) : null}
                  </div>
                </div>

                <div className="shrink-0 px-6 pb-4">
                  <div className="mt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={goPrev}
                      disabled={slideIdx === 0}
                      className="flex cursor-pointer items-center gap-1 px-3 py-1.5 font-mono text-[0.65rem] tracking-wider text-text/30 transition hover:text-text disabled:cursor-default disabled:opacity-15"
                    >
                      ← ย้อนกลับ
                    </button>
                    <span className="font-mono text-[0.55rem] tracking-wider text-text/20">
                      {slideIdx + 1} / {totalSlides}
                    </span>
                    <button
                      type="button"
                      onClick={goNext}
                      disabled={slideIdx >= totalSlides - 1}
                      className="flex cursor-pointer items-center gap-1 px-3 py-1.5 font-mono text-[0.65rem] tracking-wider text-cyan/60 transition hover:text-cyan disabled:cursor-default disabled:opacity-15"
                    >
                      ถัดไป →
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex w-[340px] shrink-0 flex-col border-l border-white/[0.06] bg-white/[0.02]">
                <div className="flex flex-col items-center border-b border-white/[0.06] px-6 pt-8 pb-4">
                  <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-amber/20">
                    <img
                      src={LAIKA_AVATAR_URL}
                      alt="LAIKA"
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <p className="font-mono mt-3 text-[0.6rem] tracking-wider text-amber/70">LAIKA</p>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-5">
                  <div className="rounded-xl border border-amber/10 bg-amber/[0.03] p-4">
                    <p className="font-section-thai text-[0.92rem] leading-relaxed text-text/80">
                      <KnowledgeText text={slide.laikaSays} />
                    </p>
                  </div>
                  <div className="mt-4 space-y-3">
                    <p className="font-section-thai text-[0.85rem] leading-relaxed text-text/60">
                      <KnowledgeText text={slide.body} />
                    </p>
                  </div>
                  <div className="mt-4 rounded-xl border border-cyan/15 bg-cyan/[0.04] p-4">
                    <p className="font-mono mb-2 text-[0.58rem] tracking-wider text-cyan/60 uppercase">
                      เกร็ดความรู้
                    </p>
                    <p className="font-section-thai text-[0.82rem] leading-relaxed text-text/65">
                      <KnowledgeText text={slide.funFact} />
                    </p>
                  </div>
                </div>
                <div className="shrink-0 border-t border-white/[0.06] px-6 py-4">
                  <p className="font-mono text-center text-[0.5rem] tracking-wider text-text/20">
                    {module.title} · LUNAR
                  </p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </SimulationClockProvider>
    </KnowledgeProvider>
  );
}
