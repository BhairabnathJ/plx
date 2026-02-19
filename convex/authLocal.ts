import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function newToken() {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export const register = mutation({
  args: {
    email: v.string(),
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const email = normalize(args.email);
    const username = normalize(args.username);

    const existingByEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (existingByEmail) {
      throw new Error("Email already registered");
    }

    const existingByUsername = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();
    if (existingByUsername) {
      throw new Error("Username already taken");
    }

    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      clerkUserId: `local:${email}`,
      email,
      username,
      password: args.password,
      name: username,
      createdAt: now,
      updatedAt: now,
    });

    const token = newToken();
    await ctx.db.insert("authSessions", {
      userId,
      token,
      createdAt: now,
      expiresAt: now + 1000 * 60 * 60 * 24 * 30,
    });

    const groupId = await ctx.db.insert("groups", {
      name: `${username}'s Group`,
      description: "Auto-created starter group",
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

    return {
      sessionToken: token,
      user: {
        id: userId,
        email,
        username,
        name: username,
      },
      defaultGroupId: groupId,
    };
  },
});

export const login = mutation({
  args: {
    identifier: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const identifier = normalize(args.identifier);

    const byEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identifier))
      .first();

    const byUsername =
      byEmail ??
      (await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", identifier))
        .first());

    if (!byUsername || byUsername.password !== args.password) {
      throw new Error("Invalid credentials");
    }

    const now = Date.now();
    const token = newToken();
    await ctx.db.insert("authSessions", {
      userId: byUsername._id,
      token,
      createdAt: now,
      expiresAt: now + 1000 * 60 * 60 * 24 * 30,
    });

    const firstMembership = await ctx.db
      .query("groupMembers")
      .withIndex("by_user", (q) => q.eq("userId", byUsername._id))
      .first();

    return {
      sessionToken: token,
      user: {
        id: byUsername._id,
        email: byUsername.email,
        username: byUsername.username,
        name: byUsername.name,
      },
      defaultGroupId: firstMembership?.groupId ?? null,
    };
  },
});

export const getSession = query({
  args: {
    sessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("authSessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .first();

    if (!session) return null;
    if (session.expiresAt < Date.now()) return null;

    const user = await ctx.db.get(session.userId);
    if (!user) return null;

    return {
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        name: user.name,
      },
    };
  },
});

export const logout = mutation({
  args: {
    sessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("authSessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .first();
    if (session) {
      await ctx.db.delete(session._id);
    }
    return { ok: true };
  },
});
