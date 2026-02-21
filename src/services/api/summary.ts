import { useAction } from 'convex/react'
import { useAuthSessionToken } from '@/services/convex/auth'
import { api } from '../../../convex/_generated/api'
import type { TonePreset } from '@/types'

type ApiAny = any

export function useGenerateSummary(): {
  generateSummary: (
    sessionId: string,
    tone: TonePreset,
    voteSummary?: string
  ) => Promise<{ text: string; model: string }>
} {
  const sessionToken = useAuthSessionToken()
  const generateAction = useAction((api as ApiAny)['llm/actions'].generateSummaryDraft)

  return {
    generateSummary: async (sessionId: string, tone: TonePreset, voteSummary = '') => {
      if (!sessionToken) throw new Error('Not authenticated')
      const result = await generateAction({
        sessionToken,
        sessionId,
        voteSummary: voteSummary || 'Generate a planning summary based on the group discussion and voting results.',
        tone,
      })
      return { text: result.text, model: result.model }
    },
  }
}
