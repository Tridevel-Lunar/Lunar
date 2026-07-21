import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import { spaceCoursePath } from "@/components/space/core/routes";

import {
  PHYSICS_QUIZ_PASS,
  buildPhysicsQuizDeck,
  type PhysicsQuizQuestion,
} from "../lib/quiz";

function QuestionCard({
  q,
  index,
  total,
  selected,
  revealed,
  onPick,
}: {
  q: PhysicsQuizQuestion;
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
            "w-full cursor-pointer rounded-xl border px-3 py-2.5 text-left font-section-thai text-[0.85rem] transition ";
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

type PhysicsQuizPanelProps = {
  courseId: string;
  moduleCompleted: boolean;
  finishing: boolean;
  onMarkComplete: () => Promise<void>;
};

export default function PhysicsQuizPanel({
  courseId,
  moduleCompleted,
  finishing,
  onMarkComplete,
}: PhysicsQuizPanelProps) {
  const [deck, setDeck] = useState(() => buildPhysicsQuizDeck());
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = deck[index]!;
  const total = deck.length;
  const coursePath = spaceCoursePath(courseId);

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
    setDeck(buildPhysicsQuizDeck());
    setIndex(0);
    setSelected(null);
    setRevealed(false);
    setScore(0);
    setDone(false);
  }

  const pct = useMemo(() => Math.round((score / total) * 100), [score, total]);
  const passed = score >= PHYSICS_QUIZ_PASS;

  return (
    <div className="flex h-full w-full items-center justify-center overflow-y-auto bg-[radial-gradient(ellipse_at_50%_35%,rgba(0,229,255,0.1),transparent_55%),radial-gradient(ellipse_at_65%_80%,rgba(167,139,250,0.08),transparent_50%),#030812] px-4 py-8 sm:px-8">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-sm sm:p-6">
        <p className="font-mono text-center text-[0.62rem] tracking-[0.2em] text-cyan/80 uppercase">
          Review quiz
        </p>
        <h2 className="font-display mt-1 text-center text-[1.25rem] font-bold tracking-wide text-text">
          ทบทวนก่อนจบโมดูล
        </h2>
        <p className="font-section-thai mt-1 text-center text-[0.8rem] text-text/55">
          ตอบให้ถูกอย่างน้อย {PHYSICS_QUIZ_PASS} จาก {total} ข้อ เพื่อจบ Physics
        </p>

        <div className="mt-5">
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-cyan/25 bg-cyan/10 p-5 text-center"
              >
                <p className="font-mono text-[0.65rem] tracking-[0.18em] text-cyan">
                  {passed ? "PASSED" : "TRY AGAIN"}
                </p>
                <p className="font-display mt-2 text-[2rem] font-bold text-text">
                  {score}/{total}
                </p>
                <p className="font-section-thai mt-1 text-[0.9rem] text-text/70">
                  ได้ {pct}% —{" "}
                  {passed
                    ? "พร้อมจบโมดูลแล้ว"
                    : `ต้องได้อย่างน้อย ${PHYSICS_QUIZ_PASS} ข้อ ลองทบทวนแล้วทำใหม่`}
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  {passed && !moduleCompleted ? (
                    <button
                      type="button"
                      disabled={finishing}
                      onClick={() => void onMarkComplete()}
                      className="rounded-xl bg-emerald-400 px-4 py-2.5 font-mono text-[0.7rem] font-semibold tracking-wider text-[#042016] disabled:opacity-50"
                    >
                      {finishing ? "กำลังบันทึก…" : "เสร็จโมดูลนี้"}
                    </button>
                  ) : passed && moduleCompleted ? (
                    <Link
                      to={coursePath}
                      className="block rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-2.5 font-mono text-[0.7rem] tracking-wider text-emerald-100"
                    >
                      กลับหน้าคอร์ส →
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={restart}
                      className="rounded-xl border border-cyan/40 bg-cyan/15 px-4 py-2.5 font-mono text-[0.7rem] tracking-wider text-cyan"
                    >
                      ทำแบบทดสอบอีกครั้ง
                    </button>
                  )}
                  {passed && !moduleCompleted && (
                    <button
                      type="button"
                      onClick={restart}
                      className="rounded-xl border border-white/15 px-4 py-2.5 font-mono text-[0.7rem] tracking-wider text-text/60"
                    >
                      ทำแบบทดสอบอีกครั้ง
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={`${q.id}-${index}`}
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
    </div>
  );
}
