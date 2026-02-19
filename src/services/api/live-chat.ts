import type { ConsensusInsight } from '@/types'

// STUB: Replace with real fetch calls to Convex Actions. Signature stays the same.

export async function analyzeConsensus(_messages: string[]): Promise<ConsensusInsight> {
  await new Promise(r => setTimeout(r, 1800))
  return {
    consensusPoints: [
      'Saturday evening has broad availability',
      'Silver Lake / East side is preferred',
      'Group wants casual, not formal dining',
    ],
    conflicts: [
      'Jordan and Taylor have conflicting time preferences (7pm vs 8pm)',
      'Morgan prefers outdoor seating; Sam prefers indoor',
    ],
    nextStep: 'Most people can do Saturday evening in Silver Lake. Sending a quick poll will close the gap fast.',
  }
}
