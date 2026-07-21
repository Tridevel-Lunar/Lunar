import { useSimulationTimeSnapshot } from "./SimulationClock";
import {
  ORBIT_SIM_PHASES,
  formatOrbitElapsed,
  formatOrbitPeriodMinutes,
  getOrbitSimPhase,
  orbitSimPhaseIndex,
} from "./orbitSim";
import SimTimeControls from "./SimTimeControls";

/** 2D orbit timeline driven by the shared simulation clock. */
export default function OrbitSimView({ onReset }: { onReset?: () => void }) {
  const simTime = useSimulationTimeSnapshot(100);
  const activePhase = getOrbitSimPhase(simTime);
  const activeIdx = orbitSimPhaseIndex(activePhase);

  return (
    <div className="relative flex h-full flex-col items-center justify-center rounded-lg border border-cyan/15 bg-cyan/[0.03] p-8">
      <h3 className="font-thai mb-2 text-[1.1rem] font-bold text-cyan">🛰️ หนึ่งรอบวงโคจร</h3>
      <p className="font-mono mb-5 text-[0.62rem] tracking-wider text-text/40">
        {formatOrbitElapsed(simTime)} / ~{formatOrbitPeriodMinutes()} (500 km LEO)
      </p>

      <div className="mb-5 grid w-full max-w-sm grid-cols-4 gap-3">
        {ORBIT_SIM_PHASES.map((phase, i) => (
          <div
            key={phase.id}
            className={`rounded-lg border p-3 text-center transition-all ${
              activeIdx === i
                ? "border-cyan/40 bg-cyan/10"
                : "border-white/[0.06] bg-white/[0.02]"
            }`}
          >
            <p className="mb-1 text-2xl">{phase.icon}</p>
            <p
              className={`font-mono text-[0.55rem] tracking-wider ${
                activeIdx === i ? phase.accent : "text-text/40"
              }`}
            >
              {phase.label}
            </p>
          </div>
        ))}
      </div>

      <div className="w-full max-w-sm rounded-lg border border-white/[0.06] bg-white/[0.03] p-4 text-center">
        <p className="font-mono mb-1.5 text-[0.6rem] tracking-wider text-cyan/70 uppercase">
          {activePhase.label}
          {activePhase.illustrative && (
            <span className="ml-1.5 normal-case text-text/35">(สาธิต)</span>
          )}
        </p>
        <p className="font-section-thai text-[0.9rem] leading-relaxed text-text/70">
          {activePhase.desc}
        </p>
      </div>

      <SimTimeControls
        onReset={onReset}
        footnote={
          <>
            Sunlit/Eclipse จาก geometry วงโคจรจริง · SAA และ Ground Station
            เป็นช่วงเวลาสาธิต (ยังไม่มี ephemeris / ตำแหน่งสถานี)
          </>
        }
      />
    </div>
  );
}
