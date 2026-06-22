export default function Footer() {
  return (
    <footer className="border-t border-white/6 bg-black/40 px-16 py-12">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between">
        <div>
          <span className="font-en text-[1.1rem] font-extrabold tracking-[0.35em] text-cyan shadow-[0_0_15px_rgba(0,229,255,0.4)]">
            LUNAR
          </span>
          <p className="mt-2 text-[0.78rem] text-text/30">
            Thailand Deep Tech Space Learning Program
          </p>
        </div>
        <div className="flex gap-8">
          {["Star Tracker", "CubeSat OS", "Laser Comms", "Electric Propulsion"].map((item) => (
            <span
              key={item}
              className="font-mono cursor-pointer text-[0.65rem] tracking-[0.08em] text-text/25"
            >
              {item}
            </span>
          ))}
        </div>
        <p className="font-mono text-[0.65rem] tracking-[0.1em] text-text/20">
          © 2025 LUNAR PROGRAM
        </p>
      </div>
    </footer>
  );
}
