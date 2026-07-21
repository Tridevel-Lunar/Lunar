import { Suspense, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Html, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import WebGPUCanvas from "../../physics/scene/WebGPUCanvas";
import {
  formatDimensionsWxLxH,
  realDimensionsMForMission,
  realLengthMForMission,
} from "../lib/satelliteModels";
import { BAND_META, INITIAL_ORBITS, type OrbitBand, type SatelliteDefinition } from "../lib/types";
import { CanvasLoadOverlay } from "./OverviewSceneLoader";
import MuseumCameraRig from "./MuseumCameraRig";
import SatelliteMesh, {
  SatelliteMeshErrorBoundary,
} from "./SatelliteMesh";

/** Largest craft (TDRS ~17.4 m) maps to this many scene units — all others scale linearly. */
const MUSEUM_REF_LENGTH_M = 17.4;
const MUSEUM_REF_SCENE = 3.6;
/** Uniform scene units per real meter — true relative scale. */
export const MUSEUM_SCENE_PER_M = MUSEUM_REF_SCENE / MUSEUM_REF_LENGTH_M;

/** Edge-to-edge gap between adjacent pedestals (~4 m real). */
const PEDESTAL_EDGE_GAP = 4 * MUSEUM_SCENE_PER_M;

function museumDisplaySize(missionType: SatelliteDefinition["missionType"]): number {
  return realLengthMForMission(missionType) * MUSEUM_SCENE_PER_M;
}

function pedestalHalfBottom(missionType: SatelliteDefinition["missionType"]): number {
  return Math.max(0.38, museumDisplaySize(missionType) * 0.55);
}

function computeGalleryLayout(satellites: SatelliteDefinition[]) {
  const positions: number[] = [];

  for (let i = 0; i < satellites.length; i++) {
    const B = pedestalHalfBottom(satellites[i].missionType);
    if (i === 0) {
      positions.push(B);
    } else {
      const prevB = pedestalHalfBottom(satellites[i - 1].missionType);
      positions.push(positions[i - 1]! + prevB + PEDESTAL_EDGE_GAP + B);
    }
  }

  if (positions.length === 0) {
    return { positions, hallLength: 10, hallCenter: 5 };
  }

  const last = satellites.length - 1;
  const lastB = pedestalHalfBottom(satellites[last].missionType);
  const hallLength = positions[last]! + lastB + 2.5;
  return { positions, hallLength, hallCenter: hallLength / 2 };
}

function orbitBandForSatellite(sat: SatelliteDefinition): OrbitBand {
  const orbit = INITIAL_ORBITS.find((o) => o.id === sat.orbitId);
  return orbit?.band ?? "LEO";
}

function bandColorForSatellite(sat: SatelliteDefinition): string {
  return BAND_META[orbitBandForSatellite(sat)].defaultColor;
}

function orbitLabelForSatellite(sat: SatelliteDefinition): string {
  const meta = BAND_META[orbitBandForSatellite(sat)];
  return `${meta.label} · ${meta.subtitleTh}`;
}

const PLAQUE_TEX_WIDTH = 512;
const PLAQUE_TEX_HEIGHT = 280;
const PLAQUE_ASPECT = PLAQUE_TEX_WIDTH / PLAQUE_TEX_HEIGHT;

function computePlaqueSize(faceHalf: number, pedestalH: number) {
  const maxW = faceHalf * 1.62;
  const maxH = pedestalH * 0.62;
  let plaqueW = maxW;
  let plaqueH = plaqueW / PLAQUE_ASPECT;
  if (plaqueH > maxH) {
    plaqueH = maxH;
    plaqueW = plaqueH * PLAQUE_ASPECT;
  }
  return { plaqueW, plaqueH };
}

function createSidePlaqueTexture(
  title: string,
  orbitLabel: string,
  sizeLabel: string,
  selected: boolean,
): THREE.CanvasTexture {
  const w = PLAQUE_TEX_WIDTH;
  const h = PLAQUE_TEX_HEIGHT;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = selected ? "#3a3a42" : "#2a2a32";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = selected ? "#8888aa" : "#666678";
  ctx.lineWidth = 8;
  ctx.strokeRect(10, 10, w - 20, h - 20);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = selected ? "#f0f0f8" : "#e8e8ee";
  ctx.font = "600 34px ui-monospace, monospace";
  const maxW = w - 48;
  let line = title;
  if (ctx.measureText(line).width > maxW) {
    while (line.length > 3 && ctx.measureText(`${line}…`).width > maxW) {
      line = line.slice(0, -1);
    }
    line = `${line}…`;
  }
  ctx.fillText(line, w / 2, h * 0.26);

  ctx.fillStyle = selected ? "#b8c8f0" : "#98a8d0";
  ctx.font = "600 26px ui-monospace, monospace";
  ctx.fillText(orbitLabel, w / 2, h * 0.52);

  ctx.fillStyle = selected ? "#c8c8d8" : "#a8a8b8";
  ctx.font = "600 24px ui-monospace, monospace";
  ctx.fillText(sizeLabel, w / 2, h * 0.78);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

/** CC0 — Poly Haven "Blue Plaster Wall" https://polyhaven.com/a/blue_plaster_wall */
const PEDESTAL_TEXTURE_BASE = "/textures/blue_plaster_wall";

function cloneTexturedMaps(
  map: THREE.Texture,
  normalMap: THREE.Texture,
  roughnessMap: THREE.Texture,
  repeatX: number,
  repeatY: number,
) {
  const configure = (tex: THREE.Texture) => {
    const clone = tex.clone();
    clone.wrapS = THREE.RepeatWrapping;
    clone.wrapT = THREE.RepeatWrapping;
    clone.repeat.set(repeatX, repeatY);
    clone.anisotropy = 8;
    clone.needsUpdate = true;
    return clone;
  };

  const clonedMap = configure(map);
  clonedMap.colorSpace = THREE.SRGBColorSpace;

  return {
    map: clonedMap,
    normalMap: configure(normalMap),
    roughnessMap: configure(roughnessMap),
  };
}

/** Square truncated pyramid (frustum) plinth with labels on all four sides. */
function Pedestal({
  selected,
  halfBottom,
  title,
  orbitLabel,
  sizeLabel,
}: {
  selected: boolean;
  halfBottom: number;
  title: string;
  orbitLabel: string;
  sizeLabel: string;
}) {
  const B = Math.max(0.35, halfBottom);
  const T = B * 0.62;
  const H = Math.max(0.42, B * 0.55);
  /** Face tilt from vertical (top narrower → faces lean inward). */
  const slant = Math.atan2(B - T, H);
  const plaqueT = 0.48;
  const plaqueY = H * plaqueT;
  /** Horizontal distance to face at plaque height. */
  const faceHalf = B + (T - B) * plaqueT;

  const { map, normalMap, roughnessMap } = useTexture({
    map: `${PEDESTAL_TEXTURE_BASE}/blue_plaster_wall_diff_2k.jpg`,
    normalMap: `${PEDESTAL_TEXTURE_BASE}/blue_plaster_wall_nor_gl_2k.jpg`,
    roughnessMap: `${PEDESTAL_TEXTURE_BASE}/blue_plaster_wall_rough_2k.jpg`,
  });

  const bodyMaps = useMemo(
    () => cloneTexturedMaps(map, normalMap, roughnessMap, B * 3.8, H * 5.5),
    [map, normalMap, roughnessMap, B, H],
  );

  const topMaps = useMemo(
    () => cloneTexturedMaps(map, normalMap, roughnessMap, T * 6, T * 6),
    [map, normalMap, roughnessMap, T],
  );

  const plaqueMap = useMemo(
    () => createSidePlaqueTexture(title, orbitLabel, sizeLabel, selected),
    [title, orbitLabel, sizeLabel, selected],
  );

  const faceYaws = [0, Math.PI / 2, Math.PI, -Math.PI / 2] as const;
  const { plaqueW, plaqueH } = computePlaqueSize(faceHalf, H);

  return (
    <group>
      <mesh
        position={[0, H / 2, 0]}
        rotation={[0, Math.PI / 4, 0]}
        receiveShadow
        castShadow
      >
        <cylinderGeometry args={[T * Math.SQRT2, B * Math.SQRT2, H, 4]} />
        <meshStandardMaterial
          map={bodyMaps.map}
          normalMap={bodyMaps.normalMap}
          roughnessMap={bodyMaps.roughnessMap}
          color={selected ? "#f0f4ff" : "#ffffff"}
          roughness={1}
          metalness={0.02}
          emissive={selected ? "#ffe0b8" : "#000000"}
          emissiveIntensity={selected ? 0.12 : 0}
        />
      </mesh>
      <mesh position={[0, H + 0.02, 0]} receiveShadow castShadow>
        <boxGeometry args={[T * 2.05, 0.04, T * 2.05]} />
        <meshStandardMaterial
          map={topMaps.map}
          normalMap={topMaps.normalMap}
          roughnessMap={topMaps.roughnessMap}
          color={selected ? "#f0f4ff" : "#ffffff"}
          roughness={1}
          metalness={0.02}
        />
      </mesh>

      {/* Yaw first, then local pitch — same slant on every face, flush to surface */}
      {faceYaws.map((yaw) => (
        <group key={yaw} rotation={[0, yaw, 0]}>
          <mesh
            position={[0, plaqueY, faceHalf + 0.008]}
            rotation={[-slant, 0, 0]}
          >
            <planeGeometry args={[plaqueW, plaqueH]} />
            <meshBasicMaterial
              map={plaqueMap}
              toneMapped={false}
              side={THREE.FrontSide}
              polygonOffset
              polygonOffsetFactor={-2}
              polygonOffsetUnits={-2}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Exhibit({
  sat,
  x,
  selected,
  onSelect,
}: {
  sat: SatelliteDefinition;
  x: number;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const spin = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const size = museumDisplaySize(sat.missionType);
  const halfBottom = pedestalHalfBottom(sat.missionType);
  const pedestalH = Math.max(0.42, halfBottom * 0.55);
  const modelY = pedestalH + 0.06 + size * 0.5;
  const sizeLabel = formatDimensionsWxLxH(
    realDimensionsMForMission(sat.missionType),
  );
  const orbitLabel = orbitLabelForSatellite(sat);
  const bandColor = bandColorForSatellite(sat);
  const active = selected || hovered;

  useFrame((_, dt) => {
    if (spin.current) spin.current.rotation.y += dt * 0.28;
  });

  return (
    <group position={[x, 0, 0]}>
      <Pedestal
        selected={active}
        halfBottom={halfBottom}
        title={sat.name}
        orbitLabel={orbitLabel}
        sizeLabel={sizeLabel}
      />
      <group
        position={[0, modelY, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(sat.id);
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
        <mesh visible={false}>
          <sphereGeometry args={[Math.max(0.25, size * 0.65), 12, 12]} />
        </mesh>
        <group ref={spin}>
          <SatelliteMeshErrorBoundary
            fallback={
              <mesh>
                <boxGeometry args={[size, size * 0.5, size * 0.5]} />
                <meshStandardMaterial color={bandColor} />
              </mesh>
            }
          >
            <Suspense fallback={null}>
              <SatelliteMesh
                missionType={sat.missionType}
                selected={selected}
                hovered={hovered}
                accentColor={bandColor}
                displaySize={size}
                showBeacon={false}
                applyNadirTilt={false}
              />
            </Suspense>
          </SatelliteMeshErrorBoundary>
        </group>
      </group>

      <pointLight
        position={[0, Math.max(2.2, size + 1.2), 1.2]}
        intensity={active ? 1.1 : 0.45}
        distance={Math.max(5, size * 3)}
        color={bandColor}
        decay={2}
      />
    </group>
  );
}

/** CC0 — Poly Haven "Laminate Floor 02" https://polyhaven.com/a/laminate_floor_02 */
const FLOOR_TEXTURE_BASE = "/textures/laminate_floor_02";

function HallFloor({ length, centerX }: { length: number; centerX: number }) {
  const floorW = length + 10;
  const floorD = 12;
  const repeatX = floorW / 1.6;
  const repeatY = floorD / 1.6;

  const { map, normalMap, roughnessMap } = useTexture({
    map: `${FLOOR_TEXTURE_BASE}/laminate_floor_02_diff_2k.jpg`,
    normalMap: `${FLOOR_TEXTURE_BASE}/laminate_floor_02_nor_gl_2k.jpg`,
    roughnessMap: `${FLOOR_TEXTURE_BASE}/laminate_floor_02_rough_2k.jpg`,
  });

  useLayoutEffect(() => {
    for (const tex of [map, normalMap, roughnessMap]) {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(repeatX, repeatY);
      tex.anisotropy = 8;
      tex.needsUpdate = true;
    }
    map.colorSpace = THREE.SRGBColorSpace;
  }, [map, normalMap, roughnessMap, repeatX, repeatY]);

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[centerX, -0.02, 0.35]}
      receiveShadow
    >
      <planeGeometry args={[floorW, floorD]} />
      <meshStandardMaterial
        map={map}
        normalMap={normalMap}
        roughnessMap={roughnessMap}
        color="#ffffff"
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
}

function CeilingSpot({ x }: { x: number }) {
  const lightRef = useRef<THREE.SpotLight>(null);
  const targetRef = useRef<THREE.Object3D>(null);

  useLayoutEffect(() => {
    if (lightRef.current && targetRef.current) {
      lightRef.current.target = targetRef.current;
    }
  }, []);

  return (
    <group>
      <object3D ref={targetRef} position={[x, 0.05, 0.25]} />
      <group position={[x, 5.2, 0.4]}>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.2, 0.26, 0.1, 16]} />
          <meshStandardMaterial
            color="#d8d8dc"
            metalness={0.55}
            roughness={0.25}
          />
        </mesh>
        <mesh position={[0, -0.02, 0]}>
          <cylinderGeometry args={[0.12, 0.16, 0.06, 16]} />
          <meshStandardMaterial
            color="#ffe8c8"
            emissive="#ffb870"
            emissiveIntensity={2.2}
            toneMapped={false}
          />
        </mesh>
        <spotLight
          ref={lightRef}
          position={[0, 0, 0]}
          angle={0.62}
          penumbra={0.45}
          intensity={6.2}
          distance={18}
          decay={1.4}
          color="#ffb870"
        />
        <pointLight intensity={0.65} distance={7} decay={2} color="#ffd090" />
      </group>
    </group>
  );
}

function OverheadLights({ positions }: { positions: number[] }) {
  const hallCenter = positions.length
    ? (positions[0]! + positions[positions.length - 1]!) / 2
    : 0;

  return (
    <group>
      <ambientLight intensity={0.28} color="#fff0e0" />
      <hemisphereLight args={["#ffe8cc", "#1a1410", 0.38]} />
      {positions.map((x) => (
        <CeilingSpot key={x} x={x} />
      ))}
      <directionalLight
        position={[hallCenter, 12, 3]}
        intensity={0.42}
        color="#ffd8a8"
      />
    </group>
  );
}

interface MuseumSceneProps {
  satellites: SatelliteDefinition[];
  focusSatelliteId: string | null;
  onSelectSatellite: (id: string) => void;
}

export default function MuseumScene({
  satellites,
  focusSatelliteId,
  onSelectSatellite,
}: MuseumSceneProps) {
  const layout = useMemo(() => computeGalleryLayout(satellites), [satellites]);

  const focusIndex = useMemo(() => {
    if (!focusSatelliteId) return -1;
    const i = satellites.findIndex((s) => s.id === focusSatelliteId);
    return i >= 0 ? i : -1;
  }, [satellites, focusSatelliteId]);

  const focusX =
    focusIndex >= 0
      ? (layout.positions[focusIndex] ?? layout.hallCenter)
      : layout.hallCenter;
  const focusY = useMemo(() => {
    const sat =
      focusIndex >= 0 ? satellites[focusIndex] : undefined;
    if (!sat) return 0.7;
    const size = museumDisplaySize(sat.missionType);
    const halfBottom = pedestalHalfBottom(sat.missionType);
    const pedestalH = Math.max(0.42, halfBottom * 0.55);
    return pedestalH + 0.06 + size * 0.5;
  }, [satellites, focusIndex]);

  return (
    <WebGPUCanvas
      style={{ width: "100%", height: "100%", display: "block" }}
      camera={{ position: [0, 1.55, 5.8], fov: 55, near: 0.1, far: 200 }}
    >
      <color attach="background" args={["#050508"]} />
      <fog attach="fog" args={["#050508", 14, 42]} />

      <CanvasLoadOverlay variant="museum" />

      <OverheadLights positions={layout.positions} />

      <HallFloor length={layout.hallLength} centerX={layout.hallCenter} />

      {satellites.map((sat, i) => (
        <Exhibit
          key={sat.id}
          sat={sat}
          x={layout.positions[i] ?? 0}
          selected={sat.id === focusSatelliteId}
          onSelect={onSelectSatellite}
        />
      ))}

      <MuseumCameraRig focusX={focusX} focusY={focusY} focusZ={0} />
    </WebGPUCanvas>
  );
}
