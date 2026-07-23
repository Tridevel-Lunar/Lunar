import { Link, useNavigate } from "react-router-dom";
import { IoCodeSlashOutline, IoGameControllerOutline } from "react-icons/io5";

import ModuleSidebar from "@/components/app/ModuleSidebar";
import type { SpaceModulePageProps } from "@/components/space/core/types";
import { spaceCoursePath } from "@/components/space/core/routes";

const ARENA_MISSION_PATH = "/arena/mission/leo-orbit-one-lap";

/**
 * Short eclipse/sun narrative + deep-link into Arena M01.
 * Full Blockly practice lives in Arena (not a separate lesson engine).
 */
export default function ProgrammingModule({
  user,
  course,
  module,
}: SpaceModulePageProps) {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-text">
      <ModuleSidebar user={user} activeModule="space" />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
        <header className="flex shrink-0 items-center gap-3 border-b border-white/[0.06] px-5 py-3">
          <button
            type="button"
            onClick={() => navigate(spaceCoursePath(course.id))}
            className="cursor-pointer text-lg text-text/40 transition hover:text-cyan"
            aria-label="กลับคอร์ส"
          >
            ←
          </button>
          <IoCodeSlashOutline className="text-xl text-amber-300/80" />
          <div>
            <h1 className="font-display text-[1.05rem] font-bold tracking-[0.12em]">
              {module.title}
            </h1>
            <p className="font-section-thai text-[0.78rem] text-text/55">{module.titleTh}</p>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-8">
          <section className="space-y-3">
            <h2 className="font-display text-[0.72rem] font-semibold tracking-[0.16em] text-cyan/90">
              แนวคิดหลัก
            </h2>
            <p className="font-section-thai text-[0.95rem] leading-relaxed text-text/80">
              ใน LEO ดาวเทียมหมุนรอบโลกประมาณทุก 90 นาที — ช่วงหนึ่งโดนแดด
              (ชาร์จแบตได้) และช่วงหนึ่งเข้า{" "}
              <span className="text-cyan">eclipse</span> (เงาโลก ไม่มีแสงอาทิตย์)
              โปรแกรมบน OBC ต้องตอบสนองสถานการณ์นี้ทุกวินาที เช่น เปิด heater
              ตอนมืด และปิด payload ที่กินไฟเมื่อเข้าเงา
            </p>
            <p className="font-section-thai text-[0.95rem] leading-relaxed text-text/80">
              ใน LUNAR คุณจะตั้งค่า EPS / Payload / COMM เป็น config แล้วเขียน
              flight software ด้วยบล็อก OBC ที่เรียกความสามารถจาก EPS และ Payload
              เหมือน import ไลบรารีในโค้ดจริง
            </p>
          </section>

          <section className="space-y-2 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-4">
            <h2 className="font-display text-[0.72rem] font-semibold tracking-[0.16em] text-amber-200/90">
              ภารกิจถัดไปใน Arena
            </h2>
            <p className="font-section-thai text-[0.9rem] leading-relaxed text-text/75">
              ภารกิจคือให้ CubeSat รอดครบ 1 รอบโคจร เริ่มตรงกลางฝั่งที่โดนแดด แล้วผ่าน eclipse
              กลางวง — 1 วินาทีจำลอง = 1 รอบควบคุมของ OBC
            </p>
            <ul className="font-section-thai list-inside list-disc space-y-1 text-[0.85rem] text-text/65">
              <li>อย่าพูดถึง tick 10 หรือ glitch — ใช้แดด / eclipse แทน</li>
              <li>เตรียม heater/payload ก่อนเข้า eclipse</li>
              <li>ตรวจผลจาก orbit trace หลังส่งภารกิจ</li>
            </ul>
            <Link
              to={ARENA_MISSION_PATH}
              className="mt-3 inline-flex items-center gap-2 rounded-md border border-teal-500/45 bg-teal-500/15 px-4 py-2.5 font-section-thai text-[0.9rem] text-teal-100 no-underline transition hover:border-teal-400/70 hover:bg-teal-400/20"
            >
              <IoGameControllerOutline className="text-lg" />
              เปิด Arena — ONE LAP AROUND EARTH
            </Link>
          </section>
        </main>
      </div>
    </div>
  );
}
