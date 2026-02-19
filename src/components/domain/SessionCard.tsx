import { useNavigate, useParams } from 'react-router-dom'
import { CalendarDays, Clock } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { Session } from '@/types'
import { SessionStatusBadge } from './SessionStatusBadge'
import { formatRelative } from '@/lib/formatting'

interface SessionCardProps {
  session: Session
  className?: string
}

const STATUS_TO_TAB: Record<Session['status'], string> = {
  draft: 'context',
  analyzed: 'constraints',
  polling: 'votes',
  summarized: 'summary',
  finalized: 'finalize',
}

export function SessionCard({ session, className }: SessionCardProps) {
  const navigate = useNavigate()
  const { groupId = 'group-1' } = useParams()

  const handleClick = () => {
    const tab = STATUS_TO_TAB[session.status]
    navigate(`/app/${groupId}/sessions/${session.id}/${tab}`)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'card-interactive w-full text-left p-4 flex flex-col gap-3',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-neutral-900 leading-snug">{session.title}</h3>
        <SessionStatusBadge status={session.status} />
      </div>

      <div className="flex items-center gap-3 text-xs text-neutral-500">
        {session.timeframe && (
          <span className="flex items-center gap-1">
            <CalendarDays size={12} aria-hidden />
            {session.timeframe}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock size={12} aria-hidden />
          {formatRelative(session.updatedAt)}
        </span>
      </div>

      {session.activityType && (
        <div className="flex flex-wrap gap-1">
          <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded text-xs font-medium">
            {session.activityType}
          </span>
        </div>
      )}
    </button>
  )
}
