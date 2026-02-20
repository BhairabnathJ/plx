import type { ConstraintExtractionResult, PollOptionBundle, PollOption } from '@/types'
import { callLlmAction, llmActions } from './llmClient'

function asConstraint(text: string, kind: 'hard' | 'soft' | 'mention') {
  return {
    kind,
    text,
    provenance: 'chat' as const,
    confidence: 'medium' as const,
  }
}

export async function analyzeSession(
  sessionId: string,
  contextText: string,
): Promise<ConstraintExtractionResult> {
  const res = await callLlmAction<{
    hard: Array<{ text: string }>
    soft: Array<{ text: string }>
    mentions: Array<{ text: string }>
  }>(llmActions.extractConstraints, {
    sessionText: contextText,
  })

  return {
    sessionId,
    hardConstraints: res.data.hard.map((c) => asConstraint(c.text, 'hard')),
    softPreferences: res.data.soft.map((c) => asConstraint(c.text, 'soft')),
    mentions: res.data.mentions.map((c) => asConstraint(c.text, 'mention')),
    rawConfidence: 0.85,
  }
}

function toOption(pollId: string, dimension: PollOption['dimension'], label: string, rank: number): PollOption {
  return {
    id: `${dimension}-${rank}-${label}`,
    pollId,
    dimension,
    label,
    rank,
    isActive: true,
  }
}

export async function generateOptions(sessionId: string): Promise<PollOptionBundle> {
  const res = await callLlmAction<{
    dates: string[]
    times: string[]
    places: string[]
    before: string[]
    after: string[]
  }>(llmActions.generatePollOptions, {
    summaryContext: `Session ${sessionId}`,
  })

  const pollId = `poll-${sessionId}`
  return {
    pollId,
    dates: res.data.dates.map((label, i) => toOption(pollId, 'date', label, i + 1)),
    times: res.data.times.map((label, i) => toOption(pollId, 'time', label, i + 1)),
    places: res.data.places.map((label, i) => toOption(pollId, 'place', label, i + 1)),
    before: res.data.before.map((label, i) => toOption(pollId, 'before', label, i + 1)),
    after: res.data.after.map((label, i) => toOption(pollId, 'after', label, i + 1)),
  }
}
