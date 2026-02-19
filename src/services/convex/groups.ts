import { useState } from 'react'
import type { Group } from '@/types'
import { MOCK_GROUPS } from '@/fixtures'

// STUB: Replace body with real Convex hooks. Signature stays the same.

export function useGroups(): { groups: Group[]; isLoading: boolean; error: Error | null } {
  return { groups: MOCK_GROUPS, isLoading: false, error: null }
}

export function useGroup(groupId: string): { group: Group | null; isLoading: boolean } {
  const group = MOCK_GROUPS.find(g => g.id === groupId) ?? null
  return { group, isLoading: false }
}

export function useCreateGroup(): {
  createGroup: (input: Omit<Group, 'id' | 'createdAt' | 'memberCount'>) => Promise<string>
  isLoading: boolean
} {
  const [isLoading, setIsLoading] = useState(false)
  return {
    createGroup: async (_input) => {
      setIsLoading(true)
      await new Promise(r => setTimeout(r, 600))
      setIsLoading(false)
      return 'group-' + Date.now()
    },
    isLoading,
  }
}
