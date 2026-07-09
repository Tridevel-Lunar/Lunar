import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineArrowLeft, HiOutlineLightBulb, HiOutlinePencilSquare } from "react-icons/hi2";
import { IoRocketOutline } from "react-icons/io5";

import ModuleSidebar from "@/components/app/ModuleSidebar";
import type { EntryType } from "@/components/studio/data/studio-data";
import { GlassCard } from "@/components/studio/shared/studio-shared";
import { ApiError } from "@/lib/api";
import type { User } from "@/lib/api";
import { createCollection } from "@/lib/studio-storage";

/** Create a new note or idea collection and navigate to its chat view. */

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
    <div className="flex h-screen overflow-hidden bg-bg text-text">
      <ModuleSidebar user={user} activeModule="studio" />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center gap-3 border-b border-white/[0.06] px-5 py-3">
          <Link
            to="/studio"
            className="flex cursor-pointer items-center gap-1.5 font-mono text-[0.62rem] tracking-wider text-text/50 no-underline transition hover:text-amber"
          >
            <HiOutlineArrowLeft />
            Studio
          </Link>
          <IoRocketOutline className="text-lg text-amber" />
          <h1 className="font-display text-[1rem] font-bold tracking-[0.14em] text-text">
            NEW COLLECTION
          </h1>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
          <GlassCard className="mx-auto max-w-[640px] p-5">
            <p className="font-mono mb-3 text-[0.62rem] tracking-[0.16em] text-muted">
              สร้าง collection ใหม่
            </p>

            <div className="mb-3 flex gap-2">
              {(
                [
                  { type: "note" as const, label: "โน้ต", icon: HiOutlinePencilSquare },
                  { type: "idea" as const, label: "ไอเดีย", icon: HiOutlineLightBulb },
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
                        : "border-teal/50 bg-teal/10 text-teal"
                      : "border-white/10 text-text/50 hover:border-white/20"
                  }`}
                >
                  <Icon className="text-base" />
                  {label}
                </button>
              ))}
            </div>

            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={
                draftType === "idea"
                  ? "เช่น อยากทำดาวเทียมถ่ายภาพนาข้าวโซนภาคเหนือ..."
                  : "เช่น ยังงงเรื่อง power budget ตอน eclipse..."
              }
              rows={5}
              className="mb-4 w-full resize-none rounded-lg border border-white/10 bg-[rgba(3,8,18,0.5)] px-4 py-3 font-section-thai text-[0.9rem] text-text outline-none transition focus:border-amber/40"
            />

            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={!draft.trim() || saving}
              className="btn-clip font-mono cursor-pointer border border-amber/50 bg-amber/15 px-5 py-2.5 text-[0.62rem] tracking-[0.12em] text-amber transition hover:bg-amber hover:text-bg disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? "กำลังสร้าง…" : "สร้างและเปิดแชท"}
            </button>
            {error ? (
              <p className="font-section-thai mt-3 text-[0.8rem] text-red-400/90">{error}</p>
            ) : null}
          </GlassCard>
        </main>
      </div>
    </div>
  );
}
