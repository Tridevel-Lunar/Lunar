import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ANATOMY_PARTS,
  type AnatomyPartId,
} from "@/features/anatomy-of-cubesat/lib/parts";
import {
  ANATOMY_STEPS,
  DATA_FLOWS,
  FLOW_KIND_META,
  type AnatomyStep,
} from "@/features/anatomy-of-cubesat/lib/lesson";
import QuizPanel from "@/features/anatomy-of-cubesat/components/QuizPanel";

export default function AnatomyPanel({
  step,
  activePart,
  activeFlowId,
  flowPaused,
  onStepChange,
  onSelectPart,
  onSelectFlow,
  onFlowPausedChange,
}: {
  step: AnatomyStep;
  activePart: AnatomyPartId;
  activeFlowId: string | null;
  flowPaused: boolean;
  onStepChange: (step: AnatomyStep) => void;
  onSelectPart: (id: AnatomyPartId) => void;
  onSelectFlow: (id: string) => void;
  onFlowPausedChange: (paused: boolean) => void;
}) {
  const part = ANATOMY_PARTS.find((p) => p.id === activePart) ?? ANATOMY_PARTS[0];
  const flowIndex = Math.max(
    0,
    DATA_FLOWS.findIndex((f) => f.id === activeFlowId),
  );
  const flow = DATA_FLOWS[flowIndex] ?? DATA_FLOWS[0];
  const [autoFlow, setAutoFlow] = useState(false);

  useEffect(() => {
    if (step !== "dataflow" || !autoFlow || flowPaused) return;
    const id = window.setInterval(() => {
      const next = DATA_FLOWS[(flowIndex + 1) % DATA_FLOWS.length];
      onSelectFlow(next.id);
    }, 3200);
    return () => window.clearInterval(id);
  }, [step, autoFlow, flowPaused, flowIndex, onSelectFlow]);

  const stepIndex = ANATOMY_STEPS.findIndex((s) => s.id === step);
  const kindMeta = FLOW_KIND_META[flow.kind];

  function goFlow(delta: number) {
    setAutoFlow(false);
    onFlowPausedChange(true);
    const next = DATA_FLOWS[(flowIndex + delta + DATA_FLOWS.length) % DATA_FLOWS.length];
    onSelectFlow(next.id);
  }

  function pickFlow(id: string) {
    setAutoFlow(false);
    onFlowPausedChange(true);
    onSelectFlow(id);
  }

  return (
    <aside className="flex h-full min-h-0 w-full flex-col border-l border-white/10 bg-[rgba(5,10,20,0.92)] backdrop-blur-xl">
      <div className="shrink-0 border-b border-white/10 px-5 py-4">
        <p className="font-mono text-[0.62rem] tracking-[0.2em] text-cyan/80 uppercase">
          Anatomy of CubeSat
        </p>
        <h2 className="font-display mt-1 text-[1.25rem] font-bold tracking-wide text-text">
          {ANATOMY_STEPS[stepIndex]?.label ?? "บทเรียน"}
        </h2>
        <p className="font-section-thai mt-1.5 text-[0.8rem] leading-relaxed text-text/60">
          {ANATOMY_STEPS[stepIndex]?.blurb}
        </p>
      </div>

      <div className="shrink-0 border-b border-white/10 px-3 py-3">
        <div className="grid grid-cols-4 gap-1">
          {ANATOMY_STEPS.map((s, i) => {
            const on = s.id === step;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onStepChange(s.id)}
                className={`rounded-lg px-1 py-2 text-center transition ${
                  on
                    ? "bg-cyan/20 text-cyan"
                    : "bg-white/[0.03] text-text/40 hover:text-text/70"
                }`}
              >
                <span className="font-mono block text-[0.55rem] tracking-wider">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-section-thai mt-0.5 block text-[0.68rem] leading-tight">
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {step === "quiz" ? (
          <QuizPanel onExit={() => onStepChange("dataflow")} />
        ) : (
          <div className="h-full overflow-y-auto px-4 py-4">
            {(step === "explore" || step === "flatsat") && (
              <>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {ANATOMY_PARTS.map((p) => {
                    const on = p.id === activePart;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => onSelectPart(p.id)}
                        className={`rounded-xl border px-2.5 py-2.5 text-left transition ${
                          on
                            ? "border-white/25 bg-white/[0.08]"
                            : "border-white/8 bg-white/[0.02] hover:border-white/15"
                        }`}
                        style={
                          on
                            ? {
                                boxShadow: `0 0 24px ${p.accent}33`,
                                borderColor: `${p.accent}66`,
                              }
                            : undefined
                        }
                      >
                        <span
                          className="mb-1.5 block h-1 w-8 rounded-full"
                          style={{ background: p.accent }}
                        />
                        <span className="font-mono text-[0.55rem] tracking-wider text-text/45">
                          {p.labelEn}
                        </span>
                        <span className="font-section-thai mt-0.5 block text-[0.8rem] text-text/90">
                          {p.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={part.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                    className="mt-4 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-4"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          background: part.accent,
                          boxShadow: `0 0 12px ${part.accent}`,
                        }}
                      />
                      <h3 className="font-display text-[1.05rem] font-semibold tracking-wide">
                        {part.labelEn}
                      </h3>
                    </div>
                    <p className="font-section-thai mt-2 text-[0.88rem] leading-relaxed text-text/75">
                      {part.summary}
                    </p>
                    <ul className="mt-3 space-y-2">
                      {part.details.map((line) => (
                        <li
                          key={line}
                          className="font-section-thai flex gap-2 text-[0.8rem] text-text/65"
                        >
                          <span
                            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ background: part.accent }}
                          />
                          {line}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </AnimatePresence>
              </>
            )}

            {step === "dataflow" && (
              <div className="space-y-3">
                <p className="font-section-thai text-[0.78rem] text-text/55">
                  กดเส้นบนบอร์ด หรือใช้ปุ่มทีละสเต็ป — ดูว่าสิ่งที่ไหลคือไฟฟ้า / ข้อมูล / คำสั่งอะไร
                </p>

                {/* Stepper controls */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => goFlow(-1)}
                    className="rounded-lg border border-white/15 px-3 py-2 font-mono text-[0.65rem] text-text/70"
                  >
                    ← ก่อน
                  </button>
                  <button
                    type="button"
                    onClick={() => onFlowPausedChange(!flowPaused)}
                    className={`flex-1 rounded-lg border px-3 py-2 font-mono text-[0.65rem] tracking-wider ${
                      flowPaused
                        ? "border-amber/40 bg-amber/10 text-amber"
                        : "border-cyan/40 bg-cyan/15 text-cyan"
                    }`}
                  >
                    {flowPaused ? "▶ เล่นจุดวิ่ง" : "⏸ หยุดจุดวิ่ง"}
                  </button>
                  <button
                    type="button"
                    onClick={() => goFlow(1)}
                    className="rounded-lg border border-white/15 px-3 py-2 font-mono text-[0.65rem] text-text/70"
                  >
                    ถัดไป →
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-[0.6rem] tracking-wider text-text/45">
                    สเต็ป {flowIndex + 1} / {DATA_FLOWS.length}
                  </p>
                  <label className="flex items-center gap-1.5 font-section-thai text-[0.7rem] text-text/50">
                    <input
                      type="checkbox"
                      checked={autoFlow}
                      onChange={(e) => {
                        setAutoFlow(e.target.checked);
                        if (e.target.checked) onFlowPausedChange(false);
                      }}
                      className="accent-cyan"
                    />
                    เล่นสเต็ปอัตโนมัติ
                  </label>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(FLOW_KIND_META) as (keyof typeof FLOW_KIND_META)[]).map(
                    (k) => (
                      <span
                        key={k}
                        className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-1 font-section-thai text-[0.68rem] text-text/70"
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: FLOW_KIND_META[k].color }}
                        />
                        {FLOW_KIND_META[k].icon} {FLOW_KIND_META[k].short}
                      </span>
                    ),
                  )}
                </div>

                <div className="space-y-1.5">
                  {DATA_FLOWS.map((f, i) => {
                    const on = f.id === flow.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => pickFlow(f.id)}
                        className={`flex w-full items-start gap-2 rounded-xl border px-3 py-2.5 text-left transition ${
                          on
                            ? "border-white/25 bg-white/[0.07]"
                            : "border-white/8 bg-white/[0.02] hover:border-white/15"
                        }`}
                        style={
                          on
                            ? {
                                borderColor: `${FLOW_KIND_META[f.kind].color}66`,
                                boxShadow: `0 0 18px ${FLOW_KIND_META[f.kind].color}22`,
                              }
                            : undefined
                        }
                      >
                        <span className="font-mono mt-0.5 w-5 shrink-0 text-[0.55rem] text-text/35">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span
                          className="mt-1 h-2 w-2 shrink-0 rounded-full"
                          style={{ background: FLOW_KIND_META[f.kind].color }}
                        />
                        <span>
                          <span className="font-mono text-[0.58rem] tracking-wider text-text/45">
                            {f.from.toUpperCase()} → {f.to.toUpperCase()}
                          </span>
                          <span className="font-section-thai mt-0.5 block text-[0.82rem] text-text/90">
                            {FLOW_KIND_META[f.kind].icon} {f.labelTh}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Inspector: what is flowing */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={flow.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border p-4"
                    style={{
                      borderColor: `${kindMeta.color}55`,
                      background: `linear-gradient(180deg, ${kindMeta.color}18, transparent)`,
                    }}
                  >
                    <p className="font-mono text-[0.58rem] tracking-[0.16em]" style={{ color: kindMeta.color }}>
                      สิ่งที่ไหลอยู่ในลิงก์นี้
                    </p>
                    <h3 className="font-section-thai mt-1 text-[1.05rem] font-medium text-text">
                      {kindMeta.icon} {flow.labelTh}
                      <span className="ml-2 font-mono text-[0.7rem] text-text/45">
                        {flow.label}
                      </span>
                    </h3>
                    <p className="font-section-thai mt-2 text-[0.85rem] leading-relaxed text-text/80">
                      {flow.carries}
                    </p>
                    <p className="font-mono mt-2 text-[0.62rem] text-text/45">
                      {flow.unitHint}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {flow.examples.map((ex) => (
                        <span
                          key={ex}
                          className="rounded-md border border-white/10 bg-black/35 px-2 py-1 font-mono text-[0.62rem] text-text/70"
                        >
                          {ex}
                        </span>
                      ))}
                    </div>
                    <p className="font-section-thai mt-3 border-t border-white/8 pt-3 text-[0.8rem] leading-relaxed text-text/60">
                      ทำไมสำคัญ: {flow.why}
                    </p>
                    <p className="font-mono mt-2 text-[0.58rem] tracking-wider text-text/40">
                      {flow.from.toUpperCase()} → {flow.to.toUpperCase()} · คลิกเส้นบนบอร์ดได้เช่นกัน
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            )}

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                disabled={stepIndex <= 0}
                onClick={() => onStepChange(ANATOMY_STEPS[stepIndex - 1].id)}
                className="flex-1 rounded-xl border border-white/15 px-3 py-2.5 font-mono text-[0.65rem] tracking-wider text-text/60 disabled:opacity-30"
              >
                ← ก่อนหน้า
              </button>
              <button
                type="button"
                disabled={stepIndex >= ANATOMY_STEPS.length - 1}
                onClick={() => onStepChange(ANATOMY_STEPS[stepIndex + 1].id)}
                className="flex-1 rounded-xl border border-cyan/40 bg-cyan/15 px-3 py-2.5 font-mono text-[0.65rem] tracking-wider text-cyan disabled:opacity-30"
              >
                ถัดไป →
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
