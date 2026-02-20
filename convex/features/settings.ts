/**
 * Real Convex mutations for settings persistence.
 * Replaces fake timeouts in the frontend (audit IDs: 15, 16, 17, 18, 20).
 */
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { resolveSession } from "../authLocal";

// ─── Notification prefs ───────────────────────────────────────────────────────

export const getNotificationPrefs = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await resolveSession(ctx, args.sessionToken);
    const prefs = await ctx.db
      .query("notificationPrefs")
      .withIndex("by_user", (q) => q.eq("userId", session.userId))
      .first();
    if (!prefs) {
      // Return defaults
      return { reminders: true, pollVotes: true, sessionFinalized: true };
    }
    return {
      reminders: prefs.reminders,
      pollVotes: prefs.pollVotes,
      sessionFinalized: prefs.sessionFinalized,
    };
  },
});

export const updateNotificationPrefs = mutation({
  args: {
    sessionToken: v.string(),
    reminders: v.optional(v.boolean()),
    pollVotes: v.optional(v.boolean()),
    sessionFinalized: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const session = await resolveSession(ctx, args.sessionToken);
    const now = Date.now();

    const existing = await ctx.db
      .query("notificationPrefs")
      .withIndex("by_user", (q) => q.eq("userId", session.userId))
      .first();

    if (existing) {
      const patch: Record<string, unknown> = { updatedAt: now };
      if (args.reminders !== undefined) patch.reminders = args.reminders;
      if (args.pollVotes !== undefined) patch.pollVotes = args.pollVotes;
      if (args.sessionFinalized !== undefined) patch.sessionFinalized = args.sessionFinalized;
      await ctx.db.patch(existing._id, patch);
    } else {
      await ctx.db.insert("notificationPrefs", {
        userId: session.userId,
        reminders: args.reminders ?? true,
        pollVotes: args.pollVotes ?? true,
        sessionFinalized: args.sessionFinalized ?? true,
        updatedAt: now,
      });
    }
    return { ok: true };
  },
});

// ─── Group settings (role-gated) ─────────────────────────────────────────────

export const updateGroupSettings = mutation({
  args: {
    sessionToken: v.string(),
    groupId: v.id("groups"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await resolveSession(ctx, args.sessionToken);

    // Role gate: only owner can rename the group (audit ID: 17)
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", session.userId),
      )
      .first();

    if (!membership) {
      throw new Error("UNAUTHORIZED: You are not a member of this group");
    }
    if (args.name !== undefined && membership.role !== "owner") {
      throw new Error("FORBIDDEN: Only the group owner can rename the group");
    }

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) patch.name = args.name.trim();
    if (args.description !== undefined) patch.description = args.description.trim();
    if (args.imageUrl !== undefined) patch.imageUrl = args.imageUrl;

    await ctx.db.patch(args.groupId, patch);
    return { ok: true };
  },
});
