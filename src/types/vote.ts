export type VoteType = 'yes' | 'no' | 'maybe'

export interface Vote {
  id: string
  pollId: string
  pollOptionId: string
  voterId?: string
  voterToken: string
  value: VoteType
  submittedAt: number
}

export interface VoteTally {
  optionId: string
  label: string
  yes: number
  no: number
  maybe: number
  noResponse: number
  total: number
}

export interface VoteMatrix {
  pollId: string
  tallies: VoteTally[]
  totalVoters: number
  respondedVoters: number
}

export interface BestComboResult {
  rank: number
  date: string
  time: string
  place: string
  beforeAfter?: string
  voterCoverage: number
  rankingReason: string
  supportCount: number
  totalVoters: number
}
