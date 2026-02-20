import { useMutation, useQuery } from 'convex/react'
import type { Event, AttendanceSnapshot, ReminderMode } from '@/types'
import { useAuthSessionToken } from './auth'
import { api } from '../../../convex/_generated/api'

type ApiAny = any

export function useEvent(sessionId: string): { event: Event | null; isLoading: boolean } {
  const sessionToken = useAuthSessionToken()
  const rows = useQuery(
    (api as ApiAny)['features/event_finalize_reminders'].getBySession,
    sessionToken && sessionId ? { sessionToken, sessionId } : 'skip',
  ) as Event[] | undefined

  return {
    event: rows?.[0] ?? null,
    isLoading: !!sessionToken && rows === undefined,
  }
}

export function useAttendanceSnapshot(_eventId: string): { snapshot: AttendanceSnapshot | null; isLoading: boolean } {
  // Attendance snapshots are recorded post-finalize; return null until implemented
  return { snapshot: null, isLoading: false }
}

export function useFinalizeEvent(): {
  finalizeEvent: (input: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
  isLoading: boolean
} {
  const sessionToken = useAuthSessionToken()
  const createMutation = useMutation(
    (api as ApiAny)['features/event_finalize_reminders'].createEvent,
  )
  const lockMutation = useMutation(
    (api as ApiAny)['features/event_finalize_reminders'].lockEvent,
  )

  return {
    finalizeEvent: async (input) => {
      if (!sessionToken) throw new Error('Not authenticated')
      const { eventId } = await createMutation({
        sessionToken,
        sessionId: input.sessionId,
        title: input.title,
        whenIso: input.whenIso,
        venueName: input.venueName,
        mapUrl: input.mapUrl,
      })
      await lockMutation({ sessionToken, eventId })
      return String(eventId)
    },
    isLoading: false,
  }
}

export function useUpdateEvent(): {
  updateEvent: (eventId: string, updates: Partial<Pick<Event, 'title' | 'whenIso' | 'venueName' | 'mapUrl'>>) => Promise<void>
} {
  const sessionToken = useAuthSessionToken()
  const updateMutation = useMutation(
    (api as ApiAny)['features/event_finalize_reminders'].updateEvent,
  )

  return {
    updateEvent: async (eventId, updates) => {
      if (!sessionToken) throw new Error('Not authenticated')
      await updateMutation({ sessionToken, eventId, ...updates })
    },
  }
}

export function useSetReminder(): {
  setReminder: (eventId: string, mode: ReminderMode, customMinutesBefore?: number) => Promise<void>
} {
  const sessionToken = useAuthSessionToken()
  const setMutation = useMutation(
    (api as ApiAny)['features/event_finalize_reminders'].setReminder,
  )

  return {
    setReminder: async (eventId, mode, customMinutesBefore) => {
      if (!sessionToken) throw new Error('Not authenticated')
      await setMutation({ sessionToken, eventId, mode, customMinutesBefore })
    },
  }
}

export function useReminder(eventId: string) {
  const sessionToken = useAuthSessionToken()
  const reminder = useQuery(
    (api as ApiAny)['features/event_finalize_reminders'].getReminders,
    sessionToken && eventId ? { sessionToken, eventId } : 'skip',
  )
  return { reminder: reminder ?? null }
}
