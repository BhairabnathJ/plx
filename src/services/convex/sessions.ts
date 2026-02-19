import { useState, useSyncExternalStore } from 'react'
import type { Session, SessionStatus, CreateSessionInput } from '@/types'
import { MOCK_SESSIONS } from '@/fixtures'

// STUB: Replace body with real Convex hooks. Signature stays the same.
let sessionsStore: Session[] = [...MOCK_SESSIONS]
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function snapshot() {
  return sessionsStore
}

export function useSessions(groupId: string): { sessions: Session[]; isLoading: boolean; error: Error | null } {
  const allSessions = useSyncExternalStore(subscribe, snapshot, snapshot)
  const sessions = allSessions.filter(s => s.groupId === groupId)
  return { sessions, isLoading: false, error: null }
}

export function useSession(sessionId: string): { session: Session | null; isLoading: boolean } {
  const allSessions = useSyncExternalStore(subscribe, snapshot, snapshot)
  const session = allSessions.find(s => s.id === sessionId) ?? null
  return { session, isLoading: false }
}

export function useCreateSession(): {
  createSession: (input: CreateSessionInput) => Promise<string>
  isLoading: boolean
} {
  const [isLoading, setIsLoading] = useState(false)
  return {
    createSession: async (input) => {
      setIsLoading(true)
      await new Promise(r => setTimeout(r, 700))
      const id = 'session-' + Date.now()
      const now = Date.now()
      const nextSession: Session = {
        id,
        groupId: input.groupId,
        title: input.title,
        status: 'draft',
        timeframe: input.timeframe,
        activityType: input.activityType,
        contextText: input.contextText,
        createdBy: 'user-1',
        createdAt: now,
        updatedAt: now,
      }
      sessionsStore = [nextSession, ...sessionsStore]
      emit()
      setIsLoading(false)
      return id
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
    updateStatus: async (sessionId, status) => {
      setIsLoading(true)
      await new Promise(r => setTimeout(r, 400))
      sessionsStore = sessionsStore.map((session) =>
        session.id === sessionId
          ? { ...session, status, updatedAt: Date.now() }
          : session,
      )
      emit()
      setIsLoading(false)
    },
    isLoading,
  }
}
