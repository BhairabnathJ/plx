export const SESSION_STATUSES = ['draft', 'analyzed', 'polling', 'summarized', 'finalized'] as const
export type SessionStatus = typeof SESSION_STATUSES[number]

export interface Session {
  id: string
  groupId: string
  title: string
  status: SessionStatus
  timeframeLabel: string
  activityTypes: string[]
  contextText?: string
  createdBy: string
  createdAt: number
  updatedAt: number
}

export interface SessionMessage {
  id: string
  sessionId: string
  content: string
  source: 'pasted' | 'typed'
  addedAt: number
}

export interface CreateSessionInput {
  groupId: string
  title: string
  timeframeLabel: string
  activityTypes: string[]
  contextText?: string
}
