import type { Constraint } from './constraint'
import type { PollOptionBundle } from './poll'
import type { BestComboResult } from './vote'

export interface ConstraintExtractionResult {
  sessionId: string
  hardConstraints: Omit<Constraint, 'id' | 'sessionId' | 'state'>[]
  softPreferences: Omit<Constraint, 'id' | 'sessionId' | 'state'>[]
  mentions: Omit<Constraint, 'id' | 'sessionId' | 'state'>[]
  rawConfidence: number
}

export type { PollOptionBundle }

export interface SummaryGenerationResult {
  draftText: string
  tokens: {
    date?: string
    time?: string
    place?: string
    attendance?: string
  }
}

export interface ConsensusInsight {
  consensusSignals: string[]
  conflicts: string[]
  suggestedPollOptions: PollOptionBundle
  summary: string
  bestCombos: BestComboResult[]
}
