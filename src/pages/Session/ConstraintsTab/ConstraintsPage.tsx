import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/primitives/Button'
import { Input } from '@/components/primitives/Input'
import { ConstraintRow } from '@/components/domain/ConstraintRow'
import { SkeletonCard } from '@/components/primitives/Skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useConstraints, useUpdateConstraint, useAddConstraint } from '@/services/convex/constraints'
import type { ConstraintKind } from '@/types'
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

  if (isLoading) return <div className="p-6"><SkeletonCard count={3} /></div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-neutral-900">Constraints</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Review what was extracted. Accept, edit, or remove each item. Add anything the AI missed.
        </p>
      </div>

      {SECTIONS.map(section => {
        const items = constraints.filter(c => c.kind === section.kind)
        const visible = items.filter(c => c.state !== 'removed')

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

            {items.length === 0 && !addingKind ? (
              <EmptyState
                title={`No ${section.label.toLowerCase()} found`}
                description="Add one manually if needed."
              />
            ) : (
              <div className="divide-y divide-neutral-100">
                {items.map(c => (
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

            {items.length > 0 && (
              <p className="text-xs text-neutral-400">
                {visible.length} of {items.length} active
              </p>
            )}
          </section>
        )
      })}
    </div>
  )
}
