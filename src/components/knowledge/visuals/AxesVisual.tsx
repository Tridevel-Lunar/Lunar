import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

import WebGPUCanvas from "@/components/space/courses/cubesat-for-beginner/modules/physics/scene/WebGPUCanvas";
import RealisticEarth from "@/components/space/courses/cubesat-for-beginner/modules/physics/scene/RealisticEarth";
import type { KnowledgeVisualProps } from "../visuals";

const EARTH_R = 0.55;
const AXIAL_TILT = 23.44;
const MAG_OFFSET = 11;

type AxisHighlight = "geographic" | "geomagnetic";

function MiniAxis({
  length,
  color,
  highlight = false,
  dimmed = false,
}: {
  length: number;
  color: string;
  highlight?: boolean;
  dimmed?: boolean;
}) {
  const radius = highlight ? 0.022 : dimmed ? 0.008 : 0.012;
  const opacity = highlight ? 1 : dimmed ? 0.18 : 0.65;
  const coneScale = highlight ? 1.35 : dimmed ? 0.75 : 1;

  return (
    <group>
      {highlight && (
        <mesh>
          <cylinderGeometry args={[radius * 2.2, radius * 2.2, length, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.12} depthWrite={false} />
        </mesh>
      )}
      <mesh>
        <cylinderGeometry args={[radius, radius, length, 8]} />
        <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
      </mesh>
      <mesh position={[0, length / 2, 0]} scale={[coneScale, coneScale, coneScale]}>
        <coneGeometry args={[0.04, 0.1, 10]} />
        <meshBasicMaterial color={color} transparent opacity={Math.min(opacity + 0.15, 1)} depthWrite={false} />
      </mesh>
    </group>
  );
}

function AxesScene({ highlight }: { highlight: AxisHighlight }) {
  const spinRef = useRef<THREE.Group>(null);
  const axis = useRef(new THREE.Vector3(0, 1, 0));

  useFrame((_, delta) => {
    spinRef.current?.rotateOnAxis(axis.current, delta * 0.4);
  });

  const geoHighlight = highlight === "geographic";
  const magHighlight = highlight === "geomagnetic";

  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[-3, 1, 2]} intensity={2} />
      <OrbitControls enablePan={false} minDistance={1.2} maxDistance={4} enableDamping />

      <group rotation={[0, 0, THREE.MathUtils.degToRad(AXIAL_TILT)]}>
        <MiniAxis
          length={EARTH_R * 2.8}
          color="#4db2ff"
          highlight={geoHighlight}
          dimmed={magHighlight}
        />
        <group ref={spinRef}>
          <RealisticEarth radius={EARTH_R} axialTiltDeg={0} rotationSpeed={0} atmosphere={false} />
          <group rotation={[0, 0, THREE.MathUtils.degToRad(MAG_OFFSET)]}>
            <MiniAxis
              length={EARTH_R * 3}
              color="#c084fc"
              highlight={magHighlight}
              dimmed={geoHighlight}
            />
          </group>
        </group>
      </group>
    </>
  );
}

const HIGHLIGHT_BY_ENTRY: Record<string, AxisHighlight> = {
  "geographic-axis": "geographic",
  "geomagnetic-axis": "geomagnetic",
};

/** Mini WebGPU scene — highlights the axis matching the open knowledge entry. */
export default function AxesVisual({ entryId }: KnowledgeVisualProps) {
  const highlight = HIGHLIGHT_BY_ENTRY[entryId] ?? "geographic";

  return (
    <div className="relative h-[220px] w-full">
      <WebGPUCanvas camera={{ position: [1.8, 1, 1.8], fov: 35, near: 0.1, far: 100 }}>
        <AxesScene highlight={highlight} />
      </WebGPUCanvas>
      <div className="pointer-events-none absolute bottom-2 left-2 flex gap-2 font-mono text-[0.55rem] tracking-wide">
        <span
          className={`rounded px-1.5 py-0.5 ${highlight === "geographic" ? "bg-cyan/25 text-cyan" : "text-white/35"}`}
        >
          แกนหมุนโลก
        </span>
        <span
          className={`rounded px-1.5 py-0.5 ${highlight === "geomagnetic" ? "bg-purple-400/25 text-purple-300" : "text-white/35"}`}
        >
          แกนแม่เหล็ก
        </span>
      </div>
    </div>
  );
}
