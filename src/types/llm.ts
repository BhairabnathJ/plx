import type { Constraint } from './constraint'
import type { PollOptionBundle } from './poll'

export interface ConstraintExtractionResult {
  sessionId: string
  hardConstraints: Omit<Constraint, 'id' | 'sessionId' | 'state'>[]
  softPreferences: Omit<Constraint, 'id' | 'sessionId' | 'state'>[]
  mentions: Omit<Constraint, 'id' | 'sessionId' | 'state'>[]
  rawConfidence: number
}

export type { PollOptionBundle }

export interface SummaryGenerationResult {
  text: string
  model: string
}

export interface ConsensusInsight {
  consensusPoints: string[]
  conflicts: string[]
  nextStep: string
}
