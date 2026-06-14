"use client";
import { useEffect, useRef, useState } from "react";

const STEPS = [
  { num: "01", title: "สมัครเข้าร่วม", desc: "กรอกข้อมูลพื้นฐานและความสนใจด้านอวกาศของคุณ ไม่จำเป็นต้องมีพื้นฐานมาก่อน", icon: "✦" },
  { num: "02", title: "เลือกเส้นทาง", desc: "เลือก Track ที่ตรงกับเป้าหมาย ไม่ว่าจะเป็น Hardware, Software หรือ Systems Engineering", icon: "◈" },
  { num: "03", title: "เรียนรู้และสร้าง", desc: "เรียนผ่านโปรแกรมออนไลน์ ทดลองใช้อุปกรณ์จริง และร่วมทีมโปรเจกต์กับเพื่อน", icon: "⬡" },
  { num: "04", title: "Launch Your Idea", desc: "นำเสนอผลงานต่อนักลงทุน หน่วยงานรัฐ และพาร์ทเนอร์อุตสาหกรรมในงาน Demo Day", icon: "△" },
];

export default function JoinSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.2 });
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="join-us" ref={sectionRef} style={{ padding: "8rem 4rem", position: "relative", overflow: "hidden" }}>
      {/* Glow background */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "800px", height: "400px",
        background: "radial-gradient(ellipse, rgba(0,229,255,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: "5rem", opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(30px)", transition: "all 0.8s" }}>
          <p className="font-mono" style={{ fontSize: "0.7rem", letterSpacing: "0.4em", color: "#00e5ff", textTransform: "uppercase", marginBottom: "1rem" }}>
            04 / Get Started
          </p>
          <h2 className="font-en" style={{ fontWeight: 800, fontSize: "clamp(2.5rem, 6vw, 4.5rem)", lineHeight: 1.0, marginBottom: "1.5rem" }}>
            พร้อมเดินทางสู่<br />
            <span style={{
              background: "linear-gradient(90deg, #00e5ff, #1de9b6)",
              WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent"
            }}>อนาคตของอวกาศ?</span>
          </h2>
          <p style={{ fontSize: "1rem", color: "rgba(232,237,245,0.5)", maxWidth: "500px", margin: "0 auto", lineHeight: 1.9 }}>
            เข้าร่วม LUNAR Program และเป็นส่วนหนึ่งของผู้บุกเบิก<br />เทคโนโลยีอวกาศของไทย
          </p>
        </div>

        {/* Steps */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem", marginBottom: "5rem" }}>
          {STEPS.map((s, i) => (
            <div
              key={i}
              style={{
                padding: "1.8rem 1.5rem",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(0,229,255,0.1)",
                borderRadius: "2px",
                position: "relative",
                opacity: inView ? 1 : 0,
                transform: inView ? "none" : "translateY(40px)",
                transition: `all 0.7s ease ${0.1 + i * 0.1}s`,
              }}
            >
              {/* connector line */}
              {i < 3 && (
                <div style={{
                  position: "absolute", top: "2.5rem", right: "-0.75rem",
                  width: "1.5rem", height: "1px",
                  background: "linear-gradient(to right, rgba(0,229,255,0.3), rgba(0,229,255,0.1))",
                  zIndex: 1,
                }} />
              )}
              <div className="font-mono" style={{ fontSize: "0.62rem", color: "rgba(0,229,255,0.5)", letterSpacing: "0.15em", marginBottom: "1rem" }}>{s.num}</div>
              <div style={{ fontSize: "1.3rem", color: "#00e5ff", marginBottom: "0.8rem" }}>{s.icon}</div>
              <h4 className="font-en" style={{ fontWeight: 700, fontSize: "1rem", color: "#e8edf5", marginBottom: "0.7rem" }}>{s.title}</h4>
              <p style={{ fontSize: "0.83rem", lineHeight: 1.8, color: "rgba(232,237,245,0.45)" }}>{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Email CTA */}
        <div style={{
          padding: "3.5rem", textAlign: "center",
          background: "rgba(0,229,255,0.04)", border: "1px solid rgba(0,229,255,0.15)",
          borderRadius: "2px",
          opacity: inView ? 1 : 0, transition: "all 0.8s 0.5s",
          boxShadow: "0 0 80px rgba(0,229,255,0.06)",
        }}>
          {!submitted ? (
            <>
              <h3 className="font-en" style={{ fontWeight: 800, fontSize: "1.8rem", color: "#e8edf5", marginBottom: "0.8rem" }}>
                ลงทะเบียนรับข่าวสาร
              </h3>
              <p style={{ color: "rgba(232,237,245,0.45)", marginBottom: "2rem", fontSize: "0.92rem", lineHeight: 1.8 }}>
                รับข้อมูลรุ่นแรกของโปรแกรมและ Early Access ก่อนใคร
              </p>
              <div style={{ display: "flex", gap: "0.8rem", justifyContent: "center", maxWidth: "480px", margin: "0 auto" }}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="font-mono"
                  style={{
                    flex: 1, padding: "0.9rem 1.2rem",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(0,229,255,0.25)",
                    color: "#e8edf5", fontSize: "0.85rem",
                    outline: "none", letterSpacing: "0.05em",
                    borderRadius: "1px",
                  }}
                />
                <button
                  onClick={() => email && setSubmitted(true)}
                  style={{
                    padding: "0.9rem 1.8rem",
                    background: "#00e5ff", color: "#030812",
                    border: "none", cursor: "pointer",
                    fontFamily: "inherit", fontWeight: 700,
                    fontSize: "0.82rem", letterSpacing: "0.1em",
                    clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
                    transition: "all 0.3s",
                    boxShadow: "0 0 25px rgba(0,229,255,0.4)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 40px rgba(0,229,255,0.6)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 25px rgba(0,229,255,0.4)"; }}
                >
                  JOIN LUNAR
                </button>
              </div>
            </>
          ) : (
            <div style={{ padding: "1rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚀</div>
              <h3 className="font-en" style={{ fontWeight: 800, fontSize: "1.8rem", color: "#00e5ff", marginBottom: "0.8rem" }}>
                Welcome to LUNAR!
              </h3>
              <p style={{ color: "rgba(232,237,245,0.55)", lineHeight: 1.8 }}>
                เราได้รับอีเมลของคุณแล้ว จะแจ้งข่าวสารเปิดรับสมัครให้ทราบเป็นคนแรก
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
