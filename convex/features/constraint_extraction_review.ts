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

const constraintItemV = v.object({ text: v.string() });

/** Called internally by the extractConstraints action to persist results. */
export const saveExtracted = internalMutation({
  args: {
    sessionToken: v.string(),
    sessionId: v.id("sessions"),
    hard: v.array(constraintItemV),
    soft: v.array(constraintItemV),
    mentions: v.array(constraintItemV),
  },
  handler: async (ctx, args) => {
    await resolveUserId(ctx, args.sessionToken);
    const now = Date.now();

    // Remove previously detected constraints for this session so re-analysis is clean
    const existing = await ctx.db
      .query("constraints")
      .withIndex("by_session", (q: any) => q.eq("sessionId", args.sessionId))
      .collect();
    await Promise.all(existing.map((c: any) => ctx.db.delete(c._id)));

    const insertGroup = async (
      items: { text: string }[],
      kind: "hard" | "soft" | "mention",
    ) => {
      for (const item of items) {
        await ctx.db.insert("constraints", {
          sessionId: args.sessionId,
          kind,
          text: item.text,
          state: "detected",
          provenance: "chat",
          confidence: "medium",
          createdAt: now,
          updatedAt: now,
        });
      }
    };

    await insertGroup(args.hard, "hard");
    await insertGroup(args.soft, "soft");
    await insertGroup(args.mentions, "mention");

    return { ok: true };
  },
});

/** List constraints for a session. */
export const listBySession = query({
  args: {
    sessionToken: v.string(),
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    await resolveUserId(ctx, args.sessionToken);
    const rows = await ctx.db
      .query("constraints")
      .withIndex("by_session", (q: any) => q.eq("sessionId", args.sessionId))
      .collect();
    return rows.map((c: any) => ({
      id: c._id,
      sessionId: c.sessionId,
      kind: c.kind,
      text: c.text,
      state: c.state,
      provenance: c.provenance,
      confidence: c.confidence,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  },
});

/** Update a single constraint (state, text). */
export const update = mutation({
  args: {
    sessionToken: v.string(),
    constraintId: v.id("constraints"),
    state: v.optional(
      v.union(
        v.literal("detected"),
        v.literal("accepted"),
        v.literal("edited"),
        v.literal("removed"),
      ),
    ),
    text: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await resolveUserId(ctx, args.sessionToken);
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.state !== undefined) patch.state = args.state;
    if (args.text !== undefined) patch.text = args.text;
    await ctx.db.patch(args.constraintId, patch);
    return { ok: true };
  },
});

/** Bulk update constraints. */
export const bulkUpdate = mutation({
  args: {
    sessionToken: v.string(),
    sessionId: v.id("sessions"),
    state: v.union(
      v.literal("accepted"),
      v.literal("removed"),
    ),
    kind: v.optional(v.union(v.literal("hard"), v.literal("soft"), v.literal("mention"))),
  },
  handler: async (ctx, args) => {
    await resolveUserId(ctx, args.sessionToken);
    const rows = await ctx.db
      .query("constraints")
      .withIndex("by_session", (q: any) => q.eq("sessionId", args.sessionId))
      .collect();

    const now = Date.now();
    await Promise.all(
      rows
        .filter((c: any) => !args.kind || c.kind === args.kind)
        .map((c: any) => ctx.db.patch(c._id, { state: args.state, updatedAt: now })),
    );
    return { ok: true };
  },
});
