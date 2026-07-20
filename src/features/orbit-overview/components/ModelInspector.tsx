import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import {
  OrbitDefinition,
  SatelliteDefinition,
  SimulationSelection,
} from "@/features/orbit-overview/lib/types";
import {
  MISSION_MODEL,
  MODEL_TARGET_SIZE,
  SATELLITE_MODELS,
} from "@/features/orbit-overview/lib/satelliteModels";
import { altitudeToSceneRadius } from "@/features/orbit-overview/lib/orbitMath";

const EARTH_MODEL = "/models/Earth_1_12756.glb";

function forceLitMaterial(root: THREE.Object3D, accent = "#9db0c7") {
  root.traverse((obj) => {
    if (!(obj as THREE.Mesh).isMesh) return;
    const mesh = obj as THREE.Mesh;
    mesh.material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(accent).lerp(new THREE.Color("#d8dee8"), 0.5),
      metalness: 0.5,
      roughness: 0.4,
      emissive: new THREE.Color(accent),
      emissiveIntensity: 0.18,
      side: THREE.DoubleSide,
    });
  });
}

function normalizeToSize(scene: THREE.Object3D, targetSize: number) {
  const clone = scene.clone(true);
  clone.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(clone);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  clone.scale.setScalar(targetSize / maxDim);
  box.setFromObject(clone);
  clone.position.sub(box.getCenter(new THREE.Vector3()));
  return clone;
}

function EarthPreview() {
  const { scene } = useGLTF(EARTH_MODEL);
  const earth = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        const mat = mesh.material;
        if (mat && !Array.isArray(mat)) {
          const m = (mat as THREE.MeshStandardMaterial).clone();
          m.roughness = 0.85;
          mesh.material = m;
        }
      }
    });
    return normalizeToSize(clone, 1.6);
  }, [scene]);

  return <primitive object={earth} />;
}

function SatellitePreview({
  missionType,
}: {
  missionType: SatelliteDefinition["missionType"];
}) {
  const key = MISSION_MODEL[missionType];
  const path = SATELLITE_MODELS[key].path;
  const { scene } = useGLTF(path);
  const model = useMemo(() => {
    const clone = scene.clone(true);
    forceLitMaterial(clone, "#7eb8ff");
    return normalizeToSize(clone, MODEL_TARGET_SIZE[key] * 3.1);
  }, [scene, key]);

  return <primitive object={model} />;
}

function OrbitRingPreview({ orbit }: { orbit: OrbitDefinition }) {
  const radius = altitudeToSceneRadius(orbit.altitudeKm) * 0.55;
  const tilt = THREE.MathUtils.degToRad(orbit.inclinationDeg);

  return (
    <group rotation={[tilt, 0, 0]}>
      <mesh>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial
          color="#1e4d7b"
          emissive="#0a2540"
          emissiveIntensity={0.3}
          roughness={0.9}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.018, 8, 128]} />
        <meshBasicMaterial color={orbit.color} transparent opacity={0.85} />
      </mesh>
    </group>
  );
}

function InspectorScene({
  selection,
  orbit,
  satellite,
}: {
  selection: SimulationSelection | null;
  orbit: OrbitDefinition | null;
  satellite: SatelliteDefinition | null;
}) {
  const showSat = selection?.kind === "satellite" && satellite;
  const showOrbit = selection?.kind === "orbit" && orbit;

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 3, 5]} intensity={1.4} color="#fff6e8" />
      <pointLight position={[-3, -2, 2]} intensity={0.4} color="#4a9eff" />

      <Suspense fallback={null}>
        {showSat ? (
          <SatellitePreview missionType={satellite.missionType} />
        ) : showOrbit && orbit ? (
          <OrbitRingPreview orbit={orbit} />
        ) : (
          <EarthPreview />
        )}
      </Suspense>

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.8}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI - 0.2}
      />
    </>
  );
}

interface ModelInspectorProps {
  selection: SimulationSelection | null;
  orbit: OrbitDefinition | null;
  satellite: SatelliteDefinition | null;
  /** Larger hero for 50/50 panel */
  size?: "md" | "lg";
}

export default function ModelInspector({
  selection,
  orbit,
  satellite,
  size = "md",
}: ModelInspectorProps) {
  const caption =
    selection?.kind === "satellite" && satellite
      ? satellite.name
      : selection?.kind === "orbit" && orbit
      ? orbit.band
      : "Earth";

  const heightClass = size === "lg" ? "h-[min(42vh,320px)]" : "h-40";

  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#050810] shadow-[0_0_40px_rgba(34,211,238,0.06)]">
      <div className={`${heightClass} w-full relative`}>
        <Canvas
          camera={{ position: [0, 0.35, size === "lg" ? 2.8 : 3.2], fov: 36 }}
          gl={{ antialias: true, alpha: true }}
          style={{
            background:
              "radial-gradient(ellipse at center, #0c1830 0%, #050810 72%)",
          }}
        >
          <InspectorScene
            selection={selection}
            orbit={orbit}
            satellite={satellite}
          />
        </Canvas>
        <div className="absolute bottom-2 left-2 right-2 flex justify-between pointer-events-none">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/55 text-white/75 truncate">
            {caption}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/55 text-white/35">
            ลากหมุน
          </span>
        </div>
      </div>
    </div>
  );
}

useGLTF.preload(EARTH_MODEL);
Object.values(SATELLITE_MODELS).forEach((m) => useGLTF.preload(m.path));
