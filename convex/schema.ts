import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkUserId: v.string(),
    email: v.optional(v.string()),
    username: v.optional(v.string()),
    password: v.optional(v.string()),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_user_id", ["clerkUserId"])
    .index("by_email", ["email"])
    .index("by_username", ["username"]),

  authSessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_user", ["userId"]),

  groups: defineTable({
    name: v.string(),
    imageUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_created_by", ["createdBy"]),

  groupMembers: defineTable({
    groupId: v.id("groups"),
    userId: v.id("users"),
    role: v.union(v.literal("owner"), v.literal("member")),
    joinedAt: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_user", ["userId"])
    .index("by_group_user", ["groupId", "userId"]),

  sessions: defineTable({
    groupId: v.id("groups"),
    title: v.string(),
    timeframe: v.optional(v.string()),
    activityType: v.optional(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("analyzed"),
      v.literal("polling"),
      v.literal("summarized"),
      v.literal("finalized"),
    ),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_group_status", ["groupId", "status"]),

  sessionMessages: defineTable({
    sessionId: v.id("sessions"),
    source: v.union(v.literal("manual"), v.literal("whatsapp")),
    content: v.string(),
    createdBy: v.id("users"),
    createdAt: v.number(),
  }).index("by_session", ["sessionId"]),

  chats: defineTable({
    groupId: v.id("groups"),
    sessionId: v.optional(v.id("sessions")),
    authorName: v.string(),
    authorUserId: v.optional(v.id("users")),
    message: v.string(),
    source: v.union(v.literal("manual"), v.literal("whatsapp"), v.literal("web")),
    createdAt: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_session", ["sessionId"])
    .index("by_group_created_at", ["groupId", "createdAt"]),

  constraints: defineTable({
    sessionId: v.id("sessions"),
    kind: v.union(v.literal("hard"), v.literal("soft"), v.literal("mention")),
    text: v.string(),
    state: v.union(
      v.literal("detected"),
      v.literal("accepted"),
      v.literal("edited"),
      v.literal("removed"),
    ),
    provenance: v.union(v.literal("chat"), v.literal("habit"), v.literal("manual")),
    confidence: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_session", ["sessionId"]),

  polls: defineTable({
    sessionId: v.id("sessions"),
    publishToken: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("closed")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_publish_token", ["publishToken"]),

  pollOptions: defineTable({
    pollId: v.id("polls"),
    dimension: v.union(
      v.literal("date"),
      v.literal("time"),
      v.literal("place"),
      v.literal("before"),
      v.literal("after"),
    ),
    label: v.string(),
    rank: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_poll_dimension", ["pollId", "dimension"]),

  votes: defineTable({
    pollId: v.id("polls"),
    pollOptionId: v.id("pollOptions"),
    voterName: v.string(),
    voterUserId: v.optional(v.id("users")),
    createdAt: v.number(),
  })
    .index("by_poll", ["pollId"])
    .index("by_poll_option", ["pollId", "pollOptionId"]),

  summaries: defineTable({
    sessionId: v.id("sessions"),
    draftText: v.string(),
    finalText: v.optional(v.string()),
    model: v.optional(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_session", ["sessionId"]),

  events: defineTable({
    sessionId: v.id("sessions"),
    title: v.string(),
    whenIso: v.string(),
    venueName: v.optional(v.string()),
    mapUrl: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("locked")),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_session", ["sessionId"]),

  attendanceSnapshots: defineTable({
    eventId: v.id("events"),
    goingCount: v.number(),
    maybeCount: v.number(),
    noResponseCount: v.number(),
    capturedAt: v.number(),
  }).index("by_event", ["eventId"]),

  habitProfiles: defineTable({
    groupId: v.id("groups"),
    preferredDays: v.array(v.string()),
    preferredTimeWindows: v.array(v.string()),
    preferredAreas: v.array(v.string()),
    preferredVibes: v.array(v.string()),
    avgTurnout: v.optional(v.number()),
    confidence: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    updatedAt: v.number(),
  }).index("by_group", ["groupId"]),
});
