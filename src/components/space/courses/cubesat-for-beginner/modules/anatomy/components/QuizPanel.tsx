import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  QUIZ_QUESTIONS,
  type QuizQuestion,
} from "../lib/lesson";

function QuestionCard({
  q,
  index,
  total,
  selected,
  revealed,
  onPick,
}: {
  q: QuizQuestion;
  index: number;
  total: number;
  selected: string | null;
  revealed: boolean;
  onPick: (choiceId: string) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="font-mono text-[0.58rem] tracking-[0.16em] text-cyan/70">
        Q{index + 1} / {total}
      </p>
      <h3 className="font-section-thai text-[1rem] font-medium leading-snug text-text">
        {q.prompt}
      </h3>
      <div className="space-y-2">
        {q.choices.map((c) => {
          const isSel = selected === c.id;
          const isCorrect = c.id === q.correctId;
          let cls =
            "w-full rounded-xl border px-3 py-2.5 text-left font-section-thai text-[0.85rem] transition ";
          if (!revealed) {
            cls += isSel
              ? "border-cyan/50 bg-cyan/15 text-text"
              : "border-white/10 bg-white/[0.03] text-text/80 hover:border-white/20";
          } else if (isCorrect) {
            cls += "border-emerald-400/50 bg-emerald-400/15 text-emerald-100";
          } else if (isSel) {
            cls += "border-rose-400/40 bg-rose-400/10 text-rose-100";
          } else {
            cls += "border-white/8 bg-white/[0.02] text-text/40";
          }
          return (
            <button
              key={c.id}
              type="button"
              disabled={revealed}
              onClick={() => onPick(c.id)}
              className={cls}
            >
              {c.label}
            </button>
          );
        })}
      </div>
      {revealed && (
        <p className="font-section-thai rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-[0.78rem] text-text/65">
          {q.explain}
        </p>
      )}
    </div>
  );
}

export default function QuizPanel({ onExit }: { onExit?: () => void }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = QUIZ_QUESTIONS[index];
  const total = QUIZ_QUESTIONS.length;

  function pick(choiceId: string) {
    if (revealed) return;
    setSelected(choiceId);
  }

  function check() {
    if (!selected || revealed) return;
    setRevealed(true);
    if (selected === q.correctId) setScore((s) => s + 1);
  }

  function next() {
    if (index >= total - 1) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
  }

  function restart() {
    setIndex(0);
    setSelected(null);
    setRevealed(false);
    setScore(0);
    setDone(false);
  }

  const pct = useMemo(() => Math.round((score / total) * 100), [score, total]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-white/10 px-5 py-4">
        <p className="font-mono text-[0.62rem] tracking-[0.2em] text-cyan/80 uppercase">
          Review activity
        </p>
        <h2 className="font-display mt-1 text-[1.25rem] font-bold tracking-wide text-text">
          ทบทวน Anatomy
        </h2>
        <p className="font-section-thai mt-1 text-[0.8rem] text-text/55">
          ตอบคำถามสั้นๆ เพื่อเช็กว่าเข้าใจส่วนประกอบและการไหลข้อมูลหรือยัง
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-cyan/25 bg-cyan/10 p-5 text-center"
            >
              <p className="font-mono text-[0.65rem] tracking-[0.18em] text-cyan">
                COMPLETE
              </p>
              <p className="font-display mt-2 text-[2rem] font-bold text-text">
                {score}/{total}
              </p>
              <p className="font-section-thai mt-1 text-[0.9rem] text-text/70">
                ได้ {pct}% —{" "}
                {pct >= 80
                  ? "เยี่ยม ระบบคุยกันชัดแล้ว"
                  : pct >= 50
                    ? "พอใช้ ลองทบทวน data flow อีกครั้ง"
                    : "ลองย้อนไปดู FlatSat และการไหลข้อมูลใหม่"}
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={restart}
                  className="rounded-xl border border-cyan/40 bg-cyan/15 px-4 py-2.5 font-mono text-[0.7rem] tracking-wider text-cyan"
                >
                  ทำแบบทบทวนอีกครั้ง
                </button>
                {onExit && (
                  <button
                    type="button"
                    onClick={onExit}
                    className="rounded-xl border border-white/15 px-4 py-2.5 font-mono text-[0.7rem] tracking-wider text-text/60"
                  >
                    กลับไปดู data flow
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <QuestionCard
                q={q}
                index={index}
                total={total}
                selected={selected}
                revealed={revealed}
                onPick={pick}
              />
              <div className="mt-4 flex gap-2">
                {!revealed ? (
                  <button
                    type="button"
                    disabled={!selected}
                    onClick={check}
                    className="flex-1 rounded-xl border border-cyan/40 bg-cyan/15 px-4 py-2.5 font-mono text-[0.7rem] tracking-wider text-cyan disabled:opacity-40"
                  >
                    ตรวจคำตอบ
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={next}
                    className="flex-1 rounded-xl border border-cyan/40 bg-cyan/15 px-4 py-2.5 font-mono text-[0.7rem] tracking-wider text-cyan"
                  >
                    {index >= total - 1 ? "ดูผลคะแนน" : "ข้อถัดไป"}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
