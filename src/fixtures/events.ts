import type { Event, AttendanceSnapshot } from '@/types'

export const MOCK_EVENT: Event = {
  id: 'event-1',
  sessionId: 'session-3',
  venueName: 'The Griffith Observatory Lawn',
  mapLink: 'https://maps.google.com/?q=Griffith+Observatory',
  finalDate: 'Friday, Feb 14',
  finalTime: '7:00 PM',
  finalizedAt: Date.now() - 7 * 86400000,
  finalizedBy: 'user-1',
  reminderPolicy: {
    state: 'day-before',
    timezone: 'America/Los_Angeles',
  },
}

export const MOCK_ATTENDANCE: AttendanceSnapshot[] = [
  { id: 'att-1', eventId: 'event-1', userId: 'user-1', state: 'going', recordedAt: Date.now() - 7 * 86400000, displayName: 'Alex Rivera' },
  { id: 'att-2', eventId: 'event-1', userId: 'user-2', state: 'going', recordedAt: Date.now() - 6 * 86400000, displayName: 'Sam Chen' },
  { id: 'att-3', eventId: 'event-1', userId: 'user-3', state: 'going', recordedAt: Date.now() - 6 * 86400000, displayName: 'Jordan Park' },
  { id: 'att-4', eventId: 'event-1', userId: 'user-4', state: 'maybe', recordedAt: Date.now() - 5 * 86400000, displayName: 'Morgan Lee' },
  { id: 'att-5', eventId: 'event-1', userId: 'user-5', state: 'unknown', recordedAt: Date.now() - 7 * 86400000, displayName: 'Taylor Kim' },
]
