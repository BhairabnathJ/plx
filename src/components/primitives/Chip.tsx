import { cn } from '@/lib/cn'

interface ChipProps {
  label: string
  selected?: boolean
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export function Chip({ label, selected = false, onClick, disabled = false, className }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        'inline-flex items-center h-8 px-3.5 rounded-pill text-sm font-medium',
        'transition-all duration-150 ease-ui',
        'border',
        selected
          ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
          : 'bg-white text-neutral-600 border-neutral-300 hover:border-neutral-400 hover:text-neutral-700',
        disabled && 'opacity-40 cursor-not-allowed',
        className
      )}
    >
      {label}
    </button>
  )
}
