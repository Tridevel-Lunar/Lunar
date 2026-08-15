import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineLightBulb, HiOutlinePaperAirplane, HiOutlinePencilSquare } from "react-icons/hi2";
import { RiGraduationCapFill } from "react-icons/ri";

import ModuleSidebar from "@/components/app/ModuleSidebar";
import StarField from "@/components/studio/landing/StarField";
import type { EntryType } from "@/components/studio/data/studio-data";
import { ApiError } from "@/lib/api";
import type { User } from "@/lib/api";
import { LAIKA_AVATAR_URL } from "@/lib/constants";
import { createCollection } from "@/lib/studio-storage";

/** Create a new note or idea collection — full-bleed welcome layout (path-session style, no motion). */

const INTRO =
  "สวัสดี เราคือ LAIKA อยากเริ่มจากโน้ต ไอเดีย หรือหัวข้อเรียนรู้ดี? เล่ามาได้เลย";

type StudioNewCollectionProps = {
  user: User;
};

export default function StudioNewCollection({ user }: StudioNewCollectionProps) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState("");
  const [draftType, setDraftType] = useState<EntryType>("idea");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    const text = draft.trim();
    if (!text || saving) return;
    setSaving(true);
    setError(null);
    try {
      const entry = await createCollection(draftType, text);
      navigate(`/studio/chat/${entry.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "สร้าง collection ไม่สำเร็จ");
      setSaving(false);
    }
  }

  return (
    <div className="relative flex h-screen overflow-hidden bg-bg text-text">
      <ModuleSidebar user={user} activeModule="studio" />

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <StudioNewBackdrop />

        <button
          type="button"
          onClick={() => navigate("/studio")}
          className="absolute left-5 top-5 z-[2] cursor-pointer text-lg text-text/45 transition hover:text-amber"
          aria-label="กลับ"
        >
          ←
        </button>

        <div className="relative z-[1] flex h-full min-h-0 flex-col px-6 pb-8 pt-10 sm:px-10">
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
            <div className="flex w-full max-w-xl flex-col items-center text-center">
              <div className="relative h-36 w-36 overflow-hidden rounded-full border-2 border-amber-400/30 shadow-[0_0_28px_rgba(251,191,36,0.22)]">
                <img
                  src={LAIKA_AVATAR_URL}
                  alt="LAIKA"
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <p className="font-mono mt-4 text-[0.68rem] tracking-[0.22em] text-amber-400/80">
                LAIKA
              </p>
              <p className="font-section-thai mt-4 text-[1.15rem] leading-[1.75] text-text/88 sm:text-[1.22rem]">
                {INTRO}
              </p>
            </div>
          </div>

          <div className="mx-auto w-full max-w-lg shrink-0">
            <div className="mb-3 flex flex-wrap justify-center gap-2">
              {(
                [
                  { type: "note" as const, label: "โน้ต", icon: HiOutlinePencilSquare },
                  { type: "idea" as const, label: "ไอเดีย", icon: HiOutlineLightBulb },
                  { type: "learn" as const, label: "เรียนรู้", icon: RiGraduationCapFill },
                ] as const
              ).map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setDraftType(type)}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 font-section-thai text-[0.85rem] transition ${
                    draftType === type
                      ? type === "idea"
                        ? "border-amber/50 bg-amber/10 text-amber"
                        : type === "learn"
                          ? "border-violet-400/50 bg-violet-500/10 text-violet-300"
                          : "border-teal/50 bg-teal/10 text-teal"
                      : "border-white/10 bg-white/[0.03] text-text/50 hover:border-white/20"
                  }`}
                >
                  <Icon className="text-base" />
                  {label}
                </button>
              ))}
            </div>

            {error ? (
              <p className="font-section-thai mb-2 text-center text-[0.78rem] text-red-400/90">
                {error}
              </p>
            ) : null}

            <form
              className="flex items-stretch gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void handleSave();
              }}
            >
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSave();
                  }
                }}
                rows={2}
                placeholder={
                  draftType === "idea"
                    ? "เช่น อยากทำดาวเทียมถ่ายภาพนาข้าวโซนภาคเหนือ..."
                    : draftType === "learn"
                      ? "เช่น การเขียนโปรแกรมควบคุม Arduino สำหรับ CubeSat..."
                      : "เช่น ยังงงเรื่อง power budget ตอน eclipse..."
                }
                disabled={saving}
                autoFocus
                className="font-section-thai min-h-[52px] w-full resize-none rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[0.88rem] text-text outline-none placeholder:text-text/30 focus:border-amber/40"
              />
              <button
                type="submit"
                disabled={saving || !draft.trim()}
                aria-label="สร้างและเปิดแชท"
                className="flex w-[52px] shrink-0 cursor-pointer items-center justify-center self-stretch rounded-lg border border-amber/40 bg-amber/15 text-amber transition hover:bg-amber/25 disabled:cursor-default disabled:opacity-40"
              >
                <HiOutlinePaperAirplane className="text-xl" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function StudioNewBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-bg" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.08)_0%,transparent_60%)]" />
      <StarField />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(3,8,18,0.55) 0%, rgba(3,8,18,0.35) 45%, rgba(3,8,18,0.78) 100%)",
        }}
      />
    </div>
  );
}
