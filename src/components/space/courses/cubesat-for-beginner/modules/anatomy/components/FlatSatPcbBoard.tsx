import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  FLATSAT_BOARD_SIZE,
  easeInOutCubic,
} from "../lib/layout";

/** Procedural FR4 FlatSat mother board texture. */
function createPcbTexture(): THREE.CanvasTexture {
  const w = 1024;
  const h = 768;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#0d3b28");
  g.addColorStop(0.45, "#145c3c");
  g.addColorStop(1, "#0a2f20");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 2800; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.035})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
  }

  ctx.strokeStyle = "rgba(184, 115, 51, 0.22)";
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 20; i++) {
    const y = 70 + i * 34;
    ctx.beginPath();
    ctx.moveTo(48, y);
    ctx.lineTo(w - 48, y + (i % 2 === 0 ? 6 : -6));
    ctx.stroke();
  }

  // Center backbone
  ctx.strokeStyle = "rgba(212, 160, 80, 0.6)";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(w * 0.5, 90);
  ctx.lineTo(w * 0.5, h - 90);
  ctx.stroke();
  ctx.strokeStyle = "rgba(120, 180, 255, 0.45)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(w * 0.5 - 16, 90);
  ctx.lineTo(w * 0.5 - 16, h - 90);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(w * 0.5 + 16, 90);
  ctx.lineTo(w * 0.5 + 16, h - 90);
  ctx.stroke();

  // Branches
  ctx.strokeStyle = "rgba(212, 160, 80, 0.55)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(w * 0.42, h * 0.52);
  ctx.lineTo(w * 0.18, h * 0.52);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(w * 0.58, h * 0.52);
  ctx.lineTo(w * 0.82, h * 0.52);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(w * 0.5, h * 0.44);
  ctx.lineTo(w * 0.5, h * 0.2);
  ctx.stroke();

  const pads = [
    { x: w * 0.18, y: h * 0.52, pw: 210, ph: 260, label: "EPS PAD", accent: "#fbbf24" },
    { x: w * 0.5, y: h * 0.52, pw: 230, ph: 270, label: "OBC PAD", accent: "#7dd3fc" },
    { x: w * 0.82, y: h * 0.52, pw: 210, ph: 260, label: "COMM PAD", accent: "#34d399" },
    { x: w * 0.5, y: h * 0.2, pw: 440, ph: 180, label: "PAYLOAD PAD", accent: "#c084fc" },
  ];

  for (const pad of pads) {
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(pad.x - pad.pw / 2, pad.y - pad.ph / 2, pad.pw, pad.ph);
    ctx.strokeStyle = "rgba(230, 240, 255, 0.5)";
    ctx.lineWidth = 2;
    ctx.strokeRect(pad.x - pad.pw / 2, pad.y - pad.ph / 2, pad.pw, pad.ph);
    ctx.fillStyle = pad.accent;
    ctx.fillRect(pad.x - pad.pw / 2, pad.y - pad.ph / 2, 12, 3);
    ctx.fillStyle = "rgba(230,240,255,0.65)";
    ctx.font = "bold 20px monospace";
    ctx.fillText(pad.label, pad.x - pad.pw / 2 + 14, pad.y - pad.ph / 2 + 26);
  }

  ctx.fillStyle = "rgba(220, 235, 255, 0.8)";
  ctx.font = "bold 26px monospace";
  ctx.fillText("FLATSAT  ·  1U CUBESAT HARNESS BOARD", 44, 44);
  ctx.font = "15px monospace";
  ctx.fillStyle = "rgba(180, 210, 200, 0.55)";
  ctx.fillText("MODULES SPREAD FROM CENTER  ·  FR4 / POWER-DATA BUS", 44, 68);

  for (const [hx, hy] of [
    [40, 40],
    [w - 40, 40],
    [40, h - 40],
    [w - 40, h - 40],
  ] as const) {
    ctx.fillStyle = "#061018";
    ctx.beginPath();
    ctx.arc(hx, hy, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(200, 180, 120, 0.75)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(hx, hy, 17, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = "#141414";
  ctx.fillRect(w * 0.34, h - 56, w * 0.32, 30);
  for (let i = 0; i < 14; i++) {
    ctx.fillStyle = "#c8c8c8";
    ctx.fillRect(w * 0.34 + 12 + i * 20, h - 50, 7, 18);
  }
  ctx.fillStyle = "rgba(220,235,255,0.55)";
  ctx.font = "13px monospace";
  ctx.fillText("J1  HARNESS HEADER", w * 0.34 + 6, h - 62);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

/** Mother FlatSat PCB that expands from the center. */
export default function FlatSatPcbBoard({
  unfold,
}: {
  unfold: React.MutableRefObject<number>;
}) {
  const root = useRef<THREE.Group>(null);
  const topMat = useRef<THREE.MeshStandardMaterial>(null);
  const texture = useMemo(() => createPcbTexture(), []);
  const { width, depth } = FLATSAT_BOARD_SIZE;

  useFrame(() => {
    if (!root.current) return;
    const t = easeInOutCubic(unfold.current);
    root.current.visible = t > 0.02;
    const s = 0.08 + t * 0.92;
    root.current.scale.set(s, 1, s);
    if (topMat.current) {
      topMat.current.opacity = Math.min(1, t * 1.4);
    }
  });

  return (
    <group ref={root}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial
          ref={topMat}
          map={texture}
          roughness={0.7}
          metalness={0.06}
          transparent
          opacity={1}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.014, 0]}>
        <planeGeometry args={[width + 0.06, depth + 0.06]} />
        <meshStandardMaterial color="#062418" roughness={0.95} metalness={0.02} />
      </mesh>
    </group>
  );
}
