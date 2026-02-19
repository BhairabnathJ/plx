import type { SummaryGenerationResult } from '@/types'
import { MOCK_SUMMARY } from '@/fixtures'

// STUB: Replace with real fetch calls to Convex Actions. Signature stays the same.

export async function generateSummary(
  _sessionId: string,
  _tone: string
): Promise<SummaryGenerationResult> {
  await new Promise(r => setTimeout(r, 1500))
  return {
    draftText: MOCK_SUMMARY.draftText,
    tokens: {
      date: 'Saturday Feb 22',
      time: '7:30 PM',
      place: 'Trendy Silver Lake spot',
      attendance: '4 of 7 going',
    },
  }
}
