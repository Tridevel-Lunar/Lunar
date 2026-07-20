import { ThreeEvent } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { useMemo, useState } from "react";
import { OrbitDefinition } from "@/features/orbit-overview/lib/types";
import { sampleOrbitDefinition } from "@/features/orbit-overview/lib/orbitMath";

interface OrbitPathProps {
  orbit: OrbitDefinition;
  visible: boolean;
  highlighted: boolean;
  selected: boolean;
  onSelect: (orbitId: string) => void;
}

export default function OrbitPath({
  orbit,
  visible,
  highlighted,
  selected,
  onSelect,
}: OrbitPathProps) {
  const [hovered, setHovered] = useState(false);

  const points = useMemo(
    () =>
      sampleOrbitDefinition(orbit, 256).map(
        (p) => p.toArray() as [number, number, number]
      ),
    [orbit]
  );

  if (!visible) return null;

  const active = highlighted || selected || hovered;

  return (
    <group>
      <Line
        points={points}
        color={orbit.color}
        lineWidth={active ? 3.5 : 2}
        transparent
        opacity={active ? 0.35 : 0.12}
        depthWrite={false}
      />
      <Line
        points={points}
        color={orbit.color}
        lineWidth={active ? 1.8 : 1}
        transparent
        opacity={active ? 0.95 : 0.55}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onSelect(orbit.id);
        }}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      />
    </group>
  );
}
