export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-black/50 px-16 py-10">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between">
        <div>
          <span className="font-en text-[1.1rem] font-extrabold tracking-[0.35em] text-cyan">
            LUNAR
          </span>
          <p className="mt-2 text-[0.78rem] text-text/30">
            Space Technology Learning Platform
          </p>
        </div>
        
        <p className="font-mono text-[0.65rem] tracking-[0.1em] text-text/20">
          © 2026 LUNAR
        </p>
      </div>
    </footer>
  );
}
