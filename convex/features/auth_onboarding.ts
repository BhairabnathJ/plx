import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

export const getAuthBootstrap = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    return { authenticated: !!identity, subject: identity?.subject ?? null };
  },
});

export const createGroupProfile = mutation({
  args: { name: v.string(), description: v.optional(v.string()) },
  handler: async (_ctx, args) => ({ ok: true, groupName: args.name, description: args.description ?? null }),
});
