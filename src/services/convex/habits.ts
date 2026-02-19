import type { HabitProfile } from '@/types'
import { MOCK_HABIT_PROFILE } from '@/fixtures'

// STUB: Replace body with real Convex hooks. Signature stays the same.

export function useHabitProfile(groupId: string): { profile: HabitProfile | null; isLoading: boolean } {
  const profile = groupId === 'group-1' ? MOCK_HABIT_PROFILE : null
  return { profile, isLoading: false }
}
