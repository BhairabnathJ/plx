import type { Poll, PollOption, PollOptionBundle } from '@/types'

export const MOCK_POLL: Poll = {
  id: 'poll-1',
  sessionId: 'session-1',
  status: 'published',
  publishToken: 'abc123xyz',
  publishedAt: Date.now() - 2 * 3600000,
}

export const MOCK_POLL_OPTION_BUNDLE: PollOptionBundle = {
  pollId: 'poll-1',
  dates: [
    { id: 'opt-d1', pollId: 'poll-1', dimension: 'date', label: 'Sat, Feb 22', rank: 0, isActive: true },
    { id: 'opt-d2', pollId: 'poll-1', dimension: 'date', label: 'Sun, Feb 23', rank: 1, isActive: true },
    { id: 'opt-d3', pollId: 'poll-1', dimension: 'date', label: 'Fri, Feb 28', rank: 2, isActive: true },
  ],
  times: [
    { id: 'opt-t1', pollId: 'poll-1', dimension: 'time', label: '7:00 PM', rank: 0, isActive: true },
    { id: 'opt-t2', pollId: 'poll-1', dimension: 'time', label: '7:30 PM', rank: 1, isActive: true },
    { id: 'opt-t3', pollId: 'poll-1', dimension: 'time', label: '8:00 PM', rank: 2, isActive: true },
  ],
  places: [
    { id: 'opt-p1', pollId: 'poll-1', dimension: 'place', label: 'Trendy Silver Lake spot', rank: 0, isActive: true },
    { id: 'opt-p2', pollId: 'poll-1', dimension: 'place', label: 'Casual Echo Park bistro', rank: 1, isActive: true },
    { id: 'opt-p3', pollId: 'poll-1', dimension: 'place', label: 'Rooftop in Los Feliz', rank: 2, isActive: true },
    { id: 'opt-p4', pollId: 'poll-1', dimension: 'place', label: 'Cozy Atwater Village café', rank: 3, isActive: true },
  ],
  before: [
    { id: 'opt-b1', pollId: 'poll-1', dimension: 'before', label: 'Pre-drinks at someone\'s place 🍸', rank: 0, isActive: true },
    { id: 'opt-b2', pollId: 'poll-1', dimension: 'before', label: 'Meet at a bar first 🍺', rank: 1, isActive: true },
  ],
  after: [
    { id: 'opt-a1', pollId: 'poll-1', dimension: 'after', label: 'Dessert run 🍦', rank: 0, isActive: true },
    { id: 'opt-a2', pollId: 'poll-1', dimension: 'after', label: 'Bar hop 🍻', rank: 1, isActive: true },
    { id: 'opt-a3', pollId: 'poll-1', dimension: 'after', label: 'Keep the party going somewhere else', rank: 2, isActive: true },
  ],
}

export const MOCK_POLL_OPTIONS: PollOption[] = [
  ...MOCK_POLL_OPTION_BUNDLE.dates,
  ...MOCK_POLL_OPTION_BUNDLE.times,
  ...MOCK_POLL_OPTION_BUNDLE.places,
  ...MOCK_POLL_OPTION_BUNDLE.before,
  ...MOCK_POLL_OPTION_BUNDLE.after,
]
