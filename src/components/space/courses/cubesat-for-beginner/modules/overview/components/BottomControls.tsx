interface BottomControlsProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
  paused: boolean;
  onTogglePaused: () => void;
  onReset: () => void;
  onFullscreen: () => void;
}

export default function BottomControls({
  speed,
  onSpeedChange,
  paused,
  onTogglePaused,
  onReset,
  onFullscreen,
}: BottomControlsProps) {
  return (
    <div className="glass-panel absolute bottom-4 left-1/2 -translate-x-1/2 rounded-xl px-4 py-2.5 flex items-center gap-4 text-sm">
      <span className="text-white/60">Speed</span>
      <span className="font-semibold w-8">{speed.toFixed(1)}x</span>
      <input
        type="range"
        min={0.1}
        max={5}
        step={0.1}
        value={speed}
        onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
        className="w-40 accent-blue-500"
      />
      <button
        onClick={onTogglePaused}
        className="w-9 h-9 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center"
        aria-label={paused ? "Play" : "Pause"}
      >
        {paused ? "▶" : "❚❚"}
      </button>
      <button
        onClick={onReset}
        className="w-9 h-9 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center"
        aria-label="Reset"
      >
        ↻
      </button>
      <button
        onClick={onFullscreen}
        className="w-9 h-9 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center"
        aria-label="Fullscreen"
      >
        ⛶
      </button>
    </div>
  );
}
