import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import {
  BAND_META,
  OrbitBand,
  OrbitDefinition,
  SatelliteDefinition,
  SimulationSelection,
} from "@/features/orbit-overview/lib/types";
import { MISSIONS, MissionType } from "@/features/orbit-overview/lib/missions";
import {
  TOUR_MISSION_FOCUS,
  TOUR_PATH,
  TOUR_TOTAL,
  TourStepId,
  contentForStep,
  shortAltitude,
  stepIdFromIndex,
  tourIndexForBand,
  tourIndexForId,
} from "@/features/orbit-overview/lib/tour";
import { USE_CASES_BY_BAND, UseCaseDef } from "@/features/orbit-overview/lib/useCases";
import { IntroStep, TypesStep } from "./lesson/LessonSteps";

const ModelInspector = lazy(() => import("./ModelInspector"));
const UseCaseDemo = lazy(() => import("./UseCaseDemo"));
const CubeSatSizeBuilder = lazy(() => import("./CubeSatSizeBuilder"));

const modelInspectorFallback = (
  <div className="h-[min(36vh,280px)] animate-pulse rounded-2xl border border-white/10 bg-black/40" />
);
const useCaseFallback = (
  <div className="h-40 animate-pulse rounded-2xl border border-white/10 bg-black/30" />
);
const cubeSatFallback = (
  <div className="h-56 animate-pulse rounded-2xl border border-emerald-500/20 bg-black/30" />
);

const TAB_COLORS: Record<TourStepId, string> = {
  overview: "#22d3ee",
  types: "#94a3b8",
  GEO: BAND_META.GEO.defaultColor,
  MEO: BAND_META.MEO.defaultColor,
  LEO: BAND_META.LEO.defaultColor,
};

function isOrbitLesson(id: TourStepId): id is "GEO" | "MEO" | "LEO" {
  return id === "GEO" || id === "MEO" || id === "LEO";
}

interface DetailPanelProps {
  open: boolean;
  onClose: () => void;
  selection: SimulationSelection | null;
  activeOrbitId: string | null;
  orbits: OrbitDefinition[];
  satellites: SatelliteDefinition[];
  layers: {
    orbitalPaths: boolean;
    satellites: boolean;
  };
  speed: number;
  paused: boolean;
  onSpeedChange: (speed: number) => void;
  onTogglePaused: () => void;
  onReset: () => void;
  onClearSelection: () => void;
  onSelectOrbit: (orbitId: string) => void;
  onSelectSatellite: (id: string) => void;
  onToggleLayer: (key: keyof DetailPanelProps["layers"]) => void;
  onAddOrbit: (input: {
    band: OrbitBand;
    name: string;
    altitudeKm: number;
    inclinationDeg: number;
    perigeeKm?: number;
    apogeeKm?: number;
  }) => void;
  onAddSatellite: (input: {
    name: string;
    orbitId: string;
    missionType: MissionType;
    altitudeKm: number;
    inclinationDeg: number;
  }) => void;
  onDeleteOrbit: (orbitId: string) => void;
  onDeleteSatellite: (id: string) => void;
}

