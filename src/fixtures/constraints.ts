import type { Constraint } from '@/types'

export const MOCK_CONSTRAINTS: Constraint[] = [
  // Hard constraints
  {
    id: 'c-1',
    sessionId: 'session-1',
    type: 'hard',
    text: 'Not before 7pm',
    state: 'accepted',
    provenance: 'chat',
    confidence: 'high',
  },
  {
    id: 'c-2',
    sessionId: 'session-1',
    type: 'hard',
    text: 'Not Koreatown',
    state: 'accepted',
    provenance: 'chat',
    confidence: 'high',
  },
  {
    id: 'c-3',
    sessionId: 'session-1',
    type: 'hard',
    text: 'No Italian food',
    state: 'accepted',
    provenance: 'chat',
    confidence: 'medium',
  },
  // Soft preferences
  {
    id: 'c-4',
    sessionId: 'session-1',
    type: 'soft',
    text: 'Prefer Silver Lake area',
    state: 'accepted',
    provenance: 'chat',
    confidence: 'high',
  },
  {
    id: 'c-5',
    sessionId: 'session-1',
    type: 'soft',
    text: 'Weekend evenings work best for most',
    state: 'accepted',
    provenance: 'habit',
    confidence: 'medium',
  },
  {
    id: 'c-6',
    sessionId: 'session-1',
    type: 'soft',
    text: 'Group prefers casual atmosphere',
    state: 'detected',
    provenance: 'habit',
    confidence: 'low',
  },
  // Mentions
  {
    id: 'c-7',
    sessionId: 'session-1',
    type: 'mention',
    text: 'New place on Sunset Blvd',
    state: 'detected',
    provenance: 'chat',
    confidence: 'high',
  },
  {
    id: 'c-8',
    sessionId: 'session-1',
    type: 'mention',
    text: 'Sqirl (morning option)',
    state: 'detected',
    provenance: 'chat',
    confidence: 'medium',
  },
]
