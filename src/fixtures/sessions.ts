import type { Session } from '@/types'

const now = Date.now()
const day = 86400000

export const MOCK_SESSIONS: Session[] = [
  {
    id: 'session-1',
    groupId: 'group-1',
    title: 'Saturday Dinner Plans',
    status: 'polling',
    timeframe: 'This weekend',
    activityType: 'Dinner',
    contextText: `Hey everyone! We should def do something this Saturday.
Sam: I'm free Saturday evening but not before 7pm
Jordan: Same, can't do before 7. Also not Koreatown, had it last week
Morgan: Works for me! Maybe somewhere in Silver Lake?
Taylor: I'm in but please not Italian, had pasta every day this week lol
Alex: Silver Lake sounds good. What about that new place on Sunset?`,
    createdBy: 'user-1',
    createdAt: now - 3 * day,
    updatedAt: now - 1 * day,
  },
  {
    id: 'session-2',
    groupId: 'group-1',
    title: 'Beach Day Next Weekend',
    status: 'draft',
    timeframe: 'Next weekend',
    activityType: 'Outdoor',
    contextText: 'Anyone up for a beach day next weekend? The weather looks perfect.',
    createdBy: 'user-1',
    createdAt: now - 1 * day,
    updatedAt: now - 1 * day,
  },
  {
    id: 'session-3',
    groupId: 'group-1',
    title: 'Game Night',
    status: 'finalized',
    timeframe: 'Last Friday',
    activityType: 'Games',
    createdBy: 'user-2',
    createdAt: now - 10 * day,
    updatedAt: now - 7 * day,
  },
  {
    id: 'session-4',
    groupId: 'group-1',
    title: 'Hiking This Sunday',
    status: 'summarized',
    timeframe: 'This Sunday',
    activityType: 'Hiking',
    contextText: "Let's do a hike on Sunday! Griffith Park or Runyon Canyon?",
    createdBy: 'user-3',
    createdAt: now - 2 * day,
    updatedAt: now - 1 * day,
  },
  {
    id: 'session-5',
    groupId: 'group-1',
    title: 'Work Happy Hour',
    status: 'analyzed',
    timeframe: 'This Thursday',
    activityType: 'Drinks',
    contextText: "Who's free for happy hour this Thursday? Either 5:30 or 6:30?",
    createdBy: 'user-1',
    createdAt: now - 2 * day,
    updatedAt: now - 4 * 3600000,
  },
]
