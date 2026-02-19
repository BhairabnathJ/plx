import { useState } from 'react'
import type { Poll, PollOption, PollOptionBundle } from '@/types'
import { MOCK_POLL, MOCK_POLL_OPTION_BUNDLE } from '@/fixtures'

// STUB: Replace body with real Convex hooks. Signature stays the same.

export function usePoll(sessionId: string): { poll: Poll | null; isLoading: boolean } {
  const poll = sessionId === 'session-1' ? MOCK_POLL : null
  return { poll, isLoading: false }
}

export function usePollByToken(token: string): { poll: Poll | null; isLoading: boolean } {
  const poll = token === 'abc123xyz' ? MOCK_POLL : null
  return { poll, isLoading: false }
}

export function usePollOptions(pollId: string): { bundle: PollOptionBundle | null; isLoading: boolean } {
  const bundle = pollId === 'poll-1' ? MOCK_POLL_OPTION_BUNDLE : null
  return { bundle, isLoading: false }
}

export function usePublishPoll(): {
  publishPoll: (pollId: string) => Promise<string>
  isLoading: boolean
} {
  const [isLoading, setIsLoading] = useState(false)
  return {
    publishPoll: async (_pollId) => {
      setIsLoading(true)
      await new Promise(r => setTimeout(r, 600))
      setIsLoading(false)
      return `${window.location.origin}/app/group-1/polls/poll-1?token=abc123xyz`
    },
    isLoading,
  }
}

export function useUpdatePollOption(): {
  updateOption: (id: string, updates: Partial<PollOption>) => Promise<void>
} {
  return { updateOption: async () => { await new Promise(r => setTimeout(r, 200)) } }
}

export function useAddPollOption(): {
  addOption: (option: Omit<PollOption, 'id'>) => Promise<string>
} {
  return {
    addOption: async (_o) => {
      await new Promise(r => setTimeout(r, 300))
      return 'opt-' + Date.now()
    },
  }
}
