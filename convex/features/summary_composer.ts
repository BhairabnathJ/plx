import { internalMutation, mutation, query } from "../_generated/server";
import { v } from "convex/values";

async function resolveUserId(ctx: any, token: string) {
  const session = await ctx.db
    .query("authSessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .first();
  if (!session || session.expiresAt < Date.now()) throw new Error("Unauthorized");
  return session.userId;
}

/** Called internally by generateSummaryDraft action to persist the AI draft. */
export const saveDraft = internalMutation({
  args: {
    sessionToken: v.string(),
    sessionId: v.id("sessions"),
    draftText: v.string(),
    model: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx, args.sessionToken);
    const now = Date.now();
    await ctx.db.insert("summaries", {
      sessionId: args.sessionId,
      draftText: args.draftText,
      model: args.model,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    });
    return { ok: true };
  },
});

/** Get the latest summary for a session. */
export const getLatest = query({
  args: {
    sessionToken: v.string(),
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    await resolveUserId(ctx, args.sessionToken);
    const rows = await ctx.db
      .query("summaries")
      .withIndex("by_session", (q: any) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(1);
    if (!rows[0]) return null;
    const s = rows[0];
    return {
      id: s._id,
      sessionId: s.sessionId,
      draftText: s.draftText,
      finalText: s.finalText,
      model: s.model,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  },
});

/** List all summary versions for a session (version history). */
export const listVersions = query({
  args: {
    sessionToken: v.string(),
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    await resolveUserId(ctx, args.sessionToken);
    const rows = await ctx.db
      .query("summaries")
      .withIndex("by_session", (q: any) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .collect();
    return rows.map((s: any) => ({
      id: s._id,
      draftText: s.draftText,
      finalText: s.finalText,
      model: s.model,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
  },
});

/** Update the final (approved) text of the latest summary. */
export const updateFinal = mutation({
  args: {
    sessionToken: v.string(),
    summaryId: v.id("summaries"),
    finalText: v.string(),
  },
  handler: async (ctx, args) => {
    await resolveUserId(ctx, args.sessionToken);
    await ctx.db.patch(args.summaryId, {
      finalText: args.finalText,
      updatedAt: Date.now(),
    });
    return { ok: true };
  },
});
