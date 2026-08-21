import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { runThreeLoop, disposeScene } from "./why-space/useThreeScene";

// Seeded pseudo-random generator — same output on server and client
function seededRand(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}
import * as THREE from "three";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Case {
  id: number;
  tag: string;
  title: string;
  subtitle: string;
  concept: string;
  benefit: string;
  application: string;
  color: string; // accent hex
  sceneType: "laser" | "satellite" | "orbit";
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const CASES: Case[] = [
  {
    id: 1,
    tag: "OPTICAL COMMS",
    title: "Deep Space Optical Communication",
    subtitle: "DSOC · NASA / JPL",
    concept:
      "ส่งข้อมูลผ่านเลเซอร์อินฟราเรดแทนคลื่นวิทยุ เพิ่มแบนด์วิดท์ได้มากกว่า 100 เท่า ทดสอบครั้งแรกบนยาน Psyche ระยะทาง 226 ล้านกิโลเมตร",
    benefit:
      "สตรีมวิดีโอ HD จากดาวอังคารได้แบบเรียลไทม์ · รองรับข้อมูลวิทยาศาสตร์ขนาดใหญ่จากยานสำรวจดาวเคราะห์",
    application:
      "ประยุกต์ใช้บนโลก: เครือข่ายอินเทอร์เน็ตผ่านดาวเทียม LEO ความหน่วงต่ำ ครอบคลุมพื้นที่ห่างไกลของไทย",
    color: "#00e5ff",
    sceneType: "laser",
  },
  {
    id: 2,
    tag: "EARTH OBSERVATION",
    title: "Hyperspectral Satellite Imaging",
    subtitle: "SAR · Synthetic Aperture Radar",
    concept:
      "ดาวเทียมถ่ายภาพด้วยคลื่นแม่เหล็กไฟฟ้าหลายร้อยช่วงความยาวคลื่นพร้อมกัน มองเห็นองค์ประกอบเคมีของพื้นดิน พืชพันธุ์ และมหาสมุทรจากอวกาศ",
    benefit:
      "ตรวจจับโรคระบาดในพืชก่อนตาเห็น · ติดตามคุณภาพน้ำ · คาดการณ์ผลผลิตการเกษตรล่วงหน้า 3 เดือน",
    application:
      "ประยุกต์ใช้ในไทย: วิเคราะห์สุขภาพข้าวในนาทั่วประเทศ แจ้งเตือนเกษตรกรผ่าน LINE ก่อนเกิดความเสียหาย",
    color: "#7dd3fc",
    sceneType: "satellite",
  },
  {
    id: 3,
    tag: "SPACE PROPULSION",
    title: "Ion Thruster Propulsion",
    subtitle: "Hall-Effect · Electric Propulsion",
    concept:
      "เร่งอนุภาคซีนอนด้วยสนามแม่เหล็กไฟฟ้าแทนการเผาไหม้สารเคมี ใช้เชื้อเพลิงน้อยกว่า 10 เท่า แต่ให้ thrust ต่อเนื่องได้นานปี",
    benefit:
      "ยานสำรวจวงโคจรไกลขึ้น น้ำหนักน้อยลง · ดาวเทียมรุ่นใหม่ปรับวงโคจรได้ตลอดอายุการใช้งาน 15 ปี",
    application:
      "ประยุกต์ใช้: ระบบขับเคลื่อนสำหรับดาวเทียม THEOS-3 ของไทย รุ่นถัดไป ลดต้นทุนปล่อยและยืดอายุใช้งาน",
    color: "#a78bfa",
    sceneType: "orbit",
  },
];

// ─── Three.js Scenes ──────────────────────────────────────────────────────────

function LaserScene({ color }: { color: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const w = el.clientWidth, h = el.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    camera.position.set(0, 0, 5);

    // Stars
    const starsGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(600 * 3);
    for (let i = 0; i < 600 * 3; i++) starPos[i] = (Math.random() - 0.5) * 30;
    starsGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    scene.add(new THREE.Points(starsGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.04, transparent: true, opacity: 0.7 })));

    // Source planet
    const src = new THREE.Mesh(new THREE.SphereGeometry(0.4, 32, 32), new THREE.MeshStandardMaterial({ color: 0x1a1a2e, emissive: 0x0a0a1a, metalness: 0.8, roughness: 0.3 }));
    src.position.set(-2.5, 0, 0);
    scene.add(src);

    // Target planet
    const tgt = new THREE.Mesh(new THREE.SphereGeometry(0.28, 32, 32), new THREE.MeshStandardMaterial({ color: 0x16213e, emissive: new THREE.Color(color).multiplyScalar(0.15), metalness: 0.7 }));
    tgt.position.set(2.5, 0, 0);
    scene.add(tgt);

    // Laser beam
    const laserMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9, linewidth: 2 });
    const laserGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-2.1, 0, 0), new THREE.Vector3(2.1, 0, 0)]);
    const laser = new THREE.Line(laserGeo, laserMat);
    scene.add(laser);

    // Glow particles along laser
    const dotGeo = new THREE.BufferGeometry();
    const dotCount = 40;
    const dotPos = new Float32Array(dotCount * 3);
    dotGeo.setAttribute("position", new THREE.BufferAttribute(dotPos, 3));
    const dots = new THREE.Points(dotGeo, new THREE.PointsMaterial({ color, size: 0.06, transparent: true, opacity: 0.85 }));
    scene.add(dots);

    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const pLight = new THREE.PointLight(color, 2, 10);
    pLight.position.set(0, 2, 2);
    scene.add(pLight);

    let t = 0;
    const stopLoop = runThreeLoop(
      el,
      (delta) => {
        t += delta;
        src.rotation.y += 0.005;
        tgt.rotation.y -= 0.007;
        (laser.material as THREE.LineBasicMaterial).opacity = 0.5 + 0.4 * Math.sin(t * 3);

        const dp = dotGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < dotCount; i++) {
          const frac = (i / dotCount + t * 0.4) % 1;
          const wobble = Math.sin(t * 4 + i) * 0.025;
          dp.setXYZ(i, -2.1 + frac * 4.2, wobble, Math.cos(t * 3 + i) * 0.025);
        }
        dp.needsUpdate = true;
      },
      () => renderer.render(scene, camera),
    );
    return () => {
      stopLoop();
      disposeScene(scene, renderer);
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [color]);
  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
}

