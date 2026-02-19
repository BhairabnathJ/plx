import { mutation } from "../_generated/server";

export const poll_publish_and_web_response = mutation({
  args: {},
  handler: async () => ({
    ok: true,
    feature: "poll_publish_and_web_response",
    note: "Backend contract stub ready for Claude UI integration",
  }),
});
