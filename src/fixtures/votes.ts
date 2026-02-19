import type { VoteMatrix, BestComboResult } from '@/types'

export const MOCK_VOTE_MATRIX: VoteMatrix = {
  pollId: 'poll-1',
  totalVoters: 7,
  respondedVoters: 5,
  tallies: [
    { optionId: 'opt-d1', label: 'Sat, Feb 22', yes: 4, no: 1, maybe: 0, noResponse: 2, total: 7 },
    { optionId: 'opt-d2', label: 'Sun, Feb 23', yes: 3, no: 2, maybe: 0, noResponse: 2, total: 7 },
    { optionId: 'opt-d3', label: 'Fri, Feb 28', yes: 2, no: 1, maybe: 2, noResponse: 2, total: 7 },
    { optionId: 'opt-t1', label: '7:00 PM', yes: 3, no: 0, maybe: 2, noResponse: 2, total: 7 },
    { optionId: 'opt-t2', label: '7:30 PM', yes: 4, no: 1, maybe: 0, noResponse: 2, total: 7 },
    { optionId: 'opt-t3', label: '8:00 PM', yes: 2, no: 2, maybe: 1, noResponse: 2, total: 7 },
    { optionId: 'opt-p1', label: 'Trendy Silver Lake spot', yes: 4, no: 0, maybe: 1, noResponse: 2, total: 7 },
    { optionId: 'opt-p2', label: 'Casual Echo Park bistro', yes: 2, no: 2, maybe: 1, noResponse: 2, total: 7 },
    { optionId: 'opt-p3', label: 'Rooftop in Los Feliz', yes: 3, no: 1, maybe: 1, noResponse: 2, total: 7 },
    { optionId: 'opt-p4', label: 'Cozy Atwater Village café', yes: 1, no: 3, maybe: 1, noResponse: 2, total: 7 },
    { optionId: 'opt-ba1', label: 'Drinks before 🍸', yes: 2, no: 1, maybe: 2, noResponse: 2, total: 7 },
    { optionId: 'opt-ba2', label: 'Dessert after 🍦', yes: 3, no: 1, maybe: 1, noResponse: 2, total: 7 },
    { optionId: 'opt-ba3', label: 'Bar hop after 🍻', yes: 2, no: 2, maybe: 1, noResponse: 2, total: 7 },
  ],
}

export const MOCK_BEST_COMBOS: BestComboResult[] = [
  {
    rank: 1,
    date: 'Sat, Feb 22',
    time: '7:30 PM',
    place: 'Trendy Silver Lake spot',
    beforeAfter: 'Dessert after 🍦',
    voterCoverage: 0.71,
    rankingReason: '4 of 5 responders can make Saturday at 7:30, and Silver Lake was the most popular vibe',
    supportCount: 4,
    totalVoters: 7,
  },
  {
    rank: 2,
    date: 'Sat, Feb 22',
    time: '7:00 PM',
    place: 'Rooftop in Los Feliz',
    voterCoverage: 0.57,
    rankingReason: 'Good overlap for Saturday with an earlier start time',
    supportCount: 3,
    totalVoters: 7,
  },
  {
    rank: 3,
    date: 'Sun, Feb 23',
    time: '7:30 PM',
    place: 'Trendy Silver Lake spot',
    voterCoverage: 0.43,
    rankingReason: 'Backup Sunday option with same popular venue',
    supportCount: 3,
    totalVoters: 7,
  },
]
