import type { HabitProfile } from '@/types'

export const MOCK_HABIT_PROFILE: HabitProfile = {
  id: 'habit-1',
  groupId: 'group-1',
  preferredDays: ['Saturday', 'Friday', 'Sunday'],
  preferredTimeWindows: ['7:00–9:00 PM', '6:30–8:00 PM'],
  preferredAreas: ['Silver Lake', 'Echo Park', 'Los Feliz'],
  preferredVibes: ['casual', 'trendy', 'outdoor'],
  avgTurnout: 0.78,
  confidence: 'high',
  updatedAt: Date.now() - 2 * 86400000,
}
