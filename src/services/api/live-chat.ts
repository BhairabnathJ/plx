import type { ConsensusInsight } from '@/types'
import { callLlmAction, llmActions } from './llmClient'

export async function analyzeConsensus(messages: string[]): Promise<ConsensusInsight> {
  const recentMessages = messages.join('\n').trim() || 'No recent messages supplied.'

  const res = await callLlmAction<ConsensusInsight>(
    llmActions.analyzeLiveChatConsensus,
    { recentMessages },
  )

  return res.data
}
