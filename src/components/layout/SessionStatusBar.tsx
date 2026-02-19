import { useParams, useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { SESSION_STATUSES, type SessionStatus } from '@/types'
import { STATUS_LABELS } from '@/lib/constants'
import { getStatusIndex } from '@/lib/session-machine'

const STATUS_COLORS: Record<SessionStatus, string> = {
  draft:      'text-neutral-400',
  analyzed:   'text-amber-500',
  polling:    'text-blue-500',
  summarized: 'text-violet-500',
  finalized:  'text-emerald-500',
}

const STATUS_BG: Record<SessionStatus, string> = {
  draft:      'bg-neutral-100',
  analyzed:   'bg-amber-50',
  polling:    'bg-blue-50',
  summarized: 'bg-violet-50',
  finalized:  'bg-emerald-50',
}

const STATUS_TO_TAB: Record<SessionStatus, string> = {
  draft: 'context',
  analyzed: 'constraints',
  polling: 'votes',
  summarized: 'summary',
  finalized: 'finalize',
}

interface SessionStatusBarProps {
  currentStatus: SessionStatus
  sessionTitle: string
}

export function SessionStatusBar({ currentStatus, sessionTitle }: SessionStatusBarProps) {
  const { groupId, sessionId } = useParams()
  const navigate = useNavigate()
  const currentIdx = getStatusIndex(currentStatus)

  return (
    <div className="h-statusbar bg-white border-b border-neutral-200 px-4 flex items-center gap-2 overflow-x-auto">
      {/* Session title */}
      <span className="text-sm font-semibold text-neutral-900 shrink-0 mr-2 max-w-[140px] truncate">
        {sessionTitle}
      </span>

      {/* Status steps */}
      <nav aria-label="Session status" className="flex items-center gap-1 shrink-0">
        {SESSION_STATUSES.map((status, idx) => {
          const isComplete = idx < currentIdx
          const isCurrent = idx === currentIdx
          const isUpcoming = idx > currentIdx

          return (
            <span key={status} className="flex items-center gap-1">
              {idx > 0 && (
                <ChevronRight size={12} className="text-neutral-300 shrink-0" aria-hidden />
              )}
              <button
                type="button"
                onClick={() => {
                  if (isComplete || isCurrent) {
                    navigate(`/app/${groupId}/sessions/${sessionId}/${STATUS_TO_TAB[status]}`)
                  }
                }}
                aria-current={isCurrent ? 'step' : undefined}
                aria-disabled={isUpcoming}
                disabled={isUpcoming}
                className={cn(
                  'flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors duration-150',
                  isCurrent && `${STATUS_BG[status]} ${STATUS_COLORS[status]} font-semibold`,
                  isComplete && 'text-neutral-500 hover:text-neutral-700 cursor-pointer',
                  isUpcoming && 'text-neutral-300 cursor-not-allowed',
                )}
              >
                {isCurrent && (
                  <span
                    className={cn('h-1.5 w-1.5 rounded-full', STATUS_COLORS[currentStatus].replace('text-', 'bg-'))}
                    aria-hidden
                  />
                )}
                {STATUS_LABELS[status]}
              </button>
            </span>
          )
        })}
      </nav>
    </div>
  )
}
