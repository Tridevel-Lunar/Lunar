import { ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import { OrbitCurve, altitudeToSceneRadius } from "../lib/orbitMath";
import { OrbitDefinition } from "../lib/types";

interface OrbitPathProps {
  orbit: OrbitDefinition;
  visible: boolean;
  highlighted: boolean;
  selected: boolean;
  onSelect: (orbitId: string) => void;
}

/** Approx. world units for N CSS pixels at `distance` (perspective). */
function worldSizeForPixels(
  camera: THREE.Camera,
  distance: number,
  pixels: number,
  viewportHeight: number,
): number {
  const persp = camera as THREE.PerspectiveCamera;
  const fov = persp.isPerspectiveCamera
    ? THREE.MathUtils.degToRad(persp.fov)
    : Math.PI / 4;
  const worldPerPixel =
    (2 * Math.tan(fov / 2) * distance) / Math.max(viewportHeight, 1);
  return worldPerPixel * pixels;
}

function buildOrbitTube(orbit: OrbitDefinition, radius: number): THREE.TubeGeometry {
  const curve = new OrbitCurve(orbit);
  return new THREE.TubeGeometry(curve, 192, radius, 5, true);
}

type TubeBundle = {
  glow: THREE.TubeGeometry;
  core: THREE.TubeGeometry;
  hit: THREE.TubeGeometry;
};

function disposeBundle(bundle: TubeBundle | null) {
  if (!bundle) return;
  bundle.glow.dispose();
  bundle.core.dispose();
  bundle.hit.dispose();
}

export default function OrbitPath({
  orbit,
  visible,
  highlighted,
  selected,
  onSelect,
}: OrbitPathProps) {
  const { camera, size } = useThree();
  const [hovered, setHovered] = useState(false);
  const active = highlighted || selected || hovered;
  const activeRef = useRef(active);
  activeRef.current = active;
  const visibleRef = useRef(visible);
  visibleRef.current = visible;

  const glowMesh = useRef<THREE.Mesh>(null);
  const coreMesh = useRef<THREE.Mesh>(null);
  const hitMesh = useRef<THREE.Mesh>(null);
  const bundleRef = useRef<TubeBundle | null>(null);
  const lastKeyRef = useRef(-1);
  const orbitRef = useRef(orbit);
  orbitRef.current = orbit;

  const orbitR = useMemo(() => {
    if (orbit.band === "HEO" && orbit.perigeeKm != null && orbit.apogeeKm != null) {
      return altitudeToSceneRadius((orbit.perigeeKm + orbit.apogeeKm) / 2);
    }
    return altitudeToSceneRadius(orbit.altitudeKm);
  }, [orbit]);
  const orbitRRef = useRef(orbitR);
  orbitRRef.current = orbitR;

  // Force rebuild when orbit changes or Path layer is turned back on
  useEffect(() => {
    lastKeyRef.current = -1;
  }, [orbit, visible]);

  useEffect(() => {
    return () => {
      disposeBundle(bundleRef.current);
      bundleRef.current = null;
    };
  }, []);

  useFrame(() => {
    if (!visibleRef.current) return;

    const o = orbitRef.current;
    const isActive = activeRef.current;
    const camDist = camera.position.length();
    const ringDist = Math.max(0.35, Math.abs(camDist - orbitRRef.current));

    const corePx = isActive ? 1.35 : 0.95;
    const glowPx = isActive ? 3.2 : 2.2;
    const hitPx = 12;

    // Screen-constant thickness, with a soft world clamp:
    // — floor: still visible when very close
    // — ceiling: readable from Earth overview, but not a fat sausage on CubeSats
    const coreR = THREE.MathUtils.clamp(
      worldSizeForPixels(camera, ringDist, corePx, size.height),
      0.00035,
      0.014,
    );
    const glowR = THREE.MathUtils.clamp(
      worldSizeForPixels(camera, ringDist, glowPx, size.height),
      0.0007,
      0.028,
    );
    const hitR = THREE.MathUtils.clamp(
      worldSizeForPixels(camera, ringDist, hitPx, size.height),
      0.002,
      0.05,
    );

    const key = Math.round(coreR * 2500) * 10 + (isActive ? 1 : 0);
    if (key === lastKeyRef.current && bundleRef.current) return;
    lastKeyRef.current = key;

    const prev = bundleRef.current;
    const next: TubeBundle = {
      glow: buildOrbitTube(o, Math.max(glowR, coreR * 1.9)),
      core: buildOrbitTube(o, coreR),
      hit: buildOrbitTube(o, Math.max(hitR, coreR * 4)),
    };
    bundleRef.current = next;

    if (glowMesh.current) glowMesh.current.geometry = next.glow;
    if (coreMesh.current) coreMesh.current.geometry = next.core;
    if (hitMesh.current) hitMesh.current.geometry = next.hit;

    disposeBundle(prev);
  });

  const color = orbit.color;

  function handleSelect(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation();
    onSelect(orbit.id);
  }

  function handlePointerOver(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
  }

  function handlePointerOut() {
    setHovered(false);
    document.body.style.cursor = "auto";
  }

  // Keep meshes mounted — toggling Path only flips visibility so geometry
  // rebuild still works when the layer comes back on.
  return (
    <group visible={visible}>
      <mesh ref={glowMesh} renderOrder={0}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={active ? 0.28 : 0.14}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={coreMesh} renderOrder={1}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={active ? 0.9 : 0.55}
          depthWrite={false}
        />
      </mesh>

      <mesh
        ref={hitMesh}
        renderOrder={0}
        onClick={handleSelect}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}
