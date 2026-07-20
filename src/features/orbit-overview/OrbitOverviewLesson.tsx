import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DetailPanel from "@/features/orbit-overview/components/DetailPanel";
import {
  BAND_META,
  createOrbit,
  createSatellite,
  INITIAL_ORBITS,
  INITIAL_SATELLITES,
  nextOrbitColor,
  OrbitBand,
  OrbitDefinition,
  SatelliteDefinition,
  SimulationSelection,
} from "@/features/orbit-overview/lib/types";
import type { MissionType } from "@/features/orbit-overview/lib/missions";

const OrbitScene = lazy(() => import("@/features/orbit-overview/components/OrbitScene"));

export default function OrbitOverviewLesson() {
  const { courseId = "cubesat-for-beginner" } = useParams<{ courseId: string }>();
  const coursePath = `/space/course/${courseId}`;
  const [orbits, setOrbits] = useState<OrbitDefinition[]>(INITIAL_ORBITS);
  const [satellites, setSatellites] =
    useState<SatelliteDefinition[]>(INITIAL_SATELLITES);
  const [activeOrbitId, setActiveOrbitId] = useState<string | null>(null);
  const [selection, setSelection] = useState<SimulationSelection | null>(null);
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [panelOpen, setPanelOpen] = useState(true);
  const [followSatelliteId, setFollowSatelliteId] = useState<string | null>(
    null
  );
  const [homeToken, setHomeToken] = useState(0);

  const [layers, setLayers] = useState({
    orbitalPaths: true,
    satellites: true,
  });

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectedSatelliteId =
    selection?.kind === "satellite" ? selection.id : null;
  const selectedOrbitId = selection?.kind === "orbit" ? selection.id : null;

  const selectedSat = useMemo(
    () =>
      selectedSatelliteId
        ? satellites.find((s) => s.id === selectedSatelliteId) ?? null
        : null,
    [satellites, selectedSatelliteId]
  );

  const handleOrbitSelect = useCallback((orbitId: string) => {
    setActiveOrbitId(orbitId);
    setSelection({ kind: "orbit", id: orbitId });
    setFollowSatelliteId(null);
    setPanelOpen(true);
  }, []);

  const handleSatelliteSelect = useCallback(
    (id: string) => {
      const sat = satellites.find((s) => s.id === id);
      if (sat) setActiveOrbitId(sat.orbitId);
      setSelection({ kind: "satellite", id });
      setPanelOpen(true);
    },
    [satellites]
  );

  const handleClearSelection = useCallback(() => {
    setSelection(null);
  }, []);

  const handleGoHome = useCallback(() => {
    setFollowSatelliteId(null);
    setHomeToken((t) => t + 1);
    setActiveOrbitId(null);
    setSelection(null);
    setSpeed(1);
    setPaused(false);
  }, []);

  const handleToggleChase = useCallback(() => {
    if (!selectedSatelliteId) return;
    setFollowSatelliteId((cur) =>
      cur === selectedSatelliteId ? null : selectedSatelliteId
    );
  }, [selectedSatelliteId]);

  const handleReset = () => {
    setSpeed(1);
    setPaused(false);
    setFollowSatelliteId(null);
    setHomeToken((t) => t + 1);
    setResetKey((k) => k + 1);
  };

  const handleAddOrbit = (input: {
    band: OrbitBand;
    name: string;
    altitudeKm: number;
    inclinationDeg: number;
    perigeeKm?: number;
    apogeeKm?: number;
  }) => {
    const orbit = createOrbit({
      ...input,
      color: nextOrbitColor(orbits, input.band),
      name:
        input.name.trim() ||
        `${BAND_META[input.band].label} ${
          orbits.filter((o) => o.band === input.band).length + 1
        }`,
    });
    setOrbits((prev) => [...prev, orbit]);
    setActiveOrbitId(orbit.id);
    setSelection({ kind: "orbit", id: orbit.id });
  };

  const handleAddSatellite = (input: {
    name: string;
    orbitId: string;
    missionType: MissionType;
    altitudeKm: number;
    inclinationDeg: number;
  }) => {
    const orbit = orbits.find((o) => o.id === input.orbitId);
    if (!orbit) return;
    try {
      const sat = createSatellite({
        name: input.name,
        orbitId: orbit.id,
        orbit,
        missionType: input.missionType,
        altitudeKm: input.altitudeKm,
        inclinationDeg: input.inclinationDeg,
      });
      setSatellites((prev) => [...prev, sat]);
      setActiveOrbitId(orbit.id);
      setSelection({ kind: "satellite", id: sat.id });
    } catch (err) {
      console.warn(err);
    }
  };

  const handleDeleteOrbit = (orbitId: string) => {
    setOrbits((prev) => prev.filter((o) => o.id !== orbitId));
    setSatellites((prev) => prev.filter((s) => s.orbitId !== orbitId));
    setFollowSatelliteId((id) => {
      if (!id) return null;
      const sat = satellites.find((s) => s.id === id);
      return sat?.orbitId === orbitId ? null : id;
    });
    setSelection((sel) => {
      if (!sel) return null;
      if (sel.kind === "orbit" && sel.id === orbitId) return null;
      if (sel.kind === "satellite") {
        const sat = satellites.find((s) => s.id === sel.id);
        if (sat?.orbitId === orbitId) return null;
      }
      return sel;
    });
    setActiveOrbitId((id) => (id === orbitId ? null : id));
  };

  const handleDeleteSatellite = (id: string) => {
    setSatellites((prev) => prev.filter((s) => s.id !== id));
    setFollowSatelliteId((f) => (f === id ? null : f));
    setSelection((sel) =>
      sel?.kind === "satellite" && sel.id === id ? null : sel
    );
  };

  const sceneOrbits = useMemo(() => orbits, [orbits]);
  const isChasing = !!followSatelliteId;

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-[#05070d]">
      <section
        className={`relative min-w-0 h-full transition-[flex-basis,flex-grow] duration-300 ease-out ${
          panelOpen ? "flex-1 basis-1/2" : "flex-1 basis-full"
        }`}
      >
        <Suspense fallback={<div className="h-full w-full bg-[#05070d]" aria-hidden />}>
          <OrbitScene
            key={resetKey}
            orbits={sceneOrbits}
            satellites={satellites}
            activeOrbitId={activeOrbitId}
            showOrbitPaths={layers.orbitalPaths}
            showSatellites={layers.satellites}
            speed={speed}
            paused={paused}
            selectedSatelliteId={selectedSatelliteId}
            selectedOrbitId={selectedOrbitId}
            followSatelliteId={followSatelliteId}
            homeToken={homeToken}
            onSelectSatellite={handleSatelliteSelect}
            onSelectOrbit={handleOrbitSelect}
          />
        </Suspense>

        <Link
          to={coursePath}
          className="absolute top-4 left-4 z-20 flex items-center gap-2 rounded-xl border border-white/15 bg-[rgba(8,12,22,0.88)] py-2 pl-2.5 pr-3 text-white/85 shadow-lg backdrop-blur-md hover:bg-[rgba(12,18,32,0.95)]"
          aria-label="กลับคอร์ส"
          title="กลับหน้าคอร์ส"
        >
          <span className="text-sm leading-none">‹</span>
          <span className="text-[11px] font-medium tracking-wide">COURSE</span>
        </Link>

        {/* Camera home */}
        <button
          type="button"
          onClick={handleGoHome}
          className="absolute top-4 left-[7.25rem] z-20 flex items-center gap-2 pl-2.5 pr-3 py-2 rounded-xl border border-white/15 bg-[rgba(8,12,22,0.88)] text-white/85 hover:bg-[rgba(12,18,32,0.95)] backdrop-blur-md shadow-lg"
          aria-label="มุมกล้องหลัก"
          title="กลับมุมกล้องหลัก"
        >
          <span className="text-sm leading-none">⌂</span>
          <span className="text-[11px] font-medium tracking-wide">Cam</span>
        </button>

        {/* Chase cam controls */}
        <div className="absolute top-4 left-[13.5rem] z-20 flex items-center gap-2">
          <button
            type="button"
            disabled={!selectedSatelliteId}
            onClick={handleToggleChase}
            className={`flex items-center gap-2 pl-2.5 pr-3 py-2 rounded-xl border backdrop-blur-md shadow-lg text-[11px] font-medium transition-colors disabled:opacity-35 disabled:cursor-not-allowed ${
              isChasing
                ? "border-cyan-400/50 bg-cyan-500/20 text-cyan-100"
                : "border-white/15 bg-[rgba(8,12,22,0.88)] text-white/80 hover:bg-[rgba(12,18,32,0.95)]"
            }`}
            title={
              selectedSatelliteId
                ? isChasing
                  ? "หยุดตามกล้อง"
                  : "ตามหลังดาวเทียม"
                : "เลือกดาวเทียมก่อน"
            }
          >
            <span className="text-sm leading-none">{isChasing ? "◎" : "✈"}</span>
            <span>
              {isChasing
                ? "กำลังตาม…"
                : selectedSat
                ? `ตาม · ${selectedSat.name}`
                : "ตามดาวเทียม"}
            </span>
          </button>
        </div>

        {isChasing && (
          <div className="absolute bottom-4 left-4 z-20 max-w-[220px] rounded-xl border border-cyan-500/25 bg-[rgba(8,12,22,0.85)] px-3 py-2 backdrop-blur-md">
            <div className="text-[10px] uppercase tracking-wider text-cyan-300/80">
              Chase cam
            </div>
            <div className="text-[12px] text-white/85 mt-0.5 truncate">
              {satellites.find((s) => s.id === followSatelliteId)?.name}
            </div>
            <button
              type="button"
              onClick={handleGoHome}
              className="mt-1.5 text-[10px] text-white/45 hover:text-white/80"
            >
              กด Home เพื่อกลับมุมหลัก
            </button>
          </div>
        )}

        {!panelOpen && (
          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex items-center gap-1 pl-2 pr-3 py-3 rounded-l-xl border border-r-0 border-white/15 bg-[rgba(8,12,22,0.92)] text-white/80 hover:bg-[rgba(12,18,32,0.95)] backdrop-blur-md shadow-lg"
            aria-label="Open sidebar"
          >
            <span className="text-lg leading-none">‹</span>
            <span className="text-[10px] font-medium tracking-wide writing-mode-vertical">
              Panel
            </span>
          </button>
        )}
      </section>

      <div
        className={`h-full overflow-hidden transition-[flex-basis,flex-grow,opacity] duration-300 ease-out ${
          panelOpen
            ? "flex-1 basis-1/2 min-w-0 opacity-100"
            : "flex-none basis-0 w-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="h-full w-full min-w-[320px]">
          <DetailPanel
            open={panelOpen}
            onClose={() => setPanelOpen(false)}
            selection={selection}
            activeOrbitId={activeOrbitId}
            orbits={orbits}
            satellites={satellites}
            layers={layers}
            speed={speed}
            paused={paused}
            onSpeedChange={setSpeed}
            onTogglePaused={() => setPaused((p) => !p)}
            onReset={handleReset}
            onClearSelection={handleClearSelection}
            onSelectOrbit={handleOrbitSelect}
            onSelectSatellite={handleSatelliteSelect}
            onToggleLayer={toggleLayer}
            onAddOrbit={handleAddOrbit}
            onAddSatellite={handleAddSatellite}
            onDeleteOrbit={handleDeleteOrbit}
            onDeleteSatellite={handleDeleteSatellite}
          />
        </div>
      </div>
    </main>
  );
}
