import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Html } from "@react-three/drei";
import { useRef, useMemo, useState, useEffect, type MutableRefObject, type RefObject } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { getKnowledge } from "@/lib/knowledge/entries";
import { useKnowledge } from "@/components/knowledge/KnowledgeProvider";
import {
  EARTH_RADIUS,
  SAT_SCALE,
  SUN_DIR,
} from "./physics/constants";
import WebGPUCanvas from "./scene/WebGPUCanvas";
import RealisticEarth from "./scene/RealisticEarth";
import RealisticSun from "./scene/RealisticSun";
import StarSphere from "./scene/StarSphere";
import SimTimeControls from "./sim/SimTimeControls";
import { useSimulationClock } from "./sim/SimulationClock";
import {
  EARTH_SIDEREAL_OMEGA,
  GRAVITY_MEAN_MOTION,
  GRAVITY_ORBIT_A,
  GRAVITY_ORBIT_B,
  LEO500_MEAN_MOTION,
  LEO500_ORBIT_RADIUS_RE,
  equatorialOrbitPosition,
} from "./sim/orbit";
import {
  kelvinToColor,
  computeEclipseFactor,
  computeHeatFlux,
  computeRadiativeCooling,
  computeTemperatureDelta,
  emissiveIntensity,
} from "./physics/thermal";

/* ─── Dust / ambient particles ─── */

function AmbientDust({ color = "#ffffff" }: { color?: string }) {
  const ref = useRef<THREE.Points>(null);
  const { simTimeRef } = useSimulationClock();
  const positions = useMemo(() => {
    const pos = new Float32Array(60 * 3);
    for (let i = 0; i < 60; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return pos;
  }, []);

  // Illustrative ambient drift — no physical rate
  useFrame(() => {
    if (ref.current) {
      const t = simTimeRef.current * 0.02;
      ref.current.rotation.y = t;
      ref.current.rotation.x = t * 0.3;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={60} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color={color} transparent opacity={0.3} />
    </points>
  );
}

/* ─── Gravity Well — Keplerian orbit mechanics ─── */

// 3U CubeSat is 10×10×30 cm → true scale ≈ 1.57e-8 scene units, which is below
// float32 precision at r≈1.07 — the GPU cannot render it. We render at a small
// display scale instead: sub-pixel from Earth view, but a real model up close.
const EARTH_RADIUS_M = 6_371_000;
const CUBESAT_TRUE_UNIT = 0.1 / EARTH_RADIUS_M; // 10 cm in Earth radii
const SAT_DISPLAY_UNIT = 0.0004; // 1 CubeSat unit (10 cm) in scene units
const SAT_SCALE_FACTOR = Math.round(SAT_DISPLAY_UNIT / CUBESAT_TRUE_UNIT);

type GravityFocus = "earth" | "satellite";

function GravityWellScene({
  satPosRef,
}: {
  satPosRef: MutableRefObject<THREE.Vector3>;
}) {
  const satRef = useRef<THREE.Group>(null);
  const markerRef = useRef<THREE.Group>(null);
  const { simTimeRef } = useSimulationClock();

  useFrame(({ camera }) => {
    const theta = simTimeRef.current * GRAVITY_MEAN_MOTION;

    if (satRef.current) {
      const x = Math.cos(theta) * GRAVITY_ORBIT_A;
      const z = Math.sin(theta) * GRAVITY_ORBIT_B;
      satRef.current.position.set(x, 0, z);
      satPosRef.current.set(x, 0, z);
    }
    if (markerRef.current) {
      markerRef.current.visible = camera.position.distanceTo(satPosRef.current) > 0.3;
    }
  });

  return (
    <group>
      <pointLight position={[1, 2, 3]} intensity={0.4} color="#00e5ff" />
      <RealisticEarth radius={1.0} rotationSpeed={EARTH_SIDEREAL_OMEGA} />
      <RealisticSun earthRadius={1.0} />
      {/* Orbit path (ring) — real LEO altitude hugs the surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[GRAVITY_ORBIT_B - 0.004, GRAVITY_ORBIT_A + 0.004, 256]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>
      <group ref={satRef}>
        {/* 3U CubeSat (10×10×30 cm proportions) — sub-pixel at Earth view, visible up close */}
        <group>
          <mesh>
            <boxGeometry args={[SAT_DISPLAY_UNIT, SAT_DISPLAY_UNIT, SAT_DISPLAY_UNIT * 3]} />
            <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.8} />
          </mesh>
          {/* Deployed solar panels */}
          {[1, -1].map((side) => (
            <mesh key={side} position={[side * SAT_DISPLAY_UNIT * 1.55, 0, 0]}>
              <boxGeometry args={[SAT_DISPLAY_UNIT * 2, SAT_DISPLAY_UNIT * 0.04, SAT_DISPLAY_UNIT * 3]} />
              <meshStandardMaterial color="#1a3a6b" roughness={0.35} metalness={0.6} />
            </mesh>
          ))}
        </group>
        {/* Position marker — not to scale; hidden when the camera zooms in close */}
        <group ref={markerRef}>
          <mesh>
            <sphereGeometry args={[0.012, 12, 12]} />
            <meshBasicMaterial color="#00e5ff" />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.028, 12, 12]} />
            <meshBasicMaterial color="#00e5ff" transparent opacity={0.2} depthWrite={false} />
          </mesh>
        </group>
      </group>
      <AmbientDust color="#00e5ff" />
    </group>
  );
}

