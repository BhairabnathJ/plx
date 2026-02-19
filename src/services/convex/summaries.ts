import { useState } from 'react'
import type { Summary, TonePreset } from '@/types'
import { MOCK_SUMMARY } from '@/fixtures'

// STUB: Replace body with real Convex hooks. Signature stays the same.

export function useSummary(sessionId: string): { summary: Summary | null; isLoading: boolean } {
  const summary = sessionId === 'session-1' ? MOCK_SUMMARY : null
  return { summary, isLoading: false }
}

export function useUpdateSummary(): {
  updateSummary: (id: string, updates: { editedText?: string; tone?: TonePreset }) => Promise<void>
} {
  return {
    updateSummary: async () => { await new Promise(r => setTimeout(r, 300)) },
  }
}

export function useSaveSummaryDraft(): {
  saveDraft: (sessionId: string, text: string, tone: TonePreset) => Promise<void>
  isLoading: boolean
} {
  const [isLoading, setIsLoading] = useState(false)
  return {
    saveDraft: async () => {
      setIsLoading(true)
      await new Promise(r => setTimeout(r, 400))
      setIsLoading(false)
    },
    isLoading,
  }
}
