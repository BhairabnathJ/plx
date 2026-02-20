import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCheck, Filter, Plus, RotateCcw } from 'lucide-react'
import { Button } from '@/components/primitives/Button'
import { Input } from '@/components/primitives/Input'
import { ConstraintRow } from '@/components/domain/ConstraintRow'
import { SkeletonCard } from '@/components/primitives/Skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useConstraints, useUpdateConstraint, useAddConstraint } from '@/services/convex/constraints'
import type { ConfidenceLevel, Constraint, ConstraintKind, ProvenanceTag } from '@/types'
import { track } from '@/lib/telemetry'
import { ShieldAlert, Heart, MapPin } from 'lucide-react'

const SECTIONS: Array<{ kind: ConstraintKind; label: string; icon: React.ReactNode; desc: string }> = [
  { kind: 'hard', label: 'Hard constraints', icon: <ShieldAlert size={15} />, desc: 'Must be respected — dealbreakers' },
  { kind: 'soft', label: 'Preferences', icon: <Heart size={15} />, desc: 'Nice to have, but flexible' },
  { kind: 'mention', label: 'Venue mentions', icon: <MapPin size={15} />, desc: 'Specific places mentioned' },
]

export function ConstraintsPage() {
  const { sessionId = '' } = useParams()
  const { constraints, isLoading } = useConstraints(sessionId)
  const { updateConstraint } = useUpdateConstraint()
  const { addConstraint } = useAddConstraint()

  const [addingKind, setAddingKind] = useState<ConstraintKind | null>(null)
  const [newText, setNewText] = useState('')
  const [confidenceFilter, setConfidenceFilter] = useState<ConfidenceLevel | 'all'>('all')
  const [provenanceFilter, setProvenanceFilter] = useState<ProvenanceTag | 'all'>('all')
  const [bulkBusy, setBulkBusy] = useState(false)
  const [lastBulk, setLastBulk] = useState<{ ids: string[]; previousStates: Record<string, Constraint['state']> } | null>(null)

  const handleAccept = async (id: string) => {
    await updateConstraint(id, { state: 'accepted' })
    track.constraintsEdited(sessionId, 1)
  }

  const handleEdit = async (id: string, text: string) => {
    await updateConstraint(id, { text, state: 'edited' })
    track.constraintsEdited(sessionId, 1)
  }

  const handleRemove = async (id: string) => {
    await updateConstraint(id, { state: 'removed' })
  }

  const handleAdd = async (kind: ConstraintKind) => {
    if (!newText.trim()) return
    await addConstraint({
      sessionId,
      kind,
      text: newText.trim(),
      state: 'accepted',
      provenance: 'manual',
      confidence: 'high',
    })
    setNewText('')
    setAddingKind(null)
  }

  const applyFilters = (items: Constraint[]) =>
    items.filter((c) => {
      const matchesConfidence = confidenceFilter === 'all' || c.confidence === confidenceFilter
      const matchesProvenance = provenanceFilter === 'all' || c.provenance === provenanceFilter
      return matchesConfidence && matchesProvenance
    })

  const bulkUpdate = async (target: Constraint['state']) => {
    const eligible = constraints.filter((c) => {
      if (c.state === 'removed') return false
      const matchesConfidence = confidenceFilter === 'all' || c.confidence === confidenceFilter
      const matchesProvenance = provenanceFilter === 'all' || c.provenance === provenanceFilter
      return matchesConfidence && matchesProvenance
    })
    if (eligible.length === 0) return
    setBulkBusy(true)
    try {
      const previousStates = Object.fromEntries(eligible.map((c) => [c.id, c.state]))
      await Promise.all(eligible.map((c) => updateConstraint(c.id, { state: target })))
      setLastBulk({ ids: eligible.map((c) => c.id), previousStates })
    } finally {
      setBulkBusy(false)
    }
  }

  const undoLastBulk = async () => {
    if (!lastBulk) return
    setBulkBusy(true)
    try {
      await Promise.all(lastBulk.ids.map((id) => updateConstraint(id, { state: lastBulk.previousStates[id] })))
      setLastBulk(null)
    } finally {
      setBulkBusy(false)
    }
  }

  if (isLoading) return <div className="p-6"><SkeletonCard count={3} /></div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-neutral-900">Constraints</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Review what was extracted. Accept, edit, or remove each item. Add anything the AI missed.
        </p>
      </div>

      <div className="card p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-neutral-800 inline-flex items-center gap-2">
            <Filter size={14} />
            Filters
          </p>
          {lastBulk && (
            <Button variant="ghost" size="sm" iconLeft={<RotateCcw size={13} />} onClick={undoLastBulk} loading={bulkBusy}>
              Undo bulk
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {(['all', 'high', 'medium', 'low'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setConfidenceFilter(value)}
              className={`px-2.5 py-1 rounded-lg text-xs border ${
                confidenceFilter === value ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white border-neutral-200 text-neutral-600'
              }`}
            >
              {value === 'all' ? 'All confidence' : `${value} confidence`}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {(['all', 'chat', 'habit', 'manual'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setProvenanceFilter(value)}
              className={`px-2.5 py-1 rounded-lg text-xs border ${
                provenanceFilter === value ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white border-neutral-200 text-neutral-600'
              }`}
            >
              {value === 'all' ? 'All sources' : value}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" iconLeft={<CheckCheck size={13} />} onClick={() => bulkUpdate('accepted')} loading={bulkBusy}>
            Accept filtered
          </Button>
          <Button variant="outline" size="sm" onClick={() => bulkUpdate('removed')} loading={bulkBusy}>
            Remove filtered
          </Button>
        </div>
      </div>

      {SECTIONS.map(section => {
        const items = constraints.filter(c => c.kind === section.kind)
        const filtered = applyFilters(items)
        const visible = filtered.filter(c => c.state !== 'removed')

        return (
          <section key={section.kind} className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-primary-500" aria-hidden>{section.icon}</span>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-800">{section.label}</h3>
                  <p className="text-xs text-neutral-400">{section.desc}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                iconLeft={<Plus size={13} />}
                onClick={() => setAddingKind(addingKind === section.kind ? null : section.kind)}
              >
                Add
              </Button>
            </div>

            {filtered.length === 0 && !addingKind ? (
              <EmptyState
                title={`No ${section.label.toLowerCase()} match filters`}
                description="Adjust filters or add one manually."
              />
            ) : (
              <div className="divide-y divide-neutral-100">
                {filtered.map(c => (
                  <ConstraintRow
                    key={c.id}
                    constraint={c}
                    onAccept={handleAccept}
                    onEdit={handleEdit}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            )}

            {/* Add form */}
            {addingKind === section.kind && (
              <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                <Input
                  placeholder={`Add a ${section.kind === 'mention' ? 'venue mention' : section.kind === 'hard' ? 'hard constraint' : 'preference'}…`}
                  value={newText}
                  onChange={e => setNewText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleAdd(section.kind)
                    if (e.key === 'Escape') { setAddingKind(null); setNewText('') }
                  }}
                  className="flex-1"
                  autoFocus
                />
                <Button variant="primary" size="sm" onClick={() => handleAdd(section.kind)}>
                  Add
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setAddingKind(null); setNewText('') }}>
                  Cancel
                </Button>
              </div>
            )}

            {filtered.length > 0 && (
              <p className="text-xs text-neutral-400">
                {visible.length} of {filtered.length} active
              </p>
            )}
          </section>
        )
      })}
    </div>
  )
}
