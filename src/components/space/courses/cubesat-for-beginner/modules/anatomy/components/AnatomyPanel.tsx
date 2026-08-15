import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import KnowledgeText from "@/components/knowledge/KnowledgeText";
import { spaceCoursePath } from "@/components/space/core/routes";
import { LAIKA_AVATAR_URL } from "@/lib/constants";

import {
  ANATOMY_PARTS,
  REQUIRED_MEET_PARTS,
  type AnatomyPartId,
} from "../lib/parts";
import {
  ANATOMY_STEPS,
  CUBESAT_RECAP,
  INTRO_ANALOGY_CARDS,
  isCheckpointMet,
  type AnatomyStep,
  type CheckpointState,
} from "../lib/lesson";
import { FLOW_SCENARIOS, type ScenarioId } from "../lib/scenarios";
import TraceSequencePanel from "./TraceSequencePanel";

type AnatomyPanelProps = {
  step: AnatomyStep;
  stepIndex: number;
  completedSteps: Set<number>;
  checkpoint: CheckpointState;
  moduleCompleted: boolean;
  finishing: boolean;
  activePart: AnatomyPartId;
  activeScenarioId: ScenarioId | null;
  flatsatPreferred: boolean;
  courseId: string;
  onStepChange: (step: AnatomyStep) => void;
  onSelectPart: (id: AnatomyPartId) => void;
  onPlayScenario: (id: ScenarioId) => void;
  onIntroOpenCard: () => void;
  onIntroAck: () => void;
  onTracePassedChange: (count: number) => void;
  onFlatsatPreferredChange: (v: boolean) => void;
  onMarkComplete: () => Promise<void>;
};

