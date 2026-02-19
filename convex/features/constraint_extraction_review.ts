import { mutation } from "../_generated/server";

export const constraint_extraction_review = mutation({
  args: {},
  handler: async () => ({
    ok: true,
    feature: "constraint_extraction_review",
    note: "Backend contract stub ready for Claude UI integration",
  }),
});
