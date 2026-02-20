import { useQuery } from 'convex/react'
import type { HabitProfile } from '@/types'
import { useAuthSessionToken } from './auth'
import { api } from '../../../convex/_generated/api'

type ApiAny = any

export function useHabitProfile(groupId: string): { profile: HabitProfile | null; isLoading: boolean } {
  const sessionToken = useAuthSessionToken()
  const raw = useQuery(
    (api as ApiAny).features.history_analytics_tuning.getHabitProfile,
    sessionToken && groupId ? { sessionToken, groupId } : 'skip',
  ) as Omit<HabitProfile, 'id' | 'groupId'> | null | undefined

  // Backend doesn't return id/groupId — synthesize them from the query arg.
  const profile: HabitProfile | null = raw ? { id: groupId, groupId, ...raw } : null

  return {
    profile,
    isLoading: !!sessionToken && raw === undefined,
  }
}
