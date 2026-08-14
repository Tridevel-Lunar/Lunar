import { useEffect, useRef, useState } from "react";
import {
  HiOutlineCog6Tooth,
  HiOutlineDocumentText,
  HiOutlinePuzzlePiece,
} from "react-icons/hi2";
import {
  IoArrowForward,
  IoRefreshOutline,
  IoRocketOutline,
  IoSaveOutline,
} from "react-icons/io5";

import type { ProgramAst } from "@/ast/types";
import type { ArenaMission } from "@/components/arena/arena-data";
import BlocklyEditor, {
  type BlocklyEditorHandle,
  type BlocklyWorkspaceState,
} from "@/components/arena/blockly/BlocklyEditor";
import MissionFeedbackMock from "@/components/arena/feedback/MissionFeedback";
import { gradeLabel, gradeStatusClassName } from "@/components/arena/grade-label";
import MissionRunErrorDialog, {
  runErrorPresentation,
} from "@/components/arena/mission/MissionRunErrorDialog";
import MissionSetupTabs, {
  DEFAULT_MISSION_SETUP,
  type MissionSetupState,
} from "@/components/arena/mission/MissionSetupTabs";
import MissionTimeline from "@/components/arena/timeline/MissionTimeline";
import { getMissionOrbitTimelineConfig } from "@/components/arena/timeline/mission-timeline-config";
import {
  ApiError,
  type ArenaMissionPack,
  type ArenaRunResponse,
  getArenaAttempt,
  getArenaMission,
  runArenaMission,
  saveArenaAttempt,
} from "@/lib/api";

type ActivityTab = "detail" | "setup" | "coding";

const VIEW_OPTIONS: {
  id: ActivityTab;
  label: string;
  icon: typeof HiOutlineDocumentText;
}[] = [
  { id: "detail", label: "รายละเอียดภารกิจ", icon: HiOutlineDocumentText },
  { id: "setup", label: "ตั้งค่าระบบ", icon: HiOutlineCog6Tooth },
  { id: "coding", label: "เขียนโค้ดบล็อก", icon: HiOutlinePuzzlePiece },
];