function SatelliteScene({ color }: { color: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const w = el.clientWidth, h = el.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 500);
    camera.position.set(0, 3, 7);
    camera.lookAt(0, 0, 0);

    // Stars
    const starsGeo = new THREE.BufferGeometry();
    const sp = new Float32Array(800 * 3);
    for (let i = 0; i < 800 * 3; i++) sp[i] = (Math.random() - 0.5) * 60;
    starsGeo.setAttribute("position", new THREE.BufferAttribute(sp, 3));
    scene.add(new THREE.Points(starsGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.6 })));

    // Earth
    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(1.6, 48, 48),
      new THREE.MeshStandardMaterial({ color: 0x1a3a5c, emissive: 0x051020, roughness: 0.7, metalness: 0.1 })
    );
    scene.add(earth);

    // Scan lines on earth
    for (let i = 0; i < 5; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.62, 0.005, 8, 80),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(0.6), transparent: true, opacity: 0.4 })
      );
      ring.rotation.x = Math.PI / 2 + (i - 2) * 0.3;
      scene.add(ring);
    }

    // Satellite body
    const satGroup = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.4), new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.9, roughness: 0.2 }));
    satGroup.add(body);
    // Solar panels
    [-1, 1].forEach(side => {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.01, 0.22), new THREE.MeshStandardMaterial({ color: 0x1a1aff, emissive: 0x000033, metalness: 0.5 }));
      panel.position.x = side * 0.4;
      satGroup.add(panel);
    });
    // Scan beam cone
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.5, 1.2, 16, 1, true),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.12, side: THREE.DoubleSide, wireframe: false })
    );
    cone.rotation.x = Math.PI;
    cone.position.y = -0.8;
    satGroup.add(cone);
    scene.add(satGroup);

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const sun = new THREE.DirectionalLight(0xfff5e0, 1.5);
    sun.position.set(5, 5, 5);
    scene.add(sun);
    const accentLight = new THREE.PointLight(color, 1.5, 12);
    accentLight.position.set(0, 4, 2);
    scene.add(accentLight);

    let t = 0;
    const stopLoop = runThreeLoop(
      el,
      (delta) => {
        t += delta;
        earth.rotation.y += 0.002;
        const r = 2.8;
        satGroup.position.set(Math.cos(t * 0.4) * r, Math.sin(t * 0.15) * 0.5, Math.sin(t * 0.4) * r);
        satGroup.lookAt(earth.position);
      },
      () => renderer.render(scene, camera),
    );
    return () => {
      stopLoop();
      disposeScene(scene, renderer);
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [color]);
  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
}

