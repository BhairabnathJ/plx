export type VoteType = 'yes' | 'no' | 'maybe'

export interface Vote {
  id: string
  pollId: string
  pollOptionId: string
  voterName: string
  voterUserId?: string
  createdAt: number
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
  participant: string
  selectedOptionIds: string[]
}

export interface BestComboResult {
  primary: { date?: string; time?: string; place?: string; score: number }
  backups: Array<{ date?: string; time?: string; place?: string; score: number }>
}
