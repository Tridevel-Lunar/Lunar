import { useEffect, useRef, useState } from "react";

const STEPS = [
  { num: "01", title: "Space — เรียนรู้", desc: "เริ่มต้นด้วยการเรียนรู้ 4 ด้าน: 3D Model, Embedded System, Physics, Programming เพื่อปูพื้นฐานวิศวกรรมอวกาศแบบ interactive" },
  { num: "02", title: "Arena — ลงมือสร้าง", desc: "เขียนโปรแกรมควบคุมดาวเทียมด้วย Blockly และทดสอบภารกิจใน Simulation Sandbox ที่ทำงานร่วมกับ Physics Engine จริง" },
  { num: "03", title: "Studio — ต่อยอดไอเดีย", desc: "สะสมผลงาน วางแผนพัฒนา และปรึกษา LAIKA ผู้เชี่ยวชาญ AI ที่พร้อมช่วยวิเคราะห์ไอเดียและให้คำแนะนำ" },
  { num: "04", title: "Launch Your Future", desc: "จากผู้เรียนสู่ผู้สร้าง นำความรู้ที่ได้ไปต่อยอดเป็นนวัตกรรมอวกาศ หรือเส้นทางอาชีพในอุตสาหกรรม" },
];

export default function JoinSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setInView(true);
    }, { threshold: 0.2 });
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="join-us" ref={sectionRef} className="relative px-16 py-32">
      <div className="mx-auto max-w-[1100px]">
        <div
          className={`mb-20 text-center transition-all duration-800 ${inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <p className="font-mono mb-4 text-[0.7rem] tracking-[0.4em] text-cyan uppercase">
            Get Started
          </p>
          <h2 className="font-en mb-6 text-[clamp(2.5rem,6vw,4.5rem)] leading-none font-extrabold text-text">
            เริ่มต้นกับ LUNAR
          </h2>
          <p className="mx-auto max-w-[500px] text-base leading-[1.9] text-text/50">
            เรียนรู้พื้นฐาน สร้างดาวเทียมจำลอง และต่อยอดไอเดียกับ AI
            <br />
            ครบจบในแพลตฟอร์มเดียว
          </p>
        </div>

        <div className="mb-20 grid grid-cols-4 gap-6">
          {STEPS.map((s, i) => (
            <div
              key={s.num}
              className={`relative rounded-sm border border-cyan/10 bg-white/[0.02] p-7 transition-all duration-700 ${inView ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
              style={{ transitionDelay: `${100 + i * 100}ms` }}
            >
                <div className="font-mono mb-3 text-[0.62rem] tracking-[0.15em] text-cyan/50">
                {s.num}
              </div>
              <h4 className="font-en mb-3 text-base font-bold text-text">{s.title}</h4>
              <p className="text-[0.83rem] leading-[1.8] text-text/45">{s.desc}</p>
            </div>
          ))}
        </div>

        <div
          className={`rounded-sm text-center ${inView ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "500ms" }}
        >
          <div className="relative border border-cyan/20 bg-gradient-to-b from-cyan/[0.06] to-cyan/[0.02] p-16 shadow-[0_0_60px_rgba(0,229,255,0.08)]">
            <div
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(0,229,255,0.06),transparent_50%,transparent_50%,rgba(0,229,255,0.03))]"
              aria-hidden
            />
            <div className="relative">
              <h3 className="font-en mb-4 text-[clamp(1.8rem,3.5vw,2.8rem)] font-extrabold leading-tight tracking-tight text-text">
                เริ่มเรียนฟรี ไม่มีค่าใช้จ่าย
              </h3>
              <p className="mx-auto mb-10 max-w-[420px] text-[0.92rem] leading-[1.9] text-text/45">
                กดลงทะเบียนเลย และเริ่มต้นเดินทางสู่อวกาศกับ LUNAR
              </p>

              <a
                href="/register"
                className="btn-clip relative inline-block border-2 border-cyan px-14 py-4 font-mono text-[0.9rem] font-bold tracking-[0.15em] uppercase text-cyan no-underline transition-all duration-300 hover:scale-105 hover:bg-cyan hover:text-bg hover:shadow-[0_0_40px_rgba(0,229,255,0.4)]"
              >
                ลงทะเบียนฟรี
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
