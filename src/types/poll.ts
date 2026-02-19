export type PollDimension = 'date' | 'time' | 'place' | 'before-after'
export type PollSelectionType = 'multi' | 'single'
export type PollStatus = 'draft' | 'published' | 'closed'

export interface PollOption {
  id: string
  pollId: string
  dimension: PollDimension
  label: string
  selectionType: PollSelectionType
  sortOrder: number
  addedBy?: string
}

export interface Poll {
  id: string
  sessionId: string
  status: PollStatus
  shareToken: string
  publishedAt?: number
  closedAt?: number
}

export interface PollOptionBundle {
  pollId: string
  dates: PollOption[]
  times: PollOption[]
  places: PollOption[]
  beforeAfter: PollOption[]
}

export const POLL_OPTION_LIMITS: Record<PollDimension, { min: number; max: number }> = {
  date: { min: 3, max: 5 },
  time: { min: 3, max: 5 },
  place: { min: 3, max: 6 },
  'before-after': { min: 2, max: 4 },
}
