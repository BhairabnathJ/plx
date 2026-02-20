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

export const listMyGroups = query({
  args: {
    sessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx, args.sessionToken);
    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const groups = await Promise.all(
      memberships.map(async (m) => {
        const group = await ctx.db.get(m.groupId);
        if (!group) return null;
        const count = await ctx.db
          .query("groupMembers")
          .withIndex("by_group", (q) => q.eq("groupId", group._id))
          .collect();
        return {
          id: group._id,
          name: group.name,
          description: group.description,
          imageUrl: group.imageUrl,
          createdBy: group.createdBy,
          createdAt: group.createdAt,
          memberCount: count.length,
        };
      }),
    );

    return groups.filter(Boolean);
  },
});

export const create = mutation({
  args: {
    sessionToken: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx, args.sessionToken);
    const now = Date.now();

    const groupId = await ctx.db.insert("groups", {
      name: args.name,
      description: args.description,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("groupMembers", {
      groupId,
      userId,
      role: "owner",
      joinedAt: now,
    });

    return groupId;
  },
});

export const getById = query({
  args: {
    sessionToken: v.string(),
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    await resolveUserId(ctx, args.sessionToken);
    const group = await ctx.db.get(args.groupId);
    if (!group) return null;
    const count = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", group._id))
      .collect();
    return {
      id: group._id,
      name: group.name,
      description: group.description,
      imageUrl: group.imageUrl,
      createdBy: group.createdBy,
      createdAt: group.createdAt,
      memberCount: count.length,
    };
  },
});
