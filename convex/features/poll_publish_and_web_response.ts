/**
 * Poll publish, close, revoke lifecycle + token security.
 * Audit IDs: 37, 39, 41, 42, 43, 44, 45, 66
 */
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { resolveSession } from "../authLocal";

function generatePublishToken(): string {
  return [
    Math.random().toString(36).slice(2),
    Math.random().toString(36).slice(2),
    Date.now().toString(36),
  ].join("");
}

const POLL_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;

async function requirePollOwner(ctx: any, pollId: any, sessionToken: string) {
  const session = await resolveSession(ctx, sessionToken);
  const poll = await ctx.db.get(pollId);
  if (!poll) throw new Error("Poll not found");
  const plannerSession = await ctx.db.get(poll.sessionId);
  if (!plannerSession) throw new Error("Session not found");
  const membership = await ctx.db
    .query("groupMembers")
    .withIndex("by_group_user", (q: any) =>
      q.eq("groupId", plannerSession.groupId).eq("userId", session.userId))
    .first();
  if (!membership) throw new Error("UNAUTHORIZED: Not a member of this group");
  return { poll, plannerSession };
}

async function verifyToken(ctx: any, publishToken: string) {
  if (!publishToken || publishToken.trim() === "") {
    throw new Error("POLL_TOKEN_REQUIRED: A valid poll token is required");
  }
  const poll = await ctx.db
    .query("polls")
    .withIndex("by_publish_token", (q: any) => q.eq("publishToken", publishToken))
    .first();
  if (!poll) throw new Error("POLL_NOT_FOUND: Invalid poll token");
  if (poll.status === "closed") throw new Error("POLL_CLOSED: This poll is no longer accepting responses");
  if (poll.status !== "published") throw new Error("POLL_NOT_OPEN: This poll is not open for voting");
  if (poll.tokenExpiresAt && poll.tokenExpiresAt < Date.now()) {
    throw new Error("POLL_TOKEN_EXPIRED: This poll link has expired");
  }
  return poll;
}

async function checkRateLimit(ctx: any, pollId: any, voterKey: string) {
  const now = Date.now();
  const existing = await ctx.db
    .query("voteRateLimits")
    .withIndex("by_poll_voter", (q: any) => q.eq("pollId", pollId).eq("voterKey", voterKey))
    .first();
  if (!existing) {
    await ctx.db.insert("voteRateLimits", { pollId, voterKey, attempts: 1, windowStart: now });
    return;
  }
  if (now - existing.windowStart > RATE_LIMIT_WINDOW_MS) {
    await ctx.db.patch(existing._id, { attempts: 1, windowStart: now });
    return;
  }
  if (existing.attempts >= RATE_LIMIT_MAX) {
    throw new Error("RATE_LIMITED: Too many vote attempts. Please wait a few minutes.");
  }
  await ctx.db.patch(existing._id, { attempts: existing.attempts + 1 });
}

export const publishPoll = mutation({
  args: { sessionToken: v.string(), pollId: v.id("polls") },
  handler: async (ctx, args) => {
    await requirePollOwner(ctx, args.pollId, args.sessionToken);
    const options = await ctx.db
      .query("pollOptions")
      .withIndex("by_poll_dimension", (q: any) => q.eq("pollId", args.pollId))
      .collect();
    const activeOptions = options.filter((o: any) => o.isActive);
    if (activeOptions.length === 0) {
      throw new Error("INVALID_POLL: Cannot publish a poll with no active options");
    }
    const now = Date.now();
    const publishToken = generatePublishToken();
    await ctx.db.patch(args.pollId, {
      status: "published",
      publishToken,
      tokenExpiresAt: now + POLL_TOKEN_TTL_MS,
      updatedAt: now,
    });
    return { publishToken, tokenExpiresAt: now + POLL_TOKEN_TTL_MS };
  },
});

export const closePoll = mutation({
  args: { sessionToken: v.string(), pollId: v.id("polls") },
  handler: async (ctx, args) => {
    const { poll } = await requirePollOwner(ctx, args.pollId, args.sessionToken);
    if (poll.status === "closed") return { ok: true };
    await ctx.db.patch(args.pollId, { status: "closed", updatedAt: Date.now() });
    return { ok: true };
  },
});

export const revokePoll = mutation({
  args: { sessionToken: v.string(), pollId: v.id("polls") },
  handler: async (ctx, args) => {
    await requirePollOwner(ctx, args.pollId, args.sessionToken);
    await ctx.db.patch(args.pollId, {
      status: "draft",
      publishToken: undefined,
      tokenExpiresAt: undefined,
      updatedAt: Date.now(),
    });
    return { ok: true };
  },
});

