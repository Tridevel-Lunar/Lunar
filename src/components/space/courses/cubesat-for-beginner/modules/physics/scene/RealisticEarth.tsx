import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three/webgpu";
import {
  step,
  normalWorldGeometry,
  output,
  texture,
  vec3,
  vec4,
  normalize,
  positionWorld,
  bumpMap,
  cameraPosition,
  color,
  uniform,
  mix,
  uv,
  max,
} from "three/tsl";

import { loadEarthTextures } from "./textures";
import { useSimulationClockOptional } from "../sim/SimulationClock";

type RealisticEarthProps = {
  /** Earth radius in scene units (default 1). */
  radius?: number;
  position?: [number, number, number];
  /** World-space direction from Earth toward the Sun (default -X, matches SUN_DIR). */
  sunDirection?: [number, number, number];
  /** Self-rotation speed in rad/s. */
  rotationSpeed?: number;
  axialTiltDeg?: number;
  atmosphere?: boolean;
};

/**
 * Photorealistic Earth (day/night textures, clouds, atmospheric scattering)
 * built with TSL node materials — requires the WebGPU renderer (WebGPUCanvas).
 */
export default function RealisticEarth({
  radius = 1,
  position = [0, 0, 0],
  sunDirection = [-1, 0, 0],
  rotationSpeed = 0.025,
  axialTiltDeg = 23.44,
  atmosphere = true,
}: RealisticEarthProps) {
  const spinRef = useRef<THREE.Group>(null);
  const localAxis = useRef(new THREE.Vector3(0, 1, 0));
  const simClock = useSimulationClockOptional();
  const [sx, sy, sz] = sunDirection;

  useEffect(() => {
    const group = spinRef.current;
    if (!group) return;

    const { dayTex, nightTex, bumpTex } = loadEarthTextures();

    // ── TSL shared nodes ──
    const viewDir = positionWorld.sub(cameraPosition).normalize();
    const fresnel = viewDir.dot(normalWorldGeometry).abs().oneMinus().toVar();
    const sunDir = normalize(vec3(sx, sy, sz));
    const sunOri = normalWorldGeometry.dot(sunDir).toVar();
    const atmoDay = uniform(color("#4db2ff"));
    const atmoTwilight = uniform(color("#bc490b"));
    const roughLow = uniform(1);
    const roughHigh = uniform(0.35);
    const atmoColor = mix(atmoTwilight, atmoDay, sunOri.smoothstep(-0.25, 0.75));
    const cloudStr = texture(bumpTex, uv()).b.smoothstep(0.2, 1);

    // ── Globe: day/night blend + clouds + bump ──
    const gMat = new THREE.MeshStandardNodeMaterial();
    gMat.colorNode = mix(texture(dayTex), vec3(1), cloudStr.mul(2));
    gMat.roughnessNode = max(texture(bumpTex).g, step(0.01, cloudStr)).remap(0, 1, roughLow, roughHigh);
    gMat.normalNode = bumpMap(max(texture(bumpTex).r, cloudStr));
    const night = texture(nightTex);
    const dayStr = sunOri.smoothstep(-0.25, 0.5);
    const atmoDS = sunOri.smoothstep(-0.5, 1);
    const atmoMix = atmoDS.mul(fresnel.pow(2)).clamp(0, 1);
    let fo = mix(night.rgb, output.rgb, dayStr);
    fo = mix(fo, atmoColor, atmoMix);
    gMat.outputNode = vec4(fo, output.a);

    const geo = new THREE.SphereGeometry(radius, 64, 64);
    const globe = new THREE.Mesh(geo, gMat);
    globe.receiveShadow = true;
    globe.castShadow = true;
    group.add(globe);

    // ── Atmosphere rim (back-side fresnel shell) ──
    let atmo: THREE.Mesh | null = null;
    let aMat: THREE.MeshBasicNodeMaterial | null = null;
    if (atmosphere) {
      aMat = new THREE.MeshBasicNodeMaterial({ side: THREE.BackSide, transparent: true });
      let alpha = fresnel.remap(0.73, 1, 1, 0).pow(3);
      alpha = alpha.mul(sunOri.smoothstep(-0.5, 1));
      aMat.outputNode = vec4(atmoColor, alpha);
      atmo = new THREE.Mesh(geo.clone(), aMat);
      atmo.scale.setScalar(1.04);
      group.add(atmo);
    }

    return () => {
      group.remove(globe);
      geo.dispose();
      gMat.dispose();
      if (atmo && aMat) {
        group.remove(atmo);
        atmo.geometry.dispose();
        aMat.dispose();
      }
    };
  }, [radius, atmosphere, sx, sy, sz]);

  // Spin around local Y (= geographic axis after parent axial-tilt is applied)
  useFrame((_, delta) => {
    const dt = simClock ? simClock.simDeltaRef.current : delta;
    if (rotationSpeed !== 0) {
      spinRef.current?.rotateOnAxis(localAxis.current, dt * rotationSpeed);
    }
  });

  return (
    <group position={position} rotation={[0, 0, THREE.MathUtils.degToRad(axialTiltDeg)]}>
      <group ref={spinRef} />
    </group>
  );
}
