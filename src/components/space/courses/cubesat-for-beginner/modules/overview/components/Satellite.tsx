import { Suspense, useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  OrbitDefinition,
  SatelliteDefinition,
  realAngularSpeed,
} from "../lib/types";
import { satelliteWorldPosition } from "../lib/orbitMath";
import {
  clearSatellitePose,
  publishSatellitePose,
} from "../lib/satelliteTracker";
import SatelliteMesh, {
  SatelliteMeshErrorBoundary,
} from "./SatelliteMesh";

interface SatelliteProps {
  data: SatelliteDefinition;
  orbit: OrbitDefinition;
  speed: number;
  paused: boolean;
  selected: boolean;
  followed?: boolean;
  onSelect: (id: string) => void;
}

function SatelliteFallback({ color }: { color: string }) {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.18, 0.1, 0.1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.65}
        />
      </mesh>
      <mesh position={[0.2, 0, 0]}>
        <boxGeometry args={[0.2, 0.02, 0.1]} />
        <meshStandardMaterial color="#8ab4ff" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[-0.2, 0, 0]}>
        <boxGeometry args={[0.2, 0.02, 0.1]} />
        <meshStandardMaterial color="#8ab4ff" metalness={0.6} roughness={0.35} />
      </mesh>
    </group>
  );
}

export default function Satellite({
  data,
  orbit,
  speed,
  paused,
  selected,
  followed,
  onSelect,
}: SatelliteProps) {
  const groupRef = useRef<THREE.Group>(null);
  const angleRef = useRef(data.phase);
  const pos = useRef(new THREE.Vector3());
  const nextPos = useRef(new THREE.Vector3());
  const tangent = useRef(new THREE.Vector3());
  const [hovered, setHovered] = useState(false);

  // Match mean motion to the craft's altitude (HEO uses parent ellipse rate)
  const angularSpeed =
    orbit.band === "HEO"
      ? orbit.angularSpeed
      : realAngularSpeed(data.altitudeKm);

  useEffect(() => {
    return () => clearSatellitePose(data.id);
  }, [data.id]);

  useFrame((_, delta) => {
    if (!paused) {
      angleRef.current += delta * angularSpeed * speed;
    }
    satelliteWorldPosition(
      angleRef.current,
      orbit,
      data.altitudeKm,
      data.inclinationDeg,
      data.radiusJitter ?? 0,
      pos.current
    );
    satelliteWorldPosition(
      angleRef.current + 0.02,
      orbit,
      data.altitudeKm,
      data.inclinationDeg,
      data.radiusJitter ?? 0,
      nextPos.current
    );
    tangent.current.subVectors(nextPos.current, pos.current).normalize();
    publishSatellitePose(data.id, pos.current, tangent.current);

    if (groupRef.current) {
      groupRef.current.position.copy(pos.current);
      groupRef.current.lookAt(0, 0, 0);
    }
  });

  const fallback = <SatelliteFallback color={orbit.color} />;
  const highlight = selected || followed || hovered;

  return (
    <group
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(data.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      <SatelliteMeshErrorBoundary fallback={fallback}>
        <Suspense fallback={fallback}>
          <SatelliteMesh
            missionType={data.missionType}
            selected={highlight}
            hovered={hovered}
            followed={followed}
            accentColor={orbit.color}
          />
        </Suspense>
      </SatelliteMeshErrorBoundary>
    </group>
  );
}
