import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import KnowledgeDialog from "@/components/knowledge/KnowledgeDialog";
import { KnowledgeProvider } from "@/components/knowledge/KnowledgeProvider";
import { spaceCoursePath } from "@/components/space/core/routes";
import { useSpaceProgress } from "@/components/space/hooks/useSpaceProgress";

import JourneyPanel from "./components/JourneyPanel";
import OverviewTimeControls from "./components/OverviewTimeControls";
import {
  INITIAL_ORBITS,
  INITIAL_SATELLITES,
  OrbitBand,
  OrbitDefinition,
  SatelliteDefinition,
  SimulationSelection,
} from "./lib/types";
import { modelMetaForMission } from "./lib/satelliteModels";
import { hudBtn, hudBtnActive, hudPanel } from "./lib/hudStyles";
import { DEFAULT_TIME_SCALE } from "../physics/sim/timeScale";

const OrbitScene = lazy(() => import("./components/OrbitScene"));

const MODULE_ID = "overview";

export default function OrbitOverviewLesson({
  courseId = "cubesat-for-beginner",
}: {
  courseId?: string;
}) {
  const coursePath = spaceCoursePath(courseId);
  const { isModuleCompleted, markComplete } = useSpaceProgress();
  const moduleCompleted = isModuleCompleted(courseId, MODULE_ID);

  const [orbits] = useState<OrbitDefinition[]>(INITIAL_ORBITS);
  const [satellites] =
    useState<SatelliteDefinition[]>(INITIAL_SATELLITES);
  const [activeOrbitId, setActiveOrbitId] = useState<string | null>(null);
  const [selection, setSelection] = useState<SimulationSelection | null>(null);
  const [timeScale, setTimeScale] = useState(DEFAULT_TIME_SCALE);
  const [resetKey, setResetKey] = useState(0);
  const [panelOpen, setPanelOpen] = useState(true);
  const [followSatelliteId, setFollowSatelliteId] = useState<string | null>(
    null,
  );
  const [homeToken, setHomeToken] = useState(0);
  const [sceneBandVisit, setSceneBandVisit] = useState<OrbitBand | null>(null);

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
        ? (satellites.find((s) => s.id === selectedSatelliteId) ?? null)
        : null,
    [satellites, selectedSatelliteId],
  );

  const handleOrbitSelect = useCallback(
    (orbitId: string) => {
      setActiveOrbitId(orbitId);
      setSelection({ kind: "orbit", id: orbitId });
      setPanelOpen(true);
      const orbit = orbits.find((o) => o.id === orbitId);
      if (orbit && orbit.band !== "HEO") {
        setSceneBandVisit(orbit.band);
      }
      // Auto-focus a satellite on this orbit (Physics-style follow)
      const satOnOrbit = satellites.find((s) => s.orbitId === orbitId);
      setFollowSatelliteId(satOnOrbit?.id ?? null);
    },
    [orbits, satellites],
  );

  const handleSatelliteSelect = useCallback(
    (id: string) => {
      const sat = satellites.find((s) => s.id === id);
      if (sat) {
        setActiveOrbitId(sat.orbitId);
        const orbit = orbits.find((o) => o.id === sat.orbitId);
        if (orbit && orbit.band !== "HEO") {
          setSceneBandVisit(orbit.band);
        }
      }
      setSelection({ kind: "satellite", id });
      setFollowSatelliteId(id);
      setPanelOpen(true);
    },
    [satellites, orbits],
  );

  const handleClearSelection = useCallback(() => {
    setSelection(null);
    setFollowSatelliteId(null);
  }, []);

  const handleGoHome = useCallback(() => {
    setFollowSatelliteId(null);
    setHomeToken((t) => t + 1);
    setActiveOrbitId(null);
    setSelection(null);
  }, []);

  const handleToggleChase = useCallback(() => {
    if (followSatelliteId) {
      setFollowSatelliteId(null);
      return;
    }
    if (!selectedSatelliteId) return;
    setFollowSatelliteId(selectedSatelliteId);
  }, [followSatelliteId, selectedSatelliteId]);

  const handleReset = () => {
    setTimeScale(DEFAULT_TIME_SCALE);
    setFollowSatelliteId(null);
    setHomeToken((t) => t + 1);
    setResetKey((k) => k + 1);
  };

  const sceneOrbits = useMemo(() => orbits, [orbits]);
  const isChasing = !!followSatelliteId;
  const followedSat = useMemo(
    () =>
      followSatelliteId
        ? (satellites.find((s) => s.id === followSatelliteId) ?? null)
        : null,
    [followSatelliteId, satellites],
  );
  const followedModelMeta = followedSat
    ? modelMetaForMission(followedSat.missionType)
    : null;

  return (
    <KnowledgeProvider>
      <main className="flex h-screen w-screen overflow-hidden bg-[#05070d]">
        <section
          className={`relative h-full min-w-0 transition-[flex-basis,flex-grow] duration-300 ease-out ${
            panelOpen ? "flex-[2] basis-0" : "flex-1 basis-full"
          }`}
        >
          <Suspense
            fallback={<div className="h-full w-full bg-[#05070d]" aria-hidden />}
          >
            <OrbitScene
              key={resetKey}
              orbits={sceneOrbits}
              satellites={satellites}
              activeOrbitId={activeOrbitId}
              showOrbitPaths={layers.orbitalPaths}
              showSatellites={layers.satellites}
              speed={timeScale}
              paused={timeScale === 0}
              selectedSatelliteId={selectedSatelliteId}
              selectedOrbitId={selectedOrbitId}
              followSatelliteId={followSatelliteId}
              homeToken={homeToken}
              onSelectSatellite={handleSatelliteSelect}
              onSelectOrbit={handleOrbitSelect}
            />
          </Suspense>

          <div className="pointer-events-none absolute top-3 left-3 z-20 flex flex-wrap items-center gap-1">
            <Link
              to={coursePath}
              className={`pointer-events-auto ${hudBtn}`}
              aria-label="กลับคอร์ส"
              title="กลับหน้าคอร์ส"
            >
              ‹ COURSE
            </Link>
            <button
              type="button"
              onClick={handleGoHome}
              className={`pointer-events-auto ${hudBtn}`}
              aria-label="มุมกล้องหลัก"
              title="กลับมุมกล้องหลัก"
            >
              ⌂ Cam
            </button>
            <button
              type="button"
              disabled={!followSatelliteId && !selectedSatelliteId}
              onClick={handleToggleChase}
              className={`pointer-events-auto ${isChasing ? hudBtnActive : hudBtn}`}
              title={
                isChasing
                  ? "หยุดตามกล้อง (ยังซูม/หมุนรอบโลกได้)"
                  : selectedSatelliteId || followSatelliteId
                    ? "โฟกัสตามดาวเทียม"
                    : "เลือกดาวเทียมหรือวงโคจรก่อน"
              }
            >
              {isChasing
                ? "◎ กำลังตาม…"
                : selectedSat
                  ? `✈ ตาม · ${selectedSat.name}`
                  : "✈ ตามดาวเทียม"}
            </button>
          </div>

          {isChasing && followedSat && (
            <div className={`absolute right-3 bottom-3 z-20 max-w-[260px] ${hudPanel}`}>
              <div className="font-mono text-[0.58rem] tracking-wider text-cyan-300/80 uppercase">
                Follow cam
              </div>
              <div className="mt-0.5 truncate font-mono text-[0.75rem] text-white/85">
                {followedSat.name}
              </div>
              <p className="mt-1 text-[0.65rem] leading-snug text-white/40">
                ลากเพื่อหมุน · เลื่อนเพื่อซูม
              </p>
              {followedModelMeta && (
                <p className="mt-1.5 text-[0.6rem] leading-snug text-white/35">
                  Model:{" "}
                  {"source" in followedModelMeta && followedModelMeta.source ? (
                    <a
                      href={followedModelMeta.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/50 underline decoration-white/20 hover:text-white/70"
                    >
                      {followedModelMeta.credit}
                    </a>
                  ) : (
                    followedModelMeta.credit
                  )}
                  {"license" in followedModelMeta && followedModelMeta.license ? (
                    <>
                      {" · "}
                      <a
                        href={followedModelMeta.license}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/45 underline decoration-white/20 hover:text-white/65"
                      >
                        CC BY 4.0
                      </a>
                    </>
                  ) : null}
                </p>
              )}
              <button
                type="button"
                onClick={handleGoHome}
                className="mt-1.5 font-mono text-[0.6rem] text-white/45 hover:text-white/80"
              >
                กด Cam เพื่อกลับมุมหลัก
              </button>
            </div>
          )}

          <OverviewTimeControls
            timeScale={timeScale}
            onTimeScaleChange={setTimeScale}
            onReset={handleReset}
            layers={layers}
            onToggleLayer={toggleLayer}
          />

          {!panelOpen && (
            <button
              type="button"
              onClick={() => setPanelOpen(true)}
              className={`absolute top-1/2 right-0 z-20 flex -translate-y-1/2 items-center gap-1 rounded-l-md border border-r-0 ${hudBtn} py-3 pr-3 pl-2`}
              aria-label="Open sidebar"
            >
              <span className="text-lg leading-none">‹</span>
              <span className="writing-mode-vertical text-[0.58rem] tracking-wide">
                Panel
              </span>
            </button>
          )}
        </section>

        <div
          className={`h-full overflow-hidden transition-[flex-basis,flex-grow,opacity] duration-300 ease-out ${
            panelOpen
              ? "min-w-0 flex-1 basis-0 opacity-100"
              : "pointer-events-none w-0 flex-none basis-0 opacity-0"
          }`}
        >
          <div className="h-full w-full min-w-[300px]">
            <JourneyPanel
              open={panelOpen}
              onClose={() => setPanelOpen(false)}
              courseId={courseId}
              moduleCompleted={moduleCompleted}
              onMarkComplete={async () => {
                await markComplete(courseId, MODULE_ID);
              }}
              orbits={orbits}
              satellites={satellites}
              onClearSelection={handleClearSelection}
              onSelectOrbit={handleOrbitSelect}
              onSelectSatellite={handleSatelliteSelect}
              sceneBandVisit={sceneBandVisit}
            />
          </div>
        </div>
      </main>
      <KnowledgeDialog />
    </KnowledgeProvider>
  );
}
