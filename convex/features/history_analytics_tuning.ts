/**
 * History analytics + habit profile aggregation from real finalized session data.
 * Audit IDs: 23 (habits from history), 40 (poll funnel metrics), 73 (habit pipeline), 75 (real trend aggregates)
 */
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { resolveSession } from "../authLocal";

async function resolveUserId(ctx: any, token: string) {
  const session = await resolveSession(ctx, token);
  return session.userId;
}

// ─── Poll funnel metrics (audit ID: 40) ──────────────────────────────────────

export const getPollFunnelMetrics = query({
  args: {
    sessionToken: v.string(),
    pollId: v.id("polls"),
  },
  handler: async (ctx, args) => {
    await resolveUserId(ctx, args.sessionToken);

    const votes = await ctx.db
      .query("votes")
      .withIndex("by_poll", (q: any) => q.eq("pollId", args.pollId))
      .collect();

    const revisions = await ctx.db
      .query("voteRevisions")
      .withIndex("by_poll_voter", (q: any) => q.eq("pollId", args.pollId))
      .collect();

    const uniqueVoters = new Set(votes.map((v: any) => v.voterName));
    const revisedVoters = new Set(
      revisions.filter((r: any) => r.revision > 1).map((r: any) => r.voterName)
    );

    const totalVotes = votes.length;
    const totalVoters = uniqueVoters.size;
    const revisedCount = revisedVoters.size;
    const avgSelectionsPerVoter =
      totalVoters > 0 ? Math.round((totalVotes / totalVoters) * 10) / 10 : 0;

    return {
      totalVoters,
      totalVotes,
      revisedCount,
      avgSelectionsPerVoter,
      revisionRate: totalVoters > 0 ? Math.round((revisedCount / totalVoters) * 100) : 0,
    };
  },
});

// ─── Habit extraction pipeline (audit IDs: 23, 73) ───────────────────────────

function mostCommon(items: string[], top: number): string[] {
  const counts: Record<string, number> = {};
  for (const item of items) {
    counts[item] = (counts[item] ?? 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)
    .map(([label]) => label);
}

function extractDayFromIso(iso: string): string | null {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
  } catch {
    return null;
  }
}

function extractTimeWindowFromIso(iso: string): string | null {
  try {
    const d = new Date(iso);
    const hour = d.getUTCHours();
    if (hour >= 6 && hour < 12) return "Morning";
    if (hour >= 12 && hour < 17) return "Afternoon";
    if (hour >= 17 && hour < 21) return "Evening";
    return "Night";
  } catch {
    return null;
  }
}

/**
 * Rebuild habit profile from finalized events for a group.
 * Called after each finalize action or on demand.
 */
export const rebuildHabitProfile = mutation({
  args: {
    sessionToken: v.string(),
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    await resolveUserId(ctx, args.sessionToken);

    // Get all finalized sessions for this group
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_group_status", (q: any) =>
        q.eq("groupId", args.groupId).eq("status", "finalized")
      )
      .collect();

    if (sessions.length === 0) {
      return { ok: true, sessions: 0 };
    }

    // Get events for finalized sessions
    const days: string[] = [];
    const timeWindows: string[] = [];
    const areas: string[] = [];
    const vibes: string[] = [];
    const turnouts: number[] = [];

    for (const session of sessions) {
      // Collect activity type as vibe
      if (session.activityType) vibes.push(session.activityType);

      // Get event for this session
      const events = await ctx.db
        .query("events")
        .withIndex("by_session", (q: any) => q.eq("sessionId", session._id))
        .collect();

      for (const event of events) {
        const day = extractDayFromIso(event.whenIso);
        if (day) days.push(day);

        const timeWindow = extractTimeWindowFromIso(event.whenIso);
        if (timeWindow) timeWindows.push(timeWindow);

        if (event.venueName) areas.push(event.venueName);

        // Get attendance snapshot
        const snapshots = await ctx.db
          .query("attendanceSnapshots")
          .withIndex("by_event", (q: any) => q.eq("eventId", event._id))
          .order("desc")
          .take(1);

        if (snapshots[0]) {
          const snap = snapshots[0];
          const total = snap.goingCount + snap.maybeCount + snap.noResponseCount;
          if (total > 0) {
            turnouts.push(snap.goingCount / total);
          }
        }
      }
    }

    const avgTurnout =
      turnouts.length > 0
        ? Math.round((turnouts.reduce((a, b) => a + b, 0) / turnouts.length) * 100) / 100
        : undefined;

    const confidence: "high" | "medium" | "low" =
      sessions.length >= 10 ? "high" : sessions.length >= 3 ? "medium" : "low";

    const now = Date.now();
    const existing = await ctx.db
      .query("habitProfiles")
      .withIndex("by_group", (q: any) => q.eq("groupId", args.groupId))
      .first();

    const profileData = {
      groupId: args.groupId,
      preferredDays: mostCommon(days, 3),
      preferredTimeWindows: mostCommon(timeWindows, 2),
      preferredAreas: mostCommon(areas, 3),
      preferredVibes: mostCommon(vibes, 3),
      avgTurnout,
      confidence,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, profileData);
    } else {
      await ctx.db.insert("habitProfiles", profileData);
    }

    return { ok: true, sessions: sessions.length, confidence };
  },
});

// ─── Get habit profile ────────────────────────────────────────────────────────

export const getHabitProfile = query({
  args: {
    sessionToken: v.string(),
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    await resolveUserId(ctx, args.sessionToken);
    const profile = await ctx.db
      .query("habitProfiles")
      .withIndex("by_group", (q: any) => q.eq("groupId", args.groupId))
      .first();
    if (!profile) return null;
    return {
      preferredDays: profile.preferredDays,
      preferredTimeWindows: profile.preferredTimeWindows,
      preferredAreas: profile.preferredAreas,
      preferredVibes: profile.preferredVibes,
      avgTurnout: profile.avgTurnout,
      confidence: profile.confidence,
      updatedAt: profile.updatedAt,
    };
  },
});

// ─── History analytics (audit ID: 75) ────────────────────────────────────────

export const getGroupHistory = query({
  args: {
    sessionToken: v.string(),
    groupId: v.id("groups"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await resolveUserId(ctx, args.sessionToken);
    const limit = Math.min(args.limit ?? 20, 100);

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_group", (q: any) => q.eq("groupId", args.groupId))
      .order("desc")
      .take(limit);

    const results = await Promise.all(
      sessions.map(async (s: any) => {
        const events = await ctx.db
          .query("events")
          .withIndex("by_session", (q: any) => q.eq("sessionId", s._id))
          .collect();

        const event = events[0] ?? null;

        let turnoutPct: number | null = null;
        if (event) {
          const snapshots = await ctx.db
            .query("attendanceSnapshots")
            .withIndex("by_event", (q: any) => q.eq("eventId", event._id))
            .order("desc")
            .take(1);
          if (snapshots[0]) {
            const snap = snapshots[0];
            const total = snap.goingCount + snap.maybeCount + snap.noResponseCount;
            if (total > 0) turnoutPct = Math.round((snap.goingCount / total) * 100);
          }
        }

        return {
          id: s._id,
          title: s.title,
          status: s.status,
          timeframe: s.timeframe,
          activityType: s.activityType,
          updatedAt: s.updatedAt,
          event: event
            ? {
                id: event._id,
                title: event.title,
                whenIso: event.whenIso,
                venueName: event.venueName,
                status: event.status,
              }
            : null,
          turnoutPct,
        };
      })
    );

    return results;
  },
});
