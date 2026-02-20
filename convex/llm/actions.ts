import { action } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import {
  type ConsensusInsight,
  type ConstraintExtractionResult,
  type PollOptionBundle,
  type SummaryMessageDraft,
} from "../contracts/llm";
import { callOpenRouterJSON } from "./openrouter";

function requireApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error(
      "OPENROUTER_API_KEY is not configured. Set it in Convex dashboard → Settings → Environment Variables.",
    );
  }
  return key;
}

/** Validate LLM output shape; throws with a descriptive message on mismatch. */
function assertArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value)) {
    throw new Error(
      `LLM output validation failed: expected array at "${field}", got ${typeof value}`,
    );
  }
  return (value as unknown[]).map((item, i) => {
    if (typeof item === "string") return item;
    if (typeof item === "object" && item !== null && "text" in item)
      return String((item as { text: unknown }).text);
    throw new Error(
      `LLM output validation failed: unexpected item type at "${field}[${i}]"`,
    );
  });
}

// ─── Constraint extraction ───────────────────────────────────────────────────

export const extractConstraints = action({
  args: {
    sessionToken: v.string(),
    sessionId: v.id("sessions"),
    sessionText: v.string(),
  },
  handler: async (ctx, args): Promise<ConstraintExtractionResult> => {
    const result = await callOpenRouterJSON<ConstraintExtractionResult>({
      apiKey: requireApiKey(),
      systemPrompt:
        "You are a planning assistant. Extract scheduling constraints from group chat text. " +
        "Return JSON: {hard:[{text}],soft:[{text}],mentions:[{text}]}. " +
        "hard = must-have constraints, soft = preferences, mentions = relevant mentions.",
      userPrompt: args.sessionText,
      retries: 2,
    });

    // Persist constraints to DB via internal mutation
    await ctx.runMutation(internal.features.constraint_extraction_review.saveExtracted, {
      sessionToken: args.sessionToken,
      sessionId: args.sessionId,
      hard: result.data.hard,
      soft: result.data.soft,
      mentions: result.data.mentions,
    });

    return result.data;
  },
});

// ─── Poll option generation ──────────────────────────────────────────────────

export const generatePollOptions = action({
  args: {
    sessionToken: v.string(),
    pollId: v.id("polls"),
    summaryContext: v.string(),
  },
  handler: async (ctx, args): Promise<PollOptionBundle> => {
    const raw = await callOpenRouterJSON<Record<string, unknown>>({
      apiKey: requireApiKey(),
      systemPrompt:
        "Generate compact planning poll options based on the planning context. " +
        "Return JSON with keys: dates, times, places, before, after. " +
        "Each key maps to an array of strings (max 5 per key). " +
        "Example: {dates:[\"Saturday June 14\"],times:[\"7pm\"],places:[\"Central Park\"],before:[\"Dinner\"],after:[\"Drinks\"]}",
      userPrompt: args.summaryContext,
      retries: 2,
    });

    const bundle: PollOptionBundle = {
      dates: assertArray(raw.data.dates ?? [], "dates"),
      times: assertArray(raw.data.times ?? [], "times"),
      places: assertArray(raw.data.places ?? [], "places"),
      before: assertArray(raw.data.before ?? [], "before"),
      after: assertArray(raw.data.after ?? [], "after"),
    };

    // Persist generated options to DB via internal mutation
    await ctx.runMutation(internal.features.poll_option_generation.saveGenerated, {
      sessionToken: args.sessionToken,
      pollId: args.pollId,
      bundle,
    });

    return bundle;
  },
});

// ─── Summary draft generation ────────────────────────────────────────────────

export const generateSummaryDraft = action({
  args: {
    sessionToken: v.string(),
    sessionId: v.id("sessions"),
    voteSummary: v.string(),
    tone: v.optional(
      v.union(v.literal("friendly"), v.literal("default"), v.literal("concise")),
    ),
  },
  handler: async (ctx, args): Promise<SummaryMessageDraft> => {
    const toneInstruction =
      args.tone === "friendly"
        ? "Use warm, enthusiastic language."
        : args.tone === "concise"
          ? "Be brief and direct. No filler."
          : "Use a neutral, clear tone.";

    const result = await callOpenRouterJSON<{ text: string }>({
      apiKey: requireApiKey(),
      systemPrompt:
        `Write a planning summary for a group chat based on voting results. ${toneInstruction} ` +
        "Return JSON: {text: string}",
      userPrompt: args.voteSummary,
      retries: 2,
    });

    if (typeof result.data.text !== "string" || !result.data.text.trim()) {
      throw new Error("LLM summary returned empty or invalid text");
    }

    const draft: SummaryMessageDraft = {
      text: result.data.text,
      model: result.model,
    };

    // Persist the draft
    await ctx.runMutation(internal.features.summary_composer.saveDraft, {
      sessionToken: args.sessionToken,
      sessionId: args.sessionId,
      draftText: draft.text,
      model: draft.model,
    });

    return draft;
  },
});

// ─── Live chat consensus ─────────────────────────────────────────────────────

export const analyzeLiveChatConsensus = action({
  args: {
    recentMessages: v.string(),
  },
  handler: async (_ctx, args): Promise<ConsensusInsight> => {
    const result = await callOpenRouterJSON<ConsensusInsight>({
      apiKey: requireApiKey(),
      systemPrompt:
        "Analyze recent planning chat messages for consensus and conflicts. " +
        "Return JSON: {consensusPoints:string[],conflicts:string[],nextStep:string}",
      userPrompt: args.recentMessages,
      retries: 1,
    });

    if (!Array.isArray(result.data.consensusPoints)) {
      result.data.consensusPoints = [];
    }
    if (!Array.isArray(result.data.conflicts)) {
      result.data.conflicts = [];
    }
    if (typeof result.data.nextStep !== "string") {
      result.data.nextStep = "";
    }

    return result.data;
  },
});
