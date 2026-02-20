import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ─── Auth error codes ─────────────────────────────────────────────────────────
export const AUTH_ERRORS = {
  EMAIL_TAKEN: "EMAIL_TAKEN",
  USERNAME_TAKEN: "USERNAME_TAKEN",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  WEAK_PASSWORD: "WEAK_PASSWORD",
  INVALID_EMAIL: "INVALID_EMAIL",
  INVALID_USERNAME: "INVALID_USERNAME",
  SESSION_EXPIRED: "SESSION_EXPIRED",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
} as const;

type AuthErrorCode = (typeof AUTH_ERRORS)[keyof typeof AUTH_ERRORS];

function authError(code: AuthErrorCode, message: string): Error {
  const err = new Error(message);
  (err as any).code = code;
  return err;
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function newToken() {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
}

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

function validateEmail(email: string): void {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) {
    throw authError(AUTH_ERRORS.INVALID_EMAIL, "Please enter a valid email address");
  }
}

function validateUsername(username: string): void {
  if (username.length < 3 || username.length > 32) {
    throw authError(AUTH_ERRORS.INVALID_USERNAME, "Username must be between 3 and 32 characters");
  }
  if (!/^[a-z0-9_.-]+$/.test(username)) {
    throw authError(AUTH_ERRORS.INVALID_USERNAME, "Username may only contain letters, numbers, underscores, dots, and hyphens");
  }
}

function validatePassword(password: string): void {
  if (password.length < 8) {
    throw authError(AUTH_ERRORS.WEAK_PASSWORD, "Password must be at least 8 characters");
  }
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  if (!hasLetter || !hasDigit) {
    throw authError(AUTH_ERRORS.WEAK_PASSWORD, "Password must contain at least one letter and one number");
  }
}

export async function resolveSession(ctx: any, token: string) {
  const session = await ctx.db
    .query("authSessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .first();
  if (!session) {
    throw authError(AUTH_ERRORS.SESSION_EXPIRED, "Session not found. Please sign in again.");
  }
  if (session.expiresAt < Date.now()) {
    await ctx.db.delete(session._id);
    throw authError(AUTH_ERRORS.SESSION_EXPIRED, "Your session has expired. Please sign in again.");
  }
  return session;
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
    validateEmail(email);
    validateUsername(username);
    validatePassword(args.password);

    const existingByEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (existingByEmail) {
      throw authError(AUTH_ERRORS.EMAIL_TAKEN, "An account with this email already exists");
    }

    const existingByUsername = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();
    if (existingByUsername) {
      throw authError(AUTH_ERRORS.USERNAME_TAKEN, "This username is already taken");
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
      expiresAt: now + SESSION_TTL_MS,
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
      user: { id: userId, email, username, name: username },
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
    const user =
      byEmail ??
      (await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", identifier))
        .first());

    if (!user || user.password !== args.password) {
      throw authError(AUTH_ERRORS.INVALID_CREDENTIALS, "Incorrect email/username or password");
    }

    const now = Date.now();
    const token = newToken();
    await ctx.db.insert("authSessions", {
      userId: user._id,
      token,
      createdAt: now,
      expiresAt: now + SESSION_TTL_MS,
    });

    const firstMembership = await ctx.db
      .query("groupMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    return {
      sessionToken: token,
      user: { id: user._id, email: user.email, username: user.username, name: user.name },
      defaultGroupId: firstMembership?.groupId ?? null,
    };
  },
});

export const getSession = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("authSessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .first();
    if (!session) return null;
    if (session.expiresAt < Date.now()) return null;

    const user = await ctx.db.get(session.userId);
    if (!user) return null;

    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return {
      user: { id: user._id, email: user.email, username: user.username, name: user.name },
      groupIds: memberships.map((m) => m.groupId),
      expiresAt: session.expiresAt,
    };
  },
});

export const logout = mutation({
  args: { sessionToken: v.string() },
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

export const deleteAccount = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await resolveSession(ctx, args.sessionToken);
    const userId = session.userId;

    const sessions = await ctx.db
      .query("authSessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    await Promise.all(sessions.map((s) => ctx.db.delete(s._id)));

    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    await Promise.all(memberships.map((m) => ctx.db.delete(m._id)));

    await ctx.db.delete(userId);
    return { ok: true };
  },
});

export const updateProfile = mutation({
  args: {
    sessionToken: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await resolveSession(ctx, args.sessionToken);
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) patch.name = args.name.trim();
    if (args.avatarUrl !== undefined) patch.avatarUrl = args.avatarUrl;
    await ctx.db.patch(session.userId, patch);
    return { ok: true };
  },
});

export const initiatePasswordReset = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = normalize(args.email);
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user) {
      return { ok: true, message: "If that email is registered, a reset link has been sent." };
    }

    const resetToken = `reset_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    await ctx.db.patch(user._id, {
      password: `reset:${resetToken}:${Date.now() + 3600_000}:${user.password}`,
      updatedAt: Date.now(),
    });

    return {
      ok: true,
      message: "If that email is registered, a reset link has been sent.",
      _devOnlyResetToken: resetToken,
    };
  },
});

export const confirmPasswordReset = mutation({
  args: {
    email: v.string(),
    resetToken: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    validatePassword(args.newPassword);
    const email = normalize(args.email);
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user || !user.password?.startsWith("reset:")) {
      throw authError(AUTH_ERRORS.NOT_FOUND, "Invalid or expired reset token");
    }

    const parts = user.password.split(":");
    const token = parts[1];
    const expiryStr = parts[2];
    if (token !== args.resetToken) {
      throw authError(AUTH_ERRORS.INVALID_CREDENTIALS, "Invalid reset token");
    }
    if (Date.now() > Number(expiryStr)) {
      throw authError(AUTH_ERRORS.SESSION_EXPIRED, "Reset token has expired. Please request a new one.");
    }

    await ctx.db.patch(user._id, { password: args.newPassword, updatedAt: Date.now() });

    const sessions = await ctx.db
      .query("authSessions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    await Promise.all(sessions.map((s) => ctx.db.delete(s._id)));

    return { ok: true };
  },
});
