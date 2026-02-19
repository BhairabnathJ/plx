import type { SummaryGenerationResult } from '@/types'
import { MOCK_SUMMARY } from '@/fixtures'

// STUB: Replace with real fetch calls to Convex Actions. Signature stays the same.

export async function generateSummary(
  _sessionId: string,
  _tone: string
): Promise<SummaryGenerationResult> {
  await new Promise(r => setTimeout(r, 1500))
  return {
    text: MOCK_SUMMARY.draftText,
    model: MOCK_SUMMARY.model ?? 'meta-llama/llama-3.3-70b-instruct:free',
  }
}
