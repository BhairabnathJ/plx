import { useMutation, useQuery } from 'convex/react'
import type { Summary, TonePreset } from '@/types'
import { useAuthSessionToken } from './auth'
import { api } from '../../../convex/_generated/api'

type ApiAny = any

export function useSummary(sessionId: string): { summary: Summary | null; isLoading: boolean } {
  const sessionToken = useAuthSessionToken()
  const raw = useQuery(
    (api as ApiAny)['features/summary_composer'].getLatest,
    sessionToken && sessionId ? { sessionToken, sessionId } : 'skip',
  ) as (Omit<Summary, 'createdBy'> & { id: string }) | null | undefined

  const summary: Summary | null = raw
    ? { ...raw, id: String(raw.id), createdBy: '' }
    : null

  return {
    summary,
    isLoading: !!sessionToken && raw === undefined,
  }
}

export function useSummaryVersions(sessionId: string): { versions: Summary[]; isLoading: boolean } {
  const sessionToken = useAuthSessionToken()
  const rows = useQuery(
    (api as ApiAny)['features/summary_composer'].listVersions,
    sessionToken && sessionId ? { sessionToken, sessionId } : 'skip',
  ) as Summary[] | undefined

  return {
    versions: rows ?? [],
    isLoading: !!sessionToken && rows === undefined,
  }
}

export function useUpdateSummary(): {
  updateSummary: (id: string, updates: { finalText?: string; tone?: TonePreset }) => Promise<void>
} {
  const sessionToken = useAuthSessionToken()
  const updateMutation = useMutation(
    (api as ApiAny)['features/summary_composer'].updateFinal,
  )

  return {
    updateSummary: async (id, updates) => {
      if (!sessionToken) throw new Error('Not authenticated')
      if (updates.finalText !== undefined) {
        await updateMutation({ sessionToken, summaryId: id, finalText: updates.finalText })
      }
    },
  }
}

export function useSaveSummaryDraft(): {
  saveDraft: (sessionId: string, text: string, tone: TonePreset) => Promise<void>
  isLoading: boolean
} {
  // Draft saving is triggered by the LLM action (generateSummaryDraft) which calls
  // the internal saveDraft mutation automatically. This hook is a no-op stub kept
  // for signature compatibility.
  return {
    saveDraft: async () => {},
    isLoading: false,
  }
}
