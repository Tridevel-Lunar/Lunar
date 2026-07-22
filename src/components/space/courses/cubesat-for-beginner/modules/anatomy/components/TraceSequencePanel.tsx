import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import KnowledgeText from "@/components/knowledge/KnowledgeText";

import {
  TRACE_CHIP_LABEL,
  TRACE_PASS,
  TRACE_QUESTIONS,
  sequencesEqual,
  type TraceChipId,
} from "../lib/trace";

type TraceSequencePanelProps = {
  onPassedCountChange: (count: number) => void;
};

export default function TraceSequencePanel({
  onPassedCountChange,
}: TraceSequencePanelProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<TraceChipId[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [correctIds, setCorrectIds] = useState<Set<string>>(new Set());
  const [done, setDone] = useState(false);

  const q = TRACE_QUESTIONS[index]!;
  const total = TRACE_QUESTIONS.length;
  const remaining = q.pool.filter((id) => !picked.includes(id));
  const isCorrect = revealed && sequencesEqual(picked, q.answer);
  const passedCount = correctIds.size;

  function addChip(id: TraceChipId) {
    if (revealed) return;
    setPicked((prev) => [...prev, id]);
  }

  function removeLast() {
    if (revealed) return;
    setPicked((prev) => prev.slice(0, -1));
  }

  function clearPicked() {
    if (revealed) return;
    setPicked([]);
  }

  function check() {
    if (picked.length === 0 || revealed) return;
    setRevealed(true);
    const ok = sequencesEqual(picked, q.answer);
    if (ok) {
      const next = new Set(correctIds);
      next.add(q.id);
      setCorrectIds(next);
      onPassedCountChange(next.size);
    }
  }

  function next() {
    if (index >= total - 1) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setPicked([]);
    setRevealed(false);
  }

  function restart() {
    setIndex(0);
    setPicked([]);
    setRevealed(false);
    setCorrectIds(new Set());
    setDone(false);
    onPassedCountChange(0);
  }

  return (
    <div className="space-y-3">
      <p className="font-mono text-[0.58rem] tracking-[0.16em] text-cyan/70">
        TRACE {Math.min(index + 1, total)} / {total} · ผ่านแล้ว {passedCount}/
        {total} (ต้อง ≥{TRACE_PASS})
      </p>

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-cyan/25 bg-cyan/10 p-4 text-center"
          >
            <p className="font-mono text-[0.65rem] tracking-[0.18em] text-cyan">
              {passedCount >= TRACE_PASS ? "PASSED" : "TRY AGAIN"}
            </p>
            <p className="font-display mt-2 text-[1.75rem] font-bold text-text">
              {passedCount}/{total}
            </p>
            <p className="font-section-thai mt-1 text-[0.85rem] text-text/70">
              {passedCount >= TRACE_PASS
                ? "ผ่านจุดตรวจแล้ว กดถัดไปได้"
                : `ต้องผ่านอย่างน้อย ${TRACE_PASS} ข้อ ลองทบทวนแล้วทำใหม่`}
            </p>
            <button
              type="button"
              onClick={restart}
              className="mt-3 rounded-xl border border-white/15 px-4 py-2 font-mono text-[0.65rem] tracking-wider text-text/70"
            >
              ทำใหม่
            </button>
          </motion.div>
        ) : (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-3"
          >
            <h3 className="font-section-thai text-[0.95rem] font-medium leading-snug text-text">
              {q.prompt}
            </h3>

            <div className="rounded-xl border border-dashed border-white/15 bg-black/25 p-3">
              <p className="font-mono mb-2 text-[0.55rem] tracking-wider text-text/40">
                ลำดับของคุณ
              </p>
              <div className="flex min-h-[2.5rem] flex-wrap items-center gap-1.5">
                {picked.length === 0 ? (
                  <span className="font-section-thai text-[0.75rem] text-text/35">
                    แตะชิปด้านล่างตามลำดับ…
                  </span>
                ) : (
                  picked.map((id, i) => (
                    <span key={`${id}-${i}`} className="flex items-center gap-1">
                      {i > 0 && (
                        <span className="font-mono text-[0.65rem] text-text/35">
                          →
                        </span>
                      )}
                      <span
                        className={`rounded-lg border px-2.5 py-1.5 font-mono text-[0.7rem] ${
                          revealed
                            ? isCorrect
                              ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-100"
                              : q.answer[i] === id
                                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                                : "border-rose-400/35 bg-rose-500/10 text-rose-100"
                            : "border-cyan/30 bg-cyan/10 text-cyan"
                        }`}
                      >
                        {TRACE_CHIP_LABEL[id]}
                      </span>
                    </span>
                  ))
                )}
              </div>
            </div>

            {!revealed && (
              <div className="flex flex-wrap gap-1.5">
                {remaining.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => addChip(id)}
                    className="rounded-lg border border-white/12 bg-white/[0.04] px-2.5 py-1.5 font-mono text-[0.7rem] text-text/80 transition hover:border-white/25"
                  >
                    {TRACE_CHIP_LABEL[id]}
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {!revealed ? (
                <>
                  <button
                    type="button"
                    onClick={removeLast}
                    disabled={picked.length === 0}
                    className="rounded-lg border border-white/12 px-3 py-2 font-mono text-[0.62rem] text-text/55 disabled:opacity-30"
                  >
                    ลบตัวท้าย
                  </button>
                  <button
                    type="button"
                    onClick={clearPicked}
                    disabled={picked.length === 0}
                    className="rounded-lg border border-white/12 px-3 py-2 font-mono text-[0.62rem] text-text/55 disabled:opacity-30"
                  >
                    ล้าง
                  </button>
                  <button
                    type="button"
                    onClick={check}
                    disabled={picked.length === 0}
                    className="flex-1 rounded-lg border border-cyan/40 bg-cyan/15 px-3 py-2 font-mono text-[0.65rem] tracking-wider text-cyan disabled:opacity-30"
                  >
                    ตรวจลำดับ
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={next}
                  className="w-full rounded-lg border border-cyan/40 bg-cyan/15 px-3 py-2.5 font-mono text-[0.65rem] tracking-wider text-cyan"
                >
                  {index >= total - 1 ? "ดูผลรวม" : "ข้อถัดไป →"}
                </button>
              )}
            </div>

            {revealed && (
              <p
                className={`font-section-thai rounded-lg border px-3 py-2 text-[0.78rem] leading-relaxed ${
                  isCorrect
                    ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-100/90"
                    : "border-rose-400/25 bg-rose-500/10 text-rose-100/90"
                }`}
              >
                <KnowledgeText
                  text={isCorrect ? q.explain : q.hintWrong}
                />
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
