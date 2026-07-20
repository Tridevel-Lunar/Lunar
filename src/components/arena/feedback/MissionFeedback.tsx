import {
  HiOutlineCheckBadge,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";
import {
  IoBatteryHalfOutline,
  IoEarthOutline,
  IoNavigateOutline,
  IoPulseOutline,
  IoRocketOutline,
  IoTrophyOutline,
} from "react-icons/io5";

import type { RunResult } from "@/ast/types";

type Props = {
  result: RunResult | null;
  running?: boolean;
};

const CHECK_LABELS: Record<string, string> = {
  inserted_to_leo: "เข้าสู่ LEO",
  stability_ok: "เสถียรภาพวงโคจร",
  power_reserve: "พลังงานสำรอง",
  payload_safe: "payload ปลอดภัย",
};

function statusCopy(result: RunResult): { title: string; detail: string; tone: string } {
  switch (result.status) {
    case "passed":
      return {
        title: "ภารกิจสำเร็จ!",
        detail: "ดาวเทียมเข้าสู่วงโคจรโลกได้สำเร็จ",
        tone: "border-emerald-500/30 text-emerald-200",
      };
    case "failed":
      return {
        title: "ภารกิจยังไม่ผ่าน",
        detail: "ตรวจเงื่อนไขที่ยังไม่ครบ แล้วปรับลำดับบล็อก",
        tone: "border-amber-500/30 text-amber-200",
      };
    case "error":
      return {
        title: "เกิดข้อผิดพลาดระหว่างจำลอง",
        detail: result.error?.messageTh ?? "บล็อกบางตัวทำงานไม่ได้ตามเงื่อนไข",
        tone: "border-orange-500/35 text-orange-200",
      };
    case "timeout":
      return {
        title: "หมดเวลาจำลอง",
        detail: result.error?.messageTh ?? "โปรแกรมมีขั้นตอนมากเกินไป",
        tone: "border-rose-500/30 text-rose-200",
      };
  }
}

function IdleState() {
  return (
    <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 px-4 text-center">
      <IoRocketOutline className="text-4xl text-cyan/30" aria-hidden />
      <p className="font-section-thai text-[0.8rem] text-text/45">
        กดส่งภารกิจเพื่อจำลองผล
      </p>
      <p className="font-mono text-[0.5rem] tracking-[0.14em] text-muted">
        AWAITING RUN
      </p>
    </div>
  );
}

function RunningState() {
  return (
    <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 px-4 text-center">
      <IoPulseOutline className="animate-pulse text-4xl text-cyan/50" aria-hidden />
      <p className="font-section-thai text-[0.8rem] text-text/55">
        กำลังจำลองภารกิจ…
      </p>
    </div>
  );
}

export default function MissionFeedback({ result, running = false }: Props) {
  const outcome = result ? statusCopy(result) : null;
  const world = result?.finalWorld;
  const metrics = result?.metrics;
  const lastFrame = result?.frames?.length
    ? result.frames[result.frames.length - 1]
    : null;

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden p-3">
      {/* Simulate Result — summary only (no 3D) */}
      <section className="flex min-h-[180px] min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-white/10 bg-[#060e1c]/80">
        <header className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-3 py-2">
          <h3 className="font-display text-[0.65rem] font-semibold tracking-[0.14em] text-text/70">
            SIMULATE RESULT
          </h3>
          <span className="font-mono text-[0.55rem] tracking-wider text-muted">
            SUMMARY
          </span>
        </header>
        {running ? (
          <RunningState />
        ) : !result ? (
          <IdleState />
        ) : (
          <div className="relative flex min-h-0 flex-1 flex-col justify-center gap-3 bg-[radial-gradient(ellipse_at_50%_60%,rgba(0,229,255,0.08),transparent_55%)] p-4">
            <div className="flex items-center gap-3">
              <IoEarthOutline className="shrink-0 text-4xl text-cyan/50" aria-hidden />
              <div className="min-w-0">
                <p className="font-mono text-[0.5rem] tracking-wider text-muted">PHASE</p>
                <p className="font-display text-[0.95rem] tracking-wide text-text/90">
                  {world?.phase ?? "—"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
                <p className="font-mono text-[0.5rem] tracking-wider text-muted">ALTITUDE</p>
                <p className="font-display text-[0.85rem] text-text/90">
                  {(lastFrame?.altitudeKm ?? world?.orbit.altitudeKm ?? 0).toFixed(0)} km
                </p>
              </div>
              <div className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
                <p className="font-mono text-[0.5rem] tracking-wider text-muted">TICKS</p>
                <p className="font-display text-[0.85rem] text-text/90">
                  {metrics?.ticks ?? 0}
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Satellite Dashboard */}
      <section className="shrink-0 rounded-lg border border-white/10 bg-[#060e1c]/80">
        <header className="border-b border-white/[0.06] px-3 py-2">
          <h3 className="font-display text-[0.65rem] font-semibold tracking-[0.14em] text-text/70">
            SATELLITE DASHBOARD
          </h3>
        </header>
        <div className="grid grid-cols-2 gap-2 p-3">
          <div className="flex min-w-0 items-center gap-2 rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
            <IoBatteryHalfOutline className="shrink-0 text-lg text-emerald-400/80" aria-hidden />
            <div className="min-w-0">
              <p className="font-mono text-[0.5rem] tracking-wider text-muted">POWER</p>
              <p className="font-display text-[0.85rem] text-text/90">
                {world ? `${world.powerWh.toFixed(1)} Wh` : "—"}
              </p>
            </div>
          </div>
          <div className="flex min-w-0 items-center gap-2 rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
            <IoNavigateOutline className="shrink-0 text-lg text-cyan/80" aria-hidden />
            <div className="min-w-0">
              <p className="font-mono text-[0.5rem] tracking-wider text-muted">STABILITY</p>
              <p className="font-display text-[0.85rem] text-text/90">
                {world
                  ? `${Math.round((world.orbit.stability ?? 0) * 100)}%`
                  : "—"}
              </p>
            </div>
          </div>
          <div className="flex min-w-0 items-center gap-2 rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
            <HiOutlineCheckBadge className="shrink-0 text-lg text-cyan/80" aria-hidden />
            <div className="min-w-0">
              <p className="font-mono text-[0.5rem] tracking-wider text-muted">LEO</p>
              <p className="font-section-thai text-[0.75rem] text-text/90">
                {world ? (world.orbit.inLeo ? "เข้าแล้ว" : "ยังไม่เข้า") : "—"}
              </p>
            </div>
          </div>
          <div className="flex min-w-0 items-center gap-2 rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
            <IoRocketOutline className="shrink-0 text-lg text-amber-300/80" aria-hidden />
            <div className="min-w-0">
              <p className="font-mono text-[0.5rem] tracking-wider text-muted">PAYLOAD</p>
              <p className="font-section-thai text-[0.75rem] text-text/90">
                {world
                  ? world.payload_safe
                    ? world.payloadOn
                      ? "เปิด · ปลอดภัย"
                      : "ปิด"
                    : "ไม่ปลอดภัย"
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Outcome */}
      <section
        className={`shrink-0 rounded-lg border bg-[#060e1c]/80 ${
          outcome?.tone.split(" ").find((c) => c.startsWith("border-")) ??
          "border-white/10"
        }`}
      >
        <header className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-2">
          {result?.status === "passed" ? (
            <IoTrophyOutline className="text-amber-400/90" aria-hidden />
          ) : (
            <HiOutlineExclamationTriangle className="text-amber-400/80" aria-hidden />
          )}
          <h3 className="font-display text-[0.65rem] font-semibold tracking-[0.14em] text-text/70">
            MISSION OUTCOME
          </h3>
        </header>
        <div className="space-y-2 p-3">
          {!result && !running ? (
            <p className="font-section-thai text-[0.75rem] text-text/40">
              ยังไม่มีผลการจำลอง
            </p>
          ) : running ? (
            <p className="font-section-thai text-[0.75rem] text-text/50">
              รอผลจากเซิร์ฟเวอร์…
            </p>
          ) : outcome ? (
            <>
              <p
                className={`font-section-thai text-[0.9rem] font-medium ${
                  outcome.tone.split(" ").find((c) => c.startsWith("text-")) ?? "text-text"
                }`}
              >
                {outcome.title}
              </p>
              <p className="font-section-thai text-[0.72rem] leading-relaxed text-text/55">
                {outcome.detail}
              </p>
              {result.error?.blockId ? (
                <p className="font-mono text-[0.55rem] text-orange-300/80">
                  block: {result.error.blockId}
                </p>
              ) : null}
              {(result.passedChecks.length > 0 || result.failedChecks.length > 0) && (
                <ul className="space-y-1 border-t border-white/[0.06] pt-2">
                  {result.passedChecks.map((id) => (
                    <li
                      key={`pass-${id}`}
                      className="font-section-thai flex gap-2 text-[0.7rem] text-emerald-300/85"
                    >
                      <span aria-hidden>✓</span>
                      <span>{CHECK_LABELS[id] ?? id}</span>
                    </li>
                  ))}
                  {result.failedChecks.map((id) => (
                    <li
                      key={`fail-${id}`}
                      className="font-section-thai flex gap-2 text-[0.7rem] text-orange-300/85"
                    >
                      <span aria-hidden>×</span>
                      <span>{CHECK_LABELS[id] ?? id}</span>
                    </li>
                  ))}
                </ul>
              )}
              {result.log.length > 0 && (
                <div className="max-h-24 overflow-y-auto border-t border-white/[0.06] pt-2">
                  {result.log.slice(-6).map((entry, i) => (
                    <p
                      key={`${entry.t}-${i}`}
                      className={`font-section-thai text-[0.65rem] leading-snug ${
                        entry.level === "error"
                          ? "text-orange-300/80"
                          : entry.level === "warn"
                            ? "text-amber-200/70"
                            : "text-text/45"
                      }`}
                    >
                      {entry.messageTh}
                    </p>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>
      </section>
    </div>
  );
}
