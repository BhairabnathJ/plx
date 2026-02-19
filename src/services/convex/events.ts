import { useState } from 'react'
import type { Event, AttendanceSnapshot, AttendanceState } from '@/types'
import { MOCK_EVENT, MOCK_ATTENDANCE } from '@/fixtures'

// STUB: Replace body with real Convex hooks. Signature stays the same.

export function useEvent(sessionId: string): { event: Event | null; isLoading: boolean } {
  const event = sessionId === 'session-3' ? MOCK_EVENT : null
  return { event, isLoading: false }
}

export function useAttendance(eventId: string): { attendance: AttendanceSnapshot[]; isLoading: boolean } {
  const attendance = eventId === 'event-1' ? MOCK_ATTENDANCE : []
  return { attendance, isLoading: false }
}

export function useFinalizeEvent(): {
  finalizeEvent: (input: Omit<Event, 'id' | 'finalizedAt' | 'finalizedBy'>) => Promise<string>
  isLoading: boolean
} {
  const [isLoading, setIsLoading] = useState(false)
  return {
    finalizeEvent: async () => {
      setIsLoading(true)
      await new Promise(r => setTimeout(r, 800))
      setIsLoading(false)
      return 'event-' + Date.now()
    },
    isLoading,
  }
}

export function useUpdateAttendance(): {
  updateAttendance: (eventId: string, userId: string, state: AttendanceState) => Promise<void>
} {
  return {
    updateAttendance: async () => { await new Promise(r => setTimeout(r, 300)) },
  }
}
