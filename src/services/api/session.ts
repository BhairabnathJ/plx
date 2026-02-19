import type { ConstraintExtractionResult, PollOptionBundle } from '@/types'
import { MOCK_CONSTRAINTS, MOCK_POLL_OPTION_BUNDLE } from '@/fixtures'

// STUB: Replace with real fetch calls to Convex Actions. Signature stays the same.

export async function analyzeSession(
  _sessionId: string,
  _contextText: string
): Promise<ConstraintExtractionResult> {
  // Simulate LLM latency
  await new Promise(r => setTimeout(r, 2200))
  return {
    sessionId: _sessionId,
    hardConstraints: MOCK_CONSTRAINTS
      .filter(c => c.type === 'hard')
      .map(({ type: _type, id: _id, sessionId: _sid, state: _st, ...rest }) => rest),
    softPreferences: MOCK_CONSTRAINTS
      .filter(c => c.type === 'soft')
      .map(({ type: _type, id: _id, sessionId: _sid, state: _st, ...rest }) => rest),
    mentions: MOCK_CONSTRAINTS
      .filter(c => c.type === 'mention')
      .map(({ type: _type, id: _id, sessionId: _sid, state: _st, ...rest }) => rest),
    rawConfidence: 0.82,
  }
}

export async function generateOptions(_sessionId: string): Promise<PollOptionBundle> {
  await new Promise(r => setTimeout(r, 1800))
  return MOCK_POLL_OPTION_BUNDLE
}
