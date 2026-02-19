export interface HabitProfile {
  id: string
  groupId: string
  commonDays: string[]
  commonTimeWindows: string[]
  commonAreas: string[]
  leadTimePattern: string
  turnoutPattern: string
  computedAt: number
  overrides?: Partial<HabitProfile>
}