export default function DetailPanel({
  open,
  onClose,
  selection,
  orbits,
  satellites,
  layers,
  speed,
  paused,
  onSpeedChange,
  onTogglePaused,
  onReset,
  onClearSelection,
  onSelectOrbit,
  onSelectSatellite,
  onToggleLayer,
}: DetailPanelProps) {
  const [tourStep, setTourStep] = useState(0);
  const [activeCase, setActiveCase] = useState<UseCaseDef | null>(null);
  const [demoPlaying, setDemoPlaying] = useState(false);
  const [leoMode, setLeoMode] = useState<"play" | "cube">("play");

  useEffect(() => {
    if (!selection) return;
    if (selection.kind === "orbit") {
      const o = orbits.find((x) => x.id === selection.id);
      if (o) setTourStep(tourIndexForBand(o.band));
    } else {
      const sat = satellites.find((s) => s.id === selection.id);
      const o = sat ? orbits.find((x) => x.id === sat.orbitId) : null;
      if (o) setTourStep(tourIndexForBand(o.band));
      if (sat?.missionType === "science_demo") setLeoMode("cube");
    }
  }, [selection, orbits, satellites]);

  useEffect(() => {
    setActiveCase(null);
    setDemoPlaying(false);
    if (stepIdFromIndex(tourStep) !== "LEO") setLeoMode("play");
  }, [tourStep]);

  const stepId: TourStepId = stepIdFromIndex(tourStep);
  const content = contentForStep(tourStep);
  const showModel = isOrbitLesson(stepId);
  const band: OrbitBand | null = isOrbitLesson(stepId) ? stepId : null;
  const showCube = stepId === "LEO" && leoMode === "cube";

  const stepOrbit = useMemo(
    () => (band ? orbits.find((o) => o.band === band) ?? null : null),
    [orbits, band]
  );

  const stepSats = useMemo(() => {
    if (!stepOrbit || !band) return [];
    const prefer = TOUR_MISSION_FOCUS[band];
    const inOrbit = satellites.filter((s) => s.orbitId === stepOrbit.id);
    return [...inOrbit].sort((a, b) => {
      const ap = prefer.indexOf(a.missionType);
      const bp = prefer.indexOf(b.missionType);
      return (ap === -1 ? 99 : ap) - (bp === -1 ? 99 : bp);
    });
  }, [satellites, stepOrbit, band]);

  const useCases =
    isOrbitLesson(stepId) && band && !showCube ? USE_CASES_BY_BAND[band] : [];

  const selectedOrbit =
    selection?.kind === "orbit"
      ? orbits.find((o) => o.id === selection.id) ?? null
      : null;
  const selectedSatellite =
    selection?.kind === "satellite"
      ? satellites.find((s) => s.id === selection.id) ?? null
      : null;

  const inspectorOrbit =
    selectedOrbit ??
    (selectedSatellite
      ? orbits.find((o) => o.id === selectedSatellite.orbitId) ?? null
      : stepOrbit);

  const featuredSat = useMemo(() => {
    if (selectedSatellite) return selectedSatellite;
    if (showCube) {
      return (
        satellites.find((s) => s.missionType === "science_demo") ??
        stepSats[0] ??
        null
      );
    }
    if (!activeCase || !stepOrbit) return stepSats[0] ?? null;
    return (
      stepSats.find((s) => s.missionType === activeCase.missionType) ??
      stepSats[0] ??
      null
    );
  }, [
    selectedSatellite,
    activeCase,
    stepOrbit,
    stepSats,
    showCube,
    satellites,
  ]);

  const goStep = (next: number) => {
    const clamped = Math.max(0, Math.min(TOUR_TOTAL - 1, next));
    setTourStep(clamped);
    const id = stepIdFromIndex(clamped);
    if (id === "overview" || id === "types") {
      onClearSelection();
      return;
    }
    const orbit = orbits.find((o) => o.band === id);
    if (orbit) onSelectOrbit(orbit.id);
    else onClearSelection();
  };

  const runUseCase = (uc: UseCaseDef) => {
    if (uc.missionType === "science_demo") {
      setLeoMode("cube");
      const match = stepSats.find((s) => s.missionType === "science_demo");
      if (match) onSelectSatellite(match.id);
      return;
    }
    setActiveCase(uc);
    setDemoPlaying(false);
    requestAnimationFrame(() => setDemoPlaying(true));
    const match = stepSats.find((s) => s.missionType === uc.missionType);
    if (match) onSelectSatellite(match.id);
    else if (stepOrbit) onSelectOrbit(stepOrbit.id);
  };

  const selectKnacksat = () => {
    const knack = satellites.find((s) => s.missionType === "science_demo");
    if (knack) onSelectSatellite(knack.id);
  };

  const onDemoDone = useCallback(() => setDemoPlaying(false), []);

  const laikaLine =
    stepId === "overview" || stepId === "types" || showCube
      ? showCube
        ? "CubeSat เกิดจากห้องเรียน — คลิกขยายขนาดแล้วรู้สึกด้วยตา"
        : content.tip
      : activeCase
      ? activeCase.tease
      : content.tip;

  const nextId =
    tourStep < TOUR_TOTAL - 1 ? stepIdFromIndex(tourStep + 1) : null;
  const nextLabel =
    nextId == null
      ? null
      : nextId === "types"
      ? "ประเภท"
      : nextId === "GEO"
      ? "Orbit Play"
      : nextId === "LEO"
      ? "LEO + Cube"
      : nextId;

  return (
    <aside
      className="detail-zone h-full w-full flex flex-col overflow-hidden border-l border-white/10 bg-[rgba(6,10,18,0.98)]"
      aria-hidden={!open}
    >
      <header className="shrink-0 px-4 pt-3.5 pb-3 border-b border-white/[0.07]">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-full overflow-hidden border border-cyan-400/35 shrink-0 ring-2 ring-cyan-400/10">
            <img
              src="/images/laika.png"
              alt="Laika"
              width={44}
              height={44}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-cyan-300">
                Laika
              </span>
              <span className="text-[10px] text-white/30">{content.stepLabel}</span>
            </div>
            <p className="text-[13px] text-white/80 leading-snug mt-1">
              {laikaLine}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/50"
            aria-label="ปิดแถบ"
          >
            ›
          </button>
        </div>

        <nav className="flex gap-1 mt-3">
          {TOUR_PATH.map((id, i) => {
            const active = i === tourStep;
            const color = TAB_COLORS[id];
            const label =
              id === "overview" ? "1" : id === "types" ? "2" : id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => goStep(i)}
                title={contentForStep(i).title}
                className={`flex-1 h-8 rounded-full text-[10px] font-bold tracking-wide transition-all ${
                  active ? "scale-[1.03]" : "text-white/30 hover:text-white/50"
                }`}
                style={
                  active
                    ? {
                        backgroundColor: color,
                        color: "#061018",
                        boxShadow: `0 0 20px ${color}55`,
                      }
                    : { backgroundColor: "rgba(255,255,255,0.04)" }
                }
              >
                {label}
              </button>
            );
          })}
        </nav>
      </header>

      <div className="flex-1 overflow-y-auto">
        {showModel && (
          <div className="px-3 pt-3">
            <Suspense fallback={modelInspectorFallback}>
              <ModelInspector
                size="lg"
                selection={
                  featuredSat
                    ? { kind: "satellite", id: featuredSat.id }
                    : selection ??
                      (stepOrbit ? { kind: "orbit", id: stepOrbit.id } : null)
                }
                orbit={inspectorOrbit}
                satellite={featuredSat}
              />
            </Suspense>
          </div>
        )}

        <div className="px-4 pt-3 pb-1">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-[18px] font-semibold text-white tracking-tight">
              {showCube ? "CubeSat · ประตูสู่อวกาศ" : content.title}
            </h2>
            {band && !showCube && (
              <span className="text-[11px] text-white/35 shrink-0 font-mono">
                {shortAltitude(band)}
              </span>
            )}
          </div>
          {!showCube && (
            <p
              className="text-[12px] mt-1 font-medium"
              style={{ color: TAB_COLORS[stepId] }}
            >
              {content.fitOneLiner}
            </p>
          )}
        </div>

        <div className="px-4 py-3 pb-6">
          {stepId === "overview" && (
            <IntroStep
              onNext={() => goStep(tourIndexForId("types"))}
              onJumpBand={(b) => goStep(tourIndexForBand(b))}
            />
          )}

          {stepId === "types" && (
            <TypesStep
              onGoPlayground={(b) => goStep(tourIndexForBand(b))}
            />
          )}

          {isOrbitLesson(stepId) && (
            <div className="flex flex-col gap-3">
              {stepId === "LEO" && (
                <div className="flex p-1 rounded-2xl bg-black/40 border border-white/10">
                  {(
                    [
                      { id: "play" as const, label: "Orbit Play" },
                      { id: "cube" as const, label: "CubeSat" },
                    ] as const
                  ).map((m) => {
                    const on = leoMode === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setLeoMode(m.id);
                          if (m.id === "cube") selectKnacksat();
                        }}
                        className={`flex-1 py-2.5 rounded-xl text-[12px] font-semibold transition-all ${
                          on
                            ? m.id === "cube"
                              ? "bg-emerald-400 text-[#042016]"
                              : "bg-cyan-400 text-[#041018]"
                            : "text-white/40 hover:text-white/65"
                        }`}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {showCube ? (
                <Suspense fallback={cubeSatFallback}>
                  <CubeSatSizeBuilder onSelectKnacksat={selectKnacksat} />
                </Suspense>
              ) : (
                <>
                  <div className="flex flex-col gap-2">
                    {useCases.map((uc) => {
                      const selected = activeCase?.id === uc.id;
                      return (
                        <button
                          key={uc.id}
                          type="button"
                          onClick={() => runUseCase(uc)}
                          className={`group text-left rounded-2xl px-3.5 py-3 border transition-all duration-200 ${
                            selected
                              ? "border-cyan-400/45 bg-cyan-500/12 shadow-[0_0_28px_rgba(34,211,238,0.12)]"
                              : "border-white/8 bg-white/[0.03] hover:bg-white/[0.06]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[14px] font-semibold text-white/90">
                              {uc.label}
                            </span>
                            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/5 text-cyan-200/90 border border-cyan-500/20 group-hover:bg-cyan-500/15">
                              {uc.cta}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <Suspense fallback={useCaseFallback}>
                    <UseCaseDemo
                      useCase={activeCase}
                      playing={demoPlaying}
                      onDone={onDemoDone}
                    />
                  </Suspense>

                  {stepSats.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {stepSats.map((sat) => {
                        const on =
                          selection?.kind === "satellite" &&
                          selection.id === sat.id;
                        return (
                          <button
                            key={sat.id}
                            type="button"
                            onClick={() => onSelectSatellite(sat.id)}
                            className={`text-[11px] px-2.5 py-1.5 rounded-full border transition-colors ${
                              on
                                ? "border-cyan-400/50 bg-cyan-500/15 text-cyan-100"
                                : "border-white/10 text-white/45 hover:bg-white/5"
                            }`}
                          >
                            {MISSIONS[sat.missionType].labelTh}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 px-3 py-2.5 border-t border-white/[0.07] flex gap-2">
        <button
          type="button"
          disabled={tourStep === 0}
          onClick={() => goStep(tourStep - 1)}
          className="flex-1 py-3 rounded-2xl border border-white/10 text-[12px] text-white/60 disabled:opacity-25 hover:bg-white/5"
        >
          ← กลับ
        </button>
        <button
          type="button"
          disabled={!nextId}
          onClick={() => goStep(tourStep + 1)}
          className="flex-[1.4] py-3 rounded-2xl text-[12px] font-semibold text-[#061018] disabled:opacity-30 disabled:bg-white/10 disabled:text-white/35"
          style={
            nextId ? { backgroundColor: TAB_COLORS[nextId] } : undefined
          }
        >
          {nextLabel ? `${nextLabel} →` : "จบโมดูล 1"}
        </button>
      </div>

      <div className="shrink-0 px-3 py-2 border-t border-white/[0.07] flex items-center gap-2">
        <button
          type="button"
          onClick={onTogglePaused}
          className="w-7 h-7 rounded-lg border border-white/10 bg-white/5 text-[10px]"
        >
          {paused ? "▶" : "❚❚"}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="w-7 h-7 rounded-lg border border-white/10 bg-white/5 text-[11px]"
        >
          ↻
        </button>
        <input
          type="range"
          min={0.1}
          max={5}
          step={0.1}
          value={speed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          className="flex-1 accent-cyan-500 h-1"
        />
        <label className="flex items-center gap-1 text-[10px] text-white/35">
          <input
            type="checkbox"
            className="toggle scale-75 origin-left"
            checked={layers.orbitalPaths}
            onChange={() => onToggleLayer("orbitalPaths")}
          />
          Path
        </label>
        <label className="flex items-center gap-1 text-[10px] text-white/35">
          <input
            type="checkbox"
            className="toggle scale-75 origin-left"
            checked={layers.satellites}
            onChange={() => onToggleLayer("satellites")}
          />
          Sat
        </label>
      </div>
    </aside>
  );
}
