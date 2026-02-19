import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Wand2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/primitives/Button'
import { Input } from '@/components/primitives/Input'
import { OptionPill } from '@/components/domain/OptionPill'
import { SkeletonCard } from '@/components/primitives/Skeleton'
import { usePollOptions, useUpdatePollOption, useAddPollOption } from '@/services/convex/polls'
import { POLL_OPTION_LIMITS } from '@/types'
import type { PollDimension, PollOption } from '@/types'
import { cn } from '@/lib/cn'
import { Calendar, Clock, MapPin, Sparkles } from 'lucide-react'

const DIMENSION_CONFIG: Record<PollDimension, {
  label: string
  icon: React.ReactNode
  selectionType: string
  plural: string
}> = {
  date: { label: 'Dates', icon: <Calendar size={16} />, selectionType: 'Multi-select', plural: 'dates' },
  time: { label: 'Times', icon: <Clock size={16} />, selectionType: 'Multi-select', plural: 'times' },
  place: { label: 'Place vibe', icon: <MapPin size={16} />, selectionType: 'Single choice', plural: 'places' },
  'before-after': { label: 'Before / After', icon: <Sparkles size={16} />, selectionType: 'Multi-select', plural: 'options' },
}

export function PollBuilderPage() {
  const { sessionId = '' } = useParams()
  const { bundle, isLoading } = usePollOptions(sessionId === 'session-1' ? 'poll-1' : '')
  const { updateOption } = useUpdatePollOption()
  const { addOption } = useAddPollOption()

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [addingDimension, setAddingDimension] = useState<PollDimension | null>(null)
  const [newOptionLabel, setNewOptionLabel] = useState('')
  const [generating, setGenerating] = useState(false)

  if (isLoading) return <div className="p-6"><SkeletonCard count={4} /></div>

  const getDimensionOptions = (dim: PollDimension): PollOption[] => {
    if (!bundle) return []
    const map: Record<PollDimension, PollOption[]> = {
      date: bundle.dates,
      time: bundle.times,
      place: bundle.places,
      'before-after': bundle.beforeAfter,
    }
    return map[dim] ?? []
  }

  const toggleOption = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleAddOption = async (dim: PollDimension) => {
    if (!newOptionLabel.trim() || !bundle) return
    await addOption({
      pollId: bundle.pollId,
      dimension: dim,
      label: newOptionLabel.trim(),
      selectionType: dim === 'place' ? 'single' : 'multi',
      sortOrder: 999,
    })
    setNewOptionLabel('')
    setAddingDimension(null)
  }

  const handleGenerate = async () => {
    setGenerating(true)
    await new Promise(r => setTimeout(r, 1500))
    setGenerating(false)
  }

  const dimensions: PollDimension[] = ['date', 'time', 'place', 'before-after']

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Poll Builder</h2>
          <p className="text-sm text-neutral-500 mt-1">
            Curate your options. Select which to include in the poll, or add new ones.
          </p>
        </div>
        {!bundle && (
          <Button
            variant="primary"
            size="sm"
            iconLeft={<Wand2 size={14} />}
            loading={generating}
            onClick={handleGenerate}
          >
            Generate options
          </Button>
        )}
      </div>

      {!bundle ? (
        <div className="card p-8 flex flex-col items-center gap-4 text-center">
          <div className="h-12 w-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-500">
            <Wand2 size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-800">No options generated yet</p>
            <p className="text-sm text-neutral-500 mt-1">
              Make sure constraints are reviewed, then generate options.
            </p>
          </div>
          <Button variant="primary" size="md" loading={generating} onClick={handleGenerate}
            iconLeft={<Wand2 size={15} />}>
            Generate poll options
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {dimensions.map(dim => {
            const options = getDimensionOptions(dim)
            const cfg = DIMENSION_CONFIG[dim]
            const limits = POLL_OPTION_LIMITS[dim]
            const isOverLimit = options.length > limits.max
            const isUnderLimit = options.length < limits.min

            return (
              <div key={dim} className="card p-4 space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-primary-500" aria-hidden>{cfg.icon}</span>
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-800">{cfg.label}</h3>
                      <p className="text-xs text-neutral-400">{cfg.selectionType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'text-xs font-medium',
                      isOverLimit ? 'text-amber-600' : 'text-neutral-400'
                    )}>
                      {options.length}/{limits.max} {cfg.plural}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      iconLeft={<Plus size={13} />}
                      onClick={() => setAddingDimension(addingDimension === dim ? null : dim)}
                    >
                      Add
                    </Button>
                  </div>
                </div>

                {/* Pills */}
                <div className="flex flex-wrap gap-2">
                  {options.map(opt => (
                    <OptionPill
                      key={opt.id}
                      label={opt.label}
                      selected={selectedIds.size === 0 || selectedIds.has(opt.id)}
                      onToggle={() => toggleOption(opt.id)}
                      onRemove={() => updateOption(opt.id, {})}
                      onRename={label => updateOption(opt.id, { label })}
                    />
                  ))}
                </div>

                {/* Warnings */}
                {isOverLimit && (
                  <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg p-2.5">
                    <AlertCircle size={13} className="mt-0.5 shrink-0" aria-hidden />
                    Too many options may reduce response rate. Aim for {limits.max} or fewer.
                  </div>
                )}
                {isUnderLimit && options.length > 0 && (
                  <div className="flex items-start gap-2 text-xs text-neutral-500">
                    <AlertCircle size={13} className="mt-0.5 shrink-0" aria-hidden />
                    Consider adding more {cfg.plural} (min {limits.min} recommended).
                  </div>
                )}

                {/* Add form */}
                {addingDimension === dim && (
                  <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                    <Input
                      placeholder={`New ${dim === 'date' ? 'date' : dim === 'time' ? 'time' : dim === 'place' ? 'place vibe' : 'option'}…`}
                      value={newOptionLabel}
                      onChange={e => setNewOptionLabel(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleAddOption(dim)
                        if (e.key === 'Escape') { setAddingDimension(null); setNewOptionLabel('') }
                      }}
                      className="flex-1"
                      autoFocus
                    />
                    <Button variant="primary" size="sm" onClick={() => handleAddOption(dim)}>Add</Button>
                    <Button variant="ghost" size="sm" onClick={() => { setAddingDimension(null); setNewOptionLabel('') }}>Cancel</Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
