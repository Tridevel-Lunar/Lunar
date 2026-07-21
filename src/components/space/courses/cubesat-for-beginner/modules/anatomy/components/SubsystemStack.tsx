import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import FlatSatPcbBoard from "./FlatSatPcbBoard";
import {
  ASSEMBLED_POSES,
  BOARD_PART_IDS,
  FLATSAT_POSES,
  PART_COLORS,
  easeInOutCubic,
  lerp,
  lerpVec3,
  type BoardPartId,
} from "../lib/layout";
import type { AnatomyPartId } from "../lib/parts";
import { getPart } from "../lib/parts";

/** Module card that looks like a real daughterboard on FlatSat. */
function ModuleCard({
  id,
  unfold,
  active,
  onSelect,
  flat2d,
}: {
  id: BoardPartId;
  unfold: React.MutableRefObject<number>;
  active: boolean;
  onSelect: (id: AnatomyPartId) => void;
  flat2d: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const color = PART_COLORS[id];
  const part = getPart(id);

  const pcbMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#1a3d2e",
        roughness: 0.65,
        metalness: 0.12,
        emissive: new THREE.Color(color),
        emissiveIntensity: active ? 0.22 : 0.04,
      }),
    [color, active],
  );

  useFrame(() => {
    if (!group.current) return;
    const t = easeInOutCubic(unfold.current);
    const a = ASSEMBLED_POSES[id];
    const b = FLATSAT_POSES[id];

    // Spread from center: early t keeps near origin, then eases to pad
    const fromCenter: [number, number, number] = [
      a.position[0] * (1 - t) * 0.15,
      lerp(a.position[1], 0.05, t),
      a.position[2] * (1 - t) * 0.15,
    ];
    const pos = lerpVec3(fromCenter, b.position, t);
    group.current.position.fromArray(pos);
    group.current.rotation.set(
      a.rotation[0] + (b.rotation[0] - a.rotation[0]) * t,
      a.rotation[1] + (b.rotation[1] - a.rotation[1]) * t,
      a.rotation[2] + (b.rotation[2] - a.rotation[2]) * t,
    );
    // Assembled = chunky stack; flat = thin module PCB
    const assembledScale = a.scale;
    const flatScale = b.scale;
    group.current.scale.fromArray(lerpVec3(assembledScale, flatScale, t));
    pcbMat.emissiveIntensity = active ? 0.28 : lerp(0.04, 0.08, t);
  });

  return (
    <group
      ref={group}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      {/* Module PCB body */}
      <mesh material={pcbMat}>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>

      {/* Silkscreen stripe */}
      <mesh position={[0, 0.52, -0.35]} scale={[0.92, 0.04, 0.12]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* IC / MCU block */}
      <mesh position={[0, 0.6, 0.05]} scale={[0.42, 0.18, 0.38]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#0b1220"
          metalness={0.55}
          roughness={0.35}
          emissive={color}
          emissiveIntensity={active ? 0.2 : 0.05}
        />
      </mesh>

      {/* Connector pins toward center bus */}
      {([-0.35, -0.2, -0.05, 0.1, 0.25] as const).map((z, i) => (
        <mesh key={i} position={[0.48, 0.55, z]} scale={[0.08, 0.08, 0.06]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#d4d4d8" metalness={0.8} roughness={0.25} />
        </mesh>
      ))}

      {flat2d && (
        <Text
          position={[0, 0.7, -0.35]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.14}
          color="#f8fafc"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#020617"
        >
          {part.labelEn}
        </Text>
      )}
    </group>
  );
}

/** Assembled-only stack look when not flat (uses same ModuleCard poses). */
function AssembledGhostRails({
  unfold,
  active,
  onSelect,
}: {
  unfold: React.MutableRefObject<number>;
  active: boolean;
  onSelect: () => void;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!group.current) return;
    const t = easeInOutCubic(unfold.current);
    group.current.visible = t < 0.85;
    group.current.scale.setScalar(Math.max(0, 1 - t * 1.15));
  });

  return (
    <group
      ref={group}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {(
        [
          [0.48, 0, 0.48],
          [-0.48, 0, 0.48],
          [0.48, 0, -0.48],
          [-0.48, 0, -0.48],
        ] as const
      ).map((p, i) => (
        <mesh key={i} position={[...p]}>
          <boxGeometry args={[0.06, 1.05, 0.06]} />
          <meshStandardMaterial
            color={active ? "#cbd5e1" : "#64748b"}
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function SubsystemStack({
  unfold,
  activePart,
  onSelectPart,
  flat2d = false,
}: {
  unfold: React.MutableRefObject<number>;
  activePart: AnatomyPartId;
  onSelectPart: (id: AnatomyPartId) => void;
  flat2d?: boolean;
}) {
  return (
    <group>
      <FlatSatPcbBoard unfold={unfold} />
      <AssembledGhostRails
        unfold={unfold}
        active={activePart === "structure"}
        onSelect={() => onSelectPart("structure")}
      />
      {BOARD_PART_IDS.map((id) => (
        <ModuleCard
          key={id}
          id={id}
          unfold={unfold}
          active={activePart === id}
          onSelect={onSelectPart}
          flat2d={flat2d}
        />
      ))}
    </group>
  );
}