function OrbitScene({ color }: { color: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const w = el.clientWidth, h = el.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 500);
    camera.position.set(0, 2, 7);
    camera.lookAt(0, 0, 0);

    // Stars
    const starsGeo = new THREE.BufferGeometry();
    const sp = new Float32Array(700 * 3);
    for (let i = 0; i < 700 * 3; i++) sp[i] = (Math.random() - 0.5) * 50;
    starsGeo.setAttribute("position", new THREE.BufferAttribute(sp, 3));
    scene.add(new THREE.Points(starsGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, opacity: 0.65, transparent: true })));

    // Central asteroid/planet
    const planet = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.9, 1),
      new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.9, metalness: 0.2 })
    );
    scene.add(planet);

    // Ion thruster exhaust particles
    const exhaustGeo = new THREE.BufferGeometry();
    const exCount = 80;
    const exPos = new Float32Array(exCount * 3);
    exhaustGeo.setAttribute("position", new THREE.BufferAttribute(exPos, 3));
    const exhaust = new THREE.Points(exhaustGeo, new THREE.PointsMaterial({ color, size: 0.05, transparent: true, opacity: 0.8 }));
    scene.add(exhaust);

    // Orbiting spacecraft group
    const craftGroup = new THREE.Group();
    const craftBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.1, 0.35, 8),
      new THREE.MeshStandardMaterial({ color: 0xd4d4d4, metalness: 0.95, roughness: 0.15 })
    );
    craftGroup.add(craftBody);
    // Thruster nozzle
    const nozzle = new THREE.Mesh(
      new THREE.ConeGeometry(0.06, 0.12, 8),
      new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 1 })
    );
    nozzle.position.y = -0.23;
    nozzle.rotation.x = Math.PI;
    craftGroup.add(nozzle);
    scene.add(craftGroup);

    // Orbit ring
    const orbitCurve = new THREE.EllipseCurve(0, 0, 2.5, 2.0, 0, Math.PI * 2, false, 0);
    const orbitPts = orbitCurve.getPoints(80).map(p => new THREE.Vector3(p.x, 0, p.y));
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPts);
    scene.add(new THREE.Line(orbitGeo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.25 })));

    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const sun = new THREE.DirectionalLight(0xfff8e0, 2);
    sun.position.set(8, 5, 3);
    scene.add(sun);

    let t = 0;
    const stopLoop = runThreeLoop(
      el,
      (delta) => {
        t += delta;
        planet.rotation.y += 0.003;
        planet.rotation.x += 0.001;

        const angle = t * 0.35;
        const rx = 2.5, rz = 2.0;
        const cx = Math.cos(angle) * rx;
        const cz = Math.sin(angle) * rz;
        craftGroup.position.set(cx, 0, cz);
        craftGroup.lookAt(0, 0, 0);
        craftGroup.rotateY(Math.PI);

        const ep = exhaustGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < exCount; i++) {
          const backAngle = angle - (i / exCount) * 0.8;
          const spread = (i / exCount) * 0.25;
          const jitter = Math.sin(t * 6 + i * 0.7) * spread * 0.35;
          ep.setXYZ(
            i,
            Math.cos(backAngle) * rx + jitter,
            Math.cos(t * 5 + i) * spread * 0.25,
            Math.sin(backAngle) * rz + jitter,
          );
        }
        ep.needsUpdate = true;
        (exhaust.material as THREE.PointsMaterial).opacity = 0.5 + 0.3 * Math.sin(t * 5);
      },
      () => renderer.render(scene, camera),
    );
    return () => {
      stopLoop();
      disposeScene(scene, renderer);
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [color]);
  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
}

