import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Html, useGLTF } from "@react-three/drei";
import { useRef, useMemo, useState, useEffect, useCallback, type MutableRefObject, type RefObject } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { getKnowledge } from "@/lib/knowledge/entries";
import { useKnowledge } from "@/components/knowledge/KnowledgeProvider";
import { HintTooltip, TooltipProvider } from "@/components/ui/tooltip";
import {
  EARTH_RADIUS,
  PHYSICS_SAT_DISPLAY_SIZE,
  SAT_SCALE_FACTOR,
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

type GravityFocus = "earth" | "satellite";

class EllipseOrbitCurve extends THREE.Curve<THREE.Vector3> {
  private a: number;
  private b: number;

  constructor(a: number, b: number) {
    super();
    this.a = a;
    this.b = b;
  }

  getPoint(t: number, optionalTarget = new THREE.Vector3()): THREE.Vector3 {
    const theta = t * Math.PI * 2;
    return optionalTarget.set(Math.cos(theta) * this.a, 0, Math.sin(theta) * this.b);
  }
}

function OrbitPathTube({
  a,
  b,
  color,
  active = false,
  viewMode = "earth",
  boost = 1,
}: {
  a: number;
  b: number;
  color: string;
  active?: boolean;
  /** Thinner when zoomed in on the spacecraft. */
  viewMode?: GravityFocus;
  /** Emphasize the orbit for lesson visibility (world-space thickness multiplier). */
  boost?: number;
}) {
  const curve = useMemo(() => new EllipseOrbitCurve(a, b), [a, b]);
  const isClose = viewMode === "satellite";
  const glowRadius = (isClose ? 0.004 : 0.016) * boost;
  const coreRadius = (isClose ? 0.0025 : 0.010) * boost;
  const glowOpacity = active ? (isClose ? 0.16 : 0.22) : isClose ? 0.1 : 0.14;
  const coreOpacity = active ? (isClose ? 0.55 : 0.78) : isClose ? 0.38 : 0.52;

  return (
    <group>
      <mesh renderOrder={0}>
        <tubeGeometry args={[curve, 192, glowRadius, 8, true]} />
        <meshBasicMaterial color={color} transparent opacity={glowOpacity} depthWrite={false} />
      </mesh>
      <mesh renderOrder={1}>
        <tubeGeometry args={[curve, 192, coreRadius, 8, true]} />
        <meshBasicMaterial color={color} transparent opacity={coreOpacity} depthWrite={false} />
      </mesh>
    </group>
  );
}

const TESS_PATH = "/models/sats/tess.glb";
useGLTF.preload(TESS_PATH);

function normalizeImportedModel(
  source: THREE.Object3D,
  targetLongestAxis: number,
  initialColor: string,
): THREE.Object3D {
  const clone = source.clone(true);

  // Replace materials so we have consistent emissive/color control.
  clone.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;

    mesh.material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(initialColor),
      emissive: new THREE.Color(initialColor),
      emissiveIntensity: 0.0,
      metalness: 0.12,
      roughness: 0.45,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1,
    });
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.frustumCulled = false;
  });

  clone.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(clone);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);

  if (Number.isFinite(maxDim) && maxDim > 1e-6) {
    clone.scale.setScalar(targetLongestAxis / maxDim);
  }

  clone.updateMatrixWorld(true);
  const box2 = new THREE.Box3().setFromObject(clone);
  const center = box2.getCenter(new THREE.Vector3());
  // Keep pivot at the geometric center so lookAt/orbiting feels natural.
  clone.position.sub(center);
  clone.updateMatrixWorld(true);

  return clone;
}

function TessSatelliteModel({
  targetLongestAxis,
  initialColor,
}: {
  targetLongestAxis: number;
  initialColor: string;
}) {
  const { scene } = useGLTF(TESS_PATH);

  const model = useMemo(
    () => normalizeImportedModel(scene, targetLongestAxis, initialColor),
    [scene, targetLongestAxis, initialColor],
  );

  // Tess nadir axis is "-y" in the overview mapping, so tilt +90° so the model "bottom"
  // aligns toward the Earth radial direction after the parent group `lookAt()` faces Earth.
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <primitive object={model} />
    </group>
  );
}

