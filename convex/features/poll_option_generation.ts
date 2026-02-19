import { mutation } from "../_generated/server";

export const poll_option_generation = mutation({
  args: {},
  handler: async () => ({
    ok: true,
    feature: "poll_option_generation",
    note: "Backend contract stub ready for Claude UI integration",
  }),
});
