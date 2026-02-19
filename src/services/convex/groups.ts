import { useState, useSyncExternalStore } from 'react'
import type { Group } from '@/types'
import { MOCK_GROUPS } from '@/fixtures'
import { DB_GROUPS_KEY } from '@/lib/constants'

// STUB: Replace body with real Convex hooks. Signature stays the same.
let groupsStore: Group[] = (() => {
  try {
    const raw = localStorage.getItem(DB_GROUPS_KEY)
    if (raw) return JSON.parse(raw) as Group[]
  } catch {
    // ignore parse issues and use fixtures
  }
  return [...MOCK_GROUPS]
})()

const listeners = new Set<() => void>()

function persist(next: Group[]) {
  groupsStore = next
  try {
    localStorage.setItem(DB_GROUPS_KEY, JSON.stringify(next))
  } catch {
    // ignore write failures
  }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function snapshot() {
  return groupsStore
}

export function useGroups(): { groups: Group[]; isLoading: boolean; error: Error | null } {
  const groups = useSyncExternalStore(subscribe, snapshot, snapshot)
  return { groups, isLoading: false, error: null }
}

export function useGroup(groupId: string): { group: Group | null; isLoading: boolean } {
  const groups = useSyncExternalStore(subscribe, snapshot, snapshot)
  const group = groups.find(g => g.id === groupId) ?? null
  return { group, isLoading: false }
}

export function useCreateGroup(): {
  createGroup: (input: Omit<Group, 'id' | 'createdAt' | 'memberCount'>) => Promise<string>
  isLoading: boolean
} {
  const [isLoading, setIsLoading] = useState(false)
  return {
    createGroup: async (input) => {
      setIsLoading(true)
      await new Promise(r => setTimeout(r, 600))
      const next: Group = {
        ...input,
        id: 'group-' + Date.now(),
        createdAt: Date.now(),
      }
      persist([next, ...groupsStore])
      setIsLoading(false)
      return next.id
    },
    isLoading,
  }
}
