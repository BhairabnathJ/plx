import { useMutation, useQuery } from 'convex/react'
import type { Poll, PollOption, PollOptionBundle, PollDimension } from '@/types'
import { useAuthSessionToken } from './auth'
import { api } from '../../../convex/_generated/api'

type ApiAny = any

function groupByDimension(options: PollOption[], pollId: string): PollOptionBundle {
  const empty = (): PollOption[] => []
  const bundle: PollOptionBundle = {
    pollId,
    dates: empty(), times: empty(), places: empty(), before: empty(), after: empty(),
  }
  for (const opt of options) {
    if (opt.dimension === 'date') bundle.dates.push(opt)
    else if (opt.dimension === 'time') bundle.times.push(opt)
    else if (opt.dimension === 'place') bundle.places.push(opt)
    else if (opt.dimension === 'before') bundle.before.push(opt)
    else if (opt.dimension === 'after') bundle.after.push(opt)
  }
  return bundle
}

export function usePoll(sessionId: string): { poll: Poll | null; isLoading: boolean } {
  const sessionToken = useAuthSessionToken()
  const poll = useQuery(
    (api as ApiAny)['features/poll_publish_and_web_response'].getBySession,
    sessionToken && sessionId ? { sessionToken, sessionId } : 'skip',
  ) as Poll | null | undefined

  return {
    poll: poll ?? null,
    isLoading: !!sessionToken && poll === undefined,
  }
}

export function usePollByToken(token: string): { poll: Poll | null; isLoading: boolean } {
  const raw = useQuery(
    (api as ApiAny)['features/poll_publish_and_web_response'].getByToken,
    token ? { publishToken: token } : 'skip',
  ) as { id: string; sessionId: string; status: Poll['status']; tokenExpiresAt?: number; options: PollOption[] } | null | undefined

  const poll: Poll | null = raw
    ? { id: String(raw.id), sessionId: String(raw.sessionId), status: raw.status, publishToken: token }
    : null

  return {
    poll,
    isLoading: !!token && raw === undefined,
  }
}

export function usePollOptions(pollId: string): { bundle: PollOptionBundle | null; isLoading: boolean } {
  const sessionToken = useAuthSessionToken()
  const rows = useQuery(
    (api as ApiAny)['features/poll_option_generation'].listByPoll,
    sessionToken && pollId ? { sessionToken, pollId } : 'skip',
  ) as PollOption[] | undefined

  const bundle = rows ? groupByDimension(rows.map(o => ({ ...o, id: String(o.id), pollId: String(o.pollId) })), pollId) : null

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
  const publishMutation = useMutation(
    (api as ApiAny)['features/poll_publish_and_web_response'].publishPoll,
  )

  return {
    publishPoll: async (pollId) => {
      if (!sessionToken) throw new Error('Not authenticated')
      const { publishToken } = await publishMutation({ sessionToken, pollId })
      const base = window.location.origin
      return `${base}/app/polls/${pollId}?token=${publishToken}`
    },
    isLoading: false,
  }
}

export function useClosePoll(): {
  closePoll: (pollId: string) => Promise<void>
} {
  const sessionToken = useAuthSessionToken()
  const closeMutation = useMutation(
    (api as ApiAny)['features/poll_publish_and_web_response'].closePoll,
  )

  return {
    closePoll: async (pollId) => {
      if (!sessionToken) throw new Error('Not authenticated')
      await closeMutation({ sessionToken, pollId })
    },
  }
}

export function useRevokePoll(): {
  revokePoll: (pollId: string) => Promise<void>
} {
  const sessionToken = useAuthSessionToken()
  const revokeMutation = useMutation(
    (api as ApiAny)['features/poll_publish_and_web_response'].revokePoll,
  )

  return {
    revokePoll: async (pollId) => {
      if (!sessionToken) throw new Error('Not authenticated')
      await revokeMutation({ sessionToken, pollId })
    },
  }
}

export function useUpdatePollOption(): {
  updateOption: (id: string, updates: Partial<Pick<PollOption, 'label' | 'isActive'>>) => Promise<void>
} {
  const sessionToken = useAuthSessionToken()
  const updateMutation = useMutation(
    (api as ApiAny)['features/poll_option_generation'].updateOption,
  )

  return {
    updateOption: async (id, updates) => {
      if (!sessionToken) throw new Error('Not authenticated')
      await updateMutation({ sessionToken, optionId: id, ...updates })
    },
  }
}

export function useAddPollOption(): {
  addOption: (option: Omit<PollOption, 'id'>) => Promise<string>
} {
  const sessionToken = useAuthSessionToken()
  const addMutation = useMutation(
    (api as ApiAny)['features/poll_option_generation'].addOption,
  )

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
