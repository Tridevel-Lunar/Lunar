export default function Footer() {
  return (
    <footer style={{ padding: "3rem 4rem", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.4)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <span className="font-en" style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "0.35em", color: "#00e5ff", textShadow: "0 0 15px rgba(0,229,255,0.4)" }}>
            LUNAR
          </span>
          <p style={{ marginTop: "0.5rem", fontSize: "0.78rem", color: "rgba(232,237,245,0.3)" }}>
            Thailand Deep Tech Space Learning Program
          </p>
        </div>
        <div style={{ display: "flex", gap: "2rem" }}>
          {["Star Tracker", "CubeSat OS", "Laser Comms", "Electric Propulsion"].map((item, i) => (
            <span key={i} className="font-mono" style={{ fontSize: "0.65rem", color: "rgba(232,237,245,0.25)", letterSpacing: "0.08em", cursor: "pointer" }}>
              {item}
            </span>
          ))}
        </div>
        <p className="font-mono" style={{ fontSize: "0.65rem", color: "rgba(232,237,245,0.2)", letterSpacing: "0.1em" }}>
          © 2025 LUNAR PROGRAM
        </p>
      </div>
    </footer>
  );
}
