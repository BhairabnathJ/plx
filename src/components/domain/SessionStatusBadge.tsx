import { cn } from '@/lib/cn'
import type { SessionStatus } from '@/types'
import { STATUS_LABELS } from '@/lib/constants'

const CONFIG: Record<SessionStatus, { dot: string; bg: string; text: string }> = {
  draft:      { dot: 'bg-neutral-400',   bg: 'bg-neutral-100',  text: 'text-neutral-600' },
  analyzed:   { dot: 'bg-amber-500',     bg: 'bg-amber-50',     text: 'text-amber-700' },
  polling:    { dot: 'bg-blue-500',      bg: 'bg-blue-50',      text: 'text-blue-700' },
  summarized: { dot: 'bg-violet-500',    bg: 'bg-violet-50',    text: 'text-violet-700' },
  finalized:  { dot: 'bg-emerald-500',   bg: 'bg-emerald-50',   text: 'text-emerald-700' },
}

interface SessionStatusBadgeProps {
  status: SessionStatus
  size?: 'sm' | 'md'
}

export function SessionStatusBadge({ status, size = 'sm' }: SessionStatusBadgeProps) {
  const { dot, bg, text } = CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        bg, text
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dot)} aria-hidden />
      {STATUS_LABELS[status]}
    </span>
  )
}
