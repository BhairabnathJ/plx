import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/primitives/Button'
import { Input } from '@/components/primitives/Input'
import { Chip } from '@/components/primitives/Chip'
import { SkeletonCard } from '@/components/primitives/Skeleton'
import { SessionCard } from '@/components/domain/SessionCard'
import { NewSessionModal } from '@/components/domain/NewSessionModal'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useSessions } from '@/services/convex/sessions'
import type { SessionStatus } from '@/types'
import { CalendarDays } from 'lucide-react'

const STATUS_FILTERS: Array<{ label: string; value: SessionStatus | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Analyzed', value: 'analyzed' },
  { label: 'Polling', value: 'polling' },
  { label: 'Summarized', value: 'summarized' },
  { label: 'Finalized', value: 'finalized' },
]

export function SessionsPage() {
  const { groupId = 'group-1' } = useParams()
  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<SessionStatus | 'all'>('all')
  const { sessions, isLoading } = useSessions(groupId)

  const filtered = sessions.filter(s => {
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter
    const matchesSearch = !search || s.title.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-neutral-900">Planning sessions</h1>
        <Button
          variant="primary"
          size="sm"
          iconLeft={<Plus size={15} />}
          onClick={() => setModalOpen(true)}
        >
          New session
        </Button>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <Input
          placeholder="Search sessions…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          iconLeft={<Search size={16} />}
        />
        <div className="flex flex-wrap gap-2 overflow-x-auto">
          {STATUS_FILTERS.map(f => (
            <Chip
              key={f.value}
              label={f.label}
              selected={statusFilter === f.value}
              onClick={() => setStatusFilter(f.value)}
            />
          ))}
        </div>
      </div>

      {/* Sessions list */}
      {isLoading ? (
        <SkeletonCard count={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<CalendarDays size={24} />}
          title={search ? 'No matching sessions' : 'No sessions yet'}
          description={search ? 'Try a different search term.' : 'Start planning by creating a new session.'}
          action={!search ? { label: 'New session', onClick: () => setModalOpen(true) } : undefined}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map(s => (
            <SessionCard key={s.id} session={s} />
          ))}
        </div>
      )}

      <NewSessionModal
        groupId={groupId}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}
