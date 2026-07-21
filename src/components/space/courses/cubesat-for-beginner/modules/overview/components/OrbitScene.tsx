import { Suspense, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import WebGPUCanvas from "../../physics/scene/WebGPUCanvas";
import RealisticEarth from "../../physics/scene/RealisticEarth";
import RealisticSun from "../../physics/scene/RealisticSun";
import StarSphere from "../../physics/scene/StarSphere";
import OrbitPath from "./OrbitPath";
import Satellite from "./Satellite";
import CameraRig from "./CameraRig";
import { OrbitDefinition, SatelliteDefinition } from "../lib/types";
import { EARTH_SIDEREAL_OMEGA } from "../../physics/sim/orbit";

interface OrbitSceneProps {
  orbits: OrbitDefinition[];
  satellites: SatelliteDefinition[];
  activeOrbitId: string | null;
  showOrbitPaths: boolean;
  showSatellites: boolean;
  /** Time multiplier — 1 = real Keplerian / sidereal rate. */
  speed: number;
  paused: boolean;
  selectedSatelliteId: string | null;
  selectedOrbitId: string | null;
  followSatelliteId: string | null;
  homeToken: number;
  onSelectSatellite: (id: string) => void;
  onSelectOrbit: (orbitId: string) => void;
}

/** Scene Earth radius — matches `EARTH_RADIUS` in ../lib/orbitMath.ts */
const SCENE_EARTH_RADIUS = 2;

export default function OrbitScene({
  orbits,
  satellites,
  activeOrbitId,
  showOrbitPaths,
  showSatellites,
  speed,
  paused,
  selectedSatelliteId,
  selectedOrbitId,
  followSatelliteId,
  homeToken,
  onSelectSatellite,
  onSelectOrbit,
}: OrbitSceneProps) {
  const orbitById = new Map(orbits.map((o) => [o.id, o]));
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const chasing = !!followSatelliteId;
  const earthSpin = paused || speed === 0 ? 0 : EARTH_SIDEREAL_OMEGA * speed;

  return (
    <WebGPUCanvas
      style={{ width: "100%", height: "100%", display: "block" }}
      camera={{ position: [0, 5, 18], fov: chasing ? 48 : 42, near: 0.05, far: 500 }}
    >
      <color attach="background" args={["#010208"]} />
      <StarSphere />

      <RealisticSun earthRadius={SCENE_EARTH_RADIUS} lightIntensity={2.2} />
      <ambientLight intensity={0.06} color="#4466aa" />

      <Suspense fallback={null}>
        <RealisticEarth radius={SCENE_EARTH_RADIUS} rotationSpeed={earthSpin} />
      </Suspense>

      {orbits.map((orbit) => (
        <OrbitPath
          key={orbit.id}
          orbit={orbit}
          visible={showOrbitPaths}
          highlighted={orbit.id === activeOrbitId}
          selected={orbit.id === selectedOrbitId && selectedSatelliteId === null}
          onSelect={onSelectOrbit}
        />
      ))}

      {showSatellites &&
        satellites.map((sat) => {
          const orbit = orbitById.get(sat.orbitId);
          if (!orbit) return null;
          return (
            <Satellite
              key={sat.id}
              data={sat}
              orbit={orbit}
              speed={speed}
              paused={paused}
              selected={sat.id === selectedSatelliteId}
              followed={sat.id === followSatelliteId}
              onSelect={onSelectSatellite}
            />
          );
        })}

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom
        enableRotate
        minDistance={chasing ? 0.02 : 1.2}
        maxDistance={chasing ? 220 : 220}
        autoRotate={false}
        enableDamping
        dampingFactor={0.08}
      />

      <CameraRig
        followSatelliteId={followSatelliteId}
        homeToken={homeToken}
        controlsRef={controlsRef}
      />
    </WebGPUCanvas>
  );
}
