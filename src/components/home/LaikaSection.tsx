import { useEffect, useRef, useState } from "react";
import { HiOutlineChatBubbleLeftRight, HiOutlineDocumentText } from "react-icons/hi2";
import { IoBulbOutline } from "react-icons/io5";

const FEATURES = [
  {
    title: "ปรึกษา AI ตลอด 24 ชม.",
    desc: "LAIKA พร้อมตอบทุกคำถามเกี่ยวกับบทเรียน ฟิสิกส์อวกาศ และโครงสร้างดาวเทียม ตลอดเวลา",
    icon: HiOutlineChatBubbleLeftRight,
  },
  {
    title: "อ้างอิงจากแหล่งจริง",
    desc: "ใช้ RAG ดึงข้อมูลจากเอกสาร NASA และวิศวกรรมอวกาศก่อนตอบ ลดการมั่วและเพิ่มความน่าเชื่อถือ",
    icon: HiOutlineDocumentText,
  },
  {
    title: "ต่อยอดไอเดีย",
    desc: "ช่วยวิเคราะห์แนวคิด แนะนำเส้นทางพัฒนาต่อ และเชื่อมโยงสู่นวัตกรรมหรืออาชีพในอุตสาหกรรมอวกาศ",
    icon: IoBulbOutline,
  },
];

export default function LaikaSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { threshold: 0.2 },
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="laika"
      className="relative overflow-hidden border-t border-white/[0.04] bg-bg px-6 py-32 text-text"
    >
      <div className="mx-auto max-w-[1200px]">
        <div
          className={`mb-16 text-center transition-all duration-800 ${inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <div className="mb-10 flex flex-col items-center gap-4">
            <div className="flex items-center justify-center">
              <div className="h-[15rem] w-[15rem]">
                <img
                  src="/LAIKA.png"
                  alt="LAIKA"
                  className="h-full w-full object-cover object-center"
                />
              </div>
            </div>
            <div className="font-mono inline-flex items-center gap-2.5 text-[0.72rem] tracking-[0.3em] text-amber/85">
              <span className="h-1.5 w-1.5 rounded-full bg-amber" />
              AI MENTOR
            </div>
          </div>
          <h2 className="mb-5 text-[clamp(2.4rem,5vw,3.6rem)] leading-[1.15] font-light tracking-tight text-text">
            พบกับ{" "}
            <span className="text-amber">LAIKA</span>
          </h2>
          <p className="mx-auto max-w-[560px] text-[1.05rem] leading-relaxed font-light text-text/50">
            ผู้ช่วย AI ที่เข้าใจทั้งวิศวกรรมอวกาศและเส้นทางการเรียนรู้ของคุณ
            พร้อมให้คำแนะนำแบบเรียลไทม์
          </p>
        </div>

        <div className="mb-16 grid grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`rounded-sm border border-white/[0.06] bg-white/[0.02] p-8 transition-all duration-700 hover:border-amber/20 hover:bg-amber/[0.03] ${inView ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
              style={{ transitionDelay: `${200 + i * 120}ms` }}
            >
              <div className="mb-5 text-[1.6rem] text-amber/70">
                <f.icon />
              </div>
              <h3 className="font-en mb-3 text-[1.1rem] font-bold text-text">
                {f.title}
              </h3>
              <p className="m-0 text-[0.9rem] leading-relaxed text-text/50">
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        {/* <div
          className={`rounded-sm border border-amber/10 bg-amber/[0.03] p-12 text-center transition-all duration-800 ${inView ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "600ms" }}
        >

          <h3 className="font-en mb-3 text-[1.6rem] font-bold text-text">
            LAIKA พร้อมช่วยคุณแล้ว
          </h3>
          <p className="mx-auto mb-8 max-w-[480px] leading-relaxed text-text/50">
            เปิด Studio แล้วลองถาม LAIKA เกี่ยวกับบทเรียนหรือไอเดียของคุณดู
            ไม่ว่าจะเป็นเรื่องฟิสิกส์ ระบบดาวเทียม หรือเส้นทางอาชีพ
          </p>
          <a
            href="/register"
            className="btn-clip inline-block border border-amber px-10 py-3 font-mono text-[0.85rem] font-bold tracking-[0.12em] uppercase text-amber no-underline transition-all duration-300 hover:bg-amber hover:text-bg"
          >
            ทดลองใช้ LAIKA
          </a>
        </div> */}
      </div>
    </section>
  );
}
