import { useState } from 'react'
import type { Session, SessionStatus, CreateSessionInput } from '@/types'
import { MOCK_SESSIONS } from '@/fixtures'

// STUB: Replace body with real Convex hooks. Signature stays the same.

export function useSessions(groupId: string): { sessions: Session[]; isLoading: boolean; error: Error | null } {
  const sessions = MOCK_SESSIONS.filter(s => s.groupId === groupId)
  return { sessions, isLoading: false, error: null }
}

export function useSession(sessionId: string): { session: Session | null; isLoading: boolean } {
  const session = MOCK_SESSIONS.find(s => s.id === sessionId) ?? null
  return { session, isLoading: false }
}

export function useCreateSession(): {
  createSession: (input: CreateSessionInput) => Promise<string>
  isLoading: boolean
} {
  const [isLoading, setIsLoading] = useState(false)
  return {
    createSession: async (_input) => {
      setIsLoading(true)
      await new Promise(r => setTimeout(r, 700))
      setIsLoading(false)
      return 'session-' + Date.now()
    },
    isLoading,
  }
}

export function useUpdateSessionStatus(): {
  updateStatus: (sessionId: string, status: SessionStatus) => Promise<void>
  isLoading: boolean
} {
  const [isLoading, setIsLoading] = useState(false)
  return {
    updateStatus: async (_sessionId, _status) => {
      setIsLoading(true)
      await new Promise(r => setTimeout(r, 400))
      setIsLoading(false)
    },
    isLoading,
  }
}