/** Follows focus target + yaws with orbital angle; free orbit while the user drags. */
function GravityFocusCamera({
  focus,
  satPosRef,
  controlsRef,
  userOrbitingRef,
}: {
  focus: GravityFocus;
  satPosRef: MutableRefObject<THREE.Vector3>;
  controlsRef: RefObject<OrbitControlsImpl | null>;
  userOrbitingRef: MutableRefObject<boolean>;
}) {
  const { camera } = useThree();
  const earthTarget = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const offset = useMemo(() => new THREE.Vector3(), []);
  const yawAxis = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const prevOrbitAngle = useRef<number | null>(null);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    // Satellite focus jumps straight to CubeSat scale (~10 body-lengths away).
    const desiredDist = focus === "earth" ? 3.4 : SAT_DISPLAY_UNIT * 10;
    controls.minDistance = focus === "earth" ? 2.2 : SAT_DISPLAY_UNIT * 4;
    controls.maxDistance = focus === "earth" ? 10 : 0.55;

    const target = focus === "earth" ? earthTarget : satPosRef.current;
    controls.target.copy(target);
    offset.copy(camera.position).sub(controls.target);
    if (offset.lengthSq() < 1e-8) offset.set(0, 0.4, 1);
    offset.setLength(desiredDist);
    camera.position.copy(controls.target).add(offset);
    controls.update();
    // Avoid applying a large yaw jump on the first frame after focus change
    prevOrbitAngle.current = null;
  }, [focus, camera, controlsRef, earthTarget, offset, satPosRef]);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const sat = satPosRef.current;
    const orbitAngle = Math.atan2(sat.z, sat.x);

    // Keep orbit center on the moving satellite (or Earth) without rewriting camera angle.
    const target = focus === "earth" ? earthTarget : sat;
    if (focus === "satellite") {
      const dx = target.x - controls.target.x;
      const dy = target.y - controls.target.y;
      const dz = target.z - controls.target.z;
      controls.target.copy(target);
      camera.position.x += dx;
      camera.position.y += dy;
      camera.position.z += dz;
    } else {
      controls.target.lerp(earthTarget, 0.08);
    }

    // Auto-yaw with the satellite's orbital angle (satellite focus only;
    // pause while the user is dragging). Negate so camera follows orbit direction.
    if (
      focus === "satellite" &&
      prevOrbitAngle.current !== null &&
      !userOrbitingRef.current
    ) {
      let dTheta = orbitAngle - prevOrbitAngle.current;
      if (dTheta > Math.PI) dTheta -= Math.PI * 2;
      if (dTheta < -Math.PI) dTheta += Math.PI * 2;

      if (Math.abs(dTheta) > 1e-8) {
        offset.copy(camera.position).sub(controls.target);
        offset.applyAxisAngle(yawAxis, -dTheta);
        camera.position.copy(controls.target).add(offset);
        controls.update();
      }
    }
    prevOrbitAngle.current = orbitAngle;
  });

  return null;
}