// ─── Modal ─────────────────────────────────────────────────────────────────────
function CaseModal({ c, onClose }: { c: Case; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const SceneComponent = c.sceneType === "laser" ? LaserScene : c.sceneType === "satellite" ? SatelliteScene : OrbitScene;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px", animation: "fade-in 0.3s ease"
    }} onClick={onClose}>
      <div style={{
        background: "linear-gradient(135deg, #060e1a 0%, #0a1628 50%, #060e1a 100%)",
        border: `1px solid ${c.color}40`,
        borderRadius: "16px", maxWidth: "860px", width: "100%",
        overflow: "hidden", position: "relative",
        boxShadow: `0 0 60px ${c.color}20, 0 0 120px ${c.color}10`,
        animation: "slide-up 0.4s cubic-bezier(0.16,1,0.3,1)"
      }} onClick={e => e.stopPropagation()}>

        {/* Close */}
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16, zIndex: 10,
          background: "rgba(255,255,255,0.08)", border: "none", color: "#fff",
          width: 36, height: 36, borderRadius: "50%", cursor: "pointer",
          fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center"
        }}>×</button>

        {/* 3D Scene */}
        <div style={{ height: 300, background: "#020810", position: "relative" }}>
          <SceneComponent color={c.color} />
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 80,
            background: "linear-gradient(transparent, #060e1a)"
          }} />
          <div className="font-display" style={{
            position: "absolute", top: 20, left: 24,
            background: `${c.color}20`, border: `1px solid ${c.color}60`,
            padding: "4px 12px", borderRadius: 4,
            fontSize: 11, letterSpacing: "0.12em", color: c.color,
          }}>{c.tag}</div>
        </div>

        {/* Content */}
        <div style={{ padding: "28px 32px 32px" }}>
          <h2 className="font-display" style={{
            fontSize: "clamp(18px,2.5vw,26px)",
            fontWeight: 600, color: "#fff", margin: "0 0 4px",
            lineHeight: 1.3
          }}>{c.title}</h2>
          <p className="font-display" style={{ fontSize: 12, color: `${c.color}cc`, letterSpacing: "0.1em", margin: "0 0 24px" }}>{c.subtitle}</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {[
              { label: "CONCEPT", icon: "◈", text: c.concept },
              { label: "BENEFIT", icon: "◉", text: c.benefit },
              { label: "APPLICATION", icon: "◎", text: c.application },
            ].map(item => (
              <div key={item.label} style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10, padding: "16px"
              }}>
                <div className="font-display" style={{ fontSize: 10, letterSpacing: "0.15em", color: c.color, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 14 }}>{item.icon}</span>{item.label}
                </div>
                <p className="font-section-thai" style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.65, margin: 0 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Case Card ─────────────────────────────────────────────────────────────────
function CaseCard({ c, index, onClick }: { c: Case; index: number; onClick: () => void }) {
  const isLeft = index % 2 === 0;
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [sceneActive, setSceneActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
      setSceneActive(entry.isIntersecting);
    }, { threshold: 0.15, rootMargin: "80px" });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const SceneComponent = c.sceneType === "laser" ? LaserScene : c.sceneType === "satellite" ? SatelliteScene : OrbitScene;

  return (
    <div ref={ref} style={{
      display: "flex", flexDirection: isLeft ? "row" : "row-reverse",
      gap: "clamp(20px,4vw,60px)", alignItems: "center",
      marginBottom: "clamp(60px,8vw,100px)",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : `translateY(40px)`,
      transition: `opacity 0.8s ease ${index * 0.15}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${index * 0.15}s`,
    }}>
      {/* 3D Preview Card */}
      <div style={{
        flex: "0 0 clamp(260px,40%,440px)",
        height: "clamp(240px,30vw,340px)",
        borderRadius: 14,
        overflow: "hidden",
        position: "relative",
        border: `1px solid ${hovered ? c.color + "70" : c.color + "25"}`,
        transition: "border-color 0.4s, box-shadow 0.4s",
        boxShadow: hovered ? `0 0 40px ${c.color}30, 0 20px 60px rgba(0,0,0,0.5)` : "0 10px 40px rgba(0,0,0,0.4)",
        cursor: "pointer",
      }} onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        <div style={{ width: "100%", height: "100%", background: "#020810" }}>
          {sceneActive && <SceneComponent color={c.color} />}
        </div>
        {/* Overlay hint */}
        <div style={{
          position: "absolute", inset: 0,
          background: hovered ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.0)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.3s",
        }}>
          <div className="font-display" style={{
            background: `${c.color}20`, border: `1px solid ${c.color}80`,
            borderRadius: 24, padding: "8px 20px",
            fontSize: 11, letterSpacing: "0.15em", color: c.color,
            opacity: hovered ? 1 : 0, transform: hovered ? "scale(1)" : "scale(0.9)",
            transition: "opacity 0.3s, transform 0.3s",
          }}>EXPLORE →</div>
        </div>
        {/* Tag */}
        <div className="font-display" style={{
          position: "absolute", top: 14, left: 14,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)",
          border: `1px solid ${c.color}50`, borderRadius: 4,
          padding: "3px 10px", fontSize: 9, letterSpacing: "0.14em",
          color: c.color,
        }}>{c.tag}</div>
        {/* Number */}
        <div className="font-display" style={{
          position: "absolute", bottom: 14, right: 16,
          fontSize: 48, fontWeight: 900,
          color: `${c.color}15`, lineHeight: 1, userSelect: "none",
        }}>0{c.id}</div>
      </div>

      {/* Text Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="font-display" style={{
          fontSize: 10, letterSpacing: "0.18em", color: c.color,
          marginBottom: 12,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{ width: 24, height: 1, background: c.color, opacity: 0.7 }} />
          {c.tag}
        </div>

        <h3 className="font-display" style={{
          fontSize: "clamp(20px,2.5vw,32px)",
          fontWeight: 700, color: "#fff", margin: "0 0 8px", lineHeight: 1.25,
        }}>{c.title}</h3>

        <p className="font-display" style={{ fontSize: 11, color: `${c.color}aa`, margin: "0 0 18px", letterSpacing: "0.1em" }}>{c.subtitle}</p>

        <p className="font-section-thai" style={{
          fontSize: "clamp(13px,1.3vw,15px)", color: "rgba(255,255,255,0.6)",
          lineHeight: 1.7, margin: "0 0 24px",
          maxWidth: 420,
        }}>{c.concept}</p>

        {/* Quick benefit pill */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
          {c.benefit.split(" · ").slice(0, 2).map((b, i) => (
            <span key={i} className="font-section-thai" style={{
              background: `${c.color}10`, border: `1px solid ${c.color}30`,
              borderRadius: 20, padding: "5px 14px",
              fontSize: 11, color: `${c.color}cc`,
            }}>{b}</span>
          ))}
        </div>

        <button
          type="button"
          className="font-display"
          onClick={onClick}
          style={{
            background: "transparent", border: `1px solid ${c.color}60`,
            color: c.color, padding: "10px 28px", borderRadius: 6,
            fontSize: 11,
            letterSpacing: "0.12em", cursor: "pointer",
            transition: "all 0.3s",
            position: "relative", overflow: "hidden",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `${c.color}20`;
            e.currentTarget.style.borderColor = c.color;
            e.currentTarget.style.boxShadow = `0 0 20px ${c.color}40`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = `${c.color}60`;
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          EXPLORE CASE →
        </button>
      </div>
    </div>
  );
}


// ─── Star Field (client-only, avoids SSR/hydration mismatch on numeric styles) ──
function StarField() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  if (!mounted) return null;

  const stars = Array.from({ length: 80 }, (_, i) => ({
    w: `${(seededRand(i * 7 + 0) * 2 + 1).toFixed(2)}px`,
    h: `${(seededRand(i * 7 + 1) * 2 + 1).toFixed(2)}px`,
    l: `${(seededRand(i * 7 + 2) * 100).toFixed(4)}%`,
    t: `${(seededRand(i * 7 + 3) * 100).toFixed(4)}%`,
    o:  +(seededRand(i * 7 + 4) * 0.6 + 0.1).toFixed(4),
    dur: `${(2 + seededRand(i * 7 + 5) * 4).toFixed(3)}s`,
    del: `${(seededRand(i * 7 + 6) * 4).toFixed(3)}s`,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute animate-twinkle rounded-full bg-white"
          style={{
            width: s.w,
            height: s.h,
            left: s.l,
            top: s.t,
            opacity: s.o,
            animationDuration: s.dur,
            animationDelay: s.del,
          }}
        />
      ))}
    </div>
  );
}

