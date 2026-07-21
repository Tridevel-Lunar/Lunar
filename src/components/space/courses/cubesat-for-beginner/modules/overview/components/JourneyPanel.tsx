import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import KnowledgeText from "@/components/knowledge/KnowledgeText";
import { LAIKA_AVATAR_URL } from "@/lib/constants";
import { spaceCoursePath } from "@/components/space/core/routes";

import { TOUR_MISSION_FOCUS } from "../lib/tour";
import type { MissionType } from "../lib/missions";
import {
  JOURNEY_STEPS,
  JOURNEY_TOTAL,
  journeyStepAt,
  type JourneyStepId,
} from "../lib/journey";
import {
  BAND_META,
  type OrbitBand,
  type OrbitDefinition,
  type SatelliteDefinition,
} from "../lib/types";
import { IntroStep, TypesStep } from "./lesson/LessonSteps";
import MatchStep from "./MatchStep";

const CubeSatSizeBuilder = lazy(() => import("./CubeSatSizeBuilder"));

const cubeSatFallback = (
  <div className="h-56 animate-pulse rounded-2xl border border-emerald-500/20 bg-black/30" />
);

type PanelMode = "lesson" | "playground";

type CheckpointState = {
  dailyHook: boolean;
  typeCards: number;
  visitedBands: Set<OrbitBand>;
  matchCorrect: number;
  cubesatSized: boolean;
};

const EMPTY_CHECKPOINT: CheckpointState = {
  dailyHook: false,
  typeCards: 0,
  visitedBands: new Set(),
  matchCorrect: 0,
  cubesatSized: false,
};

function isCheckpointMet(
  stepId: JourneyStepId,
  cp: CheckpointState,
  moduleDone: boolean,
): boolean {
  if (moduleDone) return true;
  switch (stepId) {
    case "intro":
      return cp.dailyHook;
    case "types":
      return cp.typeCards >= 2;
    case "orbits":
      return (
        cp.visitedBands.has("LEO") &&
        cp.visitedBands.has("MEO") &&
        cp.visitedBands.has("GEO")
      );
    case "match":
      return cp.matchCorrect >= 2;
    case "cubesat":
      return cp.cubesatSized;
    case "close":
      return false; // finish CTA is separate
    default:
      return false;
  }
}

type JourneyPanelProps = {
  open: boolean;
  onClose: () => void;
  courseId: string;
  moduleCompleted: boolean;
  onMarkComplete: () => Promise<void>;
  orbits: OrbitDefinition[];
  satellites: SatelliteDefinition[];
  onClearSelection: () => void;
  onSelectOrbit: (orbitId: string) => void;
  onSelectSatellite?: (id: string) => void;
  /** When user picks a band in the scene, parent can call this to credit visit. */
  sceneBandVisit?: OrbitBand | null;
};

