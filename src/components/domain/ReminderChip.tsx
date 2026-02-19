import { Bell, BellOff } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { ReminderMode } from '@/types'
import { formatTimezone } from '@/lib/formatting'

interface ReminderChipProps {
  state: ReminderMode
  timezone: string
  onStateChange: (state: ReminderMode) => void
  disabled?: boolean
}

const OPTIONS: Array<{ value: ReminderMode; label: string }> = [
  { value: 'off', label: 'Off' },
  { value: 'day-before', label: 'Day before' },
  { value: 'same-day', label: 'Same day' },
  { value: 'custom', label: 'Custom' },
]

export function ReminderChip({ state, timezone, onStateChange, disabled }: ReminderChipProps) {
  const isOff = state === 'off'
  const tz = formatTimezone(timezone)

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span aria-hidden className={cn('flex-shrink-0', isOff ? 'text-neutral-400' : 'text-primary-500')}>
          {isOff ? <BellOff size={16} /> : <Bell size={16} />}
        </span>
        <span className="text-sm font-medium text-neutral-700">Reminder</span>
        {!isOff && (
          <span className="text-xs text-neutral-500">{tz}</span>
        )}
      </div>
      <fieldset disabled={disabled} className="flex flex-wrap gap-2">
        <legend className="sr-only">Reminder schedule</legend>
        {OPTIONS.map(opt => (
          <label
            key={opt.value}
            className={cn(
              'flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-pill border text-sm font-medium',
              'transition-all duration-150 ease-ui',
              state === opt.value
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-white text-neutral-600 border-neutral-300 hover:border-neutral-400',
              disabled && 'opacity-40 cursor-not-allowed'
            )}
          >
            <input
              type="radio"
              name="reminder-state"
              value={opt.value}
              checked={state === opt.value}
              onChange={() => onStateChange(opt.value)}
              className="sr-only"
            />
            {opt.label}
          </label>
        ))}
      </fieldset>
    </div>
  )
}
