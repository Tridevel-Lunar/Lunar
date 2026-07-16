import { useEffect, useRef, useState } from "react";
import {
  HiOutlineDocumentText,
  HiOutlinePuzzlePiece,
} from "react-icons/hi2";
import {
  IoRefreshOutline,
  IoRocketOutline,
  IoSaveOutline,
} from "react-icons/io5";

import type { ProgramAst } from "@/ast/types";
import type { ArenaMission } from "@/components/arena/arena-data";
import BlocklyEditor, {
  type BlocklyEditorHandle,
} from "@/components/arena/blockly/BlocklyEditor";
import MissionFeedbackMock from "@/components/arena/feedback/MissionFeedbackMock";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ApiError,
  getArenaAttempt,
  getArenaMission,
  saveArenaAttempt,
} from "@/lib/api";

type ActivityTab = "detail" | "coding";

const VIEW_OPTIONS: {
  id: ActivityTab;
  label: string;
  icon: typeof HiOutlineDocumentText;
}[] = [
  { id: "detail", label: "รายละเอียดภารกิจ", icon: HiOutlineDocumentText },
  { id: "coding", label: "เขียนโค้ดบล็อก", icon: HiOutlinePuzzlePiece },
];

function MissionDetailPanel({ mission }: { mission: ArenaMission }) {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <p className="font-mono text-[0.78rem] tracking-[0.18em] text-cyan">
          {mission.code}
        </p>
        <h2 className="font-display mt-1 text-[clamp(1.4rem,2.5vw,1.9rem)] font-bold tracking-[0.06em]">
          {mission.title}
        </h2>
        <p className="font-section-thai mt-1.5 text-[0.9rem] text-text/70">
          {mission.subtitle}
        </p>
        <span className="font-mono mt-3 inline-flex rounded-md border border-cyan/45 bg-cyan/15 px-2.5 py-1 text-[0.58rem] tracking-[0.14em] text-cyan">
          {mission.level}
        </span>
      </div>

      <section className="space-y-2 border-t border-white/10 pt-5">
        <h3 className="font-display text-[0.72rem] font-semibold tracking-[0.16em] text-cyan/90">
          MISSION DETAILS
        </h3>
        <p className="font-section-thai text-[0.88rem] leading-relaxed text-text/80">
          {mission.details}
        </p>
        <p className="font-section-thai text-[0.88rem] leading-relaxed text-text/80">
          <span className="font-display font-semibold tracking-[0.16em] text-cyan">
            HINT:
          </span>{" "}
          {mission.hint}
        </p>
      </section>

      <section className="space-y-2 border-t border-white/10 pt-5">
        <h3 className="font-display text-[0.72rem] font-semibold tracking-[0.16em] text-cyan/90">
          MISSION OBJECTIVE
        </h3>
        <p className="font-section-thai text-[0.88rem] leading-relaxed text-text/80">
          {mission.objectiveLead}{" "}
          <span className="mt-1 block text-[1rem] font-medium text-cyan">
            {mission.objectiveHighlight}
          </span>
        </p>
      </section>

      <section className="space-y-2 border-t border-white/10 pt-5">
        <h3 className="font-display text-[0.72rem] font-semibold tracking-[0.16em] text-cyan/90">
          YOU WILL DO
        </h3>
        <p className="font-section-thai text-[0.88rem] text-text/80">
          {mission.youWillDoIntro}
        </p>
        <ul className="font-section-thai space-y-1.5 text-[0.85rem] text-text/75">
          {mission.youWillDo.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default function MissionActivity({ mission }: { mission: ArenaMission }) {
  const [tab, setTab] = useState<ActivityTab>("coding");
  const [initialAst, setInitialAst] = useState<ProgramAst | Record<string, unknown> | null>(
    null,
  );
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const editorRef = useRef<BlocklyEditorHandle>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadError(null);
      setLoaded(false);
      try {
        const [, attempt] = await Promise.all([
          getArenaMission(mission.id),
          getArenaAttempt(mission.id),
        ]);
        if (cancelled) return;
        setInitialAst(attempt.ast);
        setLoaded(true);
      } catch (err) {
        if (cancelled) return;
        const msg =
          err instanceof ApiError
            ? err.message
            : "โหลดภารกิจไม่สำเร็จ";
        setLoadError(msg);
        setLoaded(true);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [mission.id]);

  async function handleSave() {
    const ast = editorRef.current?.toAst() ?? { type: "program", body: [] };
    setSaveState("saving");
    setSaveMessage(null);
    try {
      await saveArenaAttempt(mission.id, ast as Record<string, unknown>);
      setSaveState("saved");
      setSaveMessage("บันทึกโค้ดบล็อกแล้ว");
      window.setTimeout(() => setSaveState("idle"), 2000);
    } catch (err) {
      setSaveState("error");
      setSaveMessage(
        err instanceof ApiError ? err.message : "บันทึกไม่สำเร็จ",
      );
    }
  }

  function handleClear() {
    const ok = window.confirm("ล้างโค้ดบล็อกทั้งหมดในเวิร์กสเปซ?");
    if (!ok) return;
    editorRef.current?.clear();
    editorRef.current?.seedStart();
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* View switcher — z above Blockly toolbox (z-index: 70) */}
      <div className="relative z-[80] flex shrink-0 items-center gap-2 border-b border-white/[0.06] bg-[#050a14]/90 px-3 py-2">
        <label
          htmlFor="mission-view-select"
          className="font-mono shrink-0 text-[0.85rem] tracking-[0.14em] text-muted"
        >
          VIEW :
        </label>
        <Select
          value={tab}
          onValueChange={(value) => setTab(value as ActivityTab)}
        >
          <SelectTrigger
            id="mission-view-select"
            aria-label="เลือกมุมมองภารกิจ"
            className="h-9 w-full max-w-[16rem] rounded-lg border-white/10 bg-white/[0.03] px-2.5 font-section-thai text-[0.82rem] text-text hover:border-cyan/30 focus:ring-cyan/40 focus:ring-offset-0 data-[state=open]:border-cyan/40"
          >
            <SelectValue placeholder="เลือกมุมมอง" />
          </SelectTrigger>

          <SelectContent className="z-[100] border-white/10 bg-[#0a1220] text-text">
            {VIEW_OPTIONS.map(({ id, label, icon: Icon }) => (
              <SelectItem
                key={id}
                value={id}
                className="font-section-thai cursor-pointer focus:bg-cyan/15 focus:text-cyan"
              >
                <span className="flex items-center gap-2">
                  <Icon className="text-base opacity-70" aria-hidden />
                  <span>{label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {tab === "detail" ? (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <MissionDetailPanel mission={mission} />
        </div>
      ) : (
        <>
          {loadError && (
            <p className="shrink-0 border-b border-orange-500/30 bg-orange-500/10 px-4 py-2 font-section-thai text-[0.8rem] text-orange-200">
              {loadError} — ใช้งานเอดิเตอร์แบบออฟไลน์ได้ แต่บันทึกจะไม่สำเร็จจนกว่า API พร้อม
            </p>
          )}

          <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,1fr)]">
            <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-b border-white/[0.06] lg:border-b-0 lg:border-r">
              {loaded ? (
                <div className="relative min-h-0 flex-1 overflow-hidden">
                  <BlocklyEditor
                    key={`${mission.id}-${initialAst ? "restored" : "fresh"}`}
                    ref={editorRef}
                    initialAst={initialAst}
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
              ) : (
                <div className="flex flex-1 items-center justify-center font-section-thai text-text/40">
                  กำลังโหลดเวิร์กสเปซ…
                </div>
              )}

              <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-white/[0.06] bg-[#050a14]/95 px-3 py-2.5">
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/[0.03] px-3 py-2 font-section-thai text-[0.8rem] text-text/70 transition hover:border-white/30 hover:text-text"
                >
                  <IoRefreshOutline className="text-base" />
                  ล้างโค้ด
                </button>

                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={saveState === "saving"}
                  className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/50 bg-gradient-to-r from-amber-600 to-orange-500 px-4 py-2 font-section-thai text-[0.85rem] font-medium text-white shadow-[0_0_20px_rgba(245,158,11,0.35)] transition hover:brightness-110 disabled:opacity-60"
                >
                  <IoSaveOutline className="text-base" />
                  {saveState === "saving" ? "กำลังบันทึก…" : "บันทึกโค้ดบล็อก"}
                </button>

                <button
                  type="button"
                  disabled
                  title="ยังไม่พร้อมในรอบนี้"
                  className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-md border border-teal-500/25 bg-teal-500/15 px-4 py-2 font-section-thai text-[0.85rem] text-teal-200/40"
                >
                  <IoRocketOutline className="text-base" />
                  ส่งภารกิจ
                </button>

                {saveMessage && (
                  <span
                    className={`font-section-thai text-[0.75rem] ${
                      saveState === "error" ? "text-orange-300" : "text-emerald-300/90"
                    }`}
                  >
                    {saveMessage}
                  </span>
                )}
              </div>
            </div>

            <aside className="min-h-0 min-w-0 overflow-hidden bg-[#040912]/60">
              <MissionFeedbackMock />
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