export default function JourneyPanel({
  open,
  onClose,
  courseId,
  moduleCompleted,
  onMarkComplete,
  orbits,
  satellites,
  onClearSelection,
  onSelectOrbit,
  onSelectSatellite,
  sceneBandVisit,
}: JourneyPanelProps) {
  const coursePath = spaceCoursePath(courseId);
  const [stepIdx, setStepIdx] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(() =>
    moduleCompleted
      ? new Set(JOURNEY_STEPS.map((_, i) => i))
      : new Set(),
  );
  const [checkpoint, setCheckpoint] = useState<CheckpointState>(EMPTY_CHECKPOINT);
  const [mode, setMode] = useState<PanelMode>("lesson");
  const [finishing, setFinishing] = useState(false);
  const [justFinished, setJustFinished] = useState(moduleCompleted);
  const [playgroundBand, setPlaygroundBand] = useState<OrbitBand>("LEO");

  const step = journeyStepAt(stepIdx);
  const gateOpen = isCheckpointMet(step.id, checkpoint, moduleCompleted || justFinished);
  const playgroundUnlocked =
    moduleCompleted ||
    justFinished ||
    completedSteps.has(2) ||
    stepIdx > 2;

  // Sync moduleCompleted from server (e.g. returning visitor)
  useEffect(() => {
    if (!moduleCompleted) return;
    setJustFinished(true);
    setCompletedSteps(new Set(JOURNEY_STEPS.map((_, i) => i)));
  }, [moduleCompleted]);

  // Credit band visits from scene clicks
  useEffect(() => {
    if (!sceneBandVisit || sceneBandVisit === "HEO") return;
    setCheckpoint((prev) => {
      if (prev.visitedBands.has(sceneBandVisit)) return prev;
      const next = new Set(prev.visitedBands);
      next.add(sceneBandVisit);
      return { ...prev, visitedBands: next };
    });
  }, [sceneBandVisit]);

  // Mark current step complete when gate opens (except close)
  useEffect(() => {
    if (step.id === "close") return;
    if (!gateOpen) return;
    setCompletedSteps((prev) => {
      if (prev.has(stepIdx)) return prev;
      const next = new Set(prev);
      next.add(stepIdx);
      return next;
    });
  }, [gateOpen, step.id, stepIdx]);

  function focusBand(band: OrbitBand, missionType?: MissionType) {
    if (band !== "HEO") {
      setCheckpoint((prev) => {
        if (prev.visitedBands.has(band)) return prev;
        const next = new Set(prev.visitedBands);
        next.add(band);
        return { ...prev, visitedBands: next };
      });
    }

    const orbitForSatellite = (sat: SatelliteDefinition) =>
      orbits.find((o) => o.id === sat.orbitId);

    const satellitesOnBand = satellites.filter(
      (sat) => orbitForSatellite(sat)?.band === band,
    );

    let targetSat: SatelliteDefinition | undefined;

    if (missionType) {
      targetSat = satellitesOnBand.find((sat) => sat.missionType === missionType);
    }

    if (!targetSat) {
      for (const mission of TOUR_MISSION_FOCUS[band]) {
        targetSat = satellitesOnBand.find((sat) => sat.missionType === mission);
        if (targetSat) break;
      }
    }

    targetSat ??= satellitesOnBand[0];

    if (targetSat) {
      onSelectSatellite?.(targetSat.id);
      return;
    }

    const orbit = orbits.find((o) => o.band === band);
    if (orbit) onSelectOrbit(orbit.id);
    else onClearSelection();
  }

  function goStep(next: number) {
    const clamped = Math.max(0, Math.min(JOURNEY_TOTAL - 1, next));
    if (clamped === stepIdx) {
      setMode("lesson");
      return;
    }
    const freely =
      moduleCompleted || justFinished || clamped < stepIdx || completedSteps.has(clamped);
    if (clamped > stepIdx && !freely) {
      // Soft gate: only one step forward when checkpoint met
      if (!(clamped === stepIdx + 1 && gateOpen && step.id !== "close")) return;
    }
    setStepIdx(clamped);
    setMode("lesson");
    const target = journeyStepAt(clamped);
    if (target.focusBand) focusBand(target.focusBand);
    else if (
      target.id === "intro" ||
      target.id === "types" ||
      target.id === "close"
    ) {
      onClearSelection();
    }
  }

  async function handleFinish() {
    if (finishing) return;
    setFinishing(true);
    try {
      await onMarkComplete();
      setJustFinished(true);
      setCompletedSteps(new Set(JOURNEY_STEPS.map((_, i) => i)));
    } finally {
      setFinishing(false);
    }
  }

  const progressLabel = `${stepIdx + 1} / ${JOURNEY_TOTAL}`;
  const visitedCount = checkpoint.visitedBands.size;

  const orbitBands = useMemo(
    () =>
      (["LEO", "MEO", "GEO"] as const).map((b) => ({
        band: b,
        visited: checkpoint.visitedBands.has(b),
        color: BAND_META[b].defaultColor,
      })),
    [checkpoint.visitedBands],
  );

  return (
    <aside
      className="detail-zone flex h-full w-full flex-col overflow-hidden border-l border-white/10 bg-[rgba(6,10,18,0.98)]"
      aria-hidden={!open}
    >
      <header className="shrink-0 border-b border-white/[0.07] px-4 pt-3.5 pb-3">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[0.58rem] tracking-wider text-cyan-300/70 uppercase">
              Module 1 · Overview
            </p>
            <h1 className="mt-0.5 text-[15px] font-semibold tracking-tight text-white">
              Guided Journey
            </h1>
          </div>
          {(justFinished || moduleCompleted) && (
            <span className="shrink-0 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2.5 py-1 text-[10px] font-semibold text-emerald-200">
              ✓ เสร็จแล้ว
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 shrink-0 cursor-pointer rounded-full border border-white/10 bg-white/5 text-white/50 hover:bg-white/10"
            aria-label="ปิดแถบ"
          >
            ›
          </button>
        </div>

        {/* Journey map */}
        <nav className="mt-3 flex gap-1" aria-label="เส้นทางเรียน">
          {JOURNEY_STEPS.map((s, i) => {
            const active = i === stepIdx && mode === "lesson";
            const done = completedSteps.has(i) || (s.id === "close" && justFinished);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => goStep(i)}
                title={s.title}
                className={`h-8 flex-1 cursor-pointer rounded-full text-[10px] font-bold tracking-wide transition-all ${
                  active
                    ? "scale-[1.03] bg-cyan-400 text-[#061018] shadow-[0_0_20px_rgba(34,211,238,0.35)]"
                    : done
                      ? "bg-emerald-500/25 text-emerald-200"
                      : "bg-white/[0.04] text-white/30 hover:text-white/50"
                }`}
              >
                {done && !active ? "✓" : s.shortLabel}
              </button>
            );
          })}
        </nav>

        {/* Lesson / Playground toggle */}
        <div className="mt-2.5 flex gap-1 rounded-xl border border-white/10 bg-black/30 p-1">
          <button
            type="button"
            onClick={() => setMode("lesson")}
            className={`flex-1 cursor-pointer rounded-lg py-1.5 text-[11px] font-semibold transition ${
              mode === "lesson"
                ? "bg-white/10 text-white"
                : "text-white/40 hover:text-white/65"
            }`}
          >
            เส้นเรียน
          </button>
          <button
            type="button"
            disabled={!playgroundUnlocked}
            onClick={() => {
              if (!playgroundUnlocked) return;
              setMode("playground");
            }}
            className={`flex-1 cursor-pointer rounded-lg py-1.5 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-30 ${
              mode === "playground"
                ? "bg-violet-400/25 text-violet-100"
                : "text-white/40 hover:text-white/65"
            }`}
            title={
              playgroundUnlocked
                ? "ทดลองอิสระในฉาก"
                : "ปลดล็อกหลังจบขั้นวงโคจร"
            }
          >
            ทดลองอิสระ
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {mode === "lesson" ? (
          <div className="px-4 py-4">
            {/* LAIKA teacher bubble */}
            <div className="flex items-start gap-3">
              <div className="flex shrink-0 flex-col items-center gap-1.5">
                <div className="h-11 w-11 overflow-hidden rounded-full border-2 border-amber-400/25 shadow-[0_0_12px_rgba(251,191,36,0.15)]">
                  <img
                    src={LAIKA_AVATAR_URL}
                    alt="LAIKA"
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <p className="font-mono text-[0.5rem] tracking-wider text-amber-400/70">
                  LAIKA
                </p>
              </div>
              <div className="relative min-w-0 flex-1 rounded-2xl rounded-tl-md border border-amber-400/15 bg-amber-400/[0.06] px-3.5 py-3">
                <p className="font-section-thai text-[0.88rem] leading-relaxed text-white/85">
                  <KnowledgeText text={step.laikaSays} />
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-1">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-[17px] font-semibold tracking-tight text-white">
                  {step.title}
                </h2>
                <span className="font-mono shrink-0 text-[10px] text-white/30">
                  {progressLabel}
                </span>
              </div>
            </div>

            <div className="mt-3 space-y-3">
              {step.body.split("\n\n").map((paragraph, i) => (
                <p
                  key={i}
                  className="font-section-thai text-[0.85rem] leading-relaxed text-white/55"
                >
                  <KnowledgeText text={paragraph} />
                </p>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-violet-400/20 bg-violet-400/[0.06] p-3.5">
              <p className="font-mono mb-1.5 text-[0.58rem] tracking-wider text-violet-300/80 uppercase">
                ลองทำ
              </p>
              <p className="font-section-thai text-[0.82rem] leading-relaxed text-white/70">
                {step.tryThis}
              </p>
            </div>

            <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
              <p
                className={`font-section-thai text-[0.75rem] ${
                  gateOpen || step.id === "close"
                    ? "text-emerald-300/80"
                    : "text-white/40"
                }`}
              >
                {gateOpen && step.id !== "close"
                  ? "✓ ผ่านจุดตรวจแล้ว — กดถัดไปได้"
                  : step.checkpoint.hint}
                {step.id === "orbits" && !gateOpen
                  ? ` (${visitedCount}/3)`
                  : ""}
              </p>
            </div>

            <div className="mt-4">
              {step.id === "intro" && (
                <IntroStep
                  onHookOpened={() =>
                    setCheckpoint((p) => ({ ...p, dailyHook: true }))
                  }
                />
              )}

              {step.id === "types" && (
                <TypesStep
                  onCardsOpenedCount={(n) =>
                    setCheckpoint((p) => ({ ...p, typeCards: Math.max(p.typeCards, n) }))
                  }
                  onFocusBand={focusBand}
                />
              )}

              {step.id === "orbits" && (
                <div className="flex flex-col gap-2">
                  {orbitBands.map(({ band, visited, color }) => (
                    <button
                      key={band}
                      type="button"
                      onClick={() => focusBand(band)}
                      className={`cursor-pointer rounded-2xl border px-3.5 py-3 text-left transition ${
                        visited
                          ? "border-emerald-400/35 bg-emerald-500/10"
                          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="text-[14px] font-semibold"
                          style={{ color }}
                        >
                          {band}
                        </span>
                        <span className="text-[11px] text-white/40">
                          {visited ? "เยี่ยมชมแล้ว" : "กดเพื่อเยี่ยมชม"}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-white/55">
                        {BAND_META[band].subtitle}
                      </p>
                      <p className="text-[11px] text-white/45">
                        {BAND_META[band].subtitleTh}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {step.id === "match" && (
                <MatchStep
                  onCorrectCountChange={(n) =>
                    setCheckpoint((p) => ({
                      ...p,
                      matchCorrect: Math.max(p.matchCorrect, n),
                    }))
                  }
                  onFocusBand={focusBand}
                />
              )}

              {step.id === "cubesat" && (
                <Suspense fallback={cubeSatFallback}>
                  <CubeSatSizeBuilder
                    onSelectKnacksat={() => {
                      focusBand("LEO");
                      const knack = satellites.find(
                        (s) => s.missionType === "science_demo",
                      );
                      if (knack) onSelectSatellite?.(knack.id);
                    }}
                    onSizeChanged={() =>
                      setCheckpoint((p) => ({ ...p, cubesatSized: true }))
                    }
                  />
                </Suspense>
              )}

              {step.id === "close" && (
                <div className="flex flex-col gap-3">
                  <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-3.5 py-3">
                    <p className="font-section-thai text-[0.82rem] leading-relaxed text-cyan-50/90">
                      คุณพร้อมก้าวไปโมดูลถัดไปได้แล้ว กดบันทึกความคืบหน้าด้านล่าง
                      หรือเปิดทดลองอิสระเพื่อซูมหมุนตามดาวเทียมในฉาก
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("playground");
                      focusBand("LEO");
                    }}
                    className="cursor-pointer rounded-2xl border border-violet-400/30 bg-violet-400/15 py-3.5 text-[13px] font-semibold text-violet-100 transition hover:bg-violet-400/25"
                  >
                    ทดลองอิสระในฉาก →
                  </button>
                  {!justFinished && !moduleCompleted ? (
                    <button
                      type="button"
                      disabled={finishing}
                      onClick={() => void handleFinish()}
                      className="cursor-pointer rounded-2xl bg-emerald-400 py-3.5 text-[13px] font-semibold text-[#042016] transition hover:bg-emerald-300 disabled:opacity-50"
                    >
                      {finishing ? "กำลังบันทึก…" : "เสร็จโมดูลนี้"}
                    </button>
                  ) : (
                    <Link
                      to={coursePath}
                      className="block rounded-2xl border border-emerald-400/30 bg-emerald-500/15 py-3.5 text-center text-[13px] font-semibold text-emerald-100 transition hover:bg-emerald-500/25"
                    >
                      กลับหน้าคอร์ส →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <PlaygroundBody
            band={playgroundBand}
            onBandChange={(b) => {
              setPlaygroundBand(b);
              focusBand(b);
            }}
          />
        )}
      </div>

      {mode === "lesson" && (
        <div className="flex shrink-0 gap-2 border-t border-white/[0.07] px-3 py-2.5">
          <button
            type="button"
            disabled={stepIdx === 0}
            onClick={() => goStep(stepIdx - 1)}
            className="flex-1 cursor-pointer rounded-2xl border border-white/10 py-3 text-[12px] text-white/60 hover:bg-white/5 disabled:opacity-25"
          >
            ← ก่อนหน้า
          </button>
          {step.id !== "close" ? (
            <button
              type="button"
              disabled={!gateOpen}
              onClick={() => goStep(stepIdx + 1)}
              className="flex-[1.4] cursor-pointer rounded-2xl bg-cyan-400 py-3 text-[12px] font-semibold text-[#061018] disabled:bg-white/10 disabled:text-white/35"
            >
              ถัดไป →
            </button>
          ) : (
            <Link
              to={coursePath}
              className="flex-[1.4] rounded-2xl border border-white/15 py-3 text-center text-[12px] font-semibold text-white/70 hover:bg-white/5"
            >
              หน้าคอร์ส
            </Link>
          )}
        </div>
      )}
    </aside>
  );
}

function PlaygroundBody({
  band,
  onBandChange,
}: {
  band: OrbitBand;
  onBandChange: (b: OrbitBand) => void;
}) {
  return (
    <div className="px-4 py-4">
      <h2 className="text-[16px] font-semibold text-white">ทดลองอิสระ</h2>
      <p className="font-section-thai mt-1.5 text-[0.82rem] leading-relaxed text-white/50">
        เลือกชั้นวงโคจรแล้วกล้องจะโฟกัสดาวเทียมอัตโนมัติ ลากเพื่อหมุน เลื่อนเพื่อซูม
        กล้องจะหมุนตามวงโคจรเองเมื่อคุณไม่ได้ลาก
      </p>
      <div className="mt-4 flex gap-1.5">
        {(["LEO", "MEO", "GEO"] as const).map((b) => {
          const on = band === b;
          return (
            <button
              key={b}
              type="button"
              onClick={() => onBandChange(b)}
              className={`flex-1 cursor-pointer rounded-xl py-2.5 text-[12px] font-bold transition ${
                on
                  ? "text-[#061018]"
                  : "border border-white/10 text-white/45 hover:text-white/70"
              }`}
              style={
                on
                  ? { backgroundColor: BAND_META[b].defaultColor }
                  : undefined
              }
            >
              {b}
            </button>
          );
        })}
      </div>
      <ul className="font-section-thai mt-4 space-y-1.5 text-[0.78rem] text-white/40">
        <li>· คลิกดาวเทียมในฉากเพื่อสลับเป้าหมาย</li>
        <li>· กด Cam เพื่อกลับมุมโลกทั้งดวง</li>
        <li>· ปุ่มตามดาวเทียมใช้เปิด/ปิดการติดตาม</li>
      </ul>
    </div>
  );
}
