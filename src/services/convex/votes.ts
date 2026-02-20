import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import type { VoteTally, BestComboResult, VoteType } from '@/types'
import { useAuthSessionToken } from './auth'
import { useAuthUser } from './auth'
import { api } from '../../../convex/_generated/api'

type ApiAny = any

type RawTally = {
  optionId: string
  dimension: string
  label: string
  rank: number
  isActive: boolean
  voteCount: number
  pct: number
}

type RawVoteTalliesResult = {
  tallies: RawTally[]
  totalVoters: number
  respondedVoters: number
}

export function useVoteTallies(pollId: string): {
  tallies: VoteTally[]
  totalVoters: number
  respondedVoters: number
  isLoading: boolean
} {
  const sessionToken = useAuthSessionToken()
  const raw = useQuery(
    (api as ApiAny)['features/vote_aggregation_best_combo'].getVoteTallies,
    sessionToken && pollId ? { sessionToken, pollId } : 'skip',
  ) as RawVoteTalliesResult | undefined

  // Adapt backend shape (voteCount/pct selected model) to frontend VoteTally type (yes/no/maybe/noResponse).
  // Vote model is binary (selected / not selected): yes=voteCount, noResponse=totalVoters-voteCount.
  const totalVoters = raw?.totalVoters ?? 0
  const tallies: VoteTally[] = (raw?.tallies ?? []).map((t) => ({
    optionId: String(t.optionId),
    label: t.label,
    yes: t.voteCount,
    no: 0,
    maybe: 0,
    noResponse: Math.max(0, totalVoters - t.voteCount),
    total: totalVoters,
  }))

  return {
    tallies,
    totalVoters,
    respondedVoters: raw?.respondedVoters ?? 0,
    isLoading: !!sessionToken && raw === undefined,
  }
}

export function useBestCombos(pollId: string): { combo: BestComboResult | null; isLoading: boolean } {
  const sessionToken = useAuthSessionToken()
  const combo = useQuery(
    (api as ApiAny)['features/vote_aggregation_best_combo'].computeBestCombos,
    sessionToken && pollId ? { sessionToken, pollId } : 'skip',
  ) as BestComboResult | null | undefined

  return {
    combo: combo ?? null,
    isLoading: !!sessionToken && combo === undefined,
  }
}

export function useSubmitVote(): {
  submitVote: (pollId: string, votes: Record<string, VoteType>) => Promise<void>
  isLoading: boolean
} {
  const sessionToken = useAuthSessionToken()
  const { user } = useAuthUser()
  const submitMutation = useMutation((api as ApiAny)['features/vote_aggregation_best_combo'].submitVote)
  const [isLoading, setIsLoading] = useState(false)

  return {
    submitVote: async (pollId, votes) => {
      if (!sessionToken) throw new Error('Not authenticated')
      setIsLoading(true)
      try {
        const voterName = user?.name ?? user?.username ?? user?.email ?? 'Anonymous'
        // Include options marked yes or maybe; exclude no
        const optionIds = Object.entries(votes)
          .filter(([, type]) => type !== 'no')
          .map(([id]) => id)
        await submitMutation({ pollId, optionIds, voterName, sessionToken })
      } finally {
        setIsLoading(false)
      }
    },
    isLoading,
  }
}
