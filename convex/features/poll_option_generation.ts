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

const DIMENSION_LIMITS: Record<string, number> = {
  date: 5,
  time: 5,
  place: 5,
  before: 3,
  after: 3,
};

/** Called internally by the generatePollOptions action after LLM generation. */
export const saveGenerated = internalMutation({
  args: {
    sessionToken: v.string(),
    pollId: v.id("polls"),
    bundle: v.object({
      dates: v.array(v.string()),
      times: v.array(v.string()),
      places: v.array(v.string()),
      before: v.array(v.string()),
      after: v.array(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await resolveUserId(ctx, args.sessionToken);
    const now = Date.now();

    // Clear existing options for this poll before inserting
    const existing = await ctx.db
      .query("pollOptions")
      .withIndex("by_poll_dimension", (q: any) => q.eq("pollId", args.pollId))
      .collect();
    await Promise.all(existing.map((o: any) => ctx.db.delete(o._id)));

    const insertDimension = async (
      labels: string[],
      dimension: "date" | "time" | "place" | "before" | "after",
    ) => {
      const limit = DIMENSION_LIMITS[dimension] ?? 5;
      const capped = labels.slice(0, limit);
      for (let i = 0; i < capped.length; i++) {
        await ctx.db.insert("pollOptions", {
          pollId: args.pollId,
          dimension,
          label: capped[i]!,
          rank: i,
          isActive: true,
          createdAt: now,
        });
      }
    };

    await insertDimension(args.bundle.dates, "date");
    await insertDimension(args.bundle.times, "time");
    await insertDimension(args.bundle.places, "place");
    await insertDimension(args.bundle.before, "before");
    await insertDimension(args.bundle.after, "after");

    return { ok: true };
  },
});

/** List poll options grouped by dimension. */
export const listByPoll = query({
  args: {
    sessionToken: v.string(),
    pollId: v.id("polls"),
  },
  handler: async (ctx, args) => {
    await resolveUserId(ctx, args.sessionToken);
    const rows = await ctx.db
      .query("pollOptions")
      .withIndex("by_poll_dimension", (q: any) => q.eq("pollId", args.pollId))
      .collect();
    return rows.map((o: any) => ({
      id: o._id,
      pollId: o.pollId,
      dimension: o.dimension,
      label: o.label,
      rank: o.rank,
      isActive: o.isActive,
      createdAt: o.createdAt,
    }));
  },
});

/** Add a single poll option (organizer-added). Enforces dimension cap. */
export const addOption = mutation({
  args: {
    sessionToken: v.string(),
    pollId: v.id("polls"),
    dimension: v.union(
      v.literal("date"),
      v.literal("time"),
      v.literal("place"),
      v.literal("before"),
      v.literal("after"),
    ),
    label: v.string(),
  },
  handler: async (ctx, args) => {
    await resolveUserId(ctx, args.sessionToken);
    const limit = DIMENSION_LIMITS[args.dimension] ?? 5;

    const existing = await ctx.db
      .query("pollOptions")
      .withIndex("by_poll_dimension", (q: any) =>
        q.eq("pollId", args.pollId).eq("dimension", args.dimension),
      )
      .collect();

    const active = existing.filter((o: any) => o.isActive);
    if (active.length >= limit) {
      throw new Error(
        `Dimension "${args.dimension}" is at capacity (${limit} options max). Remove an option first.`,
      );
    }

    const now = Date.now();
    const id = await ctx.db.insert("pollOptions", {
      pollId: args.pollId,
      dimension: args.dimension,
      label: args.label.trim(),
      rank: existing.length,
      isActive: true,
      createdAt: now,
    });
    return { id };
  },
});

/** Toggle active state or update label of a poll option. */
export const updateOption = mutation({
  args: {
    sessionToken: v.string(),
    optionId: v.id("pollOptions"),
    isActive: v.optional(v.boolean()),
    label: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await resolveUserId(ctx, args.sessionToken);
    const patch: Record<string, unknown> = {};
    if (args.isActive !== undefined) patch.isActive = args.isActive;
    if (args.label !== undefined) patch.label = args.label.trim();
    await ctx.db.patch(args.optionId, patch);
    return { ok: true };
  },
});
