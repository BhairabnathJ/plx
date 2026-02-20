import { action } from "../_generated/server";
import { v } from "convex/values";
import {
  type ConsensusInsight,
  type ConstraintExtractionResult,
  type LlmFailure,
  type LlmResult,
  type PollOptionBundle,
  type SummaryMessageDraft,
} from "../contracts/llm";
import { callOpenRouterWithFallback, OpenRouterError, PRIMARY_MODEL } from "./openrouter";

function requireApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new OpenRouterError("config_error", "OPENROUTER_API_KEY is not configured", false);
  return key;
}

function toFailure(error: unknown): LlmFailure {
  if (error instanceof OpenRouterError) {
    return {
      ok: false,
      code: error.code,
      message: error.message,
      retryable: error.retryable,
    };
  }
  return {
    ok: false,
    code: "request_failed",
    message: error instanceof Error ? error.message : "Unknown LLM error",
    retryable: false,
  };
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v ?? "").trim()).filter(Boolean);
}

function repairConstraints(raw: unknown): ConstraintExtractionResult {
  const obj = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
  return {
    hard: toStringArray(obj.hard).map((text) => ({ text })),
    soft: toStringArray(obj.soft).map((text) => ({ text })),
    mentions: toStringArray(obj.mentions).map((text) => ({ text })),
  };
}

function repairPollOptions(raw: unknown): PollOptionBundle {
  const obj = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
  return {
    dates: toStringArray(obj.dates).slice(0, 5),
    times: toStringArray(obj.times).slice(0, 5),
    places: toStringArray(obj.places).slice(0, 6),
    before: toStringArray(obj.before).slice(0, 4),
    after: toStringArray(obj.after).slice(0, 4),
  };
}

function repairSummary(raw: unknown, model: string): SummaryMessageDraft {
  const obj = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
  const text = typeof obj.text === "string" ? obj.text.trim() : "";
  return { text, model };
}

function repairConsensus(raw: unknown): ConsensusInsight {
  const obj = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
  return {
    consensusPoints: toStringArray(obj.consensusPoints),
    conflicts: toStringArray(obj.conflicts),
    nextStep: typeof obj.nextStep === "string" ? obj.nextStep.trim() : "",
  };
}

export const extractConstraints = action({
  args: {
    sessionText: v.string(),
  },
  handler: async (_ctx, args): Promise<LlmResult<ConstraintExtractionResult>> => {
    try {
      const res = await callOpenRouterWithFallback<unknown>({
        apiKey: requireApiKey(),
        systemPrompt:
          "You extract planning constraints. Return JSON: {hard:[string],soft:[string],mentions:[string]}",
        userPrompt: args.sessionText,
        retries: 1,
      });
      return {
        ok: true,
        data: repairConstraints(res.data),
        meta: {
          model: res.model ?? PRIMARY_MODEL,
          latencyMs: res.latencyMs,
          attempts: res.attempts,
        },
      };
    } catch (error) {
      return toFailure(error);
    }
  },
});

export const generatePollOptions = action({
  args: {
    summaryContext: v.string(),
  },
  handler: async (_ctx, args): Promise<LlmResult<PollOptionBundle>> => {
    try {
      const res = await callOpenRouterWithFallback<unknown>({
        apiKey: requireApiKey(),
        systemPrompt:
          "Generate compact planning poll options. Return JSON: {dates:[],times:[],places:[],before:[],after:[]}",
        userPrompt: args.summaryContext,
        retries: 1,
      });
      return {
        ok: true,
        data: repairPollOptions(res.data),
        meta: {
          model: res.model ?? PRIMARY_MODEL,
          latencyMs: res.latencyMs,
          attempts: res.attempts,
        },
      };
    } catch (error) {
      return toFailure(error);
    }
  },
});

export const generateSummaryDraft = action({
  args: {
    voteSummary: v.string(),
  },
  handler: async (_ctx, args): Promise<LlmResult<SummaryMessageDraft>> => {
    try {
      const res = await callOpenRouterWithFallback<unknown>({
        apiKey: requireApiKey(),
        systemPrompt:
          "Write a concise friendly planning summary for a group chat. Return JSON: {text}",
        userPrompt: args.voteSummary,
        retries: 1,
      });
      return {
        ok: true,
        data: repairSummary(res.data, res.model ?? PRIMARY_MODEL),
        meta: {
          model: res.model ?? PRIMARY_MODEL,
          latencyMs: res.latencyMs,
          attempts: res.attempts,
        },
      };
    } catch (error) {
      return toFailure(error);
    }
  },
});

export const analyzeLiveChatConsensus = action({
  args: {
    recentMessages: v.string(),
  },
  handler: async (_ctx, args): Promise<LlmResult<ConsensusInsight>> => {
    try {
      const res = await callOpenRouterWithFallback<unknown>({
        apiKey: requireApiKey(),
        systemPrompt:
          "Analyze recent planning chat. Return JSON: {consensusPoints:[],conflicts:[],nextStep:string}",
        userPrompt: args.recentMessages,
        retries: 1,
      });
      return {
        ok: true,
        data: repairConsensus(res.data),
        meta: {
          model: res.model ?? PRIMARY_MODEL,
          latencyMs: res.latencyMs,
          attempts: res.attempts,
        },
      };
    } catch (error) {
      return toFailure(error);
    }
  },
});
