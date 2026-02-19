import type { VoteTally, BestComboResult } from '@/types'

export const MOCK_VOTE_TALLIES: VoteTally[] = [
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
  { optionId: 'opt-b1', label: 'Pre-drinks at someone\'s place 🍸', yes: 2, no: 1, maybe: 2, noResponse: 2, total: 7 },
  { optionId: 'opt-a1', label: 'Dessert run 🍦', yes: 3, no: 1, maybe: 1, noResponse: 2, total: 7 },
  { optionId: 'opt-a2', label: 'Bar hop 🍻', yes: 2, no: 2, maybe: 1, noResponse: 2, total: 7 },
]

export const MOCK_BEST_COMBOS: BestComboResult = {
  primary: {
    date: 'Sat, Feb 22',
    time: '7:30 PM',
    place: 'Trendy Silver Lake spot',
    score: 0.86,
  },
  backups: [
    {
      date: 'Sat, Feb 22',
      time: '7:00 PM',
      place: 'Rooftop in Los Feliz',
      score: 0.71,
    },
    {
      date: 'Sun, Feb 23',
      time: '7:30 PM',
      place: 'Trendy Silver Lake spot',
      score: 0.57,
    },
  ],
}