function MissionDetailPanel({
  mission,
  onGoToCoding,
}: {
  mission: ArenaMission;
  onGoToCoding: () => void;
}) {
  const [previewIndex, setPreviewIndex] = useState(0);
  const timelineConfig = getMissionOrbitTimelineConfig(mission.id);

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

      {timelineConfig ? (
        <section className="space-y-2 border-t border-white/10 pt-5">
          <h3 className="font-display text-[0.72rem] font-semibold tracking-[0.16em] text-cyan/90">
            ไทม์ไลน์ 1 วงโคจร
          </h3>
          <p className="font-section-thai text-[0.85rem] leading-relaxed text-text/70">
            เริ่มที่ subsolar (แดดเต็มที่) → เข้า eclipse กลางวง → กลับสู่แดด — โปรแกรม OBC
            รันซ้ำทุกวินาทีจำลองตลอดวงโคจร
          </p>
          <MissionTimeline
            config={timelineConfig}
            selectedIndex={previewIndex}
            onSelectIndex={setPreviewIndex}
            preview
          />
        </section>
      ) : null}

      <section className="space-y-3 border-t border-white/10 pt-5">
        <h3 className="font-display text-[0.72rem] font-semibold tracking-[0.16em] text-cyan/90">
          MISSION OBJECTIVE
        </h3>
        <p className="font-section-thai text-[0.88rem] leading-relaxed text-text/80">
          {mission.objectiveLead}{" "}
          <span className="mt-1 block text-[1rem] font-medium text-cyan">
            {mission.objectiveHighlight}
          </span>
        </p>
        {mission.objectiveCheckWhen ? (
          <p className="font-section-thai text-[0.85rem] leading-relaxed text-text/70">
            {mission.objectiveCheckWhen}
          </p>
        ) : null}
        {mission.objectiveMetrics.length > 0 ? (
          <div className="space-y-1.5">
            <p className="font-display text-[0.62rem] font-semibold tracking-[0.14em] text-text/55">
              สิ่งที่ระบบตรวจ
            </p>
            <ul className="font-section-thai space-y-1.5 text-[0.85rem] text-text/75">
              {mission.objectiveMetrics.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan/70" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {mission.objectiveOutcomes.length > 0 ? (
          <div className="space-y-2.5">
            <p className="font-display text-[0.62rem] font-semibold tracking-[0.14em] text-text/55">
              เกณฑ์ผลลัพธ์
            </p>
            <div className="space-y-2">
              {mission.objectiveOutcomes.map((outcome) => (
                <div
                  key={outcome.grade}
                  className="rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
                >
                  <p className="font-display text-[0.68rem] font-semibold tracking-[0.12em] text-cyan/85">
                    {outcome.grade}
                  </p>
                  <p className="font-section-thai mt-1 text-[0.84rem] leading-relaxed text-text/75">
                    {outcome.summary}
                  </p>
                  <ul className="font-section-thai mt-1.5 space-y-1 text-[0.82rem] text-text/65">
                    {outcome.conditions.map((condition) => (
                      <li key={condition} className="flex gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/30" />
                        <span>{condition}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {mission.objectiveBonus ? (
          <p className="font-section-thai rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[0.84rem] leading-relaxed text-amber-200/85">
            <span className="font-display text-[0.62rem] font-semibold tracking-[0.14em] text-amber-300/90">
              โบนัส:{" "}
            </span>
            {mission.objectiveBonus}
          </p>
        ) : null}
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

      <div className="border-t border-white/10 pt-5">
        <button
          type="button"
          onClick={onGoToCoding}
          className="group inline-flex items-center justify-center gap-2 rounded-lg border border-cyan/60 bg-gradient-to-r from-cyan to-[#4df0ff] px-6 py-3 font-section-thai text-[0.95rem] font-medium text-bg shadow-[0_0_28px_rgba(0,229,255,0.45)] transition hover:brightness-110"
        >
          To Playground
          <IoArrowForward className="text-base transition group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}

function setupFromPack(pack: ArenaMissionPack | null): MissionSetupState {
  const base = structuredClone(DEFAULT_MISSION_SETUP);
  const eps = pack?.setupPresets?.eps;
  const payload = pack?.setupPresets?.payload;
  const comm = pack?.setupPresets?.comm;
  if (eps) {
    if (typeof eps.battery_threshold_low === "number") {
      base.eps.battery_threshold_low = eps.battery_threshold_low;
    }
    if (typeof eps.battery_threshold_high === "number") {
      base.eps.battery_threshold_high = eps.battery_threshold_high;
    }
    if (typeof eps.temp_min === "number") base.eps.temp_min = eps.temp_min;
    if (typeof eps.temp_max === "number") base.eps.temp_max = eps.temp_max;
    if (typeof eps.heater_power === "number") base.eps.heater_power = eps.heater_power;
  }
  if (payload) {
    if (typeof payload.payload_module === "string") {
      base.payload.payload_module = payload.payload_module;
    }
    if (typeof payload.default_on === "boolean") {
      base.payload.default_on = payload.default_on;
    }
  }
  if (comm) {
    if (typeof comm.pass_sim_sec === "number") base.comm.pass_sim_sec = comm.pass_sim_sec;
    if (typeof comm.downlink_policy === "string") {
      base.comm.downlink_policy = comm.downlink_policy;
    }
  }
  return base;
}

function lockedFields(pack: ArenaMissionPack | null) {
  const eps = pack?.setupPresets?.eps;
  const payload = pack?.setupPresets?.payload;
  const comm = pack?.setupPresets?.comm;
  return {
    eps: Array.isArray(eps?.locked) ? (eps.locked as string[]) : [],
    payload: Array.isArray(payload?.locked) ? (payload.locked as string[]) : ["payload_module", "default_on"],
    comm: Array.isArray(comm?.locked)
      ? (comm.locked as string[])
      : ["pass_sim_sec", "downlink_policy"],
  };
}

export default function MissionActivity({ mission }: { mission: ArenaMission }) {
  const [tab, setTab] = useState<ActivityTab>("detail");
  const [initialAst, setInitialAst] = useState<ProgramAst | Record<string, unknown> | null>(
    null,
  );
  const [draftWorkspace, setDraftWorkspace] = useState<BlocklyWorkspaceState | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [runState, setRunState] = useState<"idle" | "running" | "done" | "error">("idle");
  const [runMessage, setRunMessage] = useState<string | null>(null);
  const [runError, setRunError] = useState<{ title: string; message: string } | null>(null);
  const [runResult, setRunResult] = useState<ArenaRunResponse | null>(null);
  const [pack, setPack] = useState<ArenaMissionPack | null>(null);
  const [setup, setSetup] = useState<MissionSetupState>(DEFAULT_MISSION_SETUP);

  const editorRef = useRef<BlocklyEditorHandle>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadError(null);
      setLoaded(false);
      try {
        const [missionPack, attempt] = await Promise.all([
          getArenaMission(mission.id),
          getArenaAttempt(mission.id),
        ]);
        if (cancelled) return;
        setPack(missionPack);
        setSetup(setupFromPack(missionPack));
        setInitialAst(attempt.ast);
        setDraftWorkspace(attempt.workspace);
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

  function snapshotEditorDraft() {
    const ast = editorRef.current?.toAst() ?? null;
    const workspace = editorRef.current?.toWorkspaceState() ?? null;
    if (ast) setInitialAst(ast);
    setDraftWorkspace(workspace);
    return { ast, workspace };
  }

  async function handleSave() {
    const { ast, workspace } = snapshotEditorDraft();
    const programAst = ast ?? { type: "program", body: [] };
    setSaveState("saving");
    setSaveMessage(null);
    try {
      await saveArenaAttempt(
        mission.id,
        programAst as Record<string, unknown>,
        workspace,
      );
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
    snapshotEditorDraft();
    setRunState("idle");
    setRunMessage(null);
    setRunError(null);
    setRunResult(null);
  }

  function handleTabChange(next: ActivityTab) {
    if (next === tab) return;
    if (tab === "coding" && next !== "coding") {
      snapshotEditorDraft();
    }
    setTab(next);
  }

  async function handleRun() {
    const ast = editorRef.current?.toAst() ?? { type: "program", body: [] };
    setRunState("running");
    setRunMessage(null);
    setRunError(null);
    setRunResult(null);
    try {
      const result = await runArenaMission(mission.id, {
        ast: ast as Record<string, unknown>,
        epsSetup: setup.eps,
        payloadSetup: setup.payload,
        commSetup: setup.comm,
      });
      setRunResult(result);
      setRunState("done");
      setRunMessage("ประมวลผลสำเร็จ");
    } catch (err) {
      setRunState("idle");
      setRunError(runErrorPresentation(err));
    }
  }

  const registryOptions = {
    enabledLibs: (pack?.enabledLibs as ("obc" | "eps" | "payload" | "comm")[] | undefined) ?? [
      "obc",
      "eps",
      "payload",
    ],
    payloadModuleId: pack?.payloadModuleId ?? "generic",
    commLibVisible: pack?.commLibVisible ?? false,
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        className="relative z-[80] flex shrink-0 items-stretch gap-1 border-b border-white/[0.06] bg-[#050a14]/90 px-3"
        role="tablist"
        aria-label="มุมมองภารกิจ"
      >
        {VIEW_OPTIONS.map(({ id, label, icon: Icon }) => {
          const selected = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`mission-tab-${id}`}
              aria-selected={selected}
              aria-controls={`mission-panel-${id}`}
              onClick={() => handleTabChange(id)}
              className={`font-section-thai relative inline-flex items-center gap-1.5 px-3 py-2.5 text-[0.82rem] transition ${
                selected
                  ? "text-cyan"
                  : "text-text/55 hover:text-text/85"
              }`}
            >
              <Icon className="text-base opacity-80" aria-hidden />
              <span>{label}</span>
              {selected && (
                <span
                  className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-cyan"
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </div>

      {tab === "detail" ? (
        <div
          id="mission-panel-detail"
          role="tabpanel"
          aria-labelledby="mission-tab-detail"
          className="min-h-0 flex-1 overflow-y-auto"
        >
          <MissionDetailPanel
            mission={mission}
            onGoToCoding={() => handleTabChange("coding")}
          />
        </div>
      ) : tab === "setup" ? (
        <div
          id="mission-panel-setup"
          role="tabpanel"
          aria-labelledby="mission-tab-setup"
          className="min-h-0 flex-1 overflow-y-auto"
        >
          <div className="mx-auto max-w-3xl space-y-4 p-6">
            <div>
              <h2 className="font-display text-[0.72rem] font-semibold tracking-[0.16em] text-cyan/90">
                ตั้งค่าระบบ
              </h2>
              <p className="font-section-thai mt-1.5 text-[0.88rem] leading-relaxed text-text/70">
                ค่าเหล่านี้จะถูกส่งไปพร้อมโปรแกรมเมื่อกดส่งภารกิจ
              </p>
            </div>
            <MissionSetupTabs
              value={setup}
              onChange={setSetup}
              locked={lockedFields(pack)}
            />
          </div>
        </div>
      ) : (
        <div
          id="mission-panel-coding"
          role="tabpanel"
          aria-labelledby="mission-tab-coding"
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
        >
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
                    key={`${mission.id}-${initialAst ? "ast" : "fresh"}-${draftWorkspace ? "ws" : "nows"}`}
                    ref={editorRef}
                    initialAst={initialAst}
                    initialWorkspace={draftWorkspace}
                    registryOptions={registryOptions}
                    className="absolute inset-0 h-full w-full"
                  />
                  {(runState === "running" ||
                    (runMessage && runState === "done") ||
                    (runResult && runState === "done")) && (
                    <div
                      className="pointer-events-none absolute right-3 top-3 z-[60] max-w-[14rem] rounded-md border border-white/15 bg-[#050a14]/92 px-2.5 py-2 shadow-lg backdrop-blur-sm"
                      role="status"
                      aria-live="polite"
                    >
                      {runState === "running" && (
                        <p className="font-section-thai text-[0.9rem] text-cyan-200">
                          กำลังจำลอง 1 วงโคจร...
                        </p>
                      )}
                      {runMessage && runState === "done" && (
                        <p className="font-section-thai text-[0.9rem] text-cyan-200">
                          {runMessage}
                        </p>
                      )}
                      {runResult && runState === "done" && (
                        <p
                          className={`font-section-thai text-[0.9rem] ${
                            runMessage ? "mt-0.5" : ""
                          } ${gradeStatusClassName(runResult.result.grade)}`}
                        >
                          Status: {gradeLabel(runResult.result.grade)}
                        </p>
                      )}
                    </div>
                  )}
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
                  onClick={() => void handleRun()}
                  disabled={runState === "running"}
                  className="inline-flex items-center gap-1.5 rounded-md border border-teal-500/45 bg-teal-500/15 px-4 py-2 font-section-thai text-[0.85rem] text-teal-100 transition hover:border-teal-400/70 hover:bg-teal-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <IoRocketOutline className="text-base" />
                  {runState === "running" ? "กำลังส่งภารกิจ..." : "ส่งภารกิจ"}
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

            <aside className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-[#040912]/60">
              <MissionFeedbackMock missionId={mission.id} runResult={runResult} />
            </aside>
          </div>
        </div>
      )}

      <MissionRunErrorDialog
        open={runError !== null}
        title={runError?.title ?? ""}
        message={runError?.message ?? ""}
        onClose={() => setRunError(null)}
      />
    </div>
  );
}