function GravityWellScene({
  satPosRef,
  focus = "earth",
}: {
  satPosRef: MutableRefObject<THREE.Vector3>;
  focus?: GravityFocus;
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
      // Orient so model's nadir/bottom faces Earth (concept reused from overview).
      satRef.current.lookAt(0, 0, 0);
      satPosRef.current.set(x, 0, z);
    }
    if (markerRef.current) {
      markerRef.current.visible =
        focus === "earth" && camera.position.distanceTo(satPosRef.current) > 0.3;
    }
  });

  return (
    <group>
      <pointLight position={[1, 2, 3]} intensity={0.4} color="#00e5ff" />
      <RealisticEarth radius={1.0} rotationSpeed={EARTH_SIDEREAL_OMEGA} />
      <RealisticSun earthRadius={1.0} />
      {/* Orbit path — same “double glow/core” concept as overview. */}
      <OrbitPathTube
        a={GRAVITY_ORBIT_A}
        b={GRAVITY_ORBIT_B}
        color="#00e5ff"
        viewMode={focus}
        active={focus === "satellite"}
      />
      <group ref={satRef}>
        <TessSatelliteModel
          targetLongestAxis={PHYSICS_SAT_DISPLAY_SIZE}
          initialColor="#c0c0c0"
        />
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
    const desiredDist = focus === "earth" ? 3.4 : PHYSICS_SAT_DISPLAY_SIZE * 10;
    controls.minDistance = focus === "earth" ? 2.2 : PHYSICS_SAT_DISPLAY_SIZE * 4;
    controls.maxDistance = focus === "earth" ? 10 : PHYSICS_SAT_DISPLAY_SIZE * 16;

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
  resetKey,
}: {
  sceneType: SceneType;
  controlsRef: RefObject<OrbitControlsImpl | null>;
  resetKey: number;
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
  }, [sceneType, resetKey, camera, controlsRef]);

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

