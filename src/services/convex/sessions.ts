import { useMutation, useQuery } from 'convex/react'
import type { Session, SessionStatus, CreateSessionInput } from '@/types'
import { useAuthSessionToken } from './auth'
import { api } from '../../../convex/_generated/api'

type ApiAny = any

export function useSessions(groupId: string): { sessions: Session[]; isLoading: boolean; error: Error | null } {
  const sessionToken = useAuthSessionToken()
  const sessions = useQuery(
    (api as ApiAny).sessions.listByGroup,
    sessionToken && groupId ? { sessionToken, groupId } : 'skip',
  ) as Session[] | undefined

  return {
    sessions: sessions ?? [],
    isLoading: !!sessionToken && sessions === undefined,
    error: null,
  }
}

export function useSession(sessionId: string): { session: Session | null; isLoading: boolean } {
  const sessionToken = useAuthSessionToken()
  const session = useQuery(
    (api as ApiAny).sessions.getById,
    sessionToken && sessionId ? { sessionToken, sessionId } : 'skip',
  ) as Session | null | undefined

  return { session: session ?? null, isLoading: !!sessionToken && session === undefined }
}

export function useCreateSession(): {
  createSession: (input: CreateSessionInput) => Promise<string>
  isLoading: boolean
} {
  const sessionToken = useAuthSessionToken()
  const createMutation = useMutation((api as ApiAny).sessions.create)

  return {
    createSession: async (input) => {
      if (!sessionToken) throw new Error('Not authenticated')
      const id = await createMutation({
        sessionToken,
        groupId: input.groupId,
        title: input.title,
        timeframe: input.timeframe,
        activityType: input.activityType,
        contextText: input.contextText,
      })
      return String(id)
    },
    isLoading: false,
  }
}

export function useUpdateSessionStatus(): {
  updateStatus: (sessionId: string, status: SessionStatus) => Promise<void>
  isLoading: boolean
} {
  const sessionToken = useAuthSessionToken()
  const updateMutation = useMutation((api as ApiAny).sessions.updateStatus)

  return {
    updateStatus: async (sessionId, status) => {
      if (!sessionToken) throw new Error('Not authenticated')
      await updateMutation({ sessionToken, sessionId, status })
    },
    isLoading: false,
  }
}
