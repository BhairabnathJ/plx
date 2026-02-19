import { useState } from 'react'
import { Check, X, Pencil } from 'lucide-react'
import { cn } from '@/lib/cn'

interface OptionPillProps {
  label: string
  selected?: boolean
  disabled?: boolean
  count?: number
  onToggle?: () => void
  onRemove?: () => void
  onRename?: (value: string) => void
  className?: string
}

export function OptionPill({
  label,
  selected = false,
  disabled = false,
  count,
  onToggle,
  onRemove,
  onRename,
  className,
}: OptionPillProps) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(label)

  const commitEdit = () => {
    if (editValue.trim() && editValue !== label) {
      onRename?.(editValue.trim())
    } else {
      setEditValue(label)
    }
    setEditing(false)
  }

  return (
    <div
      className={cn(
        'group inline-flex items-center min-h-tap rounded-pill border transition-all duration-150 ease-ui',
        'text-sm font-medium select-none',
        selected
          ? 'bg-primary-500 border-primary-500 text-white shadow-sm'
          : 'bg-white border-neutral-300 text-neutral-700 hover:border-neutral-400',
        disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
        !disabled && 'cursor-pointer',
        className
      )}
    >
      {/* Main pill body */}
      {editing ? (
        <input
          autoFocus
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={e => {
            if (e.key === 'Enter') commitEdit()
            if (e.key === 'Escape') { setEditValue(label); setEditing(false) }
          }}
          onClick={e => e.stopPropagation()}
          className={cn(
            'min-w-[80px] max-w-[160px] bg-transparent outline-none pl-3 pr-2 py-2',
            selected ? 'placeholder-primary-200' : 'placeholder-neutral-400'
          )}
          aria-label="Edit option label"
        />
      ) : (
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          aria-pressed={selected}
          className="flex items-center gap-2 pl-3 pr-2 py-2 min-w-0"
        >
          {selected && <Check size={13} aria-hidden className="shrink-0" />}
          <span className="truncate">{label}</span>
          {count !== undefined && (
            <span
              aria-label={`${count} votes`}
              className={cn(
                'text-xs rounded-full px-1.5 py-0.5 font-semibold',
                selected ? 'bg-primary-400 text-white' : 'bg-neutral-100 text-neutral-600'
              )}
            >
              {count}
            </span>
          )}
        </button>
      )}

      {/* Action buttons (shown on hover) */}
      {!editing && !disabled && (
        <div className={cn(
          'flex items-center pr-1 gap-0.5 overflow-hidden',
          (onRename || onRemove) ? 'opacity-0 group-hover:opacity-100 transition-opacity duration-150' : 'hidden'
        )}>
          {onRename && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); setEditing(true) }}
              aria-label="Rename option"
              className={cn(
                'h-6 w-6 flex items-center justify-center rounded-full transition-colors',
                selected ? 'hover:bg-primary-400' : 'hover:bg-neutral-100'
              )}
            >
              <Pencil size={11} />
            </button>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onRemove() }}
              aria-label="Remove option"
              className={cn(
                'h-6 w-6 flex items-center justify-center rounded-full transition-colors',
                selected ? 'hover:bg-primary-400' : 'hover:bg-neutral-100'
              )}
            >
              <X size={11} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
