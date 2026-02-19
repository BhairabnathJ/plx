import { mutation } from "../_generated/server";

export const summary_composer = mutation({
  args: {},
  handler: async () => ({
    ok: true,
    feature: "summary_composer",
    note: "Backend contract stub ready for Claude UI integration",
  }),
});
