import { useState } from 'react'
import type { VoteMatrix, BestComboResult, VoteType } from '@/types'
import { MOCK_VOTE_MATRIX, MOCK_BEST_COMBOS } from '@/fixtures'

// STUB: Replace body with real Convex hooks. Signature stays the same.

export function useVoteMatrix(pollId: string): { matrix: VoteMatrix | null; isLoading: boolean } {
  const matrix = pollId === 'poll-1' ? MOCK_VOTE_MATRIX : null
  return { matrix, isLoading: false }
}

export function useBestCombos(pollId: string): { combos: BestComboResult[]; isLoading: boolean } {
  const combos = pollId === 'poll-1' ? MOCK_BEST_COMBOS : []
  return { combos, isLoading: false }
}

export function useSubmitVote(): {
  submitVote: (pollId: string, votes: Record<string, VoteType>) => Promise<void>
  isLoading: boolean
} {
  const [isLoading, setIsLoading] = useState(false)
  return {
    submitVote: async () => {
      setIsLoading(true)
      await new Promise(r => setTimeout(r, 800))
      setIsLoading(false)
    },
    isLoading,
  }
}
