import { useEffect, useRef } from "react";
import * as THREE from "three";
import { runThreeLoop, disposeScene } from "@/components/why-space/useThreeScene";

export default function StarField() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    let w = el.clientWidth;
    let h = el.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(w, h);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 200);
    camera.position.z = 8;

    const count = 900;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 18 + Math.random() * 30;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi) - 10;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.06,
      color: 0xbfd9ff,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
      depthWrite: false,
    });
    const stars = new THREE.Points(geo, mat);
    scene.add(stars);

    const glowGeo = new THREE.SphereGeometry(14, 24, 24);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x0a3a5c,
      transparent: true,
      opacity: 0.18,
      side: THREE.BackSide,
      depthWrite: false,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.set(0, 0, -12);
    scene.add(glow);

    let t = 0;
    const stopLoop = runThreeLoop(
      el,
      (delta) => {
        t += delta * 0.05;
        stars.rotation.y = t;
        stars.rotation.x = Math.sin(t * 0.5) * 0.08;
      },
      () => renderer.render(scene, camera),
    );

    const onResize = () => {
      w = el.clientWidth;
      h = el.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      stopLoop();
      window.removeEventListener("resize", onResize);
      geo.dispose();
      mat.dispose();
      glowGeo.dispose();
      glowMat.dispose();
      disposeScene(scene, renderer);
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div ref={mountRef} aria-hidden className="pointer-events-none absolute inset-0" />
  );
}
