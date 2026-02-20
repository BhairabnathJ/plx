import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../../convex/_generated/api'

type LlmSuccess<T> = {
  ok: true
  data: T
  meta: { model: string; latencyMs: number; attempts: number }
}

type LlmFailure = {
  ok: false
  code: string
  message: string
  retryable: boolean
}

type LlmResult<T> = LlmSuccess<T> | LlmFailure

const convexUrl = import.meta.env.VITE_CONVEX_URL
const client = convexUrl ? new ConvexHttpClient(convexUrl) : null

export class LlmServiceError extends Error {
  code: string
  retryable: boolean

  constructor(code: string, message: string, retryable: boolean) {
    super(message)
    this.code = code
    this.retryable = retryable
  }
}

export async function callLlmAction<T>(
  fn: any,
  args: Record<string, unknown>,
): Promise<LlmSuccess<T>> {
  if (!client) {
    throw new LlmServiceError('config_error', 'VITE_CONVEX_URL is not configured', false)
  }

  const result = await client.action(fn, args) as LlmResult<T>
  if (!result.ok) {
    throw new LlmServiceError(result.code, result.message, result.retryable)
  }
  return result
}

export const llmActions = {
  extractConstraints: (api as any)['llm/actions'].extractConstraints,
  generatePollOptions: (api as any)['llm/actions'].generatePollOptions,
  generateSummaryDraft: (api as any)['llm/actions'].generateSummaryDraft,
  analyzeLiveChatConsensus: (api as any)['llm/actions'].analyzeLiveChatConsensus,
}