export default function AnatomyPanel({
  step,
  stepIndex,
  completedSteps,
  checkpoint,
  moduleCompleted,
  finishing,
  activePart,
  activeScenarioId,
  flatsatPreferred,
  courseId,
  onStepChange,
  onSelectPart,
  onPlayScenario,
  onIntroOpenCard,
  onIntroAck,
  onTracePassedChange,
  onFlatsatPreferredChange,
  onMarkComplete,
}: AnatomyPanelProps) {
  const coursePath = spaceCoursePath(courseId);
  const stepMeta = ANATOMY_STEPS[stepIndex]!;
  const gateOpen = isCheckpointMet(
    step,
    checkpoint,
    moduleCompleted,
  );
  const part = ANATOMY_PARTS.find((p) => p.id === activePart) ?? ANATOMY_PARTS[0]!;
  const [introSeen, setIntroSeen] = useState<Set<string>>(new Set());

  const meetCount = useMemo(() => {
    let n = 0;
    for (const id of REQUIRED_MEET_PARTS) {
      if (checkpoint.openedParts.has(id)) n += 1;
    }
    return n;
  }, [checkpoint.openedParts]);

  const scenarioCount = checkpoint.playedScenarios.size;
  const progressLabel = `${stepIndex + 1} / ${ANATOMY_STEPS.length}`;

  const laikaText =
    step === "meet" && part.laikaTip ? part.laikaTip : stepMeta.laikaSays;

  function goNext() {
    if (stepIndex >= ANATOMY_STEPS.length - 1) return;
    if (!gateOpen && step !== "close") return;
    onStepChange(ANATOMY_STEPS[stepIndex + 1]!.id);
  }

  function goPrev() {
    if (stepIndex <= 0) return;
    onStepChange(ANATOMY_STEPS[stepIndex - 1]!.id);
  }

  function handleIntroCard(cardId: string) {
    if (!introSeen.has(cardId)) {
      const next = new Set(introSeen);
      next.add(cardId);
      setIntroSeen(next);
      onIntroOpenCard();
    }
  }

  // Sync intro opened count if remounting with existing checkpoint
  useEffect(() => {
    if (checkpoint.introOpened > 0 && introSeen.size === 0) {
      setIntroSeen(new Set(INTRO_ANALOGY_CARDS.slice(0, checkpoint.introOpened).map((c) => c.id)));
    }
  }, [checkpoint.introOpened, introSeen.size]);

  function stepNavAllowed(i: number): boolean {
    if (moduleCompleted) return true;
    if (i <= stepIndex) return true;
    if (completedSteps.has(i)) return true;
    if (i === stepIndex + 1 && gateOpen) return true;
    return false;
  }
  return (
    <aside className="flex h-full min-h-0 w-full flex-col border-l border-white/10 bg-[rgba(5,10,20,0.92)] backdrop-blur-xl">
      <header className="shrink-0 border-b border-white/10 px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-mono text-[0.58rem] tracking-[0.2em] text-cyan/80 uppercase">
              Anatomy of CubeSat
            </p>
            {moduleCompleted && (
              <span className="mt-1 inline-flex items-center rounded-md border border-emerald-400/30 bg-emerald-500/15 px-2 py-0.5 font-mono text-[0.55rem] tracking-wider text-emerald-200">
                ✓ เสร็จแล้ว
              </span>
            )}
          </div>
          <span className="font-mono shrink-0 text-[10px] text-white/30">
            {progressLabel}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-5 gap-1">
          {ANATOMY_STEPS.map((s, i) => {
            const on = s.id === step;
            const done = completedSteps.has(i) || moduleCompleted;
            const locked = !stepNavAllowed(i);
            return (
              <button
                key={s.id}
                type="button"
                disabled={locked}
                onClick={() => {
                  if (stepNavAllowed(i)) onStepChange(s.id);
                }}
                className={`rounded-lg px-0.5 py-2 text-center transition ${
                  on
                    ? "bg-cyan/20 text-cyan"
                    : done
                      ? "bg-emerald-500/10 text-emerald-300/90"
                      : locked
                        ? "bg-white/[0.02] text-text/25"
                        : "bg-white/[0.03] text-text/45 hover:text-text/70"
                }`}
              >
                <span className="font-mono block text-[0.5rem] tracking-wider">
                  {done && !on ? "✓" : s.shortLabel}
                </span>
                <span className="font-section-thai mt-0.5 block text-[0.62rem] leading-tight">
                  {s.id === "intro"
                    ? "ทบทวน"
                    : s.id === "meet"
                      ? "ระบบ"
                      : s.id === "flow"
                        ? "ไหล"
                        : s.id === "trace"
                          ? "ตามรอย"
                          : "จบ"}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {/* LAIKA bubble */}
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
              <KnowledgeText text={laikaText} />
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-1">
          <h2 className="text-[17px] font-semibold tracking-tight text-white">
            {stepMeta.title}
          </h2>
        </div>

        <div className="mt-3 space-y-3">
          {stepMeta.body.split("\n\n").map((paragraph, i) => (
            <p
              key={i}
              className="font-section-thai text-[0.85rem] leading-relaxed text-white/55"
            >
              <KnowledgeText text={paragraph} />
            </p>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-violet-400/20 bg-violet-400/[0.06] p-4">
          <p className="font-mono mb-2 text-[0.58rem] tracking-wider text-violet-300/80 uppercase">
            ลองทำ
          </p>
          <p className="font-section-thai text-[0.82rem] leading-relaxed text-white/75">
            <KnowledgeText text={stepMeta.tryThis} />
          </p>
        </div>

        <p
          className={`mt-3 font-section-thai text-[0.78rem] ${
            gateOpen && step !== "close"
              ? "text-emerald-300/90"
              : "text-white/40"
          }`}
        >
          {gateOpen && step !== "close"
            ? "✓ ผ่านจุดตรวจแล้ว กดถัดไปได้"
            : stepMeta.checkpoint.hint}
          {step === "meet" ? ` (${meetCount}/4)` : null}
          {step === "flow" ? ` (${scenarioCount}/3)` : null}
          {step === "trace"
            ? ` (${checkpoint.tracePassed}/3)`
            : null}
        </p>

        {/* Step-specific UI */}
        <div className="mt-5 space-y-3">
          {step === "intro" && (
            <>
              <div className="rounded-xl border border-cyan/20 bg-cyan/[0.06] p-4">
                <p className="font-mono mb-2 text-[0.58rem] tracking-wider text-cyan/80 uppercase">
                  จากโมดูล Overview
                </p>
                <h3 className="font-section-thai text-[0.95rem] font-medium text-text">
                  {CUBESAT_RECAP.heading}
                </h3>
                <ul className="mt-3 space-y-2">
                  {CUBESAT_RECAP.points.map((line) => (
                    <li
                      key={line}
                      className="font-section-thai flex gap-2 text-[0.8rem] leading-relaxed text-text/65"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan/70" />
                      <span>
                        <KnowledgeText text={line} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="font-mono text-[0.58rem] tracking-wider text-text/40">
                จากนั้นเทียบกับร่างกาย
              </p>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {INTRO_ANALOGY_CARDS.map((card) => {
                  const on = introSeen.has(card.id);
                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => handleIntroCard(card.id)}
                      className={`rounded-xl border px-3 py-3 text-left transition ${
                        on
                          ? "border-white/25 bg-white/[0.08]"
                          : "border-white/10 bg-white/[0.03] hover:border-white/20"
                      }`}
                      style={
                        on
                          ? {
                              borderColor: `${card.accent}66`,
                              boxShadow: `0 0 20px ${card.accent}22`,
                            }
                          : undefined
                      }
                    >
                      <span
                        className="mb-1.5 block h-1 w-8 rounded-full"
                        style={{ background: card.accent }}
                      />
                      <span className="font-section-thai block text-[0.85rem] text-text/90">
                        {card.title}
                      </span>
                      <span className="font-section-thai mt-1 block text-[0.75rem] text-text/55">
                        <KnowledgeText text={card.body} />
                      </span>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                disabled={introSeen.size < 1 && checkpoint.introOpened < 1}
                onClick={onIntroAck}
                className="w-full rounded-xl border border-cyan/40 bg-cyan/15 px-3 py-2.5 font-mono text-[0.7rem] tracking-wider text-cyan disabled:opacity-35"
              >
                {checkpoint.introAck ? "✓ เข้าใจแล้ว" : "เข้าใจแล้ว พร้อมไปต่อ"}
              </button>
            </>
          )}

          {step === "meet" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-[0.58rem] tracking-wider text-text/40">
                  มุมมองฉาก
                </p>
                <button
                  type="button"
                  onClick={() => onFlatsatPreferredChange(!flatsatPreferred)}
                  className="rounded-lg border border-white/12 px-2.5 py-1.5 font-mono text-[0.6rem] text-text/65"
                >
                  {flatsatPreferred ? "3D ประกอบ" : "FlatSat แบน"}
                </button>
              </div>
              <p className="font-section-thai text-[0.78rem] leading-relaxed text-text/50">
                คลิกป้ายในฉากซ้ายที่มีเส้นชี้ไปยังแต่ละระบบ อ่านรายละเอียดบน popup
                แล้วเปิดให้ครบสี่ระบบ
              </p>
              <div className="flex flex-wrap gap-1.5">
                {REQUIRED_MEET_PARTS.map((id) => {
                  const p = ANATOMY_PARTS.find((x) => x.id === id)!;
                  const visited = checkpoint.openedParts.has(id);
                  const on = activePart === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => onSelectPart(id)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.62rem] tracking-wider transition ${
                        on
                          ? "border-white/30 bg-white/10 text-text"
                          : visited
                            ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-100/90"
                            : "border-white/10 bg-white/[0.03] text-text/45 hover:text-text/70"
                      }`}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: p.accent }}
                      />
                      {p.labelEn}
                      {visited ? " ✓" : ""}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === "flow" && (
            <div className="space-y-2">
              {FLOW_SCENARIOS.map((sc) => {
                const on = activeScenarioId === sc.id;
                const played = checkpoint.playedScenarios.has(sc.id);
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => onPlayScenario(sc.id)}
                    className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                      on
                        ? "border-cyan/40 bg-cyan/10"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-section-thai text-[0.88rem] text-text/90">
                        {sc.title}
                      </span>
                      {played && (
                        <span className="font-mono text-[0.55rem] text-emerald-300/80">
                          ✓
                        </span>
                      )}
                    </div>
                    {on && (
                      <p className="font-section-thai mt-2 text-[0.78rem] leading-relaxed text-text/60">
                        <KnowledgeText text={sc.caption} />
                      </p>
                    )}
                  </button>
                );
              })}
              <p className="font-section-thai text-[0.72rem] text-text/40">
                เส้นเหลืองคือพลังงาน เส้นฟ้าหรือเขียวคือข้อมูล ทุกอย่างผ่าน OBC
              </p>
            </div>
          )}

          {step === "trace" && (
            <TraceSequencePanel onPassedCountChange={onTracePassedChange} />
          )}

          {step === "close" && (
            <div className="space-y-3">
              {!moduleCompleted ? (
                <button
                  type="button"
                  disabled={finishing}
                  onClick={() => void onMarkComplete()}
                  className="w-full rounded-xl bg-emerald-400 px-4 py-3 font-mono text-[0.75rem] font-semibold tracking-wider text-[#042016] disabled:opacity-50"
                >
                  {finishing ? "กำลังบันทึก…" : "เสร็จโมดูลนี้"}
                </button>
              ) : (
                <Link
                  to={coursePath}
                  className="block rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-3 text-center font-mono text-[0.75rem] tracking-wider text-emerald-100"
                >
                  กลับหน้าคอร์ส
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      <footer className="shrink-0 border-t border-white/10 px-4 py-3">
        <div className="flex gap-2">
          <button
            type="button"
            disabled={stepIndex <= 0}
            onClick={goPrev}
            className="flex-1 rounded-xl border border-white/15 px-3 py-2.5 font-mono text-[0.65rem] tracking-wider text-text/60 disabled:opacity-30"
          >
            ← ก่อนหน้า
          </button>
          {step !== "close" ? (
            <button
              type="button"
              disabled={!gateOpen || stepIndex >= ANATOMY_STEPS.length - 1}
              onClick={goNext}
              className="flex-1 rounded-xl border border-cyan/40 bg-cyan/15 px-3 py-2.5 font-mono text-[0.65rem] tracking-wider text-cyan disabled:opacity-30"
            >
              ถัดไป →
            </button>
          ) : moduleCompleted ? (
            <Link
              to={coursePath}
              className="flex flex-1 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-3 py-2.5 font-mono text-[0.65rem] tracking-wider text-emerald-100"
            >
              กลับคอร์ส
            </Link>
          ) : (
            <button
              type="button"
              disabled={finishing}
              onClick={() => void onMarkComplete()}
              className="flex-1 rounded-xl bg-emerald-400 px-3 py-2.5 font-mono text-[0.65rem] font-semibold tracking-wider text-[#042016] disabled:opacity-50"
            >
              {finishing ? "…" : "เสร็จโมดูลนี้"}
            </button>
          )}
        </div>
      </footer>
    </aside>
  );
}
