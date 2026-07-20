import { useMemo } from "react";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

/**
 * Deep-space backdrop: procedural Milky Way band + dense starfield.
 * Avoids large HDRI downloads while still reading as near-Earth space.
 */
function createMilkyWayTexture(): THREE.CanvasTexture {
  const w = 2048;
  const h = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  // Near-black void
  ctx.fillStyle = "#02040a";
  ctx.fillRect(0, 0, w, h);

  // Galactic plane glow
  const band = ctx.createLinearGradient(0, h * 0.35, 0, h * 0.65);
  band.addColorStop(0, "rgba(0,0,0,0)");
  band.addColorStop(0.35, "rgba(90, 110, 160, 0.12)");
  band.addColorStop(0.5, "rgba(180, 170, 210, 0.22)");
  band.addColorStop(0.65, "rgba(90, 110, 160, 0.12)");
  band.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = band;
  ctx.fillRect(0, 0, w, h);

  // Soft nebula patches along the plane
  for (let i = 0; i < 18; i++) {
    const x = (i / 18) * w + Math.sin(i * 2.1) * 40;
    const y = h * 0.5 + Math.sin(i * 1.7) * h * 0.06;
    const r = 80 + (i % 5) * 30;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const cool = i % 3 === 0;
    g.addColorStop(
      0,
      cool ? "rgba(100,140,220,0.14)" : "rgba(160,120,180,0.1)"
    );
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // Dust of faint stars in the texture
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const a = Math.random() * 0.55;
    const s = Math.random() * 1.4;
    ctx.fillStyle = `rgba(220,230,255,${a})`;
    ctx.fillRect(x, y, s, s);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.needsUpdate = true;
  return tex;
}

export default function SpaceEnvironment() {
  const milkyWay = useMemo(() => createMilkyWayTexture(), []);

  return (
    <>
      <color attach="background" args={["#010208"]} />
      <mesh>
        <sphereGeometry args={[200, 64, 32]} />
        <meshBasicMaterial map={milkyWay} side={THREE.BackSide} depthWrite={false} />
      </mesh>

      <Stars
        radius={120}
        depth={60}
        count={6000}
        factor={3.2}
        saturation={0}
        fade
        speed={0.15}
      />
      <Stars
        radius={90}
        depth={30}
        count={1800}
        factor={1.6}
        saturation={0.2}
        fade
        speed={0.08}
      />
    </>
  );
}
