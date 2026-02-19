import { cn } from '@/lib/cn'

interface ProgressBarProps {
  value: number  // 0-100
  max?: number
  variant?: 'default' | 'success' | 'warning'
  size?: 'sm' | 'md'
  label?: string
  showValue?: boolean
  className?: string
}

export function ProgressBar({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  label,
  showValue = false,
  className,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))

  const trackColor = 'bg-neutral-200'
  const fillColor = {
    default: 'bg-primary-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
  }[variant]

  const height = size === 'sm' ? 'h-1.5' : 'h-2'

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {(label || showValue) && (
        <div className="flex justify-between text-xs text-neutral-500">
          {label && <span>{label}</span>}
          {showValue && <span>{Math.round(pct)}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemax={max}
        aria-label={label}
        className={cn('w-full rounded-full overflow-hidden', height, trackColor)}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-ui', fillColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
