import { useState } from 'react'
import type { Event, AttendanceSnapshot } from '@/types'
import { MOCK_EVENT, MOCK_ATTENDANCE } from '@/fixtures'

// STUB: Replace body with real Convex hooks. Signature stays the same.

export function useEvent(sessionId: string): { event: Event | null; isLoading: boolean } {
  const event = sessionId === 'session-3' ? MOCK_EVENT : null
  return { event, isLoading: false }
}

export function useAttendanceSnapshot(eventId: string): { snapshot: AttendanceSnapshot | null; isLoading: boolean } {
  const snapshot = eventId === 'event-1' ? MOCK_ATTENDANCE : null
  return { snapshot, isLoading: false }
}

export function useFinalizeEvent(): {
  finalizeEvent: (input: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
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
