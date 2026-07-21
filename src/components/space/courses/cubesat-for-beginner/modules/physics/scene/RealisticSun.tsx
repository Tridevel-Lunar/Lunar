import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three/webgpu";
import { mix, texture, uv, vec3 } from "three/tsl";

import { SUN_DIST_RENDER, SUN_RADIUS_RENDER } from "../physics/constants";
import { loadSunTexture } from "./textures";

type RealisticSunProps = {
  /** Scales real-proportion distance (23,481 Rₑ) and size (109.2 Rₑ). */
  earthRadius?: number;
  /** Direction from origin toward the Sun (default -X, matches SUN_DIR). */
  direction?: [number, number, number];
  lightIntensity?: number;
  lightColor?: string;
  castShadow?: boolean;
  corona?: boolean;
};

/**
 * Textured Sun at real Sun:Earth proportions + the DirectionalLight that
 * illuminates the scene. Pairs with RealisticEarth (same direction vector
 * drives the day/night terminator).
 */
export default function RealisticSun({
  earthRadius = 1,
  direction = [-1, 0, 0],
  lightIntensity = 2.5,
  lightColor = "#ffffff",
  castShadow = false,
  corona = true,
}: RealisticSunProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [dx, dy, dz] = direction;

  const sunRadius = SUN_RADIUS_RENDER * earthRadius;
  const sunDist = SUN_DIST_RENDER * earthRadius;

  const sunPosition = useMemo(
    () => new THREE.Vector3(dx, dy, dz).normalize().multiplyScalar(sunDist).toArray() as [number, number, number],
    [dx, dy, dz, sunDist],
  );

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    const disposables: { geometry: THREE.BufferGeometry; material: THREE.Material }[] = [];

    // Textured core, brightened toward white
    const sMat = new THREE.MeshBasicNodeMaterial();
    sMat.colorNode = mix(texture(loadSunTexture(), uv()).mul(1.8), vec3(1), 0.4);
    const core = new THREE.Mesh(new THREE.SphereGeometry(sunRadius, 32, 32), sMat);
    group.add(core);
    disposables.push(core);

    if (corona) {
      for (const [scale, opacity] of [
        [1.3, 0.08],
        [2.5, 0.05],
        [4.0, 0.02],
      ] as const) {
        const mat = new THREE.MeshBasicMaterial({
          color: "#fbbf24",
          transparent: true,
          opacity,
          depthWrite: false,
        });
        const shell = new THREE.Mesh(new THREE.SphereGeometry(sunRadius * scale, 32, 32), mat);
        group.add(shell);
        disposables.push(shell);
      }
    }

    return () => {
      for (const mesh of disposables) {
        group.remove(mesh as THREE.Mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
      }
    };
  }, [sunRadius, corona]);

  return (
    <>
      <group ref={groupRef} position={sunPosition} />
      <directionalLight
        position={sunPosition}
        intensity={lightIntensity}
        color={lightColor}
        castShadow={castShadow}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-radius={4}
        shadow-camera-near={1}
        shadow-camera-far={sunDist * 2.2}
      />
    </>
  );
}
