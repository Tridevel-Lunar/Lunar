import { useLayoutEffect, useMemo, useRef } from "react";
import { Line, OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

import { orbitPosition, orbitRingPoints } from "./orbitPosition";
import type { ArenaOrbitPreviewSample } from "./types";

const EARTH_RADIUS = 1;
const ORBIT_RADIUS = 1.65;
const SUN_POSITION: [number, number, number] = [18, 4, 2];

function Earth() {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS, 32, 32]} />
        <meshStandardMaterial color="#1a4a8a" roughness={0.85} metalness={0.08} />
      </mesh>
      <mesh scale={1.035}>
        <sphereGeometry args={[EARTH_RADIUS, 24, 24]} />
        <meshBasicMaterial color="#4db2ff" transparent opacity={0.14} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Craft({
  sample,
  inclinationDeg,
}: {
  sample: ArenaOrbitPreviewSample;
  inclinationDeg: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const invalidate = useThree((state) => state.invalidate);

  useLayoutEffect(() => {
    const group = ref.current;
    if (!group) return;
    orbitPosition(sample.phase, ORBIT_RADIUS, inclinationDeg, group.position);
    group.lookAt(0, 0, 0);
    invalidate();
  }, [
    sample.phase,
    sample.isSunlit,
    sample.heaterOn,
    sample.payloadOn,
    sample.safeMode,
    inclinationDeg,
    invalidate,
  ]);

  const bodyColor = sample.safeMode
    ? "#f87171"
    : sample.isSunlit
      ? "#d4e8f7"
      : "#64748b";

  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[0.12, 0.12, 0.12]} />
        <meshStandardMaterial
          color={bodyColor}
          emissive={sample.safeMode ? "#7f1d1d" : "#0ea5e9"}
          emissiveIntensity={sample.safeMode ? 0.55 : sample.isSunlit ? 0.12 : 0.04}
          roughness={0.45}
          metalness={0.25}
        />
      </mesh>
      {sample.heaterOn ? (
        <mesh position={[0, -0.1, 0]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshBasicMaterial color="#fb923c" />
        </mesh>
      ) : null}
      {sample.payloadOn ? (
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.05, 0.05, 0.05]} />
          <meshBasicMaterial color="#22d3ee" />
        </mesh>
      ) : null}
    </group>
  );
}

export default function ArenaOrbitScene({
  sample,
  inclinationDeg,
}: {
  sample: ArenaOrbitPreviewSample;
  inclinationDeg: number;
}) {
  const invalidate = useThree((state) => state.invalidate);
  const ringPoints = useMemo(
    () => orbitRingPoints(ORBIT_RADIUS, inclinationDeg),
    [inclinationDeg],
  );

  return (
    <>
      <color attach="background" args={["#02060f"]} />
      <ambientLight intensity={sample.isSunlit ? 0.18 : 0.06} />
      <directionalLight
        position={SUN_POSITION}
        intensity={sample.isSunlit ? 2.1 : 0.35}
        color="#fff4d6"
      />
      <pointLight position={[-6, 2, -4]} intensity={0.15} color="#334466" />

      <Earth />
      <Line points={ringPoints} color="#5ee7ff" transparent opacity={0.4} lineWidth={1} />
      <Craft sample={sample} inclinationDeg={inclinationDeg} />

      <OrbitControls
        enablePan={false}
        enableDamping={false}
        minDistance={3.2}
        maxDistance={8}
        maxPolarAngle={Math.PI * 0.49}
        onChange={() => invalidate()}
      />
    </>
  );
}
