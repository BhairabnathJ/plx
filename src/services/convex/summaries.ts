import { useMutation, useQuery } from 'convex/react'
import type { Summary, TonePreset } from '@/types'
import { useAuthSessionToken } from './auth'
import { api } from '../../../convex/_generated/api'

type ApiAny = any

export function useSummary(sessionId: string): { summary: Summary | null; isLoading: boolean } {
  const sessionToken = useAuthSessionToken()
  const raw = useQuery(
    (api as ApiAny).features.summary_composer.getLatest,
    sessionToken && sessionId ? { sessionToken, sessionId } : 'skip',
  ) as (Omit<Summary, 'createdBy'> & { sessionId?: string }) | null | undefined

  // Backend getLatest doesn't return createdBy — synthesize a placeholder.
  const summary: Summary | null = raw
    ? { ...raw, sessionId: raw.sessionId ?? sessionId, createdBy: '' }
    : null

  return {
    summary,
    isLoading: !!sessionToken && raw === undefined,
  }
}

export function useSummaryVersions(sessionId: string): {
  versions: Array<Omit<Summary, 'createdBy' | 'sessionId'>>
  isLoading: boolean
} {
  const sessionToken = useAuthSessionToken()
  const rows = useQuery(
    (api as ApiAny).features.summary_composer.listVersions,
    sessionToken && sessionId ? { sessionToken, sessionId } : 'skip',
  ) as Array<Omit<Summary, 'createdBy' | 'sessionId'>> | undefined

  return {
    versions: rows ?? [],
    isLoading: !!sessionToken && rows === undefined,
  }
}

export function useUpdateSummary(): {
  updateSummary: (id: string, updates: { finalText?: string; tone?: TonePreset }) => Promise<void>
} {
  const sessionToken = useAuthSessionToken()
  const updateMutation = useMutation((api as ApiAny).features.summary_composer.updateFinal)

  return {
    updateSummary: async (id, updates) => {
      if (!sessionToken) throw new Error('Not authenticated')
      if (updates.finalText !== undefined) {
        await updateMutation({ sessionToken, summaryId: id, finalText: updates.finalText })
      }
      // tone is stored locally (LLM re-generation) — not persisted separately
    },
  }
}

export function useSaveSummaryDraft(): {
  saveDraft: (sessionId: string, text: string, tone: TonePreset) => Promise<void>
  isLoading: boolean
} {
  // Draft is saved automatically by the generateSummaryDraft LLM action — no separate hook needed.
  return {
    saveDraft: async () => {},
    isLoading: false,
  }
}
