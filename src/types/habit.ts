import type { ConfidenceLevel } from './constraint'

export type { ConfidenceLevel }

export interface HabitProfile {
  id: string
  groupId: string
  preferredDays: string[]
  preferredTimeWindows: string[]
  preferredAreas: string[]
  preferredVibes: string[]
  avgTurnout?: number
  confidence: ConfidenceLevel
  updatedAt: number
}
