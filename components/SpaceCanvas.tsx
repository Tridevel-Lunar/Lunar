"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Float } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState, type RefObject } from "react";
import * as THREE from "three";

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

function Moon() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.05;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={meshRef} position={[2.5, 0.3, 0]}>
        <sphereGeometry args={[1.3, 48, 48]} />
        <meshStandardMaterial
          color="#c8ccd4"
          roughness={1}
          metalness={0.05}
          emissive="#1a2540"
          emissiveIntensity={0.15}
        />
      </mesh>
    </Float>
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
    <div ref={containerRef} className="h-full w-full">
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