/** Dipole field line: r(θ) = L · Rₑ · sin²(θ), θ = magnetic colatitude */
function buildDipoleFieldLines(
  earthR: number,
  lShells: readonly number[],
  azimuths: number,
  samples: number,
): THREE.Vector3[][] {
  const lines: THREE.Vector3[][] = [];

  for (const L of lShells) {
    const thetaFoot = Math.asin(Math.sqrt(1 / L));

    for (let a = 0; a < azimuths; a++) {
      const azim = (a / azimuths) * Math.PI * 2;
      const pts: THREE.Vector3[] = [];

      for (let i = 0; i <= samples; i++) {
        const t = i / samples;
        const theta = thetaFoot + t * (Math.PI - 2 * thetaFoot);
        const sinT = Math.sin(theta);
        const r = L * earthR * sinT * sinT;
        pts.push(
          new THREE.Vector3(
            r * sinT * Math.cos(azim),
            r * Math.cos(theta),
            r * sinT * Math.sin(azim),
          ),
        );
      }
      lines.push(pts);
    }
  }

  return lines;
}

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

  // Dipole field lines at McIlwain L-shells (equatorial crossing in Earth radii)
  const fieldLines = useMemo(() => {
    const lines: { pts: THREE.Vector3[]; shell: number }[] = [];

    MAGNET_L_SHELLS.forEach((L, shell) => {
      for (const pts of buildDipoleFieldLines(MAGNET_EARTH_R, [L], MAGNET_AZIMUTHS, MAGNET_SAMPLES)) {
        lines.push({ pts, shell });
      }
    });

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

function ThermalScene({ resetKey }: { resetKey: number }) {
  const satRef = useRef<THREE.Group>(null);
  const { simTimeRef, simDeltaRef } = useSimulationClock();

  const sunDir = SUN_DIR;
  const tempRef = useRef(290);
  const satPos = useMemo(() => new THREE.Vector3(), []);

  // Make the satellite + orbit path readable at the default camera distance.
  const THERMAL_SAT_BOOST = 7;
  const THERMAL_ORBIT_BOOST = 1;

  useEffect(() => {
    tempRef.current = 290;
  }, [resetKey]);

  useFrame(() => {
    const { x, z } = equatorialOrbitPosition(
      simTimeRef.current,
      LEO500_ORBIT_RADIUS_RE,
      LEO500_MEAN_MOTION,
    );

    if (satRef.current) {
      satRef.current.position.set(x, 0, z);
      // Orient so model's nadir/bottom faces Earth.
      satRef.current.lookAt(0, 0, 0);
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

    const color = kelvinToColor(tempRef.current);
    const glow = emissiveIntensity(tempRef.current, 1.0);

    if (satRef.current) {
      satRef.current.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (!mesh.isMesh) return;

        const mat = mesh.material as any;
        if (mat?.color?.copy) mat.color.copy(color);
        if (mat?.emissive?.copy) mat.emissive.copy(color);
        if (typeof mat?.emissiveIntensity === "number") mat.emissiveIntensity = glow;
        if (typeof mat?.metalness === "number") mat.metalness = 0.12;
        if (typeof mat?.roughness === "number") mat.roughness = 0.45;
      });
    }
  });

  return (
    <group>
      <RealisticSun earthRadius={EARTH_RADIUS} lightIntensity={5} lightColor="#ffddaa" castShadow />
      <RealisticEarth radius={EARTH_RADIUS} rotationSpeed={EARTH_SIDEREAL_OMEGA} />

      {/* Orbit path (LEO 500km) — tube with glow/core styling. */}
      <OrbitPathTube
        a={LEO500_ORBIT_RADIUS_RE}
        b={LEO500_ORBIT_RADIUS_RE}
        color="#ffffff"
        boost={THERMAL_ORBIT_BOOST}
        active
      />

      {/* Satellite */}
      <group ref={satRef}>
        <TessSatelliteModel
          targetLongestAxis={PHYSICS_SAT_DISPLAY_SIZE * THERMAL_SAT_BOOST}
          initialColor="#1a3a5c"
        />
      </group>
      <AmbientDust color="#fbbf24" />
    </group>
  );
}

/* ─── Radiation — Van Allen belts, SEU memory flip ─── */

const MEMORY_BIT_COUNT = 16;
/** Average sim-seconds between random SEU events at 1× time scale. */
const SEU_MEAN_INTERVAL_SIM_S = 5;
const SEU_FLASH_DURATION_SIM_S = 0.85;

/** Van Allen belts — inner / outer L-shells (illustrative McIlwain values). */
const VAN_ALLEN_INNER_L = [1.3, 1.55, 1.8] as const;
const VAN_ALLEN_OUTER_L = [3.0, 3.8, 4.6] as const;
const VAN_ALLEN_AZIMUTHS = 6;
const VAN_ALLEN_SAMPLES = 56;

type VanAllenBelt = "inner" | "outer";

const VAN_ALLEN_BELT_INFO: Record<
  VanAllenBelt,
  { title: string; range: string; summary: string }
> = {
  inner: {
    title: "แถบ Van Allen ชั้นใน",
    range: "L ≈ 1–2 Rₑ",
    summary: "โซนกักอนุภาคพลังงานสูงใกล้โลก — ความเสี่ยง SEU สูงเมื่อดาวเทียมบินผ่าน",
  },
  outer: {
    title: "แถบ Van Allen ชั้นนอก",
    range: "L ≈ 3–5 Rₑ",
    summary: "โซนกักอนุภาคชั้นนอก — ดาวเทียม LEO มักบินต่ำกว่า แต่ยังได้รับผลจาก SAA",
  },
};

function VanAllenFieldLineTube({
  pts,
  radius,
  color,
  opacity,
  belt,
}: {
  pts: THREE.Vector3[];
  radius: number;
  color: string;
  opacity: number;
  belt: VanAllenBelt;
}) {
  const [hovered, setHovered] = useState(false);
  const { openKnowledge } = useKnowledge();
  const info = VAN_ALLEN_BELT_INFO[belt];
  const mid = pts[Math.floor(pts.length / 2)]!;

  return (
    <group
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        e.stopPropagation();
        openKnowledge("van-allen-belts");
      }}
    >
      <mesh>
        <tubeGeometry args={[new THREE.CatmullRomCurve3(pts), VAN_ALLEN_SAMPLES, radius, 6, false]} />
        <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
      </mesh>
      <mesh>
        <tubeGeometry
          args={[new THREE.CatmullRomCurve3(pts), VAN_ALLEN_SAMPLES, radius + 0.04, 6, false]}
        />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {hovered && (
        <Html position={[mid.x, mid.y, mid.z]} center style={{ pointerEvents: "none" }}>
          <div className="max-w-[200px] rounded-md border border-white/15 bg-black/90 px-2.5 py-1.5 font-section-thai text-[0.72rem] text-white/90 shadow-lg backdrop-blur-sm">
            <p className="font-semibold text-purple-200">{info.title}</p>
            <p className="font-mono text-[0.62rem] text-white/55">{info.range}</p>
            <p className="mt-1 text-[0.68rem] leading-snug text-white/65">{info.summary}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

function VanAllenFieldLines({ earthR }: { earthR: number }) {
  const innerLines = useMemo(
    () => buildDipoleFieldLines(earthR, VAN_ALLEN_INNER_L, VAN_ALLEN_AZIMUTHS, VAN_ALLEN_SAMPLES),
    [earthR],
  );
  const outerLines = useMemo(
    () => buildDipoleFieldLines(earthR, VAN_ALLEN_OUTER_L, VAN_ALLEN_AZIMUTHS, VAN_ALLEN_SAMPLES),
    [earthR],
  );

  return (
    <group rotation={[0, 0, THREE.MathUtils.degToRad(MAGNETIC_AXIS_OFFSET)]}>
      {innerLines.map((pts, i) => (
        <VanAllenFieldLineTube
          key={`inner-${i}`}
          pts={pts}
          radius={0.007}
          color="#c084fc"
          opacity={0.2}
          belt="inner"
        />
      ))}
      {outerLines.map((pts, i) => (
        <VanAllenFieldLineTube
          key={`outer-${i}`}
          pts={pts}
          radius={0.009}
          color="#a78bfa"
          opacity={0.13}
          belt="outer"
        />
      ))}
      <mesh position={[0, earthR + 0.025, 0]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshBasicMaterial color="#c084fc" transparent opacity={0.45} depthWrite={false} />
      </mesh>
      <mesh position={[0, -(earthR + 0.025), 0]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshBasicMaterial color="#c084fc" transparent opacity={0.45} depthWrite={false} />
      </mesh>
    </group>
  );
}

function SeuMemoryHud({
  bits,
  flashIdx,
  hitFlash,
  lastFlip,
  lastBelt,
}: {
  bits: number[];
  flashIdx: number | null;
  hitFlash: boolean;
  lastFlip: { idx: number; from: 0 | 1; to: 0 | 1 } | null;
  lastBelt: VanAllenBelt | null;
}) {
  const beltInfo = lastBelt ? VAN_ALLEN_BELT_INFO[lastBelt] : null;

  return (
    <div
      className={`w-[280px] rounded-xl border px-4 py-3 font-mono shadow-xl backdrop-blur-md transition ${
        hitFlash
          ? "border-amber-400/70 bg-black/85 shadow-[0_0_28px_rgba(251,191,36,0.55)] ring-2 ring-amber-400/50"
          : "border-white/15 bg-black/85"
      }`}
    >
      <p className="mb-2 font-mono text-[0.72rem] tracking-wider text-red-300 uppercase">SRAM · SEU Monitor</p>
      <div className="grid grid-cols-8 gap-1">
        {bits.map((bit, i) => (
          <span
            key={i}
            className={`rounded-md px-1 py-1.5 text-center text-[0.78rem] font-semibold transition ${
              flashIdx === i
                ? "bg-amber-400 text-black"
                : bit === 1
                  ? "bg-cyan/30 text-cyan"
                  : "bg-white/10 text-white/60"
            }`}
          >
            {bit}
          </span>
        ))}
      </div>
      {lastFlip && beltInfo ? (
        <p className="mt-2 font-section-thai text-[0.75rem] leading-snug text-white/70">
          บิต #{lastFlip.idx + 1} พลิก {lastFlip.from} → {lastFlip.to}
          {" · "}
          <HintTooltip
            content={
              <span className="font-section-thai block max-w-[220px] text-[0.72rem] leading-snug">
                <span className="font-semibold text-purple-200">{beltInfo.title}</span>
                <span className="mt-1 block font-mono text-[0.62rem] text-white/55">{beltInfo.range}</span>
                <span className="mt-1 block text-white/75">{beltInfo.summary}</span>
              </span>
            }
          >
            <span className="cursor-help border-b border-dotted border-purple-300/50 text-purple-200">
              {beltInfo.title}
            </span>
          </HintTooltip>
        </p>
      ) : (
        <p className="mt-2 font-section-thai text-[0.75rem] leading-snug text-white/50">
          ชี้ที่เส้นสนามเพื่อดู{" "}
          <HintTooltip content={VAN_ALLEN_BELT_INFO.inner.summary}>
            <span className="cursor-help border-b border-dotted border-purple-300/40 text-purple-200/90">
              แถบ Van Allen ชั้นใน
            </span>
          </HintTooltip>{" "}
          /{" "}
          <HintTooltip content={VAN_ALLEN_BELT_INFO.outer.summary}>
            <span className="cursor-help border-b border-dotted border-purple-300/40 text-purple-200/70">
              ชั้นนอก
            </span>
          </HintTooltip>
        </p>
      )}
    </div>
  );
}

function useSeuMemory(active: boolean) {
  const { simDeltaRef } = useSimulationClock();
  const [memoryBits, setMemoryBits] = useState(() =>
    Array.from({ length: MEMORY_BIT_COUNT }, () => (Math.random() > 0.5 ? 1 : 0)),
  );
  const [flashBit, setFlashBit] = useState<number | null>(null);
  const [hitFlash, setHitFlash] = useState(false);
  const [lastFlip, setLastFlip] = useState<{ idx: number; from: 0 | 1; to: 0 | 1 } | null>(null);
  const [lastBelt, setLastBelt] = useState<VanAllenBelt | null>(null);
  const flashTimerRef = useRef(0);
  const nextSeuInRef = useRef(SEU_MEAN_INTERVAL_SIM_S * (0.4 + Math.random()));

  const scheduleNextSeu = useCallback(() => {
    nextSeuInRef.current = SEU_MEAN_INTERVAL_SIM_S * (0.35 + Math.random() * 1.3);
  }, []);

  const triggerSeu = useCallback(() => {
    setMemoryBits((prev) => {
      const idx = Math.floor(Math.random() * prev.length);
      const from = prev[idx] as 0 | 1;
      const to = (from === 0 ? 1 : 0) as 0 | 1;
      const next = [...prev];
      next[idx] = to;
      setFlashBit(idx);
      setHitFlash(true);
      setLastFlip({ idx, from, to });
      setLastBelt(Math.random() < 0.55 ? "inner" : "outer");
      flashTimerRef.current = SEU_FLASH_DURATION_SIM_S;
      scheduleNextSeu();
      return next;
    });
  }, [scheduleNextSeu]);

  const reset = useCallback(() => {
    setMemoryBits(Array.from({ length: MEMORY_BIT_COUNT }, () => (Math.random() > 0.5 ? 1 : 0)));
    setFlashBit(null);
    setHitFlash(false);
    setLastFlip(null);
    setLastBelt(null);
    flashTimerRef.current = 0;
    scheduleNextSeu();
  }, [scheduleNextSeu]);

  useEffect(() => {
    if (!active) return;

    let raf = 0;
    const tick = () => {
      const dt = simDeltaRef.current;
      if (dt > 0) {
        if (flashTimerRef.current > 0) {
          flashTimerRef.current = Math.max(0, flashTimerRef.current - dt);
          if (flashTimerRef.current === 0) {
            setFlashBit(null);
            setHitFlash(false);
          }
        }

        nextSeuInRef.current -= dt;
        if (nextSeuInRef.current <= 0) {
          triggerSeu();
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, simDeltaRef, triggerSeu]);

  return { memoryBits, flashBit, hitFlash, lastFlip, lastBelt, reset };
}

function RadiationScene() {
  const satRef = useRef<THREE.Group>(null);
  const earthSpinRef = useRef<THREE.Group>(null);
  const localAxis = useRef(new THREE.Vector3(0, 1, 0));
  const { simTimeRef, simDeltaRef } = useSimulationClock();

  useFrame(() => {
    const { x, z } = equatorialOrbitPosition(
      simTimeRef.current,
      LEO500_ORBIT_RADIUS_RE,
      LEO500_MEAN_MOTION,
    );

    if (satRef.current) {
      satRef.current.position.set(x, 0, z);
      satRef.current.lookAt(0, 0, 0);
    }

    earthSpinRef.current?.rotateOnAxis(localAxis.current, simDeltaRef.current * EARTH_SIDEREAL_OMEGA);
  });

  const earthR = EARTH_RADIUS;

  return (
    <group>
      <ambientLight intensity={0.18} color="#4466aa" />
      <pointLight position={[2, 3, 2]} intensity={0.5} color="#ef4444" />
      <RealisticSun earthRadius={earthR} lightIntensity={2.5} />

      <group ref={earthSpinRef}>
        <RealisticEarth radius={earthR} rotationSpeed={0} />
        <VanAllenFieldLines earthR={earthR} />
      </group>

      <OrbitPathTube
        a={LEO500_ORBIT_RADIUS_RE}
        b={LEO500_ORBIT_RADIUS_RE}
        color="#fca5a5"
        boost={1.4}
        active
      />

      <group ref={satRef}>
        <TessSatelliteModel
          targetLongestAxis={PHYSICS_SAT_DISPLAY_SIZE * 12}
          initialColor="#94a3b8"
        />
      </group>
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
      {/* Orbit-like ring — shown as a tube for consistent overview-style concept. */}
      <OrbitPathTube a={2.0} b={2.0} color="#ffffff" />
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
export default function LessonScene({
  type,
  resetKey,
  onResetScene,
}: {
  type: SceneType;
  resetKey: number;
  onResetScene: () => void;
}) {
  const [focus, setFocus] = useState<GravityFocus>("earth");
  const satPosRef = useRef(new THREE.Vector3(GRAVITY_ORBIT_A, 0, 0));
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const userOrbitingRef = useRef(false);

  useEffect(() => {
    setFocus("earth");
    userOrbitingRef.current = false;
  }, [type, resetKey]);

  const isGravity = type === "gravity-well";
  const isRadiation = type === "radiation";
  const { memoryBits, flashBit, hitFlash, lastFlip, lastBelt, reset: resetSeu } = useSeuMemory(isRadiation);

  useEffect(() => {
    if (isRadiation) resetSeu();
  }, [isRadiation, resetKey, resetSeu]);

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

        <SceneCameraReset sceneType={type} controlsRef={controlsRef} resetKey={resetKey} />

        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableZoom={true}
          minDistance={
            isGravity ? (focus === "earth" ? 2.2 : PHYSICS_SAT_DISPLAY_SIZE * 4) : 3
          }
          maxDistance={
            isGravity ? (focus === "earth" ? 10 : PHYSICS_SAT_DISPLAY_SIZE * 16) : 15
          }
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

        {type === "gravity-well" && (
          <GravityWellScene satPosRef={satPosRef} focus={focus} />
        )}
        {type === "magnet" && <MagnetScene />}
        {type === "thermal" && <ThermalScene resetKey={resetKey} />}
        {type === "radiation" && <RadiationScene />}
        {type === "vacuum" && <VacuumScene />}
      </WebGPUCanvas>

      {isRadiation && (
        <div className="pointer-events-none absolute right-3 bottom-3 z-10">
          <div className="pointer-events-auto">
            <TooltipProvider delayDuration={200}>
              <SeuMemoryHud
                bits={memoryBits}
                flashIdx={flashBit}
                hitFlash={hitFlash}
                lastFlip={lastFlip}
                lastBelt={lastBelt}
              />
            </TooltipProvider>
          </div>
        </div>
      )}

      <SimTimeControls
        onReset={onResetScene}
        footnote={
          isGravity ? (
            <>
              ขนาดดาวเทียมขยายประมาณ{" "}
              <span className="text-text/75">{SAT_SCALE_FACTOR.toLocaleString("th-TH")}</span>{" "}
              เท่า เพื่อให้มองเห็นได้ (วงโคจรยังเป็นสเกลจริง)
            </>
          ) : type === "radiation" ? (
            <>รั่วสี cosmic ray จากทุกทิศเป็นภาพประกอบ · เมื่อชนดาวเทียมบิตใน SRAM จะพลิก (SEU)</>
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
