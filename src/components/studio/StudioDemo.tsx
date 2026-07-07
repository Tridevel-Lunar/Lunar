import { useState } from "react";
import {
  HiOutlineBell,
  HiOutlineCalendar,
  HiOutlineLightBulb,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineSparkles,
} from "react-icons/hi2";
import { IoRocketOutline } from "react-icons/io5";

import ModuleSidebar from "@/components/app/ModuleSidebar";
import type { User } from "@/lib/api";
import {
  DEMO_LEARNING_CONTEXT,
  IDEA_INTENTS,
  NOTE_INTENTS,
  SEED_ENTRIES,
  getLaikaDemoResponse,
  type CollectionEntry,
  type EntryType,
  type IdeaIntent,
  type LaikaIntent,
} from "./studio-data";

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-white/10 bg-white/[0.04] shadow-[0_6px_24px_rgba(0,0,0,0.3)] backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

function TypeBadge({ type }: { type: EntryType }) {
  const isIdea = type === "idea";
  return (
    <span
      className={`font-mono rounded-full border px-2 py-0.5 text-[0.55rem] tracking-wider ${
        isIdea
          ? "border-amber/40 bg-amber/10 text-amber"
          : "border-teal/40 bg-teal/10 text-teal"
      }`}
    >
      {isIdea ? "IDEA" : "NOTE"}
    </span>
  );
}

