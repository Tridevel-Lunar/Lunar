import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  OrbitControls,
  OrthographicCamera,
  PerspectiveCamera,
  Stars,
} from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import CubeSatOverviewModel from "./CubeSatOverviewModel";
import StructureFrame from "./StructureFrame";
import SubsystemStack from "./SubsystemStack";
import DataFlowLinks from "./DataFlowLinks";
import { easeInOutCubic, lerp } from "../lib/layout";
import { stepToViewMode, type AnatomyStep } from "../lib/lesson";
import type { AnatomyPartId } from "../lib/parts";

/** Fit whole FlatSat board in view (world units half-extent). */
const FLAT_HALF_W = 2.7;
const FLAT_HALF_H = 2.1;

function FlatCameraFit({ active }: { active: boolean }) {
  const { size, camera } = useThree();
  const orthoZoom = useMemo(() => {
    const aspect = size.width / Math.max(1, size.height);
    // Choose zoom so the board fills most of the viewport
    const needW = size.width / (FLAT_HALF_W * 2);
    const needH = size.height / (FLAT_HALF_H * 2);
    return Math.min(needW, needH) * 0.92;
  }, [size.width, size.height]);

  useEffect(() => {
    if (!active) return;
    if (!(camera instanceof THREE.OrthographicCamera)) return;
    camera.position.set(0, 12, 0);
    camera.up.set(0, 0, -1);
    camera.lookAt(0, 0, 0);
    camera.zoom = orthoZoom;
    camera.near = 0.1;
    camera.far = 40;
    camera.updateProjectionMatrix();
  }, [active, camera, orthoZoom]);

  useFrame(() => {
    if (!active) return;
    if (!(camera instanceof THREE.OrthographicCamera)) return;
    // Hard-lock: no drift to side angle
    camera.position.set(0, 12, 0);
    camera.up.set(0, 0, -1);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function SceneRig({
  step,
  activePart,
  activeFlowId,
  flowPaused = true,
  onSelectPart,
  onSelectFlow,
}: {
  step: AnatomyStep;
  activePart: AnatomyPartId;
  activeFlowId: string | null;
  flowPaused?: boolean;
  onSelectPart: (id: AnatomyPartId) => void;
  onSelectFlow?: (id: string) => void;
}) {
  const mode = stepToViewMode(step);
  const flat = mode === "flatsat";
  const unfold = useRef(flat ? 1 : 0);
  const shellOpacity = useRef(flat ? 0 : 1);
  const spin = useRef<THREE.Group>(null);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  useFrame((_, dt) => {
    const goal = flat ? 1 : 0;
    unfold.current = lerp(unfold.current, goal, Math.min(1, dt * 1.8));
    const t = easeInOutCubic(unfold.current);
    shellOpacity.current = Math.max(0, 1 - t * 1.5);

    if (spin.current) {
      if (!flat && activePart === "overview") {
        spin.current.rotation.y += dt * 0.28;
      } else {
        spin.current.rotation.set(
          lerp(spin.current.rotation.x, 0, Math.min(1, dt * 3)),
          lerp(spin.current.rotation.y, 0, Math.min(1, dt * 3)),
          lerp(spin.current.rotation.z, 0, Math.min(1, dt * 3)),
        );
      }
    }
  });

  const showStructureGhost = !flat && activePart === "structure";

  return (
    <>
      <color attach="background" args={["#030712"]} />
      {!flat && <fog attach="fog" args={["#030712", 8, 24]} />}

      {/* Cameras: perspective for 3D explore, orthographic top-down for FlatSat */}
      <PerspectiveCamera
        makeDefault={!flat}
        position={[2.6, 1.8, 3.2]}
        fov={42}
        near={0.1}
        far={60}
      />
      <OrthographicCamera
        makeDefault={flat}
        position={[0, 12, 0]}
        zoom={90}
        near={0.1}
        far={40}
      />
      <FlatCameraFit active={flat} />

      <ambientLight intensity={flat ? 0.7 : 0.48} />
      <directionalLight
        position={flat ? [0, 10, 0] : [4, 6, 3]}
        intensity={flat ? 0.85 : 1.5}
        castShadow={!flat}
        shadow-mapSize={[1024, 1024]}
      />
      {!flat && (
        <>
          {/* Local lights only — avoid drei Environment HDRI (CORS on localhost) */}
          <directionalLight position={[-3, 2, -4]} intensity={0.55} color="#7dd3fc" />
          <hemisphereLight color="#a8c4ff" groundColor="#030712" intensity={0.35} />
          <pointLight position={[0, -2, 2]} intensity={0.4} color="#00e5ff" />
          <Stars radius={40} depth={30} count={1800} factor={2.2} fade speed={0.4} />
        </>
      )}

      <Suspense fallback={null}>
        <group ref={spin}>
          {!flat && (
            <CubeSatOverviewModel
              highlighted={activePart === "overview"}
              opacityRef={shellOpacity}
            />
          )}
          {showStructureGhost && (
            <group scale={1.18}>
              <StructureFrame activePart={activePart} />
            </group>
          )}
          <SubsystemStack
            unfold={unfold}
            activePart={activePart}
            onSelectPart={onSelectPart}
            flat2d={flat}
          />
          {(step === "dataflow" || step === "quiz") && (
            <DataFlowLinks
              activeFlowId={step === "dataflow" ? activeFlowId : null}
              showAllDimmed={step === "dataflow" || step === "quiz"}
              paused={flowPaused}
              onSelectFlow={onSelectFlow}
            />
          )}
        </group>
      </Suspense>

      {!flat && (
        <ContactShadows
          position={[0, -1.15, 0]}
          opacity={0.4}
          scale={10}
          blur={2.6}
          far={5}
        />
      )}

      {/* Orbit only in 3D explore — FlatSat stays locked top-down */}
      <OrbitControls
        ref={controlsRef}
        makeDefault={!flat}
        enabled={!flat}
        enablePan={false}
        enableRotate={!flat}
        enableZoom={!flat}
        minDistance={2}
        maxDistance={8}
        maxPolarAngle={Math.PI * 0.88}
        target={[0, 0, 0]}
      />
    </>
  );
}

export default function AnatomyScene({
  step,
  activePart,
  activeFlowId,
  onSelectPart,
  onSelectFlow,
  flowPaused = true,
}: {
  step: AnatomyStep;
  activePart: AnatomyPartId;
  activeFlowId: string | null;
  onSelectPart: (id: AnatomyPartId) => void;
  onSelectFlow?: (id: string) => void;
  flowPaused?: boolean;
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: false }}
      className="h-full w-full touch-none"
    >
      <SceneRig
        step={step}
        activePart={activePart}
        activeFlowId={activeFlowId}
        flowPaused={flowPaused}
        onSelectPart={onSelectPart}
        onSelectFlow={onSelectFlow}
      />
    </Canvas>
  );
}
