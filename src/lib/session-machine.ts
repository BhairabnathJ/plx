import type { SessionStatus } from '@/types'
import { SESSION_STATUSES } from '@/types'

const TRANSITIONS: Record<SessionStatus, SessionStatus[]> = {
  draft:      ['analyzed'],
  analyzed:   ['polling', 'draft'],
  polling:    ['summarized'],
  summarized: ['finalized', 'polling'],
  finalized:  [],
}

export function canTransition(from: SessionStatus, to: SessionStatus): boolean {
  return TRANSITIONS[from].includes(to)
}

export function nextStatus(current: SessionStatus): SessionStatus | null {
  const idx = SESSION_STATUSES.indexOf(current)
  const next = SESSION_STATUSES[idx + 1]
  return next ?? null
}

export function getStatusIndex(status: SessionStatus): number {
  return SESSION_STATUSES.indexOf(status)
}

export function isStatusComplete(status: SessionStatus, checkpoint: SessionStatus): boolean {
  return getStatusIndex(status) >= getStatusIndex(checkpoint)
}
