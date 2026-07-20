import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { GiCube } from "react-icons/gi";
import AnatomyScene from "@/features/anatomy-of-cubesat/components/AnatomyScene";
import AnatomyPanel from "@/features/anatomy-of-cubesat/components/AnatomyPanel";
import type { AnatomyPartId } from "@/features/anatomy-of-cubesat/lib/parts";
import {
  ANATOMY_STEPS,
  DATA_FLOWS,
  defaultPartForStep,
  type AnatomyStep,
} from "@/features/anatomy-of-cubesat/lib/lesson";

export default function AnatomyLesson() {
  const { courseId = "cubesat-for-beginner" } = useParams<{ courseId: string }>();
  const coursePath = `/space/course/${courseId}`;
  const [step, setStep] = useState<AnatomyStep>("explore");
  const [activePart, setActivePart] = useState<AnatomyPartId>("overview");
  const [activeFlowId, setActiveFlowId] = useState<string>(DATA_FLOWS[0].id);
  const [flowPaused, setFlowPaused] = useState(true);

  function handleStepChange(next: AnatomyStep) {
    setStep(next);
    setActivePart(defaultPartForStep(next));
    if (next === "dataflow") {
      setActiveFlowId(DATA_FLOWS[0].id);
      setFlowPaused(true);
    }
  }

  const stepMeta = ANATOMY_STEPS.find((s) => s.id === step);

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-[#030712] text-text">
      <section className="relative min-w-0 flex-1 basis-[58%]">
        <AnatomyScene
          step={step}
          activePart={activePart}
          activeFlowId={activeFlowId}
          flowPaused={flowPaused}
          onSelectPart={setActivePart}
          onSelectFlow={(id) => {
            setActiveFlowId(id);
            setFlowPaused(true);
          }}
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-4">
          <Link
            to={coursePath}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-xl border border-white/15 bg-[rgba(8,12,22,0.88)] py-2 pl-2.5 pr-3 text-white/85 no-underline shadow-lg backdrop-blur-md transition hover:bg-[rgba(12,18,32,0.95)]"
            aria-label="กลับคอร์ส"
          >
            <IoArrowBack className="text-sm" />
            <span className="font-mono text-[11px] font-medium tracking-wide">
              COURSE
            </span>
          </Link>

          <div className="rounded-xl border border-white/10 bg-[rgba(8,12,22,0.75)] px-3 py-2 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <GiCube className="text-cyan" />
              <div>
                <p className="font-display text-[0.78rem] font-semibold tracking-[0.14em] text-text">
                  ANATOMY
                </p>
                <p className="font-section-thai text-[0.7rem] text-text/50">
                  {stepMeta?.label} · {stepMeta?.labelEn}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-4 left-4 z-20 max-w-sm rounded-xl border border-white/10 bg-[rgba(8,12,22,0.8)] px-3 py-2 backdrop-blur-md">
          <p className="font-mono text-[0.58rem] tracking-wider text-text/45">
            {step === "explore"
              ? "Drag หมุน · Scroll ซูม · เลือกชิ้นส่วนทางขวา"
              : step === "flatsat"
                ? "แผ่จากกลางเป็นบอร์ด FlatSat จริง · มองลงทั้งแผ่น"
                : step === "dataflow"
                  ? "คลิกเส้นบนบอร์ด · ทีละสเต็ปดูว่าไหลอะไร"
                  : "ทำแบบทบทวนทางขวา"}
          </p>
        </div>
      </section>

      <div className="hidden h-full min-w-[320px] max-w-[460px] flex-1 basis-[42%] lg:flex">
        <AnatomyPanel
          step={step}
          activePart={activePart}
          activeFlowId={activeFlowId}
          flowPaused={flowPaused}
          onStepChange={handleStepChange}
          onSelectPart={setActivePart}
          onSelectFlow={setActiveFlowId}
          onFlowPausedChange={setFlowPaused}
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-30 max-h-[44vh] overflow-hidden rounded-t-2xl border-t border-white/10 lg:hidden">
        <AnatomyPanel
          step={step}
          activePart={activePart}
          activeFlowId={activeFlowId}
          flowPaused={flowPaused}
          onStepChange={handleStepChange}
          onSelectPart={setActivePart}
          onSelectFlow={setActiveFlowId}
          onFlowPausedChange={setFlowPaused}
        />
      </div>
    </main>
  );
}
