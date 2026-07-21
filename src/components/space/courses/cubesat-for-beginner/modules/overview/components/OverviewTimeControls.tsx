import {
  DEFAULT_TIME_SCALE,
  TIME_SCALE_STEPS,
  formatTimeScale,
  timeScaleIndex,
} from "../../physics/sim/timeScale";
import { SAT_SCALE_FACTOR } from "../lib/satelliteModels";
import {
  hudBtn,
  hudChip,
  hudPanel,
  hudToggleOff,
  hudToggleOn,
} from "../lib/hudStyles";

type OverviewTimeControlsProps = {
  timeScale: number;
  onTimeScaleChange: (scale: number) => void;
  onReset: () => void;
  layers: { orbitalPaths: boolean; satellites: boolean };
  onToggleLayer: (key: "orbitalPaths" | "satellites") => void;
};

/** Physics-style time + scene layer controls over the 3D view. */
export default function OverviewTimeControls({
  timeScale,
  onTimeScaleChange,
  onReset,
  layers,
  onToggleLayer,
}: OverviewTimeControlsProps) {
  const idx = timeScaleIndex(timeScale);
  const canSlow = idx > 0;
  const canFast = idx >= 0 && idx < TIME_SCALE_STEPS.length - 1;

  return (
    <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 flex items-end">
      <div className="flex max-w-[18rem] flex-col gap-1.5">
        <div className="pointer-events-auto flex flex-wrap items-center gap-1">
          <button
            type="button"
            disabled={!canSlow}
            aria-label="หน่วงเวลา"
            onClick={() => {
              if (!canSlow) return;
              onTimeScaleChange(TIME_SCALE_STEPS[idx - 1]);
            }}
            className={hudBtn}
          >
            −
          </button>
          <button
            type="button"
            aria-label={timeScale === 0 ? "เล่นต่อ" : "หยุด"}
            onClick={() =>
              onTimeScaleChange(timeScale === 0 ? DEFAULT_TIME_SCALE : 0)
            }
            className={
              timeScale === 0
                ? "cursor-pointer rounded-md border border-amber-400/40 bg-amber-400/15 px-2.5 py-1.5 font-section-thai text-[0.7rem] text-amber-200 backdrop-blur-sm transition"
                : hudBtn
            }
          >
            {timeScale === 0 ? "เล่น" : "หยุด"}
          </button>
          <button
            type="button"
            disabled={!canFast}
            aria-label="เร่งเวลา"
            onClick={() => {
              if (!canFast) return;
              onTimeScaleChange(TIME_SCALE_STEPS[idx + 1]);
            }}
            className={hudBtn}
          >
            +
          </button>
          <span className={`${hudChip} ml-0.5 min-w-[3.2rem] text-center`}>
            {formatTimeScale(timeScale)}
          </span>
          <button
            type="button"
            onClick={onReset}
            title="รีเซ็ตฉาก"
            aria-label="รีเซ็ตฉาก"
            className={hudBtn}
          >
            ↻
          </button>
        </div>
        <div className="pointer-events-auto flex items-center gap-1.5">
          <label
            className={layers.orbitalPaths ? hudToggleOn : hudToggleOff}
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={layers.orbitalPaths}
              onChange={() => onToggleLayer("orbitalPaths")}
            />
            <span aria-hidden>{layers.orbitalPaths ? "✓" : "○"}</span>
            Path
          </label>
          <label className={layers.satellites ? hudToggleOn : hudToggleOff}>
            <input
              type="checkbox"
              className="sr-only"
              checked={layers.satellites}
              onChange={() => onToggleLayer("satellites")}
            />
            <span aria-hidden>{layers.satellites ? "✓" : "○"}</span>
            Sat
          </label>
        </div>
        <div className={hudPanel}>
          ขนาดดาวเทียมขยาย{" "}
          <span className="text-white/75">
            {SAT_SCALE_FACTOR.toLocaleString("th-TH")}
          </span>{" "}
          เท่า เพื่อให้มองเห็นได้บนจอ
        </div>
      </div>
    </div>
  );
}
