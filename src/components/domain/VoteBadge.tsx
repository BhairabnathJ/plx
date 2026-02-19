import { ThumbsUp, ThumbsDown, Minus, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { VoteType } from '@/types'

interface VoteBadgeProps {
  type: VoteType | 'no-response'
  count?: number
  showLabel?: boolean
  size?: 'sm' | 'md'
}

const CONFIG: Record<string, { icon: React.ReactNode; label: string; bg: string; text: string }> = {
  yes:         { icon: <ThumbsUp />,   label: 'Yes',         bg: 'bg-emerald-50', text: 'text-emerald-700' },
  no:          { icon: <ThumbsDown />, label: 'No',          bg: 'bg-red-50',     text: 'text-red-700' },
  maybe:       { icon: <Minus />,      label: 'Maybe',       bg: 'bg-amber-50',   text: 'text-amber-700' },
  'no-response': { icon: <HelpCircle />, label: 'No response', bg: 'bg-neutral-100', text: 'text-neutral-500' },
}

export function VoteBadge({ type, count, showLabel = true, size = 'sm' }: VoteBadgeProps) {
  const cfg = CONFIG[type] ?? CONFIG['no-response']!
  const iconSize = size === 'sm' ? 11 : 14

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        cfg.bg, cfg.text
      )}
      aria-label={`${cfg.label}${count !== undefined ? `: ${count}` : ''}`}
    >
      <span aria-hidden className="[&>svg]:h-[1em] [&>svg]:w-[1em]" style={{ fontSize: iconSize }}>
        {cfg.icon}
      </span>
      {showLabel && cfg.label}
      {count !== undefined && (
        <span className="font-semibold">{count}</span>
      )}
    </span>
  )
}