function LaikaAvatar() {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber/40 bg-amber/10 text-lg text-amber shadow-[0_0_20px_rgba(255,171,0,0.15)]">
      ✦
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function StudioDemo({ user }: { user: User }) {
  const [entries, setEntries] = useState<CollectionEntry[]>(SEED_ENTRIES);
  const [draft, setDraft] = useState("");
  const [draftType, setDraftType] = useState<EntryType>("idea");
  const [pendingEntryId, setPendingEntryId] = useState<string | null>(null);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);

  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const pendingEntry = entries.find((e) => e.id === pendingEntryId);
  const activeEntry = entries.find((e) => e.id === activeEntryId);

  function handleSave() {
    const text = draft.trim();
    if (!text) return;

    const entry: CollectionEntry = {
      id: crypto.randomUUID(),
      type: draftType,
      content: text,
      createdAt: new Date().toISOString(),
    };

    setEntries((prev) => [entry, ...prev]);
    setDraft("");
    setPendingEntryId(entry.id);
    setActiveEntryId(null);
  }

  function handleLaikaIntent(intent: LaikaIntent) {
    if (!pendingEntry) return;

    const response = getLaikaDemoResponse(pendingEntry.type, intent, pendingEntry.content);
    const updated: CollectionEntry = {
      ...pendingEntry,
      laikaIntent: intent,
      laikaResponse: response,
    };

    setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    setPendingEntryId(null);
    setActiveEntryId(updated.id);
  }

  function skipLaika() {
    setPendingEntryId(null);
  }

  const intents = pendingEntry?.type === "idea" ? IDEA_INTENTS : NOTE_INTENTS;

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-text">
      <ModuleSidebar user={user} activeModule="studio" />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-3">
          <div className="flex items-center gap-2.5">
            <IoRocketOutline className="text-xl text-amber" />
            <h1 className="font-display text-[1.35rem] font-bold tracking-[0.18em] text-text">STUDIO</h1>
          </div>

          <div className="flex items-center gap-2 text-text/50">
            {[HiOutlineMagnifyingGlass, HiOutlineCalendar, HiOutlineBell].map((Icon, i) => (
              <button
                key={i}
                type="button"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-white/10 bg-white/[0.03] transition hover:border-amber/30 hover:text-amber"
              >
                <Icon className="text-base" />
              </button>
            ))}
            <div className="ml-1 hidden text-right sm:block">
              <p className="font-mono text-[0.58rem] tracking-wider text-muted">{today}</p>
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="mx-auto max-w-[820px] space-y-5">
            <GlassCard className="border-amber/20 bg-[linear-gradient(135deg,rgba(255,171,0,0.08)_0%,rgba(6,14,28,0.6)_50%)] p-5">
              <div className="flex gap-4">
                <LaikaAvatar />
                <div className="min-w-0 flex-1">
                  <p className="font-mono mb-1 text-[0.62rem] tracking-[0.2em] text-amber">LAIKA</p>
                  <p className="font-section-thai text-[0.95rem] leading-relaxed text-text/90">
                    หลังจากเรียนรู้และได้ลงมือลองทำภารกิจเสร็จแล้วเนี่ยบ คุณมีไอเดียอะไรอยากต่อยอด
                    หรืออยากโน้ตอะไรไว้ก่อนไหม? เพิ่ม collection ด้านล่างนี้ได้เลย!
                  </p>
                  <p className="font-mono mt-3 text-[0.58rem] tracking-wider text-muted">
                    บริบทการเรียน: {DEMO_LEARNING_CONTEXT.course} ·{" "}
                    {DEMO_LEARNING_CONTEXT.completedTopics.join(" · ")}
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <p className="font-mono mb-3 text-[0.62rem] tracking-[0.16em] text-muted">
                เพิ่มใน Collection
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
                    className={`flex items-center gap-2 rounded-lg border px-4 py-2 font-section-thai text-[0.85rem] transition ${
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
                rows={3}
                className="mb-3 w-full resize-none rounded-lg border border-white/10 bg-[rgba(3,8,18,0.5)] px-4 py-3 font-section-thai text-[0.9rem] text-text outline-none transition focus:border-amber/40 focus:shadow-[0_0_0_3px_rgba(255,171,0,0.1)]"
              />

              <button
                type="button"
                onClick={handleSave}
                disabled={!draft.trim()}
                className="btn-clip font-mono cursor-pointer border border-amber/50 bg-amber/15 px-5 py-2.5 text-[0.62rem] tracking-[0.12em] text-amber transition hover:bg-amber hover:text-bg disabled:cursor-not-allowed disabled:opacity-40"
              >
                บันทึก
              </button>
            </GlassCard>

            {pendingEntry && (
              <GlassCard className="border-amber/30 p-5">
                <div className="mb-4 flex items-start gap-3">
                  <LaikaAvatar />
                  <div>
                    <p className="font-section-thai mb-1 text-[0.95rem] text-text">
                      บันทึกแล้ว! อยากให้ LAIKA ช่วยแนะนำอะไรไหม?
                    </p>
                    <p className="font-mono text-[0.58rem] tracking-wider text-muted">
                      ประเภท: {pendingEntry.type === "idea" ? "ไอเดีย" : "โน้ต"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {intents.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleLaikaIntent(item.id)}
                      className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-left transition hover:border-amber/35 hover:bg-amber/[0.06]"
                    >
                      <p className="font-section-thai mb-0.5 text-[0.88rem] text-text">
                        {item.label}
                      </p>
                      <p className="font-section-thai text-[0.75rem] text-muted">
                        {item.description}
                      </p>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={skipLaika}
                  className="font-mono mt-4 cursor-pointer border-0 bg-transparent text-[0.62rem] tracking-wider text-muted hover:text-text"
                >
                  ไว้ทีหลัง
                </button>
              </GlassCard>
            )}

            {activeEntry?.laikaResponse && (
              <GlassCard className="border-cyan/20 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <HiOutlineSparkles className="text-cyan" />
                  <p className="font-mono text-[0.62rem] tracking-[0.16em] text-cyan">
                    LAIKA — คำแนะนำ
                  </p>
                </div>
                <p className="font-section-thai whitespace-pre-line text-[0.9rem] leading-relaxed text-text/85">
                  {activeEntry.laikaResponse}
                </p>
              </GlassCard>
            )}

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-mono text-[0.72rem] tracking-[0.18em] text-muted">
                  COLLECTION ({entries.length})
                </h2>
              </div>

              <div className="space-y-2">
                {entries.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => setActiveEntryId(entry.id)}
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      activeEntryId === entry.id
                        ? "border-amber/40 bg-amber/[0.06]"
                        : "border-white/[0.08] bg-white/[0.03] hover:border-white/15"
                    }`}
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <TypeBadge type={entry.type} />
                      <span className="font-mono text-[0.55rem] text-muted">
                        {formatDate(entry.createdAt)}
                      </span>
                      {entry.laikaResponse ? (
                        <span className="font-mono text-[0.55rem] text-cyan">✦ LAIKA</span>
                      ) : (
                        <span className="font-mono text-[0.55rem] text-muted">ยังไม่ถาม LAIKA</span>
                      )}
                    </div>
                    <p className="font-section-thai line-clamp-2 text-[0.88rem] leading-relaxed text-text/85">
                      {entry.content}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
