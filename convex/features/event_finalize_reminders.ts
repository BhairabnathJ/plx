/**
 * Event finalization with timezone-aware ISO datetime storage and reminder scheduler.
 * Audit IDs: 54 (canonical ISO datetime), 56 (mapUrl validation), 58 (reminder scheduling), 76 (reminder jobs)
 */
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { resolveSession } from "../authLocal";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function requireGroupMember(ctx: any, groupId: any, sessionToken: string) {
  const session = await resolveSession(ctx, sessionToken);
  const membership = await ctx.db
    .query("groupMembers")
    .withIndex("by_group_user", (q: any) =>
      q.eq("groupId", groupId).eq("userId", session.userId))
    .first();
  if (!membership) throw new Error("UNAUTHORIZED: Not a member of this group");
  return session;
}

/**
 * Validate and normalize a timezone-aware ISO 8601 datetime string.
 * Accepts: "2025-06-14T19:00:00+05:30", "2025-06-14T19:00:00Z"
 * Rejects: free-text like "Saturday 7pm" or invalid dates (audit ID: 54)
 */
function validateIsoDatetime(value: string): string {
  const normalized = value.trim();
  const parsed = new Date(normalized);
  if (isNaN(parsed.getTime())) {
    throw new Error(
      `INVALID_DATETIME: "${value}" is not a valid ISO 8601 datetime. ` +
      "Expected format: YYYY-MM-DDTHH:MM:SS+HH:MM or YYYY-MM-DDTHH:MM:SSZ"
    );
  }
  // Require explicit timezone offset (not just a bare local datetime)
  if (!normalized.includes("Z") && !normalized.match(/[+-]\d{2}:\d{2}$/)) {
    throw new Error(
      "MISSING_TIMEZONE: Datetime must include a timezone offset (e.g. +05:30 or Z for UTC)"
    );
  }
  return parsed.toISOString();
}

/**
 * Validate a map URL — must be http/https (audit ID: 56)
 */
function validateMapUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  try {
    const parsed = new URL(trimmed);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("MAP_URL_INVALID: Map URL must use http or https");
    }
    return parsed.toString();
  } catch {
    throw new Error(`MAP_URL_INVALID: "${url}" is not a valid URL`);
  }
}

/**
 * Compute the Unix timestamp for a reminder based on mode and event ISO time.
 */
function computeReminderTime(whenIso: string, mode: string, customMinutesBefore?: number): number | undefined {
  if (mode === "off") return undefined;
  const eventMs = new Date(whenIso).getTime();
  if (mode === "day-before") return eventMs - 24 * 60 * 60 * 1000;
  if (mode === "same-day") return eventMs - 3 * 60 * 60 * 1000;
  if (mode === "custom" && customMinutesBefore != null) {
    return eventMs - customMinutesBefore * 60 * 1000;
  }
  return undefined;
}

// ─── Create/finalize event ───────────────────────────────────────────────────

export const createEvent = mutation({
  args: {
    sessionToken: v.string(),
    sessionId: v.id("sessions"),
    title: v.string(),
    whenIso: v.string(),
    venueName: v.optional(v.string()),
    mapUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const plannerSession = await ctx.db.get(args.sessionId);
    if (!plannerSession) throw new Error("Session not found");
    const authSession = await requireGroupMember(ctx, plannerSession.groupId, args.sessionToken);

    const whenIso = validateIsoDatetime(args.whenIso);
    const mapUrl = args.mapUrl ? validateMapUrl(args.mapUrl) : undefined;

    const now = Date.now();
    const eventId = await ctx.db.insert("events", {
      sessionId: args.sessionId,
      title: args.title.trim(),
      whenIso,
      venueName: args.venueName?.trim(),
      mapUrl,
      status: "draft",
      createdBy: authSession.userId,
      createdAt: now,
      updatedAt: now,
    });

    return { eventId };
  },
});

export const lockEvent = mutation({
  args: {
    sessionToken: v.string(),
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");
    const plannerSession = await ctx.db.get(event.sessionId);
    if (!plannerSession) throw new Error("Session not found");
    await requireGroupMember(ctx, plannerSession.groupId, args.sessionToken);

    if (event.status === "locked") return { ok: true };
    await ctx.db.patch(args.eventId, { status: "locked", updatedAt: Date.now() });
    return { ok: true };
  },
});

