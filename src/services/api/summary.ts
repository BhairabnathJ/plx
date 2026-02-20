import type { SummaryGenerationResult } from '@/types'
import { callLlmAction, llmActions } from './llmClient'

export async function generateSummary(
  sessionId: string,
  tone: string,
): Promise<SummaryGenerationResult> {
  const res = await callLlmAction<{
    text: string
    model: string
  }>(llmActions.generateSummaryDraft, {
    voteSummary: `Session ${sessionId} summary tone=${tone}`,
  })

  return {
    text: res.data.text,
    model: res.meta.model,
  }
}
