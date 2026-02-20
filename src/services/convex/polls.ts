import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import type { Poll, PollOption, PollOptionBundle, PollDimension } from '@/types'
import { useAuthSessionToken } from './auth'
import { api } from '../../../convex/_generated/api'

type ApiAny = any

export function usePoll(sessionId: string): { poll: Poll | null; isLoading: boolean } {
  const sessionToken = useAuthSessionToken()
  const poll = useQuery(
    (api as ApiAny).features.poll_publish_and_web_response.getBySession,
    sessionToken && sessionId ? { sessionToken, sessionId } : 'skip',
  ) as Poll | null | undefined

  return {
    poll: poll ?? null,
    isLoading: !!sessionToken && poll === undefined,
  }
}

export function usePollByToken(token: string): { poll: Poll | null; isLoading: boolean } {
  const poll = useQuery(
    (api as ApiAny).features.poll_publish_and_web_response.getByToken,
    token && token !== 'abc123xyz' ? { publishToken: token } : 'skip',
  ) as Poll | null | undefined

  return {
    poll: poll ?? null,
    isLoading: !!token && poll === undefined,
  }
}

export function usePollOptions(pollId: string): { bundle: PollOptionBundle | null; isLoading: boolean } {
  const sessionToken = useAuthSessionToken()
  const rows = useQuery(
    (api as ApiAny).features.poll_option_generation.listByPoll,
    sessionToken && pollId ? { sessionToken, pollId } : 'skip',
  ) as PollOption[] | undefined

  const bundle: PollOptionBundle | null = rows
    ? {
        pollId,
        dates: rows.filter((o) => o.dimension === 'date'),
        times: rows.filter((o) => o.dimension === 'time'),
        places: rows.filter((o) => o.dimension === 'place'),
        before: rows.filter((o) => o.dimension === 'before'),
        after: rows.filter((o) => o.dimension === 'after'),
      }
    : null

  return {
    bundle,
    isLoading: !!sessionToken && rows === undefined,
  }
}

export function usePublishPoll(): {
  publishPoll: (pollId: string) => Promise<string>
  isLoading: boolean
} {
  const sessionToken = useAuthSessionToken()
  const publishMutation = useMutation((api as ApiAny).features.poll_publish_and_web_response.publishPoll)
  const [isLoading, setIsLoading] = useState(false)

  return {
    publishPoll: async (pollId) => {
      if (!sessionToken) throw new Error('Not authenticated')
      setIsLoading(true)
      try {
        const { publishToken } = await publishMutation({ sessionToken, pollId })
        return `${window.location.origin}/poll?token=${publishToken}`
      } finally {
        setIsLoading(false)
      }
    },
    isLoading,
  }
}

export function useClosePoll(): { closePoll: (pollId: string) => Promise<void> } {
  const sessionToken = useAuthSessionToken()
  const closeMutation = useMutation((api as ApiAny).features.poll_publish_and_web_response.closePoll)

  return {
    closePoll: async (pollId) => {
      if (!sessionToken) throw new Error('Not authenticated')
      await closeMutation({ sessionToken, pollId })
    },
  }
}

export function useRevokePoll(): { revokePoll: (pollId: string) => Promise<void> } {
  const sessionToken = useAuthSessionToken()
  const revokeMutation = useMutation((api as ApiAny).features.poll_publish_and_web_response.revokePoll)

  return {
    revokePoll: async (pollId) => {
      if (!sessionToken) throw new Error('Not authenticated')
      await revokeMutation({ sessionToken, pollId })
    },
  }
}

export function useUpdatePollOption(): {
  updateOption: (id: string, updates: Partial<Pick<PollOption, 'isActive' | 'label'>>) => Promise<void>
} {
  const sessionToken = useAuthSessionToken()
  const updateMutation = useMutation((api as ApiAny).features.poll_option_generation.updateOption)

  return {
    updateOption: async (id, updates) => {
      if (!sessionToken) throw new Error('Not authenticated')
      await updateMutation({ sessionToken, optionId: id, isActive: updates.isActive, label: updates.label })
    },
  }
}

export function useAddPollOption(): {
  addOption: (option: Omit<PollOption, 'id'>) => Promise<string>
} {
  const sessionToken = useAuthSessionToken()
  const addMutation = useMutation((api as ApiAny).features.poll_option_generation.addOption)

  return {
    addOption: async (option) => {
      if (!sessionToken) throw new Error('Not authenticated')
      const { id } = await addMutation({
        sessionToken,
        pollId: option.pollId,
        dimension: option.dimension as PollDimension,
        label: option.label,
      })
      return String(id)
    },
  }
}
