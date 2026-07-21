import { useMemo } from "react";
import * as THREE from "three";
import type { AnatomyPartId } from "../lib/parts";

/**
 * Procedural 1U structure stand-in (rails + panels).
 * Replace with GrabCAD GLB when available at /models/cubesat/structure-1u.glb
 */
const U = 1.0;
const RAIL = 0.045;
const PANEL = 0.02;

function Rail({
  position,
  color,
}: {
  position: [number, number, number];
  color: string;
}) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={[RAIL, U * 1.1, RAIL]} />
      <meshStandardMaterial color={color} metalness={0.75} roughness={0.28} />
    </mesh>
  );
}

export default function StructureFrame({
  activePart,
}: {
  activePart: AnatomyPartId;
}) {
  const highlight = activePart === "structure";
  const railColor = highlight ? "#e2e8f0" : "#64748b";
  const panelColor = highlight ? "#94a3b8" : "#334155";
  const panelOpacity = highlight ? 0.55 : 0.22;

  const panelMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: panelColor,
        metalness: 0.35,
        roughness: 0.55,
        transparent: true,
        opacity: panelOpacity,
        side: THREE.DoubleSide,
      }),
    [panelColor, panelOpacity],
  );

  const half = U / 2 - RAIL / 2;

  return (
    <group>
      <Rail position={[half, 0, half]} color={railColor} />
      <Rail position={[-half, 0, half]} color={railColor} />
      <Rail position={[half, 0, -half]} color={railColor} />
      <Rail position={[-half, 0, -half]} color={railColor} />

      {/* Side panels */}
      {[
        [0, 0, half + PANEL] as [number, number, number],
        [0, 0, -(half + PANEL)] as [number, number, number],
        [half + PANEL, 0, 0] as [number, number, number],
        [-(half + PANEL), 0, 0] as [number, number, number],
      ].map((pos, i) => (
        <mesh key={i} position={pos} material={panelMat}>
          <boxGeometry
            args={
              i < 2
                ? [U * 0.88, U * 0.95, PANEL]
                : [PANEL, U * 0.95, U * 0.88]
            }
          />
        </mesh>
      ))}

      {/* Top / bottom */}
      <mesh position={[0, half * 1.05, 0]} material={panelMat}>
        <boxGeometry args={[U * 0.88, PANEL, U * 0.88]} />
      </mesh>
      <mesh position={[0, -half * 1.05, 0]} material={panelMat}>
        <boxGeometry args={[U * 0.88, PANEL, U * 0.88]} />
      </mesh>
    </group>
  );
}
