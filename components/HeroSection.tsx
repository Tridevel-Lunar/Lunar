"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const SpaceCanvas = dynamic(() => import("./SpaceCanvas"), { ssr: false });

export default function HeroSection() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        background: "#030812",
        color: "#e8edf5",
      }}
    >
      {/* 3D Background */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
        <SpaceCanvas />
      </div>

      {/* Vignette + bottom fade for legibility */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(3,8,18,0.6) 100%), linear-gradient(to bottom, transparent 60%, rgba(3,8,18,0.9) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 3,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "6rem 1.5rem",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 1.2s ease, transform 1.2s ease",
          pointerEvents: "none",
        }}
      >
        <div
          className="font-mono"
          style={{
            fontSize: "0.75rem",
            letterSpacing: "0.35em",
            color: "rgba(0,229,255,0.8)",
            marginBottom: "2rem",
            textTransform: "uppercase",
          }}
        >
          Thailand Deep Tech Space Program
        </div>

        <h1
          style={{
            fontSize: "clamp(4rem, 14vw, 9rem)",
            fontWeight: 200,
            letterSpacing: "0.18em",
            lineHeight: 1,
            margin: 0,
            color: "#e8edf5",
            textShadow: "0 0 40px rgba(0,229,255,0.25)",
          }}
        >
          LUNAR
        </h1>

        <p
          style={{
            marginTop: "2rem",
            maxWidth: "640px",
            fontSize: "1.05rem",
            lineHeight: 1.7,
            color: "rgba(232,237,245,0.7)",
          }}
        >
          แพลตฟอร์มเรียนรู้เทคโนโลยีอวกาศสำหรับคนไทย
        </p>

        <div
          style={{
            marginTop: "3rem",
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            justifyContent: "center",
            pointerEvents: "auto",
          }}
        >
          <PrimaryBtn label="เริ่มเรียนรู้" />
          <SecondaryBtn label="เกี่ยวกับเรา" />
        </div>
      </div>
    </section>
  );
}

function PrimaryBtn({ label }: { label: string }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      className="font-mono"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "0.9rem 2.4rem",
        background: hov ? "#00e5ff" : "rgba(0,229,255,0.1)",
        border: "1px solid rgba(0,229,255,0.5)",
        color: hov ? "#030812" : "#00e5ff",
        fontSize: "0.82rem",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: hov ? "0 0 30px rgba(0,229,255,0.4)" : "none",
        backdropFilter: "blur(8px)",
      }}
    >
      {label}
    </button>
  );
}

function SecondaryBtn({ label }: { label: string }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      className="font-mono"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "0.9rem 2.4rem",
        background: "rgba(232,237,245,0.03)",
        border: "1px solid rgba(232,237,245,0.18)",
        color: hov ? "#e8edf5" : "rgba(232,237,245,0.6)",
        fontSize: "0.82rem",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        cursor: "pointer",
        transition: "all 0.3s ease",
        backdropFilter: "blur(8px)",
      }}
    >
      {label}
    </button>
  );
}
