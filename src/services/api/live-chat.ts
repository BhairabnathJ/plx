import type { ConsensusInsight } from '@/types'
import { MOCK_POLL_OPTION_BUNDLE, MOCK_BEST_COMBOS } from '@/fixtures'

// STUB: Replace with real fetch calls to Convex Actions. Signature stays the same.

export async function analyzeConsensus(_messages: string[]): Promise<ConsensusInsight> {
  await new Promise(r => setTimeout(r, 1800))
  return {
    consensusSignals: [
      'Saturday evening has broad availability',
      'Silver Lake / East side is preferred',
      'Group wants casual, not formal dining',
    ],
    conflicts: [
      'Jordan and Taylor have conflicting time preferences (7pm vs 8pm)',
      'Morgan prefers outdoor seating; Sam prefers indoor',
    ],
    suggestedPollOptions: MOCK_POLL_OPTION_BUNDLE,
    summary: 'Most people can do Saturday evening in Silver Lake. Sending a quick poll will close the gap fast.',
    bestCombos: MOCK_BEST_COMBOS,
  }
}
