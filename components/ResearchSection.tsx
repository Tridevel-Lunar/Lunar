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
    <section id="research" className="relative overflow-hidden bg-bg px-6 py-32 text-text">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-16 text-center">
          <div className="font-mono mb-7 inline-flex items-center gap-2.5 text-[0.72rem] tracking-[0.3em] text-cyan/85">
            <span className="glow-dot-cyan h-1.5 w-1.5 rounded-full bg-cyan" />
            RESEARCH
          </div>
          <h2 className="mb-5 text-[clamp(2.4rem,5vw,3.6rem)] leading-[1.15] font-light tracking-tight text-text">
            หัวข้อวิจัย
          </h2>
          <p className="mx-auto max-w-[560px] text-[1.05rem] leading-relaxed font-light text-text/50">
            สำรวจเทคโนโลยีอวกาศเชิงลึกที่กำลังพัฒนาในโปรแกรม LUNAR
          </p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
          {TOPICS.map((topic) => (
            <div
              key={topic.title}
              className="rounded-sm border border-cyan/12 bg-white/[0.02] p-6 transition-[border-color] hover:border-cyan/25"
            >
              <h3 className="font-en mb-3 text-[1.05rem] font-bold text-text">
                {topic.title}
              </h3>
              <p className="m-0 text-[0.9rem] leading-relaxed text-text/50">
                {topic.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
