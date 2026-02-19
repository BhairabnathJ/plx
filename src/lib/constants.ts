export const DEV_MODE_KEY = 'plannerbot.devModeEnabled'

export const ACTIVITY_TYPES = [
  'Dinner',
  'Drinks',
  'Outdoor',
  'Movies',
  'Sports',
  'Beach',
  'Hiking',
  'Game Night',
  'Brunch',
  'Coffee',
  'Concert',
  'Other',
] as const

export const TIMEFRAME_OPTIONS = [
  { value: 'this-week', label: 'This week' },
  { value: 'next-week', label: 'Next week' },
  { value: 'this-month', label: 'This month' },
  { value: 'custom', label: 'Custom range' },
] as const

export const TONE_LABELS: Record<string, string> = {
  friendly: 'Friendly',
  default: 'Balanced',
  concise: 'Concise',
}

export const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  analyzed: 'Analyzed',
  polling: 'Polling',
  summarized: 'Summarized',
  finalized: 'Finalized',
}