export const getByToken = query({
  args: { publishToken: v.string() },
  handler: async (ctx, args) => {
    if (!args.publishToken || args.publishToken.trim() === "") return null;
    const poll = await ctx.db
      .query("polls")
      .withIndex("by_publish_token", (q: any) => q.eq("publishToken", args.publishToken))
      .first();
    if (!poll) return null;
    const expired = poll.tokenExpiresAt && poll.tokenExpiresAt < Date.now();
    if (expired) return { id: poll._id, sessionId: poll.sessionId, status: "closed" as const, options: [] };
    const options = await ctx.db
      .query("pollOptions")
      .withIndex("by_poll_dimension", (q: any) => q.eq("pollId", poll._id))
      .collect();
    const activeOptions = options.filter((o: any) => o.isActive);
    return {
      id: poll._id,
      sessionId: poll.sessionId,
      status: poll.status,
      tokenExpiresAt: poll.tokenExpiresAt,
      options: activeOptions.map((o: any) => ({
        id: o._id,
        dimension: o.dimension,
        label: o.label,
        rank: o.rank,
      })),
    };
  },
});

export const submitVoteByToken = mutation({
  args: {
    publishToken: v.string(),
    voterName: v.string(),
    selectedOptionIds: v.array(v.id("pollOptions")),
  },
  handler: async (ctx, args) => {
    const voterName = args.voterName.trim();
    if (!voterName) throw new Error("Voter name is required");
    const poll = await verifyToken(ctx, args.publishToken);
    await checkRateLimit(ctx, poll._id, voterName.toLowerCase());
    const now = Date.now();
    const currentVotes = await ctx.db
      .query("votes")
      .withIndex("by_poll", (q: any) => q.eq("pollId", poll._id))
      .collect();
    const previousVoterVotes = currentVotes.filter((v: any) => v.voterName === voterName);
    const lastRevision = await ctx.db
      .query("voteRevisions")
      .withIndex("by_poll_voter", (q: any) => q.eq("pollId", poll._id).eq("voterName", voterName))
      .order("desc")
      .take(1);
    const revisionNumber = (lastRevision[0]?.revision ?? 0) + 1;
    await ctx.db.insert("voteRevisions", {
      pollId: poll._id,
      voterName,
      selectedOptionIds: args.selectedOptionIds.map(String),
      revisedAt: now,
      revision: revisionNumber,
    });
    await Promise.all(previousVoterVotes.map((v: any) => ctx.db.delete(v._id)));
    for (const optionId of args.selectedOptionIds) {
      await ctx.db.insert("votes", {
        pollId: poll._id,
        pollOptionId: optionId,
        voterName,
        voterUserId: undefined,
        createdAt: now,
      });
    }
    return { ok: true, revision: revisionNumber };
  },
});

export const getVoterStatus = query({
  args: { publishToken: v.string(), voterName: v.string() },
  handler: async (ctx, args) => {
    if (!args.publishToken) return null;
    const poll = await ctx.db
      .query("polls")
      .withIndex("by_publish_token", (q: any) => q.eq("publishToken", args.publishToken))
      .first();
    if (!poll) return null;
    const canEdit = poll.status === "published" && (!poll.tokenExpiresAt || poll.tokenExpiresAt > Date.now());
    const existingVotes = await ctx.db
      .query("votes")
      .withIndex("by_poll", (q: any) => q.eq("pollId", poll._id))
      .collect();
    const voterVotes = existingVotes.filter((v: any) => v.voterName === args.voterName);
    return {
      hasVoted: voterVotes.length > 0,
      canEdit,
      pollStatus: poll.status,
      selectedOptionIds: voterVotes.map((v: any) => String(v.pollOptionId)),
    };
  },
});

/** Get the poll for a given planner session (organizer view). */
export const getBySession = query({
  args: { sessionToken: v.string(), sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    await resolveSession(ctx, args.sessionToken);
    const poll = await ctx.db
      .query("polls")
      .withIndex("by_session", (q: any) => q.eq("sessionId", args.sessionId))
      .first();
    if (!poll) return null;
    return {
      id: poll._id,
      sessionId: poll.sessionId,
      status: poll.status,
      publishToken: poll.publishToken,
      tokenExpiresAt: poll.tokenExpiresAt,
    };
  },
});
