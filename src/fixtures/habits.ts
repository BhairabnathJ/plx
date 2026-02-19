import type { HabitProfile } from '@/types'

export const MOCK_HABIT_PROFILE: HabitProfile = {
  id: 'habit-1',
  groupId: 'group-1',
  commonDays: ['Saturday', 'Friday', 'Sunday'],
  commonTimeWindows: ['7:00–9:00 PM', '6:30–8:00 PM'],
  commonAreas: ['Silver Lake', 'Echo Park', 'Los Feliz'],
  leadTimePattern: 'Usually planned 3–5 days out',
  turnoutPattern: '5–7 of 7 members typically attend',
  computedAt: Date.now() - 2 * 86400000,
}
