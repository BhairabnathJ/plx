import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import type { BestComboResult, BestComboEntry, ComboRankingReason } from "../contracts/types";

async function resolveUserId(ctx: any, token: string) {
  const session = await ctx.db
    .query("authSessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .first();
  if (!session || session.expiresAt < Date.now()) throw new Error("Unauthorized");
  return session.userId;
}

/** Submit or update a vote for a poll option (by the participant). */
export const submitVote = mutation({
  args: {
    pollId: v.id("polls"),
    optionIds: v.array(v.id("pollOptions")),
    voterName: v.string(),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify poll is still published (not closed)
    const poll = await ctx.db.get(args.pollId);
    if (!poll) throw new Error("Poll not found");
    if (poll.status === "closed") throw new Error("Poll is closed — no more votes accepted");
    if (poll.status !== "published") throw new Error("Poll is not open for voting");

    const now = Date.now();

    // Remove previous votes from same voter for this poll
    const existing = await ctx.db
      .query("votes")
      .withIndex("by_poll", (q: any) => q.eq("pollId", args.pollId))
      .collect();

    const voterPrevious = existing.filter((v: any) => v.voterName === args.voterName);
    await Promise.all(voterPrevious.map((v: any) => ctx.db.delete(v._id)));

    // Insert new vote selections
    let voterUserId: any;
    if (args.sessionToken) {
      const s = await ctx.db
        .query("authSessions")
        .withIndex("by_token", (q: any) => q.eq("token", args.sessionToken))
        .first();
      if (s && s.expiresAt > now) voterUserId = s.userId;
    }

    for (const optionId of args.optionIds) {
      await ctx.db.insert("votes", {
        pollId: args.pollId,
        pollOptionId: optionId,
        voterName: args.voterName,
        voterUserId,
        createdAt: now,
      });
    }

    return { ok: true };
  },
});

/** Get vote tallies for all options in a poll. */
export const getVoteTallies = query({
  args: {
    sessionToken: v.string(),
    pollId: v.id("polls"),
  },
  handler: async (ctx, args) => {
    await resolveUserId(ctx, args.sessionToken);

    const options = await ctx.db
      .query("pollOptions")
      .withIndex("by_poll_dimension", (q: any) => q.eq("pollId", args.pollId))
      .collect();

    const allVotes = await ctx.db
      .query("votes")
      .withIndex("by_poll", (q: any) => q.eq("pollId", args.pollId))
      .collect();

    const uniqueVoters = new Set(allVotes.map((v: any) => v.voterName));
    const totalVoters = uniqueVoters.size;

    const tallies = options.map((opt: any) => {
      const count = allVotes.filter(
        (v: any) => String(v.pollOptionId) === String(opt._id),
      ).length;
      return {
        optionId: opt._id,
        dimension: opt.dimension,
        label: opt.label,
        rank: opt.rank,
        isActive: opt.isActive,
        voteCount: count,
        pct: totalVoters > 0 ? Math.round((count / totalVoters) * 100) : 0,
      };
    });

    return { tallies, totalVoters, respondedVoters: totalVoters };
  },
});

/** Compute the best combo of (date × time × place) by voter coverage. Returns explainability data. */
export const computeBestCombos = query({
  args: {
    sessionToken: v.string(),
    pollId: v.id("polls"),
  },
  handler: async (ctx, args): Promise<BestComboResult | null> => {
    await resolveUserId(ctx, args.sessionToken);

    const options = await ctx.db
      .query("pollOptions")
      .withIndex("by_poll_dimension", (q: any) => q.eq("pollId", args.pollId))
      .collect();

    const allVotes = await ctx.db
      .query("votes")
      .withIndex("by_poll", (q: any) => q.eq("pollId", args.pollId))
      .collect();

    const uniqueVoters = [...new Set(allVotes.map((v: any) => v.voterName))];
    const totalVoters = uniqueVoters.length;
    if (totalVoters === 0) return null;

    // Build a set of selected option IDs per voter
    const voterSelections = new Map<string, Set<string>>();
    for (const voter of uniqueVoters) {
      const selected = new Set(
        allVotes
          .filter((v: any) => v.voterName === voter)
          .map((v: any) => String(v.pollOptionId)),
      );
      voterSelections.set(voter, selected);
    }

    const dates = options.filter((o: any) => o.dimension === "date" && o.isActive);
    const times = options.filter((o: any) => o.dimension === "time" && o.isActive);
    const places = options.filter((o: any) => o.dimension === "place" && o.isActive);

    if (dates.length === 0 && times.length === 0 && places.length === 0) return null;

    // Pad with a null sentinel so combos work even when a dimension is empty
    const dateSlots = dates.length > 0 ? dates : [null];
    const timeSlots = times.length > 0 ? times : [null];
    const placeSlots = places.length > 0 ? places : [null];

    const scored: BestComboEntry[] = [];

    for (const d of dateSlots) {
      for (const t of timeSlots) {
        for (const p of placeSlots) {
          // Count voters who selected ALL dimensions present in this combo
          let voterCount = 0;
          for (const voter of uniqueVoters) {
            const sel = voterSelections.get(voter)!;
            const ok =
              (!d || sel.has(String(d._id))) &&
              (!t || sel.has(String(t._id))) &&
              (!p || sel.has(String(p._id)));
            if (ok) voterCount++;
          }

          const coveragePct = Math.round((voterCount / totalVoters) * 100);
          const score = voterCount;

          const reasons: ComboRankingReason[] = [];
          if (voterCount === totalVoters) {
            reasons.push({ factor: "turnout", description: "Everyone can make this" });
          } else if (coveragePct >= 75) {
            reasons.push({ factor: "turnout", description: `${coveragePct}% of the group can make this` });
          } else {
            reasons.push({ factor: "turnout", description: `${voterCount} of ${totalVoters} voters available` });
          }

          // Balance bonus: prefer combos where each dimension was individually popular
          const dimScores = [d, t, p].filter(Boolean).map((opt: any) => {
            const votes = allVotes.filter(
              (v: any) => String(v.pollOptionId) === String(opt._id),
            ).length;
            return votes / totalVoters;
          });
          const avgDimScore =
            dimScores.length > 0
              ? dimScores.reduce((a, b) => a + b, 0) / dimScores.length
              : 0;
          if (avgDimScore >= 0.6) {
            reasons.push({
              factor: "preference",
              description: "Each option was individually popular",
            });
          }

          scored.push({
            date: d?.label,
            time: t?.label,
            place: p?.label,
            score,
            voterCount,
            coveragePct,
            reasons,
          });
        }
      }
    }

    scored.sort((a, b) => b.score - a.score || b.coveragePct - a.coveragePct);

    const [primary, ...rest] = scored;
    if (!primary) return null;

    return {
      primary,
      backups: rest.slice(0, 2),
    };
  },
});
