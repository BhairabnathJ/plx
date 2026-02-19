import { mutation } from "../_generated/server";

export const session_creation_context_ingest = mutation({
  args: {},
  handler: async () => ({
    ok: true,
    feature: "session_creation_context_ingest",
    note: "Backend contract stub ready for Claude UI integration",
  }),
});
