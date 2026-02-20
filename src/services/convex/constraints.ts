import { useMutation, useQuery } from 'convex/react'
import type { Constraint, ConstraintState, ConstraintKind } from '@/types'
import { useAuthSessionToken } from './auth'
import { api } from '../../../convex/_generated/api'

type ApiAny = any

export function useConstraints(sessionId: string): { constraints: Constraint[]; isLoading: boolean } {
  const sessionToken = useAuthSessionToken()
  const rows = useQuery(
    (api as ApiAny).features.constraint_extraction_review.listBySession,
    sessionToken && sessionId ? { sessionToken, sessionId } : 'skip',
  ) as Constraint[] | undefined

  return {
    constraints: rows ?? [],
    isLoading: !!sessionToken && rows === undefined,
  }
}

export function useUpdateConstraint(): {
  updateConstraint: (id: string, updates: { text?: string; state?: ConstraintState }) => Promise<void>
} {
  const sessionToken = useAuthSessionToken()
  const updateMutation = useMutation((api as ApiAny).features.constraint_extraction_review.update)

  return {
    updateConstraint: async (id, updates) => {
      if (!sessionToken) throw new Error('Not authenticated')
      await updateMutation({ sessionToken, constraintId: id, ...updates })
    },
  }
}

export function useBulkUpdateConstraints(): {
  bulkUpdate: (sessionId: string, state: 'accepted' | 'removed', kind?: ConstraintKind) => Promise<void>
} {
  const sessionToken = useAuthSessionToken()
  const bulkMutation = useMutation((api as ApiAny).features.constraint_extraction_review.bulkUpdate)

  return {
    bulkUpdate: async (sessionId, state, kind) => {
      if (!sessionToken) throw new Error('Not authenticated')
      await bulkMutation({ sessionToken, sessionId, state, kind })
    },
  }
}

export function useAddConstraint(): {
  addConstraint: (constraint: Omit<Constraint, 'id'>) => Promise<string>
  isLoading: boolean
} {
  // No addConstraint backend mutation — manual constraints are not supported in this version.
  // Constraints are populated by the extractConstraints LLM action.
  return {
    addConstraint: async () => { throw new Error('Manual constraint creation is not yet supported') },
    isLoading: false,
  }
}
