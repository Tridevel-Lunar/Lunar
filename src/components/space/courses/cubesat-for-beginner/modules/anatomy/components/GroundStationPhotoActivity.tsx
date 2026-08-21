import { useEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";

import type { ScenarioId } from "../lib/scenarios";
import {
  PHOTO_MISSION_PIPELINE,
  PHOTO_MISSION_STEPS,
  pipelineActiveIndex,
  type PhotoMissionPhase,
} from "../lib/photo-mission";

type GroundStationPhotoActivityProps = {
  onPlayScenario: (id: ScenarioId) => void;
};

type CameraState = "off" | "requesting" | "live" | "denied" | "unavailable";

function StationPhotoFrame({
  revealed,
  flashing,
  photoUrl,
  videoRef,
  cameraState,
  showLivePreview,
}: {
  revealed: boolean;
  flashing?: boolean;
  photoUrl: string | null;
  videoRef: RefObject<HTMLVideoElement | null>;
  cameraState: CameraState;
  showLivePreview: boolean;
}) {
  return (
    <div className="relative mx-auto w-full max-w-[280px]">
      <AnimatePresence>
        {flashing && (
          <motion.div
            key="flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.9, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55 }}
            className="pointer-events-none absolute inset-0 z-20 rounded-[1.35rem] bg-white/90"
            aria-hidden
          />
        )}
      </AnimatePresence>

      <div
        className="relative rounded-[1.35rem] p-[10px]"
        style={{
          background:
            "linear-gradient(145deg, #c8d2e0 0%, #6b778a 28%, #e8eef8 48%, #4a5568 72%, #a8b4c4 100%)",
          boxShadow:
            "0 12px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.55)",
        }}
      >
        {[
          "top-2 left-2",
          "top-2 right-2",
          "bottom-2 left-2",
          "bottom-2 right-2",
        ].map((pos) => (
          <span
            key={pos}
            className={`absolute h-2 w-2 rounded-full bg-[#3d4656] shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)] ${pos}`}
          />
        ))}

        <div className="rounded-[0.95rem] border border-[#1a2230]/80 bg-[#0b1220] p-1.5 shadow-[inset_0_0_18px_rgba(0,0,0,0.65)]">
          <div className="relative overflow-hidden rounded-[0.7rem] border border-cyan/25 bg-[#050a14]">
            <div className="relative aspect-[4/3] w-full">
              {/* Live camera — mirrored like a selfie viewfinder */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
                  showLivePreview && cameraState === "live"
                    ? "opacity-100"
                    : "pointer-events-none opacity-0"
                }`}
                style={{ transform: "scaleX(-1)" }}
              />

              <AnimatePresence mode="wait">
                {revealed && photoUrl ? (
                  <motion.img
                    key="photo"
                    src={photoUrl}
                    alt="ภาพจากกล้องจำลอง payload ของ CubeSat"
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ transform: "scaleX(-1)" }}
                  />
                ) : null}
              </AnimatePresence>

              {!showLivePreview && !revealed && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[radial-gradient(circle_at_30%_20%,#122038,transparent_55%),#060b16]">
                  {cameraState === "requesting" ? (
                    <p className="font-mono text-[0.55rem] tracking-[0.18em] text-cyan/60">
                      OPENING CAMERA…
                    </p>
                  ) : cameraState === "denied" ||
                    cameraState === "unavailable" ? (
                    <p className="font-section-thai max-w-[90%] text-center text-[0.72rem] text-rose-200/80">
                      เปิดกล้องไม่ได้ — อนุญาตใช้กล้องแล้วลองใหม่
                    </p>
                  ) : (
                    <>
                      <div className="h-10 w-10 rounded-full border border-dashed border-cyan/30" />
                      <p className="font-mono text-[0.55rem] tracking-[0.22em] text-cyan/50">
                        AWAITING IMAGE
                      </p>
                    </>
                  )}
                  <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(125,211,252,0.35)_1px,transparent_1px)] [background-size:14px_14px]" />
                </div>
              )}

              {/* Cupola glass overlays */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(0,0,0,0.42)_100%)]" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent" />
              {showLivePreview && cameraState === "live" && !revealed && (
                <div className="pointer-events-none absolute left-2 top-2 rounded border border-rose-400/40 bg-rose-500/20 px-1.5 py-0.5 font-mono text-[0.48rem] tracking-wider text-rose-100">
                  ● LIVE
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-2 flex max-w-[240px] items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5">
        <span className="font-mono text-[0.52rem] tracking-[0.16em] text-text/45">
          LUNAR GS · CUPOLA
        </span>
        <span className="font-mono text-[0.52rem] tracking-wider text-cyan/70">
          {revealed && photoUrl ? "IMG_YOU.OK" : "CAM READY"}
        </span>
      </div>
    </div>
  );
}

function captureFrame(video: HTMLVideoElement): string | null {
  const w = video.videoWidth;
  const h = video.videoHeight;
  if (!w || !h) return null;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(video, 0, 0, w, h);
  try {
    return canvas.toDataURL("image/jpeg", 0.92);
  } catch {
    return null;
  }
}

export default function GroundStationPhotoActivity({
  onPlayScenario,
}: GroundStationPhotoActivityProps) {
  const [phase, setPhase] = useState<PhotoMissionPhase>("idle");
  const [stepIndex, setStepIndex] = useState(-1);
  const [cameraState, setCameraState] = useState<CameraState>("off");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const capturedForRunRef = useRef(false);

  const running = phase !== "idle" && phase !== "revealed";
  const current = stepIndex >= 0 ? PHOTO_MISSION_STEPS[stepIndex] : null;
  const activePipe = pipelineActiveIndex(phase);
  const showLivePreview =
    cameraState === "live" &&
    (phase === "idle" ||
      phase === "uplink" ||
      phase === "comm-to-obc" ||
      phase === "obc-to-payload" ||
      phase === "capturing");

  useEffect(() => {
    return () => {
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
      stopCamera();
    };
  }, []);

  // Snap real webcam frame when payload “captures”
  useEffect(() => {
    if (phase !== "capturing" || capturedForRunRef.current) return;
    const video = videoRef.current;
    if (!video || cameraState !== "live") return;

    const snap = () => {
      if (capturedForRunRef.current) return;
      const url = captureFrame(video);
      if (url) {
        capturedForRunRef.current = true;
        setPhotoUrl(url);
      }
    };

    // Wait a tick so the live stream is painted
    const id = window.setTimeout(snap, 120);
    return () => window.clearTimeout(id);
  }, [phase, cameraState]);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  async function ensureCamera(): Promise<boolean> {
    if (streamRef.current && cameraState === "live") return true;
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState("unavailable");
      setCameraError("เบราว์เซอร์นี้ไม่รองรับกล้อง");
      return false;
    }

    setCameraState("requesting");
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play().catch(() => undefined);
      }
      setCameraState("live");
      return true;
    } catch {
      setCameraState("denied");
      setCameraError("กรุณาอนุญาตการใช้กล้อง แล้วกดส่งคำสั่งอีกครั้ง");
      return false;
    }
  }

  function clearTimer() {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function advanceTo(index: number) {
    if (index < 0 || index >= PHOTO_MISSION_STEPS.length) return;
    const step = PHOTO_MISSION_STEPS[index]!;
    setStepIndex(index);
    setPhase(step.phase);
    if (step.scenarioId) onPlayScenario(step.scenarioId);

    if (step.dwellMs > 0 && index < PHOTO_MISSION_STEPS.length - 1) {
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        advanceTo(index + 1);
      }, step.dwellMs);
    }
  }

  async function startMission() {
    clearTimer();
    capturedForRunRef.current = false;
    setPhotoUrl(null);
    const ok = await ensureCamera();
    if (!ok) return;
    advanceTo(0);
  }

  function resetMission() {
    clearTimer();
    setPhase("idle");
    setStepIndex(-1);
    setPhotoUrl(null);
    capturedForRunRef.current = false;
    // Keep camera on so learner can see themselves ready for next shot
  }

  // Attach stream if video remounts while live
  useEffect(() => {
    const video = videoRef.current;
    if (video && streamRef.current && !video.srcObject) {
      video.srcObject = streamRef.current;
      void video.play().catch(() => undefined);
    }
  });

  return (
    <div className="space-y-3 rounded-2xl border border-cyan/20 bg-gradient-to-b from-cyan/[0.07] to-white/[0.02] p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-[0.55rem] tracking-[0.2em] text-cyan/75 uppercase">
            Activity · Ground Station
          </p>
          <h3 className="font-section-thai mt-1 text-[0.92rem] font-medium text-text">
            สั่งถ่ายภาพจากสถานีภาคพื้น
          </h3>
        </div>
        <span className="font-mono shrink-0 rounded-md border border-white/10 bg-black/30 px-2 py-1 text-[0.5rem] tracking-wider text-text/45">
          GS-01
        </span>
      </div>

      <p className="font-section-thai text-[0.78rem] leading-relaxed text-text/55">
        ลองนั่งหน้าคอมพิวเตอร์เป็นสถานีภาคพื้น กดส่งคำสั่ง แล้วดูลำดับที่ดาวเทียมทำงาน
        ตอนถ่ายภาพ กล้องจะถ่ายคุณจริงๆ แล้วส่งกลับมาโชว์ในกรอบสถานีอวกาศ
      </p>

      <div className="flex flex-wrap items-center gap-1">
        {PHOTO_MISSION_PIPELINE.map((node, i) => {
          const on = activePipe === i;
          const passed =
            activePipe != null && i < activePipe && phase !== "idle";
          return (
            <span key={`${node}-${i}`} className="flex items-center gap-1">
              {i > 0 && (
                <span className="font-mono text-[0.55rem] text-text/25">→</span>
              )}
              <span
                className={`rounded-md border px-1.5 py-1 font-mono text-[0.55rem] tracking-wide transition ${
                  on
                    ? "border-cyan/50 bg-cyan/20 text-cyan shadow-[0_0_12px_rgba(0,229,255,0.25)]"
                    : passed
                      ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200/80"
                      : "border-white/10 bg-white/[0.03] text-text/35"
                }`}
              >
                {node}
              </span>
            </span>
          );
        })}
      </div>

      <div className="min-h-[3.25rem] rounded-xl border border-dashed border-white/12 bg-black/25 px-3 py-2.5">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase + (cameraError ?? "")}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {cameraError ? (
              <p className="font-section-thai text-[0.78rem] text-rose-200/85">
                {cameraError}
              </p>
            ) : phase === "idle" ? (
              <p className="font-section-thai text-[0.78rem] text-text/40">
                กดส่งคำสั่งเพื่อเปิดกล้องและเริ่มภารกิจ — จัดท่าให้อยู่ในเฟรมได้เลย
              </p>
            ) : phase === "capturing" ? (
              <>
                <p className="font-mono text-[0.55rem] tracking-[0.18em] text-cyan/80">
                  CAPTURE
                  <span className="ml-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-cyan" />
                </p>
                <p className="font-section-thai mt-1 text-[0.8rem] leading-relaxed text-text/75">
                  Payload เปิดชัตเตอร์ — กำลังถ่ายภาพคุณจากกล้องจริง
                </p>
              </>
            ) : phase === "revealed" ? (
              <>
                <p className="font-mono text-[0.55rem] tracking-[0.18em] text-cyan/80">
                  RECEIVED
                </p>
                <p className="font-section-thai mt-1 text-[0.8rem] leading-relaxed text-text/75">
                  ภาพถึงสถานีแล้ว! นี่คือภาพจากกล้อง (Payload) ของดาวเทียมเรา
                </p>
              </>
            ) : (
              <>
                <p className="font-mono text-[0.55rem] tracking-[0.18em] text-cyan/80">
                  {current?.label}
                  {running ? (
                    <span className="ml-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-cyan" />
                  ) : null}
                </p>
                <p className="font-section-thai mt-1 text-[0.8rem] leading-relaxed text-text/75">
                  {current?.detail}
                </p>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <StationPhotoFrame
        revealed={phase === "revealed"}
        flashing={phase === "capturing"}
        photoUrl={photoUrl}
        videoRef={videoRef}
        cameraState={cameraState}
        showLivePreview={showLivePreview}
      />

      <div className="flex flex-wrap gap-2">
        {phase === "idle" || phase === "revealed" ? (
          <>
            <button
              type="button"
              onClick={() => void startMission()}
              className="flex-1 rounded-xl border border-cyan/40 bg-cyan/15 px-3 py-2.5 font-mono text-[0.68rem] tracking-wider text-cyan transition hover:bg-cyan/25"
            >
              {phase === "revealed"
                ? "ถ่ายอีกครั้ง"
                : cameraState === "requesting"
                  ? "กำลังเปิดกล้อง…"
                  : "ส่งคำสั่งถ่ายภาพ"}
            </button>
            {phase === "revealed" && (
              <button
                type="button"
                onClick={resetMission}
                className="rounded-xl border border-white/12 px-3 py-2.5 font-mono text-[0.62rem] tracking-wider text-text/55"
              >
                รีเซ็ต
              </button>
            )}
          </>
        ) : (
          <button
            type="button"
            disabled
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 font-mono text-[0.65rem] tracking-wider text-text/40"
          >
            กำลังประมวลผลภารกิจ…
          </button>
        )}
      </div>
    </div>
  );
}
