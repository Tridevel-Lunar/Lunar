import {
  HiOutlineCheckBadge,
  HiOutlineExclamationTriangle,
  HiOutlineSignal,
} from "react-icons/hi2";
import {
  IoBatteryHalfOutline,
  IoCubeOutline,
  IoEarthOutline,
  IoThermometerOutline,
  IoTrophyOutline,
} from "react-icons/io5";

import type { ArenaRunResponse } from "@/lib/api";
import { gradeLabel } from "@/components/arena/grade-label";

/** Mission Feedback panel for Mission 01 run results. */
export default function MissionFeedbackMock({ runResult }: { runResult: ArenaRunResponse | null }) {
  const finalTick = runResult?.ticks.at(-1);
  const battery = finalTick?.battery ?? 0;
  const temperature = finalTick?.temperature ?? 0;
  const grade = runResult?.result.grade;
  const isSuccess = grade === "perfect";

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden p-3">
      {/* Simulate Result */}
      <section className="flex min-h-[200px] min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-white/10 bg-[#060e1c]/80">
        <header className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-3 py-2">
          <h3 className="font-display text-[0.65rem] font-semibold tracking-[0.14em] text-text/70">
            SIMULATE RESULT
          </h3>
          <span className="font-mono text-[0.55rem] tracking-wider text-muted">
            3D VIEW
          </span>
        </header>
        <div
          className="relative flex min-h-0 flex-1 flex-col items-center justify-center gap-2 bg-[radial-gradient(ellipse_at_50%_60%,rgba(0,229,255,0.08),transparent_55%)]"
          role="img"
          aria-label="พื้นที่จำลองผลภารกิจ"
        >
          <IoEarthOutline className="text-5xl text-cyan/35" aria-hidden />
          <p className="font-section-thai text-[0.72rem] text-text/40">
            {runResult ? "รันภารกิจเสร็จแล้ว" : "ยังไม่ได้ส่งภารกิจ"}
          </p>
          <p className="font-mono text-[0.5rem] tracking-[0.14em] text-muted">
            {runResult ? `TICKS: ${runResult.ticks.length}` : "WAITING"}
          </p>
        </div>
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
              <p className="font-mono text-[0.5rem] tracking-wider text-muted">BATTERY</p>
              <p className="font-display text-[0.85rem] text-text/90">{battery}%</p>
            </div>
          </div>
          <div className="flex min-w-0 items-center gap-2 rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
            <IoThermometerOutline className="shrink-0 text-lg text-orange-300/80" aria-hidden />
            <div className="min-w-0">
              <p className="font-mono text-[0.5rem] tracking-wider text-muted">TEMP</p>
              <p className="font-display text-[0.85rem] text-text/90">{temperature}°C</p>
            </div>
          </div>
          <div className="flex min-w-0 items-center gap-2 rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
            <HiOutlineCheckBadge className="shrink-0 text-lg text-cyan/80" aria-hidden />
            <div className="min-w-0">
              <p className="font-mono text-[0.5rem] tracking-wider text-muted">STATUS</p>
              <p className="font-section-thai text-[0.75rem] text-text/90">{gradeLabel(grade)}</p>
            </div>
          </div>
          <div className="flex min-w-0 items-center gap-2 rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
            <HiOutlineSignal className="shrink-0 text-lg text-cyan/70" aria-hidden />
            <div className="min-w-0">
              <p className="font-mono text-[0.5rem] tracking-wider text-muted">SIGNAL</p>
              <p className="font-display text-[0.85rem] tracking-widest text-text/90" aria-label="สัญญาณจากผลภารกิจ">
                {runResult?.result.comms === "full"
                  ? "■■■■"
                  : runResult?.result.comms === "partial"
                    ? "■■□"
                    : "□"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Outcome — compact after trimming details */}
      <section className="shrink-0 rounded-lg border border-amber-500/25 bg-[#060e1c]/80">
        <header className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-2">
          {isSuccess ? (
            <IoTrophyOutline className="text-amber-400/90" aria-hidden />
          ) : (
            <HiOutlineExclamationTriangle className="text-amber-400/90" aria-hidden />
          )}
          <h3 className="font-display text-[0.65rem] font-semibold tracking-[0.14em] text-text/70">
            MISSION OUTCOME
          </h3>
        </header>
        <div className="flex items-start gap-3 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10">
            <IoCubeOutline className="text-lg text-amber-300" aria-hidden />
          </div>
          <div className="min-w-0 pt-0.5">
            <p className="font-section-thai text-[0.9rem] font-medium text-amber-200/95">
              {runResult
                ? `${gradeLabel(grade)} • Comms ${runResult.result.comms}`
                : "ยังไม่มีผลลัพธ์ภารกิจ"}
            </p>
            <p className="font-section-thai mt-0.5 text-[0.72rem] leading-relaxed text-text/55">
              {runResult
                ? `ดาวเทียมอยู่รอด: ${runResult.result.satellite_survived ? "ใช่" : "ไม่ใช่"} — ส่งข้อมูลกลับโลกได้: ${runResult.result.sent_to_earth ? "ใช่" : "ไม่ใช่"}`
                : "กดปุ่มส่งภารกิจเพื่อดูผลลัพธ์"}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
