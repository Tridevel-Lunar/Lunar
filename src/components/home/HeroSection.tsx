import { lazy, Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SpaceCanvas = lazy(() => import("./SpaceCanvas"));

export default function HeroSection() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-bg text-text">
      <div className="absolute inset-0 z-[1]">
        <Suspense fallback={null}>
          <SpaceCanvas />
        </Suspense>
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(3,8,18,0.6)_100%),linear-gradient(to_bottom,transparent_60%,rgba(3,8,18,0.9)_100%)]"
        aria-hidden
      />

      <div
        className={`relative z-[3] flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center transition-[opacity,transform] duration-[1.2s] ease-out pointer-events-none ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
      >
        <div className="font-mono mb-8 text-[0.72rem] tracking-[0.35em] text-cyan/70 uppercase">
          Learn · Build · Launch
        </div>

        <h1 className="m-0 text-[clamp(4rem,14vw,9rem)] leading-none font-extralight tracking-[0.18em] text-text">
          LUNAR
        </h1>

        <p className="mt-8 max-w-[640px] text-[1.05rem] leading-relaxed text-text/70">
          แพลตฟอร์มการเรียนรู้เทคโนโลยีอวกาศแบบ Interactive Learning
        </p>

        <div className="pointer-events-auto mt-12">
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="font-mono cursor-pointer border border-cyan/50 bg-cyan/10 px-10 py-3.5 text-[0.82rem] tracking-[0.12em] text-cyan uppercase backdrop-blur-sm transition-all hover:bg-cyan hover:text-bg"
          >
            เริ่มเรียนรู้
          </button>
        </div>
      </div>
    </section>
  );
}


