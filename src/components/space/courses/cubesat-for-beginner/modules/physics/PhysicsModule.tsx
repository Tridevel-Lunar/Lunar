import { useNavigate } from "react-router-dom";
import { HiOutlineBell, HiOutlineCalendar, HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { IoPlanetOutline } from "react-icons/io5";
import { Suspense, useRef, useState } from "react";

import { KnowledgeProvider } from "@/components/knowledge/KnowledgeProvider";
import KnowledgeDialog from "@/components/knowledge/KnowledgeDialog";
import KnowledgeText from "@/components/knowledge/KnowledgeText";
import { LAIKA_AVATAR_URL } from "@/lib/constants";
import type { SpaceModulePageProps } from "@/components/space/core/types";
import { spaceCoursePath } from "@/components/space/core/routes";
import { useSpaceProgress } from "@/components/space/hooks/useSpaceProgress";

import LessonScene from "./LessonScene";
import PhysicsQuizPanel from "./components/PhysicsQuizPanel";
import { SimulationClockProvider } from "./sim/SimulationClock";
import OrbitSimView from "./sim/OrbitSimView";
import { PHYSICS_SLIDES } from "./slides";

const MODULE_ID = "physics";

/** Physics for Space — custom module page (slides + WebGPU lessons). */
export default function PhysicsModule({ course, module }: SpaceModulePageProps) {
  const navigate = useNavigate();
  const { isModuleCompleted, markComplete } = useSpaceProgress();
  const moduleCompleted = isModuleCompleted(course.id, MODULE_ID);
  const slides = PHYSICS_SLIDES;

  const [slideIdx, setSlideIdx] = useState(0);
  const [sceneResetKey, setSceneResetKey] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const totalSlides = slides.length;
  const slideElRef = useRef<HTMLDivElement>(null);

  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const slide = slides[slideIdx]!;

  async function handleMarkComplete() {
    setFinishing(true);
    try {
      await markComplete(course.id, MODULE_ID);
    } finally {
      setFinishing(false);
    }
  }

  function goNext() {
    if (slideIdx < totalSlides - 1) setSlideIdx((p) => p + 1);
  }
  function goPrev() {
    if (slideIdx > 0) setSlideIdx((p) => p - 1);
  }

  function handleResetScene() {
    setSceneResetKey((k) => k + 1);
  }

  return (
    <KnowledgeProvider>
      <KnowledgeDialog />
      <SimulationClockProvider resetKey={`${slideIdx}-${sceneResetKey}`}>
        <div className="flex h-screen flex-col overflow-hidden bg-bg text-text">
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
              <div className="relative min-h-0 min-w-0 flex-[2_1_0%] overflow-hidden">
                <div ref={slideElRef} className="absolute inset-0">
                  {slide.graphic === "quiz" ? (
                    <PhysicsQuizPanel
                      courseId={course.id}
                      moduleCompleted={moduleCompleted}
                      finishing={finishing}
                      onMarkComplete={handleMarkComplete}
                    />
                  ) : slide.graphic && slide.graphic !== "orbit-sim" ? (
                    <>
                      <div className="pointer-events-none absolute top-3 left-3 z-10 rounded-lg border border-white/10 bg-black/45 px-3.5 py-2 backdrop-blur-sm">
                        <p className="font-thai text-[0.9rem] font-bold text-text">{slide.heading}</p>
                      </div>
                      <Suspense fallback={<div className="h-full w-full bg-bg" />}>
                        <LessonScene
                          type={
                            slide.graphic as
                              | "gravity-well"
                              | "magnet"
                              | "thermal"
                              | "radiation"
                              | "vacuum"
                          }
                          resetKey={sceneResetKey}
                          onResetScene={handleResetScene}
                        />
                      </Suspense>
                    </>
                  ) : slide.graphic === "orbit-sim" ? (
                    <>
                      <div className="pointer-events-none absolute top-3 left-3 z-10 rounded-lg border border-white/10 bg-black/45 px-3.5 py-2 backdrop-blur-sm">
                        <p className="font-thai text-[0.9rem] font-bold text-text">{slide.heading}</p>
                      </div>
                      <OrbitSimView onReset={handleResetScene} />
                    </>
                  ) : (
                    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_50%_40%,rgba(0,229,255,0.12),transparent_55%),radial-gradient(ellipse_at_70%_75%,rgba(167,139,250,0.1),transparent_50%),#030812] px-6 py-10 sm:px-10">
                      <div className="flex w-full max-w-2xl flex-col items-center text-center">
                        <p className="font-mono mb-3 text-[0.65rem] tracking-[0.2em] text-cyan/70 uppercase">
                          Physics for Space
                        </p>
                        <h2 className="font-thai mb-4 max-w-xl text-[clamp(1.6rem,3vw,2.2rem)] font-bold leading-snug text-text">
                          {slide.heading}
                        </h2>
                        <p className="font-section-thai mb-8 max-w-lg text-[1rem] leading-relaxed text-text/65">
                          สภาพแวดล้อมนอกชั้นบรรยากาศมีอะไรบ้าง และทำไมมันสำคัญตอนออกแบบดาวเทียม
                        </p>
                        <div className="grid w-full max-w-xl gap-3 sm:grid-cols-2">
                          {[
                            { title: "แรงโน้มถ่วง", desc: "ทำไมดาวเทียมถึงลอยได้" },
                            { title: "สนามแม่เหล็ก", desc: "ปกป้องและบอกทิศทาง" },
                            { title: "ความร้อนและรังสี", desc: "สิ่งที่ทำให้อุปกรณ์เสื่อม" },
                            { title: "สุญญากาศ", desc: "อากาศบางๆ ที่ยังดึงอยู่" },
                          ].map((item) => (
                            <div
                              key={item.title}
                              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left backdrop-blur-sm"
                            >
                              <p className="font-thai text-[0.95rem] font-semibold text-text">{item.title}</p>
                              <p className="font-section-thai mt-1 text-[0.82rem] text-text/50">{item.desc}</p>
                            </div>
                          ))}
                        </div>
                        <p className="font-section-thai mt-8 text-[0.85rem] text-text/40">
                          กด «ถัดไป» ทางขวาเพื่อเริ่มฉากแรก
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex min-w-[280px] flex-[1_1_0%] flex-col border-l border-white/[0.06] bg-white/[0.02]">
                <div className="flex-1 overflow-y-auto px-4 py-5">
                  {/* LAIKA chat row: avatar | message bubble */}
                  <div className="flex items-start gap-3">
                    <div className="flex shrink-0 flex-col items-center gap-1.5">
                      <div className="h-11 w-11 overflow-hidden rounded-full border-2 border-amber/25 shadow-[0_0_12px_rgba(251,191,36,0.15)]">
                        <img
                          src={LAIKA_AVATAR_URL}
                          alt="LAIKA"
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <p className="font-mono text-[0.5rem] tracking-wider text-amber/70">LAIKA</p>
                    </div>
                    <div className="relative min-w-0 flex-1 rounded-2xl rounded-tl-md border border-amber/15 bg-amber/[0.06] px-3.5 py-3">
                      <p className="font-section-thai text-[0.88rem] leading-relaxed text-text/85">
                        <KnowledgeText text={slide.laikaSays} />
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3 px-1">
                    {slide.body.split("\n\n").map((paragraph, i) => (
                      <p
                        key={i}
                        className="font-section-thai text-[0.85rem] leading-relaxed text-text/60"
                      >
                        <KnowledgeText text={paragraph} />
                      </p>
                    ))}
                  </div>
                  <div className="mt-4 rounded-xl border border-violet-400/20 bg-violet-400/[0.06] p-4">
                    <p className="font-mono mb-2 text-[0.58rem] tracking-wider text-violet-300/80 uppercase">
                      {slide.graphic === "quiz"
                        ? "แบบทดสอบ"
                        : slide.graphic
                          ? "ลองเล่นในฉากนี้"
                          : "เริ่มต้นยังไง"}
                    </p>
                    <p className="font-section-thai text-[0.82rem] leading-relaxed text-text/70">
                      {slide.tryThis}
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

                <div className="shrink-0 border-t border-white/[0.06] px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={goPrev}
                      disabled={slideIdx === 0}
                      className="flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1.5 font-mono text-[0.65rem] tracking-wider text-text/40 transition hover:bg-white/[0.04] hover:text-text disabled:cursor-default disabled:opacity-20"
                    >
                      ← ก่อนหน้า
                    </button>
                    <span className="font-mono text-[0.55rem] tracking-wider text-text/30">
                      {slideIdx + 1} / {totalSlides}
                    </span>
                    <button
                      type="button"
                      onClick={goNext}
                      disabled={slideIdx >= totalSlides - 1}
                      className="flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1.5 font-mono text-[0.65rem] tracking-wider text-cyan/70 transition hover:bg-cyan/10 hover:text-cyan disabled:cursor-default disabled:opacity-20"
                    >
                      ถัดไป →
                    </button>
                  </div>
                </div>
              </div>
            </main>
        </div>
      </SimulationClockProvider>
    </KnowledgeProvider>
  );
}