/** Snap OrbitControls back to Earth when the lesson scene changes (shared canvas). */
function SceneCameraReset({
  sceneType,
  controlsRef,
}: {
  sceneType: SceneType;
  controlsRef: RefObject<OrbitControlsImpl | null>;
}) {
  const { camera } = useThree();

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    controls.target.set(0, 0, 0);
    camera.position.set(0, 1.5, 4);
    camera.near = 0.1;
    camera.updateProjectionMatrix();

    if (sceneType === "gravity-well") {
      controls.minDistance = 2.2;
      controls.maxDistance = 10;
    } else {
      controls.minDistance = 3;
      controls.maxDistance = 15;
    }
    controls.update();
  }, [sceneType, camera, controlsRef]);

  return null;
}

/* ─── Magnet — Earth's dipole magnetic field ─── */

const MAGNET_EARTH_R = 0.7;
/** McIlwain L-shells (equatorial crossing in Earth radii) — 4 nested layers. */
const MAGNET_L_SHELLS = [1.4, 1.9, 2.5, 3.2] as const;
const MAGNET_AZIMUTHS = 8;
const MAGNET_SAMPLES = 64;

const EARTH_AXIAL_TILT = 23.44; // rotation axis vs orbital plane
const MAGNETIC_AXIS_OFFSET = 11; // dipole axis vs rotation axis (~11° real)

