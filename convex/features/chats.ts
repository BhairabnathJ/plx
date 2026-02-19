import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

export const listBySession = query({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chats")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("asc")
      .collect();
  },
});

export const addMessage = mutation({
  args: {
    groupId: v.id("groups"),
    sessionId: v.optional(v.id("sessions")),
    authorName: v.string(),
    authorUserId: v.optional(v.id("users")),
    message: v.string(),
    source: v.union(v.literal("manual"), v.literal("whatsapp"), v.literal("web")),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("chats", {
      ...args,
      createdAt: Date.now(),
    });
    return id;
  },
});
