"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Float } from "@react-three/drei";
import { Suspense, useRef, useEffect } from "react";
import * as THREE from "three";

function Moon() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={meshRef} position={[2.5, 0.3, 0]}>
        <sphereGeometry args={[1.3, 128, 128]} />
        <meshStandardMaterial
          color="#c8ccd4"
          roughness={1}
          metalness={0.05}
          emissive="#1a2540"
          emissiveIntensity={0.15}
          bumpScale={0.05}
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
    window.addEventListener("mousemove", handler);
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
      <sphereGeometry args={[3, 32, 32]} />
      <meshBasicMaterial
        color="#00e5ff"
        transparent
        opacity={0.04}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

export default function SpaceCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 55 }}
      gl={{ antialias: true, alpha: false }}
      className="bg-bg"
    >
      <Suspense fallback={null}>
        {/* Lighting */}
        <ambientLight intensity={0.15} />
        <directionalLight
          position={[-5, 3, 5]}
          intensity={1.2}
          color="#ffffff"
        />
        <pointLight
          position={[5, -2, 3]}
          intensity={2}
          color="#00e5ff"
          distance={15}
        />
        <pointLight
          position={[-8, 5, -5]}
          intensity={1.5}
          color="#4a6fff"
          distance={20}
        />

        {/* Starfield */}
        <Stars
          radius={120}
          depth={60}
          count={6000}
          factor={4}
          saturation={0}
          fade
          speed={0.5}
        />

        {/* Moon */}
        <Moon />

        {/* Distant nebula glow */}
        <Nebula />

        {/* Mouse parallax */}
        <CameraRig />

        {/* Fog for depth */}
        <fog attach="fog" args={["#030812", 8, 25]} />
      </Suspense>
    </Canvas>
  );
}
