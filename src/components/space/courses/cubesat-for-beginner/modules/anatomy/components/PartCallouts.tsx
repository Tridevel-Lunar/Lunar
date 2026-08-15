import { useMemo } from "react";
import { Html, Line } from "@react-three/drei";
import * as THREE from "three";

import { parseKnowledgeText } from "@/lib/knowledge/parseKnowledgeText";

import {
  ASSEMBLED_POSES,
  FLATSAT_POSES,
  PART_COLORS,
  type BoardPartId,
} from "../lib/layout";
import {
  REQUIRED_MEET_PARTS,
  getPart,
  type AnatomyPartId,
} from "../lib/parts";

/** Label offsets from part center (assembled 3D vs FlatSat top-down). */
const LABEL_OFFSET_ASSEMBLED: Record<BoardPartId, [number, number, number]> = {
  eps: [-1.55, -0.15, 0.35],
  obc: [1.55, 0.05, 0.2],
  comm: [-1.45, 0.35, -0.25],
  payload: [1.35, 0.65, -0.15],
};

const LABEL_OFFSET_FLAT: Record<BoardPartId, [number, number, number]> = {
  eps: [-0.15, 0.35, 1.35],
  obc: [0.15, 0.35, 1.45],
  comm: [0.15, 0.35, -1.35],
  payload: [0, 0.35, 0.95],
};

/** Strip [[id|label]] markers — callout cards stay plain text (no nested buttons). */
function plainLessonText(text: string): string {
  return parseKnowledgeText(text)
    .map((p) => (p.type === "text" ? p.value : (p.label ?? p.id)))
    .join("");
}

function partAnchor(id: BoardPartId, flat: boolean): THREE.Vector3 {
  const pose = flat ? FLATSAT_POSES[id] : ASSEMBLED_POSES[id];
  return new THREE.Vector3(...pose.position);
}

function labelWorld(id: BoardPartId, flat: boolean): THREE.Vector3 {
  const anchor = partAnchor(id, flat);
  const off = flat ? LABEL_OFFSET_FLAT[id] : LABEL_OFFSET_ASSEMBLED[id];
  return anchor.clone().add(new THREE.Vector3(...off));
}

function PartCallout({
  id,
  flat,
  active,
  visited,
  onSelect,
}: {
  id: BoardPartId;
  flat: boolean;
  active: boolean;
  visited: boolean;
  onSelect: (id: AnatomyPartId) => void;
}) {
  const part = getPart(id);
  const color = PART_COLORS[id];
  const from = useMemo(() => partAnchor(id, flat), [id, flat]);
  const to = useMemo(() => labelWorld(id, flat), [id, flat]);
  const mid = useMemo(
    () =>
      from
        .clone()
        .lerp(to, 0.55)
        .add(new THREE.Vector3(0, flat ? 0.08 : 0.12, 0)),
    [from, to, flat],
  );
  const points = useMemo(() => [from, mid, to], [from, mid, to]);
  const detailLines = part.details.slice(0, 2);

  return (
    <group>
      <Line
        points={points}
        color={color}
        lineWidth={active ? 2.2 : 1.2}
        transparent
        opacity={active ? 0.95 : 0.45}
      />
      <mesh position={from}>
        <sphereGeometry args={[active ? 0.045 : 0.032, 12, 12]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={active ? 1 : 0.7}
          depthTest={false}
        />
      </mesh>

      <Html
        position={to}
        center
        transform={false}
        zIndexRange={active ? [18, 12] : [10, 1]}
        style={{ pointerEvents: "auto" }}
      >
        <div
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(id);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onSelect(id);
            }
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className={`box-border w-[200px] cursor-pointer rounded-xl border text-left shadow-lg backdrop-blur-md outline-none transition ${
            active
              ? "border-white/25 bg-[rgba(8,12,22,0.94)] px-3 py-2.5"
              : "border-white/12 bg-[rgba(8,12,22,0.82)] px-3 py-2 hover:border-white/25"
          }`}
          style={{
            borderColor: active ? `${color}88` : undefined,
            boxShadow: active ? `0 0 28px ${color}33` : undefined,
          }}
        >
          <div className="flex items-center gap-1.5">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: color, boxShadow: `0 0 8px ${color}` }}
            />
            <span className="font-mono text-[0.58rem] tracking-wider text-white/50">
              {part.labelEn}
            </span>
            {visited && (
              <span className="font-mono ml-auto text-[0.55rem] text-emerald-300/90">
                ✓
              </span>
            )}
          </div>
          <p className="font-section-thai mt-0.5 text-[0.78rem] font-medium text-white/90">
            {part.label}
          </p>

          {active && (
            <div className="mt-2 border-t border-white/10 pt-2">
              <p className="font-section-thai text-[0.72rem] leading-relaxed text-white/70">
                {plainLessonText(part.summary)}
              </p>
              <ul className="mt-2 space-y-1.5">
                {detailLines.map((line) => (
                  <li
                    key={line}
                    className="font-section-thai flex gap-1.5 text-[0.68rem] leading-snug text-white/55"
                  >
                    <span
                      className="mt-1.5 h-1 w-1 shrink-0 rounded-full"
                      style={{ background: color }}
                    />
                    <span>{plainLessonText(line)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

export default function PartCallouts({
  flat,
  activePart,
  visitedParts,
  onSelectPart,
}: {
  flat: boolean;
  activePart: AnatomyPartId;
  visitedParts: Set<AnatomyPartId>;
  onSelectPart: (id: AnatomyPartId) => void;
}) {
  // Draw active last so the expanded card stacks above siblings.
  const order = [
    ...REQUIRED_MEET_PARTS.filter((id) => id !== activePart),
    ...REQUIRED_MEET_PARTS.filter((id) => id === activePart),
  ];

  return (
    <group>
      {order.map((id) => (
        <PartCallout
          key={id}
          id={id}
          flat={flat}
          active={activePart === id}
          visited={visitedParts.has(id)}
          onSelect={onSelectPart}
        />
      ))}
    </group>
  );
}
