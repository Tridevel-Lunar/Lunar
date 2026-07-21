import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, Text } from "@react-three/drei";
import * as THREE from "three";
import {
  FLATSAT_POSES,
  type BoardPartId,
} from "../lib/layout";
import {
  DATA_FLOWS,
  FLOW_KIND_META,
  type DataFlowEdge,
} from "../lib/lesson";

function nodePos(id: BoardPartId): THREE.Vector3 {
  const p = FLATSAT_POSES[id].position;
  return new THREE.Vector3(p[0], 0.08, p[2]);
}

function FlowParticle({
  edge,
  active,
  paused,
  speed = 0.55,
}: {
  edge: DataFlowEdge;
  active: boolean;
  paused: boolean;
  speed?: number;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const t = useRef(Math.random());
  const color = FLOW_KIND_META[edge.kind].color;
  const from = useMemo(() => nodePos(edge.from), [edge.from]);
  const to = useMemo(() => nodePos(edge.to), [edge.to]);

  useFrame((_, dt) => {
    if (!mesh.current) return;
    mesh.current.visible = active;
    if (!active) return;
    if (!paused) {
      t.current = (t.current + dt * speed) % 1;
    }
    mesh.current.position.lerpVectors(from, to, t.current);
  });

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[0.06, 12, 12]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1.25}
        toneMapped={false}
      />
    </mesh>
  );
}

function FlowEdge({
  edge,
  highlight,
  paused,
  onSelect,
}: {
  edge: DataFlowEdge;
  highlight: boolean;
  paused: boolean;
  onSelect: (id: string) => void;
}) {
  const color = FLOW_KIND_META[edge.kind].color;
  const meta = FLOW_KIND_META[edge.kind];
  const points = useMemo(() => {
    const a = nodePos(edge.from);
    const b = nodePos(edge.to);
    const mid = a.clone().lerp(b, 0.5);
    mid.y += 0.1;
    return [a, mid, b];
  }, [edge.from, edge.to]);

  // Invisible fat hit area so learners can click the link
  const hitPoints = useMemo(() => [points[0], points[2]], [points]);

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        onSelect(edge.id);
      }}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <Line
        points={points}
        color={color}
        lineWidth={highlight ? 3 : 1.15}
        transparent
        opacity={highlight ? 0.98 : 0.32}
      />
      {/* Click target */}
      <Line
        points={hitPoints}
        color={color}
        lineWidth={12}
        transparent
        opacity={0.001}
      />
      <FlowParticle
        edge={edge}
        active={highlight}
        paused={paused}
        speed={highlight ? 0.65 : 0.3}
      />
      {highlight && (
        <>
          <Text
            position={points[1].clone().add(new THREE.Vector3(0, 0.16, 0))}
            fontSize={0.13}
            color="#f8fafc"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="#020617"
          >
            {`${meta.icon} ${edge.labelTh}`}
          </Text>
          <Text
            position={points[1].clone().add(new THREE.Vector3(0, 0.02, 0))}
            fontSize={0.09}
            color={color}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.006}
            outlineColor="#020617"
          >
            {edge.label}
          </Text>
        </>
      )}
    </group>
  );
}

export default function DataFlowLinks({
  activeFlowId,
  showAllDimmed,
  paused = true,
  onSelectFlow,
}: {
  activeFlowId: string | null;
  showAllDimmed: boolean;
  paused?: boolean;
  onSelectFlow?: (id: string) => void;
}) {
  return (
    <group>
      {DATA_FLOWS.map((edge) => {
        const on = edge.id === activeFlowId;
        if (!showAllDimmed && !on) return null;
        return (
          <FlowEdge
            key={edge.id}
            edge={edge}
            highlight={on}
            paused={paused}
            onSelect={(id) => onSelectFlow?.(id)}
          />
        );
      })}
    </group>
  );
}
