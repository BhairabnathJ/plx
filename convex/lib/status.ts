import type { SessionStatus } from "../contracts/types";

const ORDER: SessionStatus[] = ["draft", "analyzed", "polling", "summarized", "finalized"];

export function canTransition(from: SessionStatus, to: SessionStatus): boolean {
  return ORDER.indexOf(to) >= ORDER.indexOf(from);
}

export function nextStatus(current: SessionStatus): SessionStatus {
  const idx = ORDER.indexOf(current);
  return ORDER[Math.min(idx + 1, ORDER.length - 1)];
}
