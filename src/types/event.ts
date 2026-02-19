export type EventStatus = 'draft' | 'locked'
export type ReminderMode = 'off' | 'day-before' | 'same-day' | 'custom'

export interface ReminderPolicy {
  mode: ReminderMode
  customMinutesBefore?: number
}

export interface Event {
  id: string
  sessionId: string
  title: string
  whenIso: string
  venueName?: string
  mapUrl?: string
  status: EventStatus
  createdBy: string
  createdAt: number
  updatedAt: number
  reminderPolicy?: ReminderPolicy
}

export interface AttendanceSnapshot {
  id: string
  eventId: string
  goingCount: number
  maybeCount: number
  noResponseCount: number
  capturedAt: number
}
