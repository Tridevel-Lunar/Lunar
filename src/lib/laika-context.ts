/**
 * Client-side context window estimates — mirrors backend/app/services/rag/tokens.py heuristics.
 */

import {
  type ChatNode,
  type LaikaIntent,
} from "@/components/studio/data/studio-data";
import type { LaikaHealth, LaikaLearningContext } from "@/lib/api";

const RAG_CHUNK_CHAR_ESTIMATE = 1120;
const RAG_EMPTY_CONTEXT_CHARS = 34;
const WEB_SEARCH_TOKEN_ESTIMATE = 600;

/** Approximate system prompt sizes per intent (chars) — aligned with backend INTENT_SYSTEM_PROMPTS. */
const SYSTEM_PROMPT_CHAR_ESTIMATE: Record<LaikaIntent, number> = {
  summarize: 720,
  explain: 680,
  "next-step": 700,
  analyze: 700,
  "innovation-path": 680,
  "more-ideas": 660,
  "career-path": 680,
};

export type ContextUsageSegment = {
  key: string;
  label: string;
  tokens: number;
};

export type ContextUsageEstimate = {
  contextWindow: number;
  reservedOutput: number;
  inputBudget: number;
  usedInput: number;
  remainingInput: number;
  usageRatio: number;
  segments: ContextUsageSegment[];
  historyMessageCount: number;
  historyTrimmedCount: number;
  historyKeptCount: number;
  llmModel: string;
};

export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.max(1, Math.ceil((text.length + 2) / 3));
}

function estimateRagTokens(topK: number): number {
  if (topK <= 0) return estimateTokens("x".repeat(RAG_EMPTY_CONTEXT_CHARS));
  const perChunk = estimateTokens("x".repeat(RAG_CHUNK_CHAR_ESTIMATE));
  return perChunk * topK + 24;
}

function formatLearningContext(ctx?: LaikaLearningContext): string {
  if (!ctx) return "(no progress data)";
  const topics = ctx.completed_topics?.join(", ") ?? "";
  const missions = ctx.arena_missions?.join(", ") ?? "";
  return `Course: ${ctx.course ?? ""}\nCompleted topics: ${topics}\nArena missions: ${missions}`;
}

function formatHistory(messages: ChatNode[]): string {
  if (messages.length === 0) return "";
  return messages
    .map((m) => `${m.role === "user" ? "Learner" : "LAIKA"}:\n${m.content}`)
    .join("\n\n");
}

function trimMessages(messages: ChatNode[], maxTokens: number): {
  kept: ChatNode[];
  dropped: number;
} {
  if (maxTokens <= 0 || messages.length === 0) {
    return { kept: [], dropped: messages.length };
  }

  const kept: ChatNode[] = [];
  let total = 0;
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const msg = messages[i];
    const msgTokens = estimateTokens(msg.content) + 8;
    if (kept.length > 0 && total + msgTokens > maxTokens) break;
    total += msgTokens;
    kept.unshift(msg);
  }
  return { kept, dropped: messages.length - kept.length };
}

export function buildContextUsageEstimate(input: {
  health: LaikaHealth | null;
  intent: LaikaIntent;
  entryContent: string;
  currentContent: string;
  draft?: string;
  historyMessages: ChatNode[];
  learningContext?: LaikaLearningContext;
  topK?: number;
  webSearch?: boolean;
  mode?: "standard" | "extra";
}): ContextUsageEstimate {
  const contextWindow = input.health?.context_window ?? 8192;
  const reservedOutput = input.health?.reserved_output_tokens ?? 1500;
  const maxHistoryTokens = input.health?.max_history_tokens ?? 2500;
  const topK = input.topK ?? 5;
  const inputBudget = Math.max(0, contextWindow - reservedOutput);

  const learningContext = input.learningContext;

  const pending =
    (input.draft ?? "").trim() || input.currentContent.trim();

  let fixedTokens =
    estimateTokens("x".repeat(SYSTEM_PROMPT_CHAR_ESTIMATE[input.intent])) +
    estimateRagTokens(topK) +
    estimateTokens(formatLearningContext(learningContext)) +
    estimateTokens(input.entryContent.trim()) +
    estimateTokens(pending) +
    48;
  if (input.webSearch) fixedTokens += WEB_SEARCH_TOKEN_ESTIMATE;

  const historyBudget = Math.min(
    maxHistoryTokens,
    Math.max(0, inputBudget - fixedTokens),
  );
  const { kept, dropped } = trimMessages(input.historyMessages, historyBudget);
  const historyTokens = estimateTokens(formatHistory(kept));

  const segments: ContextUsageSegment[] = [
    { key: "system", label: "System / persona", tokens: estimateTokens("x".repeat(SYSTEM_PROMPT_CHAR_ESTIMATE[input.intent])) },
    { key: "rag", label: "Knowledge (RAG)", tokens: estimateRagTokens(topK) },
    { key: "learning", label: "Learning progress", tokens: estimateTokens(formatLearningContext(learningContext)) },
    { key: "entry", label: "โน้ตต้นทาง", tokens: estimateTokens(input.entryContent.trim()) },
  ];

  if (input.webSearch) {
    segments.push({ key: "web", label: "ค้นหาจากอินเทอร์เน็ต", tokens: WEB_SEARCH_TOKEN_ESTIMATE });
  }
  if (input.mode === "extra") {
    segments.push({ key: "tool_loop", label: "Agentic tool loop", tokens: WEB_SEARCH_TOKEN_ESTIMATE * 2 });
  }

  segments.push({ key: "history", label: "ประวัติแชท", tokens: historyTokens });

  if (pending) {
    segments.push({
      key: "pending",
      label: input.draft?.trim() ? "กำลังพิมพ์" : "ข้อความถัดไป",
      tokens: estimateTokens(pending),
    });
  }

  const usedInput = segments.reduce((sum, s) => sum + s.tokens, 0) + 48;
  const remainingInput = Math.max(0, inputBudget - usedInput);
  const usageRatio = inputBudget > 0 ? Math.min(1, usedInput / inputBudget) : 1;

  return {
    contextWindow,
    reservedOutput,
    inputBudget,
    usedInput,
    remainingInput,
    usageRatio,
    segments,
    historyMessageCount: input.historyMessages.length,
    historyTrimmedCount: dropped,
    historyKeptCount: kept.length,
    llmModel: input.health?.llm_model ?? "unknown",
  };
}

export function usageRingColor(ratio: number): string {
  if (ratio >= 0.92) return "#f87171";
  if (ratio >= 0.75) return "#fbbf24";
  return "#2dd4bf";
}
