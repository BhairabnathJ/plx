import { action } from "../_generated/server";
import { v } from "convex/values";
import {
  type ConsensusInsight,
  type ConstraintExtractionResult,
  type PollOptionBundle,
  type SummaryMessageDraft,
} from "../contracts/llm";
import { callOpenRouterJSON } from "./openrouter";

function requireApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY is not configured");
  return key;
}

export const extractConstraints = action({
  args: {
    sessionText: v.string(),
  },
  handler: async (_ctx, args): Promise<ConstraintExtractionResult> => {
    const { data } = await callOpenRouterJSON<ConstraintExtractionResult>({
      apiKey: requireApiKey(),
      systemPrompt:
        "You extract planning constraints. Return JSON: {hard:[{text}],soft:[{text}],mentions:[{text}]}",
      userPrompt: args.sessionText,
      retries: 1,
    });
    return data;
  },
});

export const generatePollOptions = action({
  args: {
    summaryContext: v.string(),
  },
  handler: async (_ctx, args): Promise<PollOptionBundle> => {
    const { data } = await callOpenRouterJSON<PollOptionBundle>({
      apiKey: requireApiKey(),
      systemPrompt:
        "Generate compact planning poll options. Return JSON: {dates:[],times:[],places:[],before:[],after:[]}",
      userPrompt: args.summaryContext,
      retries: 1,
    });
    return data;
  },
});

export const generateSummaryDraft = action({
  args: {
    voteSummary: v.string(),
  },
  handler: async (_ctx, args): Promise<SummaryMessageDraft> => {
    const { data, model } = await callOpenRouterJSON<{ text: string }>({
      apiKey: requireApiKey(),
      systemPrompt:
        "Write a concise friendly planning summary for a group chat. Return JSON: {text}",
      userPrompt: args.voteSummary,
      retries: 1,
    });
    return { text: data.text, model };
  },
});

export const analyzeLiveChatConsensus = action({
  args: {
    recentMessages: v.string(),
  },
  handler: async (_ctx, args): Promise<ConsensusInsight> => {
    const { data } = await callOpenRouterJSON<ConsensusInsight>({
      apiKey: requireApiKey(),
      systemPrompt:
        "Analyze recent planning chat. Return JSON: {consensusPoints:[],conflicts:[],nextStep:string}",
      userPrompt: args.recentMessages,
      retries: 1,
    });
    return data;
  },
});
