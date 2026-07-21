import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from "react";

import { DEFAULT_TIME_SCALE, type TimeScaleStep } from "./timeScale";

const MAX_WALL_DELTA = 0.25;

export type SimulationClockValue = {
  /** Accumulated simulation time (seconds). */
  simTimeRef: MutableRefObject<number>;
  /** Last frame scaled delta (seconds). Zero when paused. */
  simDeltaRef: MutableRefObject<number>;
  timeScale: number;
  setTimeScale: (scale: TimeScaleStep | number) => void;
  reset: () => void;
};

const SimulationClockContext = createContext<SimulationClockValue | null>(null);

export function SimulationClockProvider({
  children,
  resetKey,
}: {
  children: ReactNode;
  /** When this changes, sim time resets to 0 and scale to default. */
  resetKey?: string | number;
}) {
  const simTimeRef = useRef(0);
  const simDeltaRef = useRef(0);
  const timeScaleRef = useRef(DEFAULT_TIME_SCALE);
  const [timeScale, setTimeScaleState] = useState(DEFAULT_TIME_SCALE);

  const setTimeScale = useCallback((scale: TimeScaleStep | number) => {
    timeScaleRef.current = scale;
    setTimeScaleState(scale);
  }, []);

  const reset = useCallback(() => {
    simTimeRef.current = 0;
    simDeltaRef.current = 0;
    timeScaleRef.current = DEFAULT_TIME_SCALE;
    setTimeScaleState(DEFAULT_TIME_SCALE);
  }, []);

  useEffect(() => {
    reset();
  }, [resetKey, reset]);

  // Advance sim time every frame (works for 3D scenes and 2D orbit-sim alike)
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const wallDt = Math.min((now - last) / 1000, MAX_WALL_DELTA);
      last = now;
      const scale = timeScaleRef.current;
      const simDt = wallDt * scale;
      simDeltaRef.current = simDt;
      if (scale > 0) {
        simTimeRef.current += simDt;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const value = useMemo(
    () => ({
      simTimeRef,
      simDeltaRef,
      timeScale,
      setTimeScale,
      reset,
    }),
    [timeScale, setTimeScale, reset],
  );

  return (
    <SimulationClockContext.Provider value={value}>{children}</SimulationClockContext.Provider>
  );
}

/** @deprecated Clock advances in SimulationClockProvider — no-op kept for compatibility. */
export function SimulationClockTicker() {
  return null;
}

export function useSimulationClock(): SimulationClockValue {
  const ctx = useContext(SimulationClockContext);
  if (!ctx) {
    throw new Error("useSimulationClock must be used within SimulationClockProvider");
  }
  return ctx;
}

export function useSimulationClockOptional(): SimulationClockValue | null {
  return useContext(SimulationClockContext);
}

/** Read-only sim time for non-3D UI (orbit-sim) — polls on interval, not every frame. */
export function useSimulationTimeSnapshot(pollMs = 100): number {
  const { simTimeRef } = useSimulationClock();
  const [snapshot, setSnapshot] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSnapshot(simTimeRef.current);
    }, pollMs);
    return () => window.clearInterval(id);
  }, [simTimeRef, pollMs]);

  return snapshot;
}
