"use client";

const TOPICS = [
  { title: "Star Tracker", description: "Attitude determination and optical navigation for spacecraft" },
  { title: "Air Bearing", description: "Frictionless testbed for satellite attitude control experiments" },
  { title: "CubeSat OS", description: "Lightweight operating system for small satellite missions" },
  { title: "Laser Comm", description: "High-bandwidth optical communication between spacecraft" },
  { title: "SAR", description: "Synthetic aperture radar for all-weather Earth observation" },
  { title: "Electric Propulsion", description: "Ion and Hall-effect thrusters for efficient orbit maneuvers" },
  { title: "Rocket GNC", description: "Guidance, navigation, and control for launch vehicles" },
] as const;

export default function ResearchSection() {
  return (
    <section
      id="research"
      style={{
        position: "relative",
        background: "#030812",
        color: "#e8edf5",
        padding: "8rem 1.5rem",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div
            className="font-mono"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              fontSize: "0.72rem",
              letterSpacing: "0.3em",
              color: "rgba(0,229,255,0.85)",
              marginBottom: "1.75rem",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                background: "#00e5ff",
                borderRadius: "50%",
                boxShadow: "0 0 12px #00e5ff",
              }}
            />
            RESEARCH
          </div>
          <h2
            style={{
              fontSize: "clamp(2.4rem, 5vw, 3.6rem)",
              fontWeight: 300,
              letterSpacing: "-0.01em",
              color: "#e8edf5",
              margin: "0 0 1.25rem 0",
              lineHeight: 1.15,
            }}
          >
            หัวข้อวิจัย
          </h2>
          <p
            style={{
              fontSize: "1.05rem",
              fontWeight: 300,
              color: "rgba(232,237,245,0.5)",
              maxWidth: 560,
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            สำรวจเทคโนโลยีอวกาศเชิงลึกที่กำลังพัฒนาในโปรแกรม LUNAR
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {TOPICS.map((topic) => (
            <div
              key={topic.title}
              style={{
                padding: "1.75rem 1.5rem",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(0,229,255,0.12)",
                borderRadius: 2,
                transition: "border-color 0.3s",
              }}
            >
              <h3
                className="font-en"
                style={{
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  color: "#e8edf5",
                  margin: "0 0 0.75rem 0",
                }}
              >
                {topic.title}
              </h3>
              <p
                style={{
                  fontSize: "0.9rem",
                  lineHeight: 1.65,
                  color: "rgba(232,237,245,0.5)",
                  margin: 0,
                }}
              >
                {topic.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
