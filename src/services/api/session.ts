import { useAction } from 'convex/react'
import { useAuthSessionToken } from '@/services/convex/auth'
import { api } from '../../../convex/_generated/api'

type ApiAny = any

export function useAnalyzeSession(): {
  analyzeSession: (sessionId: string, contextText: string) => Promise<void>
} {
  const sessionToken = useAuthSessionToken()
  const analyzeAction = useAction((api as ApiAny)['llm/actions'].extractConstraints)

  return {
    analyzeSession: async (sessionId: string, contextText: string) => {
      if (!sessionToken) throw new Error('Not authenticated')
      await analyzeAction({ sessionToken, sessionId, sessionText: contextText })
    },
  }
}

export function useGeneratePollOptions(): {
  generateOptions: (pollId: string, summaryContext: string) => Promise<void>
} {
  const sessionToken = useAuthSessionToken()
  const generateAction = useAction((api as ApiAny)['llm/actions'].generatePollOptions)

  return {
    generateOptions: async (pollId: string, summaryContext: string) => {
      if (!sessionToken) throw new Error('Not authenticated')
      await generateAction({ sessionToken, pollId, summaryContext })
    },
  }
}
