import type { ReactNode } from "react";

import {
  DEFAULT_TIME_SCALE,
  TIME_SCALE_STEPS,
  formatTimeScale,
  timeScaleIndex,
} from "./timeScale";
import { useSimulationClock } from "./SimulationClock";

type SimTimeControlsProps = {
  /** Optional note shown below the controls (e.g. gravity satellite scale disclaimer). */
  footnote?: ReactNode;
  /** Extra controls rendered on the right (e.g. focus buttons). */
  trailing?: ReactNode;
};

export default function SimTimeControls({ footnote, trailing }: SimTimeControlsProps) {
  const { timeScale, setTimeScale } = useSimulationClock();
  const idx = timeScaleIndex(timeScale);
  const canSlow = idx > 0;
  const canFast = idx >= 0 && idx < TIME_SCALE_STEPS.length - 1;

  return (
    <div className="pointer-events-none absolute inset-x-3 bottom-3 z-10 flex items-end justify-between gap-3">
      <div className="flex max-w-[16rem] flex-col gap-1.5">
        <div className="pointer-events-auto flex items-center gap-1">
          <button
            type="button"
            disabled={!canSlow}
            aria-label="หน่วงเวลา"
            onClick={() => {
              if (!canSlow) return;
              setTimeScale(TIME_SCALE_STEPS[idx - 1]);
            }}
            className="cursor-pointer rounded-md border border-white/15 bg-black/50 px-2.5 py-1.5 font-mono text-[0.75rem] text-text/70 backdrop-blur-sm transition hover:border-white/25 hover:text-text disabled:cursor-not-allowed disabled:opacity-35"
          >
            −
          </button>
          <button
            type="button"
            aria-label={timeScale === 0 ? "เล่นต่อ" : "หยุด"}
            onClick={() => setTimeScale(timeScale === 0 ? DEFAULT_TIME_SCALE : 0)}
            className={`cursor-pointer rounded-md border px-2.5 py-1.5 font-section-thai text-[0.7rem] backdrop-blur-sm transition ${
              timeScale === 0
                ? "border-amber/40 bg-amber/15 text-amber"
                : "border-white/15 bg-black/50 text-text/70 hover:border-white/25 hover:text-text"
            }`}
          >
            {timeScale === 0 ? "เล่น" : "หยุด"}
          </button>
          <button
            type="button"
            disabled={!canFast}
            aria-label="เร่งเวลา"
            onClick={() => {
              if (!canFast) return;
              setTimeScale(TIME_SCALE_STEPS[idx + 1]);
            }}
            className="cursor-pointer rounded-md border border-white/15 bg-black/50 px-2.5 py-1.5 font-mono text-[0.75rem] text-text/70 backdrop-blur-sm transition hover:border-white/25 hover:text-text disabled:cursor-not-allowed disabled:opacity-35"
          >
            +
          </button>
          <span className="ml-1 min-w-[3.2rem] rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-center font-mono text-[0.7rem] text-cyan/80 backdrop-blur-sm">
            {formatTimeScale(timeScale)}
          </span>
        </div>
        {footnote && (
          <div className="rounded-md border border-white/10 bg-black/50 px-2.5 py-1.5 font-section-thai text-[0.68rem] leading-snug text-text/55 backdrop-blur-sm">
            {footnote}
          </div>
        )}
      </div>
      {trailing && <div className="pointer-events-auto flex gap-1.5">{trailing}</div>}
    </div>
  );
}