// ─── WhySpace Page ─────────────────────────────────────────────────────────────
export default function WhySpace() {
  const [activeCase, setActiveCase] = useState<Case | null>(null);

  return (
    <div
      id="why-space"
      className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#020810_0%,#040d1e_40%,#020810_100%)] text-white"
    >
      <StarField />

      <div
        className="pointer-events-none fixed inset-0 z-[1] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,229,255,0.008)_2px,rgba(0,229,255,0.008)_4px)]"
        aria-hidden
      />

      <div className="relative z-[2]">
        <div className="mx-auto max-w-[800px] px-5 py-[clamp(60px,8vw,100px)] pb-[clamp(50px,6vw,80px)] text-center">
          <div className="mb-8 inline-flex animate-fade-in items-center gap-3 rounded-3xl border border-cyan/25 bg-cyan/8 px-5 py-1.5">
            <div className="glow-dot-cyan-sm h-1.5 w-1.5 rounded-full bg-cyan" />
            <span className="font-display text-[11px] tracking-[0.2em] text-cyan">
              REAL WORLD APPLICATIONS
            </span>
          </div>

          <h1
            className="font-display mb-5 text-[clamp(32px,5vw,60px)] leading-[1.15] font-black animate-slide-up bg-[linear-gradient(135deg,#ffffff_0%,#a8d8ea_50%,#00e5ff_100%)] bg-clip-text text-transparent [animation-delay:0.2s]"
          >
            WHY SPACE
            <br />
            TECHNOLOGY?
          </h1>

          <p className="font-section-thai mx-auto max-w-[720px] animate-slide-up text-[clamp(14px,1.6vw,18px)] leading-[1.8] text-white/55 [animation-delay:0.35s]">
            <span className="inline-block whitespace-nowrap max-[520px]:whitespace-normal">
              เทคโนโลยีอวกาศไม่ใช่แค่เรื่องไกลตัวอีกต่อไป แต่มันคือโครงสร้างพื้นฐานของโลกยุคต่อไป
            </span>
            <br />
            ตัวอย่าง 3 กรณีศึกษา เกี่ยวกับเทคโนโลยีอวกาศในปัจจุบัน
          </p>

          <div className="mt-12 flex animate-slide-up items-center justify-center gap-4 [animation-delay:0.5s]">
            <div className="h-px max-w-20 flex-1 bg-gradient-to-r from-transparent to-cyan/40" />
            <div className="h-2 w-2 rotate-45 border border-cyan opacity-60" />
            <div className="h-px max-w-20 flex-1 bg-gradient-to-l from-transparent to-cyan/40" />
          </div>
        </div>

        <div className="mx-auto max-w-[1180px] px-[clamp(20px,5vw,60px)] pb-[clamp(80px,10vw,120px)]">
          {CASES.map((c, i) => (
            <CaseCard key={c.id} c={c} index={i} onClick={() => setActiveCase(c)} />
          ))}
        </div>
      </div>

      {activeCase && <CaseModal c={activeCase} onClose={() => setActiveCase(null)} />}
    </div>
  );
}