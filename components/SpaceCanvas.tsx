"use client";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Stars, Float, useTexture } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState, type RefObject } from "react";
import * as THREE from "three";

const MOON_COLOR_MAP = "/lroc_color_poles_2k.png";
const MOON_BUMP_MAP = "/ldem_4_uint.png";

useTexture.preload([MOON_COLOR_MAP, MOON_BUMP_MAP]);

function useCanvasActive(containerRef: RefObject<HTMLDivElement | null>) {
  const [active, setActive] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let inView = true;
    let pageVisible = !document.hidden;

    const sync = () => setActive(inView && pageVisible);

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        sync();
      },
      { rootMargin: "0px" },
    );
    observer.observe(el);

    const onVisibility = () => {
      pageVisible = !document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [containerRef]);

  return active;
}

const MOON_DRAG_SPEED = 0.004;
const MOON_INERTIA_DAMPING = 1.5;
const MOON_IDLE_SPIN = 0.03;
const MOON_INITIAL_EULER = new THREE.Euler(0, 1.2, 0.08);
const WORLD_X = new THREE.Vector3(1, 0, 0);
const WORLD_Y = new THREE.Vector3(0, 1, 0);

function applyWorldSpin(
  quat: THREE.Quaternion,
  spinX: number,
  spinY: number,
  scratch: { qX: THREE.Quaternion; qY: THREE.Quaternion },
) {
  scratch.qY.setFromAxisAngle(WORLD_Y, spinY);
  scratch.qX.setFromAxisAngle(WORLD_X, spinX);
  quat.premultiply(scratch.qY);
  quat.premultiply(scratch.qX);
}

function Moon() {
  const groupRef = useRef<THREE.Group>(null);
  const dragRef = useRef({ active: false, lastX: 0, lastY: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const quatScratch = useRef({
    qX: new THREE.Quaternion(),
    qY: new THREE.Quaternion(),
    initial: new THREE.Quaternion().setFromEuler(MOON_INITIAL_EULER),
  });
  const [colorMap, bumpMap] = useTexture([MOON_COLOR_MAP, MOON_BUMP_MAP]);

  useEffect(() => {
    colorMap.colorSpace = THREE.SRGBColorSpace;
    bumpMap.colorSpace = THREE.NoColorSpace;
    colorMap.anisotropy = 4;
    bumpMap.anisotropy = 4;
  }, [colorMap, bumpMap]);

  useEffect(() => {
    if (groupRef.current) groupRef.current.quaternion.copy(quatScratch.current.initial);
  }, []);

  const endDrag = () => {
    dragRef.current.active = false;
    document.body.style.cursor = "";
  };

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    dragRef.current = { active: true, lastX: e.clientX, lastY: e.clientY };
    velocityRef.current = { x: 0, y: 0 };
    document.body.style.cursor = "grabbing";
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    const group = groupRef.current;
    if (!dragRef.current.active || !group) return;

    const dx = e.clientX - dragRef.current.lastX;
    const dy = e.clientY - dragRef.current.lastY;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;

    const spinY = dx * MOON_DRAG_SPEED;
    const spinX = dy * MOON_DRAG_SPEED;
    applyWorldSpin(group.quaternion, spinX, spinY, quatScratch.current);
    velocityRef.current = {
      y: spinY * 60,
      x: spinX * 60,
    };
  };

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group || dragRef.current.active) return;

    applyWorldSpin(
      group.quaternion,
      velocityRef.current.x * delta,
      velocityRef.current.y * delta,
      quatScratch.current,
    );

    const decay = Math.exp(-MOON_INERTIA_DAMPING * delta);
    velocityRef.current.x *= decay;
    velocityRef.current.y *= decay;

    const speed = Math.hypot(velocityRef.current.x, velocityRef.current.y);
    if (speed < 0.008) {
      quatScratch.current.qY.setFromAxisAngle(WORLD_Y, MOON_IDLE_SPIN * delta);
      group.quaternion.premultiply(quatScratch.current.qY);
    }
  });

  return (
    <group position={[2.5, 0.3, 0]}>
      <Float speed={1.2} rotationIntensity={0} floatIntensity={0.8}>
        <group ref={groupRef}>
          <mesh
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
            onPointerOver={() => {
              if (!dragRef.current.active) document.body.style.cursor = "grab";
            }}
            onPointerOut={() => {
              if (!dragRef.current.active) document.body.style.cursor = "";
            }}
          >
            <sphereGeometry args={[1.3, 48, 48]} />
            <meshStandardMaterial
              map={colorMap}
              bumpMap={bumpMap}
              bumpScale={0.035}
              roughness={0.92}
              metalness={0.04}
              emissive="#0a1020"
              emissiveIntensity={0.06}
            />
          </mesh>
        </group>
      </Float>
    </group>
  );
}

function CameraRig() {
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouse.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  useFrame((state) => {
    state.camera.position.x += (mouse.current.x * 0.3 - state.camera.position.x) * 0.05;
    state.camera.position.y += (-mouse.current.y * 0.3 - state.camera.position.y) * 0.05;
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

function Nebula() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * 0.01;
  });
  return (
    <mesh ref={ref} position={[-3, -1, -5]}>
      <sphereGeometry args={[3, 24, 24]} />
      <meshBasicMaterial color="#00e5ff" transparent opacity={0.04} side={THREE.BackSide} />
    </mesh>
  );
}

export default function SpaceCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const active = useCanvasActive(containerRef);

  return (
    <div ref={containerRef} className="h-full w-full touch-none">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 55 }}
        dpr={[1, 1.5]}
        frameloop={active ? "always" : "never"}
        gl={{ antialias: false, alpha: false, powerPreference: "low-power" }}
        className="bg-bg"
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.15} />
          <directionalLight position={[-5, 3, 5]} intensity={1.2} color="#ffffff" />
          <pointLight position={[5, -2, 3]} intensity={2} color="#00e5ff" distance={15} />

          <Stars radius={120} depth={60} count={2500} factor={4} saturation={0} fade speed={0.5} />

          <Moon />
          <Nebula />
          <CameraRig />

          <fog attach="fog" args={["#030812", 8, 25]} />
        </Suspense>
      </Canvas>
    </div>
  );
}
