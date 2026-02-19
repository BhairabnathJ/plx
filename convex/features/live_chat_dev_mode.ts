import { mutation } from "../_generated/server";

export const live_chat_dev_mode = mutation({
  args: {},
  handler: async () => ({
    ok: true,
    feature: "live_chat_dev_mode",
    note: "Backend contract stub ready for Claude UI integration",
  }),
});
