import { useState } from 'react'
import type { VoteTally, BestComboResult, VoteType } from '@/types'
import { MOCK_VOTE_TALLIES, MOCK_BEST_COMBOS } from '@/fixtures'

// STUB: Replace body with real Convex hooks. Signature stays the same.

export function useVoteTallies(pollId: string): {
  tallies: VoteTally[]
  totalVoters: number
  respondedVoters: number
  isLoading: boolean
} {
  const tallies = pollId === 'poll-1' ? MOCK_VOTE_TALLIES : []
  return { tallies, totalVoters: 7, respondedVoters: 5, isLoading: false }
}

export function useBestCombos(pollId: string): { combo: BestComboResult | null; isLoading: boolean } {
  const combo = pollId === 'poll-1' ? MOCK_BEST_COMBOS : null
  return { combo, isLoading: false }
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
