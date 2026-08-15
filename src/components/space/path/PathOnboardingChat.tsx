import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HiOutlinePaperAirplane } from "react-icons/hi2";

import { LAIKA_AVATAR_URL } from "@/lib/constants";
import {
  isAbortError,
  putLearningPath,
  streamSpacePathAssist,
  type LearningPathChatMessage,
  type PathProposal,
} from "@/lib/api";
import { spaceExplorePath, spacePathTabPath } from "@/components/space/core/routes";
import { useQueuedTypewriter } from "@/lib/use-queued-typewriter";

import { SPACE_PATH_OPENING, SPACE_PATH_PLACEHOLDER } from "./copy";

type ChatItem = {
  role: "user" | "assistant";
  content: string;
};

type Props = {
  onPlan: (plan: PathProposal) => void;
  draft: PathProposal | null;
  onStarted?: () => void;
  fullBleed?: boolean;
  initialMessages?: LearningPathChatMessage[];
};

export default function PathOnboardingChat({
  onPlan,
  draft,
  onStarted,
  fullBleed,
  initialMessages,
}: Props) {
  const navigate = useNavigate();
  const [items, setItems] = useState<ChatItem[]>(() =>
    initialMessages && initialMessages.length > 0
      ? initialMessages.map((m) => ({ role: m.role, content: m.content }))
      : [{ role: "assistant", content: SPACE_PATH_OPENING }],
  );
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const started = items.some((item) => item.role === "user");
  const [reduceMotion, setReduceMotion] = useState(false);
  const showTypewriter = !started && items.length === 1 && items[0]?.content === SPACE_PATH_OPENING;
  const { display: introDisplay } = useQueuedTypewriter(
    showTypewriter && !reduceMotion ? SPACE_PATH_OPENING : null,
    { typeMs: 28 },
  );
  const introDone = !showTypewriter || reduceMotion || introDisplay === SPACE_PATH_OPENING;

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (started) onStarted?.();
  }, [started, onStarted]);

  useEffect(() => {
    if (!started) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [items, busy, started]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  async function handleSkip() {
    abortRef.current?.abort();
    try {
      await putLearningPath({ status: "skipped" });
    } catch {
      /* still leave */
    }
    navigate(spaceExplorePath());
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setError(null);
    const nextItems: ChatItem[] = [...items, { role: "user", content: text }];
    setItems(nextItems);
    setBusy(true);

    const history: LearningPathChatMessage[] = nextItems
      .slice(0, -1)
      .filter((m) => m.content.trim())
      .map((m) => ({ role: m.role, content: m.content }));

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    let assistant = "";
    setItems((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      await streamSpacePathAssist(
        { content: text, messages: history },
        {
          onToken: (delta) => {
            assistant += delta;
            const snapshot = assistant;
            setItems((prev) => {
              const copy = [...prev];
              const last = copy[copy.length - 1];
              if (last?.role === "assistant") {
                copy[copy.length - 1] = { role: "assistant", content: snapshot };
              }
              return copy;
            });
          },
          onPlanDelta: onPlan,
          onPlan: onPlan,
          onDone: (response) => {
            const finalText = response || assistant;
            setItems((prev) => {
              const copy = [...prev];
              const last = copy[copy.length - 1];
              if (last?.role === "assistant") {
                copy[copy.length - 1] = { role: "assistant", content: finalText };
              }
              return copy;
            });
          },
          onError: (message) => setError(message),
        },
        controller.signal,
      );
    } catch (err) {
      if (!isAbortError(err)) {
        setError(err instanceof Error ? err.message : "คุยกับ LAIKA ไม่สำเร็จ");
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleSave() {
    if (!draft || draft.steps.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      await putLearningPath({
        status: "active",
        steps: draft.steps,
        edges: draft.edges,
        intentTags: draft.intentTags,
        chatTranscript: items
          .filter((m) => m.content.trim())
          .map((m) => ({ role: m.role, content: m.content })),
      });
      navigate(spacePathTabPath());
    } catch (err) {
      setError(err instanceof Error ? err.message : "บันทึกเส้นทางไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  const composer = (
    <Composer
      input={input}
      busy={busy}
      error={error}
      saving={saving}
      canSave={Boolean(draft && draft.steps.length > 0)}
      onInput={setInput}
      onSend={() => void handleSend()}
      onSkip={() => void handleSkip()}
      onSave={() => void handleSave()}
      compact={!started}
    />
  );

  if (!started) {
    const shownIntro = showTypewriter
      ? reduceMotion
        ? SPACE_PATH_OPENING
        : introDisplay
      : (items[0]?.content ?? SPACE_PATH_OPENING);
    return (
      <div
        className={`flex h-full min-h-0 flex-col ${
          fullBleed ? "px-6 pb-8 pt-10 sm:px-10" : "px-5 pb-4 pt-6"
        }`}
      >
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className={`flex w-full flex-col items-center text-center ${
              fullBleed ? "max-w-xl" : "max-w-sm"
            }`}
          >
            <div
              className={`relative overflow-hidden rounded-full border-2 border-amber-400/30 shadow-[0_0_28px_rgba(251,191,36,0.22)] ${
                fullBleed ? "h-36 w-36" : "h-28 w-28"
              }`}
            >
              <img
                src={LAIKA_AVATAR_URL}
                alt="LAIKA"
                className="h-full w-full object-cover object-center"
              />
            </div>
            <p className="font-mono mt-4 text-[0.68rem] tracking-[0.22em] text-amber-400/80">LAIKA</p>
            <div
              className={`relative mt-4 w-full ${
                fullBleed ? "text-[1.15rem] sm:text-[1.22rem]" : "text-[1.02rem]"
              }`}
            >
              <p
                aria-hidden
                className="invisible font-section-thai leading-[1.75]"
              >
                {SPACE_PATH_OPENING}
              </p>
              <p
                className="font-section-thai absolute inset-0 text-center leading-[1.75] text-text/88"
                aria-live="polite"
              >
                {shownIntro}
                {!introDone ? (
                  <span className="ml-0.5 inline-block animate-pulse text-amber-400/70">|</span>
                ) : null}
              </p>
            </div>
          </motion.div>
        </div>
        {introDone ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`mx-auto w-full shrink-0 ${fullBleed ? "max-w-lg" : "max-w-md"}`}
          >
            {composer}
          </motion.div>
        ) : (
          <div className={`mx-auto w-full shrink-0 ${fullBleed ? "max-w-lg" : "max-w-md"}`} aria-hidden>
            <div className="invisible pointer-events-none">{composer}</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          {items.map((item, i) =>
            item.role === "assistant" ? (
              <LaikaBubble
                key={i}
                text={item.content}
                pending={busy && i === items.length - 1 && !item.content}
              />
            ) : (
              <UserBubble key={i} text={item.content} />
            ),
          )}
          <div ref={bottomRef} />
        </div>
      </div>
      {composer}
    </div>
  );
}

function Composer({
  input,
  busy,
  error,
  saving,
  canSave,
  onInput,
  onSend,
  onSkip,
  onSave,
  compact,
}: {
  input: string;
  busy: boolean;
  error: string | null;
  saving: boolean;
  canSave: boolean;
  onInput: (value: string) => void;
  onSend: () => void;
  onSkip: () => void;
  onSave: () => void;
  compact: boolean;
}) {
  return (
    <form
      className={compact ? "pt-2" : "border-t border-white/[0.06] px-4 py-3"}
      onSubmit={(e) => {
        e.preventDefault();
        onSend();
      }}
    >
      {error ? (
        <p className="font-section-thai pb-2 text-[0.78rem] text-red-400/90">{error}</p>
      ) : null}
      <div className="flex items-stretch gap-2">
        <textarea
          value={input}
          onChange={(e) => onInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          rows={2}
          placeholder={SPACE_PATH_PLACEHOLDER}
          disabled={busy}
          autoFocus={compact}
          className="font-section-thai min-h-[52px] w-full resize-none rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[0.88rem] text-text outline-none placeholder:text-text/30 focus:border-cyan/40"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          aria-label="ส่ง"
          className="flex w-[52px] shrink-0 cursor-pointer items-center justify-center self-stretch rounded-lg border border-cyan/40 bg-cyan/15 text-cyan transition hover:bg-cyan/25 disabled:cursor-default disabled:opacity-40"
        >
          <HiOutlinePaperAirplane className="text-xl" />
        </button>
      </div>
      <div className={`mt-3 flex items-center ${canSave ? "justify-between" : "justify-center"} gap-3`}>
        <button
          type="button"
          onClick={onSkip}
          className="font-section-thai cursor-pointer px-1 py-2 text-[0.88rem] text-text/50 transition hover:text-text/80"
        >
          เดี๋ยวเลือกเรียนเอง
        </button>
        {canSave ? (
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="font-section-thai cursor-pointer rounded-lg border border-cyan/40 bg-cyan/15 px-4 py-2.5 text-[0.88rem] text-cyan transition hover:bg-cyan/25 disabled:cursor-default disabled:opacity-50"
          >
            บันทึกเส้นทาง
          </button>
        ) : null}
      </div>
    </form>
  );
}

function LaikaBubble({ text, pending }: { text: string; pending?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex shrink-0 flex-col items-center gap-1.5">
        <div className="h-11 w-11 overflow-hidden rounded-full border-2 border-amber-400/25 shadow-[0_0_12px_rgba(251,191,36,0.15)]">
          <img src={LAIKA_AVATAR_URL} alt="LAIKA" className="h-full w-full object-cover object-center" />
        </div>
        <p className="font-mono text-[0.5rem] tracking-wider text-amber-400/70">LAIKA</p>
      </div>
      <div className="relative min-w-0 flex-1 rounded-2xl rounded-tl-md border border-amber-400/15 bg-amber-400/[0.06] px-3.5 py-3">
        <p className="font-section-thai text-[0.88rem] leading-relaxed text-white/85 whitespace-pre-wrap">
          {text || (pending ? "…" : "")}
        </p>
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-2xl rounded-tr-md border border-cyan/20 bg-cyan/[0.08] px-3.5 py-3">
        <p className="font-section-thai text-[0.88rem] leading-relaxed text-text/90 whitespace-pre-wrap">
          {text}
        </p>
      </div>
    </div>
  );
}
