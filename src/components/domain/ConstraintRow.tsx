import { useState } from 'react'
import { Check, Pencil, X, MessageSquare, Sparkles, User } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { Constraint, ProvenanceTag, ConfidenceLevel } from '@/types'

const PROVENANCE_CONFIG: Record<ProvenanceTag, { icon: React.ReactNode; label: string; color: string }> = {
  chat:   { icon: <MessageSquare size={10} />, label: 'Chat',   color: 'text-blue-500 bg-blue-50' },
  habit:  { icon: <Sparkles size={10} />,      label: 'Habit',  color: 'text-violet-500 bg-violet-50' },
  manual: { icon: <User size={10} />,          label: 'Manual', color: 'text-neutral-500 bg-neutral-100' },
}

const CONFIDENCE_CONFIG: Record<ConfidenceLevel, { label: string; color: string }> = {
  high:   { label: 'High',   color: 'text-emerald-600' },
  medium: { label: 'Med',    color: 'text-amber-600' },
  low:    { label: 'Low',    color: 'text-red-500' },
}

interface ConstraintRowProps {
  constraint: Constraint
  onAccept: (id: string) => void
  onEdit: (id: string, newText: string) => void
  onRemove: (id: string) => void
}

export function ConstraintRow({ constraint, onAccept, onEdit, onRemove }: ConstraintRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(constraint.text)

  const isRemoved = constraint.state === 'removed'
  const prov = PROVENANCE_CONFIG[constraint.provenance]
  const conf = CONFIDENCE_CONFIG[constraint.confidence]

  const commitEdit = () => {
    if (editValue.trim() && editValue !== constraint.text) {
      onEdit(constraint.id, editValue.trim())
    } else {
      setEditValue(constraint.text)
    }
    setIsEditing(false)
  }

  return (
    <div
      className={cn(
        'group flex items-start gap-3 p-3 rounded-lg transition-all duration-150',
        isRemoved ? 'opacity-40' : 'hover:bg-neutral-50',
      )}
      aria-label={`Constraint: ${constraint.text}`}
    >
      {/* State indicator */}
      <div className={cn(
        'mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
        constraint.state === 'accepted' || constraint.state === 'edited'
          ? 'border-emerald-500 bg-emerald-500 text-white'
          : 'border-neutral-300',
      )}>
        {(constraint.state === 'accepted' || constraint.state === 'edited') && (
          <Check size={10} aria-hidden />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={e => {
                if (e.key === 'Enter') commitEdit()
                if (e.key === 'Escape') { setEditValue(constraint.text); setIsEditing(false) }
              }}
              className="flex-1 text-sm border border-primary-400 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="button"
              onClick={commitEdit}
              aria-label="Save edit"
              className="text-xs text-emerald-600 font-medium hover:text-emerald-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => { setEditValue(constraint.text); setIsEditing(false) }}
              aria-label="Cancel edit"
              className="text-xs text-neutral-500 font-medium hover:text-neutral-700"
            >
              Cancel
            </button>
          </div>
        ) : (
          <p className={cn(
            'text-sm text-neutral-800 leading-snug',
            isRemoved && 'line-through text-neutral-400'
          )}>
            {constraint.text}
            {constraint.state === 'edited' && constraint.originalText && (
              <span className="ml-2 text-xs text-neutral-400">(edited)</span>
            )}
          </p>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-2 mt-1">
          <span className={cn('inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded font-medium', prov.color)}>
            <span aria-hidden>{prov.icon}</span>
            {prov.label}
          </span>
          <span className={cn('text-xs font-medium', conf.color)} aria-label={`${conf.label} confidence`}>
            {conf.label} confidence
          </span>
        </div>
      </div>

      {/* Actions */}
      {!isRemoved && !isEditing && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0 mt-0.5">
          {constraint.state === 'detected' && (
            <button
              type="button"
              onClick={() => onAccept(constraint.id)}
              aria-label="Accept constraint"
              className="h-7 w-7 flex items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
            >
              <Check size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            aria-label="Edit constraint"
            className="h-7 w-7 flex items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={() => onRemove(constraint.id)}
            aria-label="Remove constraint"
            className="h-7 w-7 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}
      {isRemoved && (
        <button
          type="button"
          onClick={() => onAccept(constraint.id)}
          aria-label="Restore constraint"
          className="text-xs text-neutral-500 hover:text-neutral-700 underline flex-shrink-0 mt-0.5"
        >
          Restore
        </button>
      )}
    </div>
  )
}
