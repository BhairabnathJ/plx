export type AttendanceState = 'going' | 'maybe' | 'unknown'
export type ReminderState = 'off' | 'day-before' | 'same-day' | 'custom'

export interface ReminderPolicy {
  state: ReminderState
  customTime?: number
  timezone: string
}

export interface Event {
  id: string
  sessionId: string
  venueName: string
  mapLink?: string
  finalDate: string
  finalTime: string
  finalizedAt: number
  finalizedBy: string
  reminderPolicy: ReminderPolicy
}

export interface AttendanceSnapshot {
  id: string
  eventId: string
  userId: string
  state: AttendanceState
  recordedAt: number
  displayName?: string
  avatarUrl?: string
}
