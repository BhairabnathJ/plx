import { Calendar, Clock, MapPin, Star, Users } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { BestComboResult } from '@/types'
import { ProgressBar } from '@/components/primitives/ProgressBar'
import { Button } from '@/components/primitives/Button'
import { percentToLabel } from '@/lib/formatting'

type ComboVariant = 'primary' | 'backup' | 'low-confidence'

interface ComboCardProps extends BestComboResult {
  variant: ComboVariant
  onSelect?: () => void
}

const VARIANT_CONFIG: Record<ComboVariant, {
  wrapper: string
  badge: string
  label: string
}> = {
  primary: {
    wrapper: 'border-primary-300 bg-white shadow-combo',
    badge: 'bg-primary-500 text-white',
    label: 'Best match',
  },
  backup: {
    wrapper: 'border-neutral-200 bg-white',
    badge: 'bg-neutral-100 text-neutral-600',
    label: 'Backup',
  },
  'low-confidence': {
    wrapper: 'border-amber-200 bg-amber-50/40',
    badge: 'bg-amber-100 text-amber-700',
    label: 'Low confidence',
  },
}

export function ComboCard({
  variant,
  rank,
  date,
  time,
  place,
  beforeAfter,
  voterCoverage,
  rankingReason,
  supportCount,
  totalVoters,
  onSelect,
}: ComboCardProps) {
  const cfg = VARIANT_CONFIG[variant]
  const isPrimary = variant === 'primary'

  return (
    <div
      className={cn(
        'rounded-xl border-2 p-4 flex flex-col gap-3 transition-shadow duration-200',
        cfg.wrapper
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {isPrimary && <Star size={16} className="text-primary-500 fill-primary-500" aria-hidden />}
          <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-pill', cfg.badge)}>
            {rank === 1 ? cfg.label : `#${rank} ${cfg.label}`}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-neutral-500">
          <Users size={12} aria-hidden />
          <span aria-label={`${supportCount} of ${totalVoters} voters`}>
            {supportCount}/{totalVoters}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-800">
          <Calendar size={14} className="text-neutral-400 shrink-0" aria-hidden />
          {date}
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-800">
          <Clock size={14} className="text-neutral-400 shrink-0" aria-hidden />
          {time}
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-800">
          <MapPin size={14} className="text-neutral-400 shrink-0" aria-hidden />
          {place}
        </div>
        {beforeAfter && (
          <div className="text-sm text-neutral-600 pl-[22px]">{beforeAfter}</div>
        )}
      </div>

      {/* Coverage bar */}
      <div>
        <ProgressBar
          value={voterCoverage * 100}
          label={`${percentToLabel(voterCoverage)} voter coverage`}
          showValue
          variant={voterCoverage >= 0.7 ? 'success' : voterCoverage >= 0.5 ? 'default' : 'warning'}
          size="sm"
        />
      </div>

      {/* Reasoning */}
      <p className="text-xs text-neutral-500 leading-relaxed italic">
        {rankingReason}
      </p>

      {/* Action */}
      {onSelect && (
        <Button
          variant={isPrimary ? 'primary' : 'outline'}
          size="sm"
          onClick={onSelect}
          fullWidth
        >
          {isPrimary ? 'Go with this' : 'Choose instead'}
        </Button>
      )}
    </div>
  )
}
