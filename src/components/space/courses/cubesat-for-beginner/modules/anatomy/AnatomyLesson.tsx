import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { GiCube } from "react-icons/gi";

import KnowledgeDialog from "@/components/knowledge/KnowledgeDialog";
import { KnowledgeProvider } from "@/components/knowledge/KnowledgeProvider";
import { spaceCoursePath } from "@/components/space/core/routes";
import { useSpaceProgress } from "@/components/space/hooks/useSpaceProgress";

import AnatomyScene from "./components/AnatomyScene";
import AnatomyPanel from "./components/AnatomyPanel";
import type { AnatomyPartId } from "./lib/parts";
import {
  ANATOMY_STEPS,
  EMPTY_CHECKPOINT,
  defaultPartForStep,
  isCheckpointMet,
  type AnatomyStep,
  type CheckpointState,
} from "./lib/lesson";
import { getScenario, type ScenarioId } from "./lib/scenarios";

const MODULE_ID = "anatomy";

function AnatomyLessonInner({ courseId }: { courseId: string }) {
  const coursePath = spaceCoursePath(courseId);
  const { isModuleCompleted, markComplete } = useSpaceProgress();
  const moduleCompleted = isModuleCompleted(courseId, MODULE_ID);

  const [step, setStep] = useState<AnatomyStep>("intro");
  const [activePart, setActivePart] = useState<AnatomyPartId>("overview");
  const [activeScenarioId, setActiveScenarioId] = useState<ScenarioId | null>(
    null,
  );
  const [flowPaused, setFlowPaused] = useState(false);
  const [flatsatPreferred, setFlatsatPreferred] = useState(false);
  const [checkpoint, setCheckpoint] =
    useState<CheckpointState>(EMPTY_CHECKPOINT);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(
    () =>
      moduleCompleted
        ? new Set(ANATOMY_STEPS.map((_, i) => i))
        : new Set(),
  );
  const [finishing, setFinishing] = useState(false);

  const stepIndex = Math.max(
    0,
    ANATOMY_STEPS.findIndex((s) => s.id === step),
  );
  const stepMeta = ANATOMY_STEPS[stepIndex]!;

  const activeFlowIds = useMemo(() => {
    const sc = getScenario(activeScenarioId);
    return sc?.edgeIds ?? null;
  }, [activeScenarioId]);

  useEffect(() => {
    if (!moduleCompleted) return;
    setCompletedSteps(new Set(ANATOMY_STEPS.map((_, i) => i)));
  }, [moduleCompleted]);

  useEffect(() => {
    if (step === "close") return;
    if (!isCheckpointMet(step, checkpoint, moduleCompleted)) return;
    setCompletedSteps((prev) => {
      if (prev.has(stepIndex)) return prev;
      const next = new Set(prev);
      next.add(stepIndex);
      return next;
    });
  }, [step, stepIndex, checkpoint, moduleCompleted]);

  function handleStepChange(next: AnatomyStep) {
    setStep(next);
    setActivePart(defaultPartForStep(next));
    if (next === "flow") {
      setActiveScenarioId(null);
      setFlowPaused(false);
      setFlatsatPreferred(true);
    } else if (next === "trace") {
      setActiveScenarioId(null);
      setFlowPaused(true);
      setFlatsatPreferred(true);
    } else if (next === "meet") {
      setFlatsatPreferred(false);
    } else {
      setFlatsatPreferred(false);
    }
  }

  function handleSelectPart(id: AnatomyPartId) {
    setActivePart(id);
    if (step === "meet") {
      setCheckpoint((prev) => {
        if (prev.openedParts.has(id)) return prev;
        const next = new Set(prev.openedParts);
        next.add(id);
        return { ...prev, openedParts: next };
      });
    }
  }

  function handlePlayScenario(id: ScenarioId) {
    setActiveScenarioId(id);
    setFlowPaused(false);
    setCheckpoint((prev) => {
      if (prev.playedScenarios.has(id)) return prev;
      const next = new Set(prev.playedScenarios);
      next.add(id);
      return { ...prev, playedScenarios: next };
    });
  }

  function handleIntroOpenCard() {
    setCheckpoint((prev) => ({
      ...prev,
      introOpened: prev.introOpened + 1,
    }));
  }

  function handleIntroAck() {
    setCheckpoint((prev) => ({ ...prev, introAck: true }));
  }

  function handleTracePassedChange(count: number) {
    setCheckpoint((prev) => ({
      ...prev,
      tracePassed: Math.max(prev.tracePassed, count),
    }));
  }

  async function handleMarkComplete() {
    setFinishing(true);
    try {
      await markComplete(courseId, MODULE_ID);
      setCompletedSteps(new Set(ANATOMY_STEPS.map((_, i) => i)));
    } finally {
      setFinishing(false);
    }
  }

  const hudHint =
    step === "intro"
      ? "เปิดการ์ด analogy ทางขวา · หมุนดู CubeSat ได้"
      : step === "meet"
        ? "คลิกชิ้นส่วนในฉากหรือการ์ด · กดสลับ FlatSat ได้"
        : step === "flow"
          ? "กดสถานการณ์ทางขวา · ดูอนุภาคไหลตามเส้น"
          : step === "trace"
            ? "เรียงลำดับระบบทางขวาให้ถูกเส้นทาง"
            : "กดเสร็จโมดูลนี้เพื่อบันทึกความคืบหน้า";

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-[#030712] text-text">
      <section className="relative min-w-0 flex-1 basis-[58%] overflow-visible">
        <AnatomyScene
          step={step}
          activePart={activePart}
          activeFlowIds={activeFlowIds}
          flowPaused={flowPaused}
          flatsatPreferred={flatsatPreferred}
          visitedParts={checkpoint.openedParts}
          onSelectPart={handleSelectPart}
          onSelectFlow={(flowId) => {
            setFlowPaused(false);
            const match = (
              ["uplink-photo", "downlink-image", "battery-low"] as ScenarioId[]
            ).find((sid) => getScenario(sid)?.edgeIds.includes(flowId));
            if (match) handlePlayScenario(match);
          }}
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-3 p-4">
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
                  {moduleCompleted ? (
                    <span className="ml-2 font-mono text-[0.55rem] text-emerald-300/90">
                      ✓
                    </span>
                  ) : null}
                </p>
                <p className="font-section-thai text-[0.7rem] text-text/50">
                  {stepMeta.title}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-20 left-4 z-30 max-w-sm rounded-xl border border-white/10 bg-[rgba(8,12,22,0.8)] px-3 py-2 backdrop-blur-md lg:bottom-4">
          <p className="font-mono text-[0.58rem] tracking-wider text-text/45">
            {hudHint}
          </p>
        </div>
      </section>

      <div className="absolute inset-x-0 bottom-0 z-30 max-h-[48vh] overflow-hidden rounded-t-2xl border-t border-white/10 lg:relative lg:inset-auto lg:z-auto lg:flex lg:h-full lg:max-h-none lg:min-w-[320px] lg:max-w-[460px] lg:flex-1 lg:basis-[42%] lg:rounded-none lg:border-t-0">
        <AnatomyPanel
          step={step}
          stepIndex={stepIndex}
          completedSteps={completedSteps}
          checkpoint={checkpoint}
          moduleCompleted={moduleCompleted}
          finishing={finishing}
          activePart={activePart}
          activeScenarioId={activeScenarioId}
          flatsatPreferred={flatsatPreferred}
          courseId={courseId}
          onStepChange={handleStepChange}
          onSelectPart={handleSelectPart}
          onPlayScenario={handlePlayScenario}
          onIntroOpenCard={handleIntroOpenCard}
          onIntroAck={handleIntroAck}
          onTracePassedChange={handleTracePassedChange}
          onFlatsatPreferredChange={setFlatsatPreferred}
          onMarkComplete={handleMarkComplete}
        />
      </div>
    </main>
  );
}

export default function AnatomyLesson({
  courseId = "cubesat-for-beginner",
}: {
  courseId?: string;
}) {
  return (
    <KnowledgeProvider>
      <AnatomyLessonInner courseId={courseId} />
      <KnowledgeDialog />
    </KnowledgeProvider>
  );
}
