import { useState } from 'react'
import type { Constraint, ConstraintState } from '@/types'
import { MOCK_CONSTRAINTS } from '@/fixtures'

// STUB: Replace body with real Convex hooks. Signature stays the same.

export function useConstraints(sessionId: string): { constraints: Constraint[]; isLoading: boolean } {
  const constraints = MOCK_CONSTRAINTS.filter(c => c.sessionId === sessionId)
  return { constraints, isLoading: false }
}

export function useUpdateConstraint(): {
  updateConstraint: (id: string, updates: { text?: string; state?: ConstraintState }) => Promise<void>
} {
  return {
    updateConstraint: async () => {
      await new Promise(r => setTimeout(r, 300))
    },
  }
}

export function useAddConstraint(): {
  addConstraint: (constraint: Omit<Constraint, 'id'>) => Promise<string>
  isLoading: boolean
} {
  const [isLoading, setIsLoading] = useState(false)
  return {
    addConstraint: async (_c) => {
      setIsLoading(true)
      await new Promise(r => setTimeout(r, 400))
      setIsLoading(false)
      return 'c-' + Date.now()
    },
    isLoading,
  }
}