export const updateEvent = mutation({
  args: {
    sessionToken: v.string(),
    eventId: v.id("events"),
    title: v.optional(v.string()),
    whenIso: v.optional(v.string()),
    venueName: v.optional(v.string()),
    mapUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");
    if (event.status === "locked") {
      throw new Error("LOCKED: This event is finalized and cannot be edited");
    }
    const plannerSession = await ctx.db.get(event.sessionId);
    if (!plannerSession) throw new Error("Session not found");
    await requireGroupMember(ctx, plannerSession.groupId, args.sessionToken);

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.title !== undefined) patch.title = args.title.trim();
    if (args.whenIso !== undefined) patch.whenIso = validateIsoDatetime(args.whenIso);
    if (args.mapUrl !== undefined) patch.mapUrl = args.mapUrl ? validateMapUrl(args.mapUrl) : undefined;
    if (args.venueName !== undefined) patch.venueName = args.venueName.trim();

    await ctx.db.patch(args.eventId, patch);
    return { ok: true };
  },
});

export const getBySession = query({
  args: { sessionToken: v.string(), sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    await resolveSession(ctx, args.sessionToken);
    const events = await ctx.db
      .query("events")
      .withIndex("by_session", (q: any) => q.eq("sessionId", args.sessionId))
      .collect();
    return events.map((e: any) => ({
      id: e._id,
      sessionId: e.sessionId,
      title: e.title,
      whenIso: e.whenIso,
      venueName: e.venueName,
      mapUrl: e.mapUrl,
      status: e.status,
      createdBy: e.createdBy,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    }));
  },
});

// ─── Reminder scheduling ──────────────────────────────────────────────────────

export const setReminder = mutation({
  args: {
    sessionToken: v.string(),
    eventId: v.id("events"),
    mode: v.union(
      v.literal("off"),
      v.literal("day-before"),
      v.literal("same-day"),
      v.literal("custom"),
    ),
    customMinutesBefore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const session = await resolveSession(ctx, args.sessionToken);
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    const scheduledAt = computeReminderTime(event.whenIso, args.mode, args.customMinutesBefore);
    const now = Date.now();

    const existing = await ctx.db
      .query("reminders")
      .withIndex("by_event", (q: any) => q.eq("eventId", args.eventId))
      .collect();

    const userReminder = existing.find((r: any) => String(r.userId) === String(session.userId));

    if (userReminder) {
      await ctx.db.patch(userReminder._id, {
        mode: args.mode,
        customMinutesBefore: args.customMinutesBefore,
        scheduledAt,
        status: args.mode === "off" ? "cancelled" : "pending",
      });
    } else {
      await ctx.db.insert("reminders", {
        eventId: args.eventId,
        userId: session.userId,
        mode: args.mode,
        customMinutesBefore: args.customMinutesBefore,
        scheduledAt,
        status: args.mode === "off" ? "cancelled" : "pending",
        createdAt: now,
      });
    }
    return { ok: true, scheduledAt };
  },
});

export const getReminders = query({
  args: { sessionToken: v.string(), eventId: v.id("events") },
  handler: async (ctx, args) => {
    const session = await resolveSession(ctx, args.sessionToken);
    const reminders = await ctx.db
      .query("reminders")
      .withIndex("by_event", (q: any) => q.eq("eventId", args.eventId))
      .collect();
    const userReminder = reminders.find(
      (r: any) => String(r.userId) === String(session.userId)
    );
    return userReminder
      ? {
          mode: userReminder.mode,
          customMinutesBefore: userReminder.customMinutesBefore,
          scheduledAt: userReminder.scheduledAt,
          status: userReminder.status,
        }
      : null;
  },
});

/**
 * Internal job: mark due reminders as sent.
 * In production this would be called by a Convex scheduled function (cron).
 * Exposed as a mutation for manual triggering in dev/testing.
 */
export const processDueReminders = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const due = await ctx.db
      .query("reminders")
      .withIndex("by_status_scheduled", (q: any) =>
        q.eq("status", "pending").lt("scheduledAt", now)
      )
      .collect();

    let processed = 0;
    for (const reminder of due) {
      await ctx.db.patch(reminder._id, { status: "sent", sentAt: now });
      processed++;
      // In production: trigger push notification / email via external action
      console.log(`[reminders] Sent reminder ${reminder._id} for event ${reminder.eventId}`);
    }
    return { processed };
  },
});
