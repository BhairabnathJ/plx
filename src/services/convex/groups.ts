import { useMutation, useQuery } from 'convex/react'
import type { Group } from '@/types'
import { useAuthSessionToken } from './auth'
import { api } from '../../../convex/_generated/api'

type ApiAny = any

export function useGroups(): { groups: Group[]; isLoading: boolean; error: Error | null } {
  const sessionToken = useAuthSessionToken()
  const groups = useQuery(
    (api as ApiAny).groups.listMyGroups,
    sessionToken ? { sessionToken } : 'skip',
  ) as Group[] | undefined

  return {
    groups: groups ?? [],
    isLoading: !!sessionToken && groups === undefined,
    error: null,
  }
}

export function useGroup(groupId: string): { group: Group | null; isLoading: boolean } {
  const { groups, isLoading } = useGroups()
  return {
    group: groups.find((g) => g.id === groupId) ?? null,
    isLoading,
  }
}

export function useCreateGroup(): {
  createGroup: (input: { name: string; description?: string }) => Promise<string>
  isLoading: boolean
} {
  const sessionToken = useAuthSessionToken()
  const createMutation = useMutation((api as ApiAny).groups.create)

  return {
    createGroup: async (input) => {
      if (!sessionToken) throw new Error('Not authenticated')
      const id = await createMutation({
        sessionToken,
        name: input.name,
        description: input.description,
      })
      return String(id)
    },
    isLoading: false,
  }
}
