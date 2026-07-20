import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import Earth from "./Earth";
import OrbitPath from "./OrbitPath";
import Satellite from "./Satellite";
import SpaceEnvironment from "./SpaceEnvironment";
import CameraRig from "./CameraRig";
import { OrbitDefinition, SatelliteDefinition } from "@/features/orbit-overview/lib/types";

interface OrbitSceneProps {
  orbits: OrbitDefinition[];
  satellites: SatelliteDefinition[];
  activeOrbitId: string | null;
  showOrbitPaths: boolean;
  showSatellites: boolean;
  speed: number;
  paused: boolean;
  selectedSatelliteId: string | null;
  selectedOrbitId: string | null;
  followSatelliteId: string | null;
  homeToken: number;
  onSelectSatellite: (id: string) => void;
  onSelectOrbit: (orbitId: string) => void;
}

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

  return (
    <Canvas
      style={{ width: "100%", height: "100%", display: "block" }}
      camera={{ position: [0, 5, 18], fov: chasing ? 50 : 42, near: 0.1, far: 500 }}
      gl={{ antialias: true, toneMappingExposure: 1.05 }}
    >
      <SpaceEnvironment />

      <directionalLight
        position={[40, 8, 20]}
        intensity={2.4}
        color="#fff6e8"
        castShadow={false}
      />
      <ambientLight intensity={0.08} />
      <hemisphereLight
        color="#a8c4ff"
        groundColor="#02040c"
        intensity={0.22}
      />
      <pointLight position={[-25, -8, -18]} intensity={0.15} color="#4a6cff" />

      <Suspense fallback={null}>
        <Earth />
      </Suspense>

      {orbits.map((orbit) => (
        <OrbitPath
          key={orbit.id}
          orbit={orbit}
          visible={showOrbitPaths}
          highlighted={orbit.id === activeOrbitId}
          selected={
            orbit.id === selectedOrbitId && selectedSatelliteId === null
          }
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
        minDistance={4}
        maxDistance={40}
        autoRotate={false}
        enableDamping
        dampingFactor={0.06}
        enabled={!chasing}
      />

      <CameraRig
        followSatelliteId={followSatelliteId}
        homeToken={homeToken}
        controlsRef={controlsRef}
      />
    </Canvas>
  );
}
