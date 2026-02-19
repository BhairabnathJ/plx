import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

async function resolveUserId(ctx: any, token: string) {
  const session = await ctx.db
    .query("authSessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .first();
  if (!session || session.expiresAt < Date.now()) {
    throw new Error("Unauthorized");
  }
  return session.userId;
}

export const listByGroup = query({
  args: {
    sessionToken: v.string(),
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    await resolveUserId(ctx, args.sessionToken);
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .order("desc")
      .collect();

    return sessions.map((s) => ({
      id: s._id,
      groupId: s.groupId,
      title: s.title,
      status: s.status,
      timeframe: s.timeframe,
      activityType: s.activityType,
      createdBy: s.createdBy,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
  },
});

export const getById = query({
  args: {
    sessionToken: v.string(),
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    await resolveUserId(ctx, args.sessionToken);
    const s = await ctx.db.get(args.sessionId);
    if (!s) return null;
    return {
      id: s._id,
      groupId: s.groupId,
      title: s.title,
      status: s.status,
      timeframe: s.timeframe,
      activityType: s.activityType,
      contextText: undefined,
      createdBy: s.createdBy,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  },
});

export const create = mutation({
  args: {
    sessionToken: v.string(),
    groupId: v.id("groups"),
    title: v.string(),
    timeframe: v.optional(v.string()),
    activityType: v.optional(v.string()),
    contextText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx, args.sessionToken);
    const now = Date.now();
    const id = await ctx.db.insert("sessions", {
      groupId: args.groupId,
      title: args.title,
      status: "draft",
      timeframe: args.timeframe,
      activityType: args.activityType,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    });

    if (args.contextText) {
      await ctx.db.insert("sessionMessages", {
        sessionId: id,
        source: "manual",
        content: args.contextText,
        createdBy: userId,
        createdAt: now,
      });
    }

    return id;
  },
});

export const updateStatus = mutation({
  args: {
    sessionToken: v.string(),
    sessionId: v.id("sessions"),
    status: v.union(
      v.literal("draft"),
      v.literal("analyzed"),
      v.literal("polling"),
      v.literal("summarized"),
      v.literal("finalized"),
    ),
  },
  handler: async (ctx, args) => {
    await resolveUserId(ctx, args.sessionToken);
    await ctx.db.patch(args.sessionId, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return { ok: true };
  },
});
