export const SESSION_STATUSES = ['draft', 'analyzed', 'polling', 'summarized', 'finalized'] as const
export type SessionStatus = typeof SESSION_STATUSES[number]

export interface Session {
  id: string
  groupId: string
  title: string
  status: SessionStatus
  timeframe?: string
  activityType?: string
  contextText?: string
  createdBy: string
  createdAt: number
  updatedAt: number
}

export interface SessionMessage {
  id: string
  sessionId: string
  content: string
  source: 'manual' | 'whatsapp'
  createdBy: string
  createdAt: number
}

export interface CreateSessionInput {
  groupId: string
  title: string
  timeframe?: string
  activityType?: string
  contextText?: string
}