/** Thin axis line along Y with an arrow cone marking the north end. */
function AxisLine({
  length,
  color,
  opacity = 0.55,
  knowledgeId,
}: {
  length: number;
  color: string;
  opacity?: number;
  knowledgeId?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const { openKnowledge } = useKnowledge();
  const entry = knowledgeId ? getKnowledge(knowledgeId) : undefined;

  return (
    <group
      onPointerOver={(e) => {
        e.stopPropagation();
        if (entry) {
          setHovered(true);
          document.body.style.cursor = "pointer";
        }
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (knowledgeId) openKnowledge(knowledgeId);
      }}
    >
      <mesh>
        <cylinderGeometry args={[0.005, 0.005, length, 8]} />
        <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
      </mesh>
      <mesh position={[0, length / 2, 0]}>
        <coneGeometry args={[0.025, 0.08, 12]} />
        <meshBasicMaterial color={color} transparent opacity={opacity + 0.2} depthWrite={false} />
      </mesh>
      {/* Invisible thicker hit target — lines are too thin to hover reliably */}
      <mesh>
        <cylinderGeometry args={[0.06, 0.06, length, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {entry && hovered && (
        <Html position={[0, length / 2 + 0.14, 0]} center style={{ pointerEvents: "none" }}>
          <div className="whitespace-nowrap rounded-md border border-white/15 bg-black/85 px-2.5 py-1 font-section-thai text-[0.72rem] text-white/90 shadow-lg backdrop-blur-sm">
            {entry.title}{" "}
            <span className="font-mono text-[0.62rem] text-white/55">({entry.english})</span>
          </div>
        </Html>
      )}
    </group>
  );
}

function MagnetScene() {
  const spinRef = useRef<THREE.Group>(null);
  const localAxis = useRef(new THREE.Vector3(0, 1, 0));
  const { simDeltaRef } = useSimulationClock();

  // Dipole field line: r(θ) = L · Rₑ · sin²(θ), θ = magnetic colatitude
  // Footprints where the line meets Earth's surface: sin(θ_foot) = √(1/L)
  const fieldLines = useMemo(() => {
    const lines: { pts: THREE.Vector3[]; shell: number }[] = [];

    for (let s = 0; s < MAGNET_L_SHELLS.length; s++) {
      const L = MAGNET_L_SHELLS[s];
      const thetaFoot = Math.asin(Math.sqrt(1 / L)); // colatitude at surface

      for (let a = 0; a < MAGNET_AZIMUTHS; a++) {
        const azim = (a / MAGNET_AZIMUTHS) * Math.PI * 2;
        const pts: THREE.Vector3[] = [];

        for (let i = 0; i <= MAGNET_SAMPLES; i++) {
          const t = i / MAGNET_SAMPLES;
          const theta = thetaFoot + t * (Math.PI - 2 * thetaFoot);
          const sinT = Math.sin(theta);
          const r = L * MAGNET_EARTH_R * sinT * sinT;
          pts.push(
            new THREE.Vector3(
              r * sinT * Math.cos(azim),
              r * Math.cos(theta),
              r * sinT * Math.sin(azim),
            ),
          );
        }
        lines.push({ pts, shell: s });
      }
    }
    return lines;
  }, []);

  // Earth + magnetic field co-rotate around the geographic axis (sidereal rate)
  useFrame(() => {
    spinRef.current?.rotateOnAxis(localAxis.current, simDeltaRef.current * EARTH_SIDEREAL_OMEGA);
  });

  return (
    <group>
      {/* Sun fixed in world space — night/day terminator stays consistent */}
      <RealisticSun earthRadius={MAGNET_EARTH_R} lightIntensity={2} />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#a78bfa" />

      {/*
        Geographic frame: local Y = Earth's rotation axis (tilted 23.44°).
        Earth + magnetic dipole spin together around this axis.
      */}
      <group rotation={[0, 0, THREE.MathUtils.degToRad(EARTH_AXIAL_TILT)]}>
        {/* Rotation axis stays fixed (spinning around itself is invisible) */}
        <AxisLine
          length={MAGNET_EARTH_R * 3.2}
          color="#4db2ff"
          opacity={0.4}
          knowledgeId="geographic-axis"
        />

        <group ref={spinRef}>
          <RealisticEarth radius={MAGNET_EARTH_R} axialTiltDeg={0} rotationSpeed={0} />

          {/* Magnetic dipole locked to Earth, offset ~11° from rotation axis */}
          <group rotation={[0, 0, THREE.MathUtils.degToRad(MAGNETIC_AXIS_OFFSET)]}>
            <AxisLine
              length={MAGNET_EARTH_R * 3.6}
              color="#c084fc"
              opacity={0.5}
              knowledgeId="geomagnetic-axis"
            />
            {fieldLines.map(({ pts, shell }, i) => (
              <mesh key={i}>
                <tubeGeometry
                  args={[new THREE.CatmullRomCurve3(pts), MAGNET_SAMPLES, 0.006 + shell * 0.001, 6, false]}
                />
                <meshBasicMaterial
                  color="#a78bfa"
                  transparent
                  opacity={0.12 - shell * 0.02}
                  depthWrite={false}
                />
              </mesh>
            ))}
            <mesh position={[0, MAGNET_EARTH_R + 0.03, 0]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshBasicMaterial color="#c084fc" transparent opacity={0.5} />
            </mesh>
            <mesh position={[0, -(MAGNET_EARTH_R + 0.03), 0]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshBasicMaterial color="#c084fc" transparent opacity={0.5} />
            </mesh>
          </group>
        </group>
      </group>

      <AmbientDust color="#a78bfa" />
    </group>
  );
}

/* ─── Thermal — Physically accurate thermal simulation ─── */
/* Physics constants & logic extracted to physics/constants.ts & physics/thermal.ts */

function ThermalScene() {
  const satRef = useRef<THREE.Group>(null);
  const satBodyRef = useRef<THREE.Mesh>(null);
  const satPanelRef = useRef<THREE.Mesh>(null);
  const satPanel2Ref = useRef<THREE.Mesh>(null);
  const { simTimeRef, simDeltaRef } = useSimulationClock();

  const sunDir = SUN_DIR;
  const tempRef = useRef(290);
  const satPos = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const { x, z, theta } = equatorialOrbitPosition(
      simTimeRef.current,
      LEO500_ORBIT_RADIUS_RE,
      LEO500_MEAN_MOTION,
    );

    if (satRef.current) {
      satRef.current.position.set(x, 0, z);
      satRef.current.rotation.y = theta + Math.PI / 2;
    }

    satPos.set(x, 0, z);
    const eclipseFactor = computeEclipseFactor(satPos, sunDir);

    // Integrate thermal inertia with scaled sim delta (substeps for high timeScale)
    let remaining = simDeltaRef.current;
    const maxStep = 0.05;
    while (remaining > 0) {
      const dt = Math.min(remaining, maxStep);
      remaining -= dt;

      const { Qsolar, Qalbedo, QIR } = computeHeatFlux(satPos, sunDir, eclipseFactor);
      const Qin = Qsolar + Qalbedo + QIR;
      const T = tempRef.current;
      const Qout = computeRadiativeCooling(T);
      const dT = computeTemperatureDelta(Qin, Qout, dt);
      tempRef.current = THREE.MathUtils.clamp(tempRef.current + dT, 100, 500);
    }

    if (satBodyRef.current) {
      const mat = satBodyRef.current.material as THREE.MeshStandardMaterial;
      const color = kelvinToColor(tempRef.current);
      mat.color.copy(color);
      mat.emissive.copy(color);
      mat.emissiveIntensity = emissiveIntensity(tempRef.current, 0.8);
    }
    if (satPanelRef.current) {
      const mat = satPanelRef.current.material as THREE.MeshStandardMaterial;
      const color = kelvinToColor(tempRef.current);
      mat.emissive.copy(color);
      mat.emissiveIntensity = emissiveIntensity(tempRef.current, 0.4);
    }
    if (satPanel2Ref.current) {
      const mat = satPanel2Ref.current.material as THREE.MeshStandardMaterial;
      const color = kelvinToColor(tempRef.current);
      mat.emissive.copy(color);
      mat.emissiveIntensity = emissiveIntensity(tempRef.current, 0.4);
    }
  });

  return (
    <group>
      <RealisticSun earthRadius={EARTH_RADIUS} lightIntensity={5} lightColor="#ffddaa" castShadow />
      <RealisticEarth radius={EARTH_RADIUS} rotationSpeed={EARTH_SIDEREAL_OMEGA} />

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[LEO500_ORBIT_RADIUS_RE - 0.004, LEO500_ORBIT_RADIUS_RE + 0.004, 80]} />
        <meshBasicMaterial color="#fff" transparent opacity={0.06} side={THREE.DoubleSide} />
      </mesh>

      {/* Satellite */}
      <group ref={satRef}>
        {/* Body — bus */}
        <mesh ref={satBodyRef} castShadow>
          <boxGeometry args={[SAT_SCALE * 0.8, SAT_SCALE * 0.8, SAT_SCALE * 1.0]} />
          <meshStandardMaterial color="#888" roughness={0.3} metalness={0.7} />
        </mesh>
        {/* Solar panels — ชิดตัวยาน */}
        <mesh ref={satPanelRef} position={[0, SAT_SCALE * 1.2, 0]} castShadow>
          <boxGeometry args={[SAT_SCALE * 4, SAT_SCALE * 0.12, SAT_SCALE * 1.2]} />
          <meshStandardMaterial color="#1a3a5c" roughness={0.3} metalness={0.6} side={THREE.DoubleSide} />
        </mesh>
        <mesh ref={satPanel2Ref} position={[0, -SAT_SCALE * 1.2, 0]} castShadow>
          <boxGeometry args={[SAT_SCALE * 4, SAT_SCALE * 0.12, SAT_SCALE * 1.2]} />
          <meshStandardMaterial color="#1a3a5c" roughness={0.3} metalness={0.6} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <AmbientDust color="#fbbf24" />
    </group>
  );
}

/* ─── Radiation — Van Allen belts & energetic particles ─── */

function RadiationScene() {
  const innerRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const particleRef = useRef<THREE.Points>(null);
  const earthSpinRef = useRef<THREE.Group>(null);
  const localAxis = useRef(new THREE.Vector3(0, 1, 0));
  const { simTimeRef, simDeltaRef } = useSimulationClock();

  const positions = useMemo(() => {
    const pos = new Float32Array(400 * 3);
    for (let i = 0; i < 400; i++) {
      const r = 1.2 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      // Flatten along Y (doughnut-shaped belts)
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi) * 0.4;
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return pos;
  }, []);

  // Belt drift + particle motion are illustrative (no species/energy model)
  useFrame(() => {
    const t = simTimeRef.current;
    const dt = simDeltaRef.current;
    if (innerRef.current) innerRef.current.rotation.y = t * 0.05;
    if (outerRef.current) outerRef.current.rotation.y = t * 0.03;
    earthSpinRef.current?.rotateOnAxis(localAxis.current, dt * EARTH_SIDEREAL_OMEGA);
    if (particleRef.current) {
      const arr = particleRef.current.geometry.attributes.position.array as Float32Array;
      const step = 0.015 * Math.sqrt(Math.max(dt, 0));
      for (let i = 0; i < 400; i++) {
        arr[i * 3]     += (Math.random() - 0.5) * step;
        arr[i * 3 + 1] += (Math.random() - 0.5) * step;
        arr[i * 3 + 2] += (Math.random() - 0.5) * step;
        const dist = Math.sqrt(arr[i*3]**2 + arr[i*3+1]**2 + arr[i*3+2]**2);
        if (dist > 3.5 || dist < 0.3) {
          const nr = 1.2 + Math.random() * 2.5;
          const nt = Math.random() * Math.PI * 2;
          const np = Math.acos(2 * Math.random() - 1);
          arr[i*3]     = nr * Math.sin(np) * Math.cos(nt);
          arr[i*3 + 1] = nr * Math.cos(np) * 0.4;
          arr[i*3 + 2] = nr * Math.sin(np) * Math.sin(nt);
        }
      }
      particleRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      <pointLight position={[2, 3, 2]} intensity={0.4} color="#ef4444" />
      <group ref={earthSpinRef}>
        <RealisticEarth radius={0.5} rotationSpeed={0} />
      </group>
      <RealisticSun earthRadius={0.5} lightIntensity={2} />
      {/* Inner Van Allen belt (~1-2 Rₑ) */}
      <mesh ref={innerRef} rotation={[0.2, 0, 0]}>
        <torusGeometry args={[1.2, 0.06, 16, 48]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.05} />
      </mesh>
      {/* Outer Van Allen belt (~3-5 Rₑ) */}
      <mesh ref={outerRef} rotation={[-0.15, 0.3, 0.1]}>
        <torusGeometry args={[2.5, 0.1, 16, 64]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.04} />
      </mesh>
      {/* Trapped energetic particles */}
      <points ref={particleRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} count={400} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.04} color="#ef4444" transparent opacity={0.25} sizeAttenuation />
      </points>
      <AmbientDust color="#ef4444" />
    </group>
  );
}

/* ─── Vacuum — Atmospheric drag & orbital decay ─── */

/** Illustrative atmospheric drag — decay rate is accelerated for demo, not a full drag model. */
const VACUUM_DECAY_RATE = 0.0003; // scene units per sim-second at r≈2 Rₑ

function VacuumScene() {
  const particlesRef = useRef<THREE.Points>(null);
  const earthSpinRef = useRef<THREE.Group>(null);
  const localAxis = useRef(new THREE.Vector3(0, 1, 0));
  const { simDeltaRef } = useSimulationClock();

  const positions = useMemo(() => {
    const pos = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 1.5 + Math.random() * 2;
      pos[i * 3]     = Math.cos(angle) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      pos[i * 3 + 2] = Math.sin(angle) * r * 0.7;
    }
    return pos;
  }, []);

  useFrame(() => {
    const dt = simDeltaRef.current;
    earthSpinRef.current?.rotateOnAxis(localAxis.current, dt * EARTH_SIDEREAL_OMEGA);
    if (particlesRef.current) {
      const arr = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 200; i++) {
        const idx = i * 3;
        const angle = Math.atan2(arr[idx + 2], arr[idx]);
        const r = Math.sqrt(arr[idx] ** 2 + arr[idx + 2] ** 2);
        // Angular motion at LEO rate + illustrative inward drag
        const newAngle = angle + dt * LEO500_MEAN_MOTION;
        if (r > 0.5) {
          const drag = VACUUM_DECAY_RATE * (1 + 0.5 / (r * r)) * dt;
          const newR = r - drag;
          arr[idx]     = Math.cos(newAngle) * newR;
          arr[idx + 2] = Math.sin(newAngle) * newR;
        } else {
          const newStartAngle = Math.random() * Math.PI * 2;
          arr[idx]     = Math.cos(newStartAngle) * 3;
          arr[idx + 2] = Math.sin(newStartAngle) * 2;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      <hemisphereLight args={["#fff", "#000", 0.1]} />
      <group ref={earthSpinRef}>
        <RealisticEarth radius={0.4} rotationSpeed={0} />
      </group>
      <RealisticSun earthRadius={0.4} lightIntensity={2} />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.95, 2.05, 64]} />
        <meshBasicMaterial color="#fff" transparent opacity={0.03} side={THREE.DoubleSide} />
      </mesh>
      {/* Orbiting particles spiraling inward due to drag */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} count={200} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.025} color="#fff" transparent opacity={0.08} sizeAttenuation />
      </points>
      <AmbientDust color="#fff" />
    </group>
  );
}



/* ─── Main ─── */

type SceneType = "gravity-well" | "magnet" | "thermal" | "radiation" | "vacuum" | "orbit-sim";

/**
 * Single persistent WebGPU canvas — only the inner scene component swaps
 * when `type` changes, so the renderer/context is reused across lessons.
 */
export default function LessonScene({ type }: { type: SceneType }) {
  const [focus, setFocus] = useState<GravityFocus>("earth");
  const satPosRef = useRef(new THREE.Vector3(GRAVITY_ORBIT_A, 0, 0));
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const userOrbitingRef = useRef(false);

  useEffect(() => {
    setFocus("earth");
    userOrbitingRef.current = false;
  }, [type]);

  const isGravity = type === "gravity-well";

  return (
    <div className="relative h-full w-full">
      <WebGPUCanvas shadows>
        <PerspectiveCamera
          makeDefault
          position={[0, 1.5, 4]}
          fov={40}
          near={isGravity && focus === "satellite" ? 0.0002 : 0.1}
          far={60000}
        />
        <color attach="background" args={["#030812"]} />

        <StarSphere />

        {type !== "thermal" && <ambientLight intensity={0.12} color="#4466aa" />}

        <SceneCameraReset sceneType={type} controlsRef={controlsRef} />

        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableZoom={true}
          minDistance={isGravity ? (focus === "earth" ? 2.2 : SAT_DISPLAY_UNIT * 4) : 3}
          maxDistance={isGravity ? (focus === "earth" ? 10 : 0.55) : 15}
          dampingFactor={0.08}
          onStart={() => {
            if (isGravity) userOrbitingRef.current = true;
          }}
          onEnd={() => {
            userOrbitingRef.current = false;
          }}
        />

        {isGravity && (
          <GravityFocusCamera
            focus={focus}
            satPosRef={satPosRef}
            controlsRef={controlsRef}
            userOrbitingRef={userOrbitingRef}
          />
        )}

        {type === "gravity-well" && <GravityWellScene satPosRef={satPosRef} />}
        {type === "magnet" && <MagnetScene />}
        {type === "thermal" && <ThermalScene />}
        {type === "radiation" && <RadiationScene />}
        {type === "vacuum" && <VacuumScene />}
      </WebGPUCanvas>

      <SimTimeControls
        footnote={
          isGravity ? (
            <>
              ขนาดดาวเทียมขยายประมาณ{" "}
              <span className="text-text/75">{SAT_SCALE_FACTOR.toLocaleString("th-TH")}</span>{" "}
              เท่า เพื่อให้มองเห็นได้ (วงโคจรยังเป็นสเกลจริง)
            </>
          ) : type === "radiation" ? (
            <>การเคลื่อนที่ของอนุภาคและเข็มขัดรังสีเป็นภาพประกอบ ไม่ใช่อัตราจริงของแต่ละชนิดอนุภาค</>
          ) : type === "vacuum" ? (
            <>อัตราการตกวงโคจรถูกเร่งเพื่อการสาธิต ไม่ใช่แบบจำลอง drag ที่ใช้ Cd และความหนาแน่นบรรยากาศจริง</>
          ) : undefined
        }
        trailing={
          isGravity ? (
            <>
              {(
                [
                  { id: "earth" as const, label: "โลก" },
                  { id: "satellite" as const, label: "ดาวเทียม" },
                ] as const
              ).map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFocus(id)}
                  className={`cursor-pointer rounded-md border px-3 py-1.5 font-section-thai text-[0.72rem] transition ${
                    focus === id
                      ? "border-cyan/50 bg-cyan/15 text-cyan"
                      : "border-white/15 bg-black/50 text-text/70 backdrop-blur-sm hover:border-white/25 hover:text-text"
                  }`}
                >
                  {label}
                </button>
              ))}
            </>
          ) : undefined
        }
      />
    </div>
  );
}
