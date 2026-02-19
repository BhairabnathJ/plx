import type { Summary } from '@/types'

export const MOCK_SUMMARY: Summary = {
  id: 'sum-1',
  sessionId: 'session-1',
  draftText: `🎉 We're on for **Saturday Feb 22 at 7:30 PM** at the **Trendy Silver Lake spot**!

4 out of 5 people voted and Saturday evening works best. Silver Lake was the crowd favourite — no Italian, no Koreatown.

We'll grab dessert after 🍦

**Going:** Alex, Sam, Jordan, Morgan (Taylor still TBD)

Reply here if anything changes. See you Saturday! 🙌`,
  model: 'meta-llama/llama-3.3-70b-instruct:free',
  createdBy: 'user-1',
  createdAt: Date.now() - 3600000,
  updatedAt: Date.now() - 3600000,
}
