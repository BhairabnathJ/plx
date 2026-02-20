/**
 * Pure session state machine — same transitions as src/lib/session-machine.ts
 * but lives in convex/lib so backend can enforce them server-side.
 */

import type { SessionStatus } from "../contracts/types";

const ALLOWED_TRANSITIONS: Record<SessionStatus, SessionStatus[]> = {
  draft: ["analyzed"],
  analyzed: ["draft", "polling"],
  polling: ["analyzed", "summarized"],
  summarized: ["polling", "finalized"],
  finalized: [], // finalized is terminal — no further transitions (audit ID: 59)
};

export function canTransition(from: SessionStatus, to: SessionStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertTransition(from: SessionStatus, to: SessionStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(
      `Invalid session status transition: ${from} → ${to}. ` +
        `Allowed from ${from}: [${(ALLOWED_TRANSITIONS[from] ?? []).join(", ") || "none"}]`,
    );
  }
}
