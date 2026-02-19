export type PollDimension = 'date' | 'time' | 'place' | 'before' | 'after'
export type PollSelectionType = 'multi' | 'single'
export type PollStatus = 'draft' | 'published' | 'closed'

export interface PollOption {
  id: string
  pollId: string
  dimension: PollDimension
  label: string
  rank: number
  isActive: boolean
  addedBy?: string
}

export interface Poll {
  id: string
  sessionId: string
  status: PollStatus
  publishToken?: string
  publishedAt?: number
  closedAt?: number
}

export interface PollOptionBundle {
  pollId: string
  dates: PollOption[]
  times: PollOption[]
  places: PollOption[]
  before: PollOption[]
  after: PollOption[]
}

export const POLL_OPTION_LIMITS: Record<PollDimension, { min: number; max: number }> = {
  date: { min: 3, max: 5 },
  time: { min: 3, max: 5 },
  place: { min: 3, max: 6 },
  before: { min: 2, max: 4 },
  after: { min: 2, max: 4 },
}
