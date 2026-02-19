import type { Event, AttendanceSnapshot } from '@/types'

export const MOCK_EVENT: Event = {
  id: 'event-1',
  sessionId: 'session-3',
  title: 'Game Night — The Usual Crew',
  whenIso: '2026-02-14T19:00:00-08:00',
  venueName: 'Alex\'s Place',
  mapUrl: 'https://maps.google.com/?q=Silver+Lake,+Los+Angeles',
  status: 'locked',
  createdBy: 'user-1',
  createdAt: Date.now() - 7 * 86400000,
  updatedAt: Date.now() - 7 * 86400000,
  reminderPolicy: {
    mode: 'day-before',
  },
}

export const MOCK_ATTENDANCE: AttendanceSnapshot = {
  id: 'att-snap-1',
  eventId: 'event-1',
  goingCount: 4,
  maybeCount: 1,
  noResponseCount: 2,
  capturedAt: Date.now() - 86400000,
}
