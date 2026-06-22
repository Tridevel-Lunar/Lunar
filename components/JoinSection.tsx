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
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setInView(true);
    }, { threshold: 0.2 });
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="join-us" ref={sectionRef} className="relative overflow-hidden px-16 py-32">
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse,rgba(0,229,255,0.06)_0%,transparent_70%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1100px]">
        <div
          className={`mb-20 text-center transition-all duration-800 ${inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <p className="font-mono mb-4 text-[0.7rem] tracking-[0.4em] text-cyan uppercase">
            04 / Get Started
          </p>
          <h2 className="font-en mb-6 text-[clamp(2.5rem,6vw,4.5rem)] leading-none font-extrabold">
            พร้อมเดินทางสู่
            <br />
            <span className="bg-gradient-to-r from-cyan to-teal bg-clip-text text-transparent">
              อนาคตของอวกาศ?
            </span>
          </h2>
          <p className="mx-auto max-w-[500px] text-base leading-[1.9] text-text/50">
            เข้าร่วม LUNAR Program และเป็นส่วนหนึ่งของผู้บุกเบิก
            <br />
            เทคโนโลยีอวกาศของไทย
          </p>
        </div>

        <div className="mb-20 grid grid-cols-4 gap-6">
          {STEPS.map((s, i) => (
            <div
              key={s.num}
              className={`relative rounded-sm border border-cyan/10 bg-white/[0.02] p-7 transition-all duration-700 ${inView ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
              style={{ transitionDelay: `${100 + i * 100}ms` }}
            >
              {i < 3 && (
                <div
                  className="absolute top-10 -right-3 z-1 h-px w-6 bg-gradient-to-r from-cyan/30 to-cyan/10"
                  aria-hidden
                />
              )}
              <div className="font-mono mb-4 text-[0.62rem] tracking-[0.15em] text-cyan/50">
                {s.num}
              </div>
              <div className="mb-3 text-[1.3rem] text-cyan">{s.icon}</div>
              <h4 className="font-en mb-3 text-base font-bold text-text">{s.title}</h4>
              <p className="text-[0.83rem] leading-[1.8] text-text/45">{s.desc}</p>
            </div>
          ))}
        </div>

        <div
          className={`rounded-sm border border-cyan/15 bg-cyan/[0.04] p-14 text-center shadow-[0_0_80px_rgba(0,229,255,0.06)] transition-all duration-800 ${inView ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "500ms" }}
        >
          {!submitted ? (
            <>
              <h3 className="font-en mb-3 text-[1.8rem] font-extrabold text-text">
                ลงทะเบียนรับข่าวสาร
              </h3>
              <p className="mb-8 text-[0.92rem] leading-[1.8] text-text/45">
                รับข้อมูลรุ่นแรกของโปรแกรมและ Early Access ก่อนใคร
              </p>
              <div className="mx-auto flex max-w-[480px] justify-center gap-3">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="font-mono flex-1 rounded-sm border border-cyan/25 bg-white/[0.04] px-5 py-3.5 text-[0.85rem] tracking-[0.05em] text-text outline-none"
                />
                <button
                  type="button"
                  onClick={() => email && setSubmitted(true)}
                  className="btn-clip cursor-pointer border-none bg-cyan px-7 py-3.5 font-mono text-[0.82rem] font-bold tracking-[0.1em] text-bg shadow-[0_0_25px_rgba(0,229,255,0.4)] transition-shadow hover:shadow-[0_0_40px_rgba(0,229,255,0.6)]"
                >
                  JOIN LUNAR
                </button>
              </div>
            </>
          ) : (
            <div className="p-4">
              <div className="mb-4 text-5xl">🚀</div>
              <h3 className="font-en mb-3 text-[1.8rem] font-extrabold text-cyan">
                Welcome to LUNAR!
              </h3>
              <p className="leading-[1.8] text-text/55">
                เราได้รับอีเมลของคุณแล้ว จะแจ้งข่าวสารเปิดรับสมัครให้ทราบเป็นคนแรก
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
