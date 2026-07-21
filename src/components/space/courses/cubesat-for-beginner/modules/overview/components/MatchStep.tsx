import { useState } from "react";

import KnowledgeText from "@/components/knowledge/KnowledgeText";

import type { MissionType } from "../lib/missions";
import { MATCH_QUESTIONS } from "../lib/journey";
import type { OrbitBand } from "../lib/types";

const MATCH_FOCUS_MISSION: Record<string, MissionType> = {
  eo: "earth_observation",
  tv: "communications",
  gps: "navigation",
};

type MatchStepProps = {
  onCorrectCountChange: (count: number) => void;
  onFocusBand: (band: OrbitBand, missionType?: MissionType) => void;
};

export default function MatchStep({
  onCorrectCountChange,
  onFocusBand,
}: MatchStepProps) {
  const [answers, setAnswers] = useState<Record<string, OrbitBand | null>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  function pick(questionId: string, band: OrbitBand, correct: OrbitBand) {
    const nextAnswers = { ...answers, [questionId]: band };
    setAnswers(nextAnswers);
    setRevealed((prev) => ({ ...prev, [questionId]: true }));
    onFocusBand(band, MATCH_FOCUS_MISSION[questionId]);

    const correctCount = MATCH_QUESTIONS.filter(
      (q) => nextAnswers[q.id] === q.answer,
    ).length;
    onCorrectCountChange(correctCount);

    // Keep focus on correct answer's band after a wrong pick settles
    if (band !== correct) {
      window.setTimeout(
        () => onFocusBand(correct, MATCH_FOCUS_MISSION[questionId]),
        900,
      );
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {MATCH_QUESTIONS.map((q) => {
        const chosen = answers[q.id];
        const show = revealed[q.id];
        const isCorrect = chosen === q.answer;
        return (
          <div
            key={q.id}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5"
          >
            <p className="font-section-thai text-[0.85rem] leading-snug text-white/80">
              {q.prompt}
            </p>
            <div className="mt-2.5 flex flex-col gap-1.5">
              {q.options.map((opt) => {
                const on = chosen === opt.id;
                const correctStyle = show && opt.id === q.answer;
                const wrongStyle = show && on && !isCorrect;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => pick(q.id, opt.id, q.answer)}
                    className={`cursor-pointer rounded-xl border px-3 py-2 text-left text-[0.78rem] transition ${
                      correctStyle
                        ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-100"
                        : wrongStyle
                          ? "border-rose-400/35 bg-rose-500/10 text-rose-100"
                          : on
                            ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-50"
                            : "border-white/10 bg-white/[0.03] text-white/65 hover:bg-white/[0.06]"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            {show && (
              <p className="font-section-thai mt-2 text-[0.75rem] leading-relaxed text-white/50">
                <KnowledgeText text={q.explain} />
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
