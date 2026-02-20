import { useMemo, useState, useSyncExternalStore } from 'react'
import type { Poll, PollOption, PollOptionBundle } from '@/types'
import { MOCK_POLL, MOCK_POLL_OPTION_BUNDLE } from '@/fixtures'

const listeners = new Set<() => void>()
let revision = 0

const pollsBySession = new Map<string, Poll>([[MOCK_POLL.sessionId, { ...MOCK_POLL }]])
const bundlesByPoll = new Map<string, PollOptionBundle>([[MOCK_POLL.id, cloneBundle(MOCK_POLL_OPTION_BUNDLE, MOCK_POLL.id)]])
const pollIdsByToken = new Map<string, string>([[MOCK_POLL.publishToken ?? 'abc123xyz', MOCK_POLL.id]])

function emit() {
  revision += 1
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function snapshot() {
  return revision
}

function cloneBundle(source: PollOptionBundle, pollId: string): PollOptionBundle {
  const rewrite = (options: PollOption[], dimensionPrefix: string) =>
    options.map((option, index) => ({
      ...option,
      id: `${pollId}-${dimensionPrefix}-${index + 1}`,
      pollId,
      isActive: true,
    }))

  return {
    pollId,
    dates: rewrite(source.dates, 'date'),
    times: rewrite(source.times, 'time'),
    places: rewrite(source.places, 'place'),
    before: rewrite(source.before, 'before'),
    after: rewrite(source.after, 'after'),
  }
}

function locateGroupIdFromPath() {
  if (typeof window === 'undefined') return 'group'
  const match = window.location.pathname.match(/^\/app\/([^/]+)/)
  return match?.[1] ?? 'group'
}

function ensurePoll(sessionId: string): Poll | null {
  if (!sessionId) return null
  const existing = pollsBySession.get(sessionId)
  if (existing) return existing

  const pollId = `poll-${sessionId}`
  const token = `tok_${Math.random().toString(36).slice(2, 10)}`
  const poll: Poll = {
    id: pollId,
    sessionId,
    status: 'draft',
    publishToken: token,
  }
  pollsBySession.set(sessionId, poll)
  pollIdsByToken.set(token, pollId)
  bundlesByPoll.set(pollId, cloneBundle(MOCK_POLL_OPTION_BUNDLE, pollId))
  return poll
}

function findPollById(pollId: string): Poll | null {
  for (const poll of pollsBySession.values()) {
    if (poll.id === pollId) return poll
  }
  return null
}

function readBundle(pollId: string): PollOptionBundle | null {
  if (!pollId) return null
  const bundle = bundlesByPoll.get(pollId)
  return bundle ?? null
}

export function usePoll(sessionId: string): { poll: Poll | null; isLoading: boolean } {
  useSyncExternalStore(subscribe, snapshot, snapshot)
  const poll = ensurePoll(sessionId)
  return { poll, isLoading: false }
}

export function usePollByToken(token: string): { poll: Poll | null; isLoading: boolean } {
  useSyncExternalStore(subscribe, snapshot, snapshot)
  if (!token) return { poll: null, isLoading: false }
  const pollId = pollIdsByToken.get(token)
  const poll = pollId ? findPollById(pollId) : null
  return { poll, isLoading: false }
}

export function usePollOptions(pollId: string): { bundle: PollOptionBundle | null; isLoading: boolean } {
  useSyncExternalStore(subscribe, snapshot, snapshot)
  const bundle = readBundle(pollId)
  return { bundle, isLoading: false }
}

export function usePublishPoll(): {
  publishPoll: (pollId: string) => Promise<string>
  isLoading: boolean
} {
  const [isLoading, setIsLoading] = useState(false)
  return {
    publishPoll: async (pollId) => {
      setIsLoading(true)
      await new Promise((r) => setTimeout(r, 300))

      const poll = findPollById(pollId)
      if (!poll) {
        setIsLoading(false)
        throw new Error('Poll not found')
      }

      const token = poll.publishToken ?? `tok_${Math.random().toString(36).slice(2, 10)}`
      const updated: Poll = {
        ...poll,
        status: 'published',
        publishToken: token,
        publishedAt: Date.now(),
      }
      pollsBySession.set(poll.sessionId, updated)
      pollIdsByToken.set(token, pollId)
      emit()

      setIsLoading(false)
      const groupId = locateGroupIdFromPath()
      return `${window.location.origin}/app/${groupId}/polls/${pollId}?token=${token}`
    },
    isLoading,
  }
}

export function useUpdatePollOption(): {
  updateOption: (id: string, updates: Partial<PollOption>) => Promise<void>
} {
  return {
    updateOption: async (id, updates) => {
      await new Promise((r) => setTimeout(r, 120))
      const bundle = [...bundlesByPoll.values()].find((candidate) =>
        [...candidate.dates, ...candidate.times, ...candidate.places, ...candidate.before, ...candidate.after].some((opt) => opt.id === id),
      )
      if (!bundle) return

      const updateCollection = (options: PollOption[]) =>
        options.map((option) => {
          if (option.id !== id) return option
          if (Object.keys(updates).length === 0) {
            return { ...option, isActive: false }
          }
          return { ...option, ...updates }
        })

      bundlesByPoll.set(bundle.pollId, {
        ...bundle,
        dates: updateCollection(bundle.dates),
        times: updateCollection(bundle.times),
        places: updateCollection(bundle.places),
        before: updateCollection(bundle.before),
        after: updateCollection(bundle.after),
      })
      emit()
    },
  }
}

export function useAddPollOption(): {
  addOption: (option: Omit<PollOption, 'id'>) => Promise<string>
} {
  return {
    addOption: async (option) => {
      await new Promise((r) => setTimeout(r, 120))
      const bundle = bundlesByPoll.get(option.pollId)
      if (!bundle) throw new Error('Poll options not found')

      const nextId = `${option.pollId}-${option.dimension}-${Math.random().toString(36).slice(2, 8)}`
      const nextOption: PollOption = {
        ...option,
        id: nextId,
      }

      const update = (values: PollOption[]) => [...values, nextOption]
      const nextBundle: PollOptionBundle = {
        ...bundle,
        dates: option.dimension === 'date' ? update(bundle.dates) : bundle.dates,
        times: option.dimension === 'time' ? update(bundle.times) : bundle.times,
        places: option.dimension === 'place' ? update(bundle.places) : bundle.places,
        before: option.dimension === 'before' ? update(bundle.before) : bundle.before,
        after: option.dimension === 'after' ? update(bundle.after) : bundle.after,
      }

      bundlesByPoll.set(option.pollId, nextBundle)
      emit()
      return nextId
    },
  }
}

export function useActivePollOptions(bundle: PollOptionBundle | null) {
  return useMemo(() => {
    if (!bundle) return null
    return {
      ...bundle,
      dates: bundle.dates.filter((o) => o.isActive),
      times: bundle.times.filter((o) => o.isActive),
      places: bundle.places.filter((o) => o.isActive),
      before: bundle.before.filter((o) => o.isActive),
      after: bundle.after.filter((o) => o.isActive),
    }
  }, [bundle])
}
