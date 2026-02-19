import type { Poll, PollOption, PollOptionBundle } from '@/types'

export const MOCK_POLL: Poll = {
  id: 'poll-1',
  sessionId: 'session-1',
  status: 'published',
  shareToken: 'abc123xyz',
  publishedAt: Date.now() - 2 * 3600000,
}

export const MOCK_POLL_OPTION_BUNDLE: PollOptionBundle = {
  pollId: 'poll-1',
  dates: [
    { id: 'opt-d1', pollId: 'poll-1', dimension: 'date', label: 'Sat, Feb 22', selectionType: 'multi', sortOrder: 0 },
    { id: 'opt-d2', pollId: 'poll-1', dimension: 'date', label: 'Sun, Feb 23', selectionType: 'multi', sortOrder: 1 },
    { id: 'opt-d3', pollId: 'poll-1', dimension: 'date', label: 'Fri, Feb 28', selectionType: 'multi', sortOrder: 2 },
  ],
  times: [
    { id: 'opt-t1', pollId: 'poll-1', dimension: 'time', label: '7:00 PM', selectionType: 'multi', sortOrder: 0 },
    { id: 'opt-t2', pollId: 'poll-1', dimension: 'time', label: '7:30 PM', selectionType: 'multi', sortOrder: 1 },
    { id: 'opt-t3', pollId: 'poll-1', dimension: 'time', label: '8:00 PM', selectionType: 'multi', sortOrder: 2 },
  ],
  places: [
    { id: 'opt-p1', pollId: 'poll-1', dimension: 'place', label: 'Trendy Silver Lake spot', selectionType: 'single', sortOrder: 0 },
    { id: 'opt-p2', pollId: 'poll-1', dimension: 'place', label: 'Casual Echo Park bistro', selectionType: 'single', sortOrder: 1 },
    { id: 'opt-p3', pollId: 'poll-1', dimension: 'place', label: 'Rooftop in Los Feliz', selectionType: 'single', sortOrder: 2 },
    { id: 'opt-p4', pollId: 'poll-1', dimension: 'place', label: 'Cozy Atwater Village café', selectionType: 'single', sortOrder: 3 },
  ],
  beforeAfter: [
    { id: 'opt-ba1', pollId: 'poll-1', dimension: 'before-after', label: 'Drinks before 🍸', selectionType: 'multi', sortOrder: 0 },
    { id: 'opt-ba2', pollId: 'poll-1', dimension: 'before-after', label: 'Dessert after 🍦', selectionType: 'multi', sortOrder: 1 },
    { id: 'opt-ba3', pollId: 'poll-1', dimension: 'before-after', label: 'Bar hop after 🍻', selectionType: 'multi', sortOrder: 2 },
  ],
}

export const MOCK_POLL_OPTIONS: PollOption[] = [
  ...MOCK_POLL_OPTION_BUNDLE.dates,
  ...MOCK_POLL_OPTION_BUNDLE.times,
  ...MOCK_POLL_OPTION_BUNDLE.places,
  ...MOCK_POLL_OPTION_BUNDLE.beforeAfter,
]
