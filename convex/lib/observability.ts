/**
 * Lightweight observability helpers for LLM call logging.
 * Writes structured log lines to Convex's console (visible in dashboard logs).
 */

import type { LLMCallRecord } from "../contracts/types";

export function logLLMCall(record: LLMCallRecord): void {
  const status = record.success ? "OK" : "ERROR";
  const tokenSummary = `prompt=${record.promptTokens} completion=${record.completionTokens}`;
  const msg =
    `[llm:${status}] action=${record.action} model=${record.model} ` +
    `latency=${record.latencyMs}ms ${tokenSummary}` +
    (record.errorMessage ? ` error="${record.errorMessage}"` : "");
  if (record.success) {
    console.log(msg);
  } else {
    console.error(msg);
  }
}

export function buildLLMRecord(
  action: string,
  result: { model: string; promptTokens: number; completionTokens: number; latencyMs: number } | null,
  error?: Error,
): LLMCallRecord {
  return {
    action,
    model: result?.model ?? "unknown",
    promptTokens: result?.promptTokens ?? 0,
    completionTokens: result?.completionTokens ?? 0,
    latencyMs: result?.latencyMs ?? 0,
    success: !error,
    errorMessage: error?.message,
    timestamp: Date.now(),
  };
}
