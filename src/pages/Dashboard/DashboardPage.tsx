import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Calendar, TrendingUp } from 'lucide-react'
import { Button } from '@/components/primitives/Button'
import { SkeletonCard } from '@/components/primitives/Skeleton'
import { SessionCard } from '@/components/domain/SessionCard'
import { NewSessionModal } from '@/components/domain/NewSessionModal'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useGroup } from '@/services/convex/groups'
import { useSessions } from '@/services/convex/sessions'
import { useHabitProfile } from '@/services/convex/habits'

export function DashboardPage() {
  const { groupId = 'group-1' } = useParams()
  const [modalOpen, setModalOpen] = useState(false)
  const { group, isLoading: groupLoading } = useGroup(groupId)
  const { sessions, isLoading: sessionsLoading } = useSessions(groupId)
  const { profile } = useHabitProfile(groupId)

  const recentSessions = sessions.slice(0, 5)
  const activeSessions = sessions.filter(s => s.status !== 'finalized')

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-6">
      {/* Group header */}
      {groupLoading ? (
        <div className="card p-5">
          <SkeletonCard />
        </div>
      ) : group ? (
        <div className="card p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                {group.name[0]}
              </div>
              <div>
                <h1 className="text-lg font-bold text-neutral-900">{group.name}</h1>
                {group.description && (
                  <p className="text-sm text-neutral-500">{group.description}</p>
                )}
                <p className="text-xs text-neutral-400 mt-0.5">{group.memberCount} members</p>
              </div>
            </div>
            <Button
              variant="primary"
              size="md"
              iconLeft={<Plus size={16} />}
              onClick={() => setModalOpen(true)}
            >
              New session
            </Button>
          </div>
        </div>
      ) : null}

      {/* Habits snapshot */}
      {profile && (
        <div className="card p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
            <TrendingUp size={16} className="text-primary-500" aria-hidden />
            Group habits
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <HabitStat label="Best days" value={profile.preferredDays.slice(0, 2).join(', ')} />
            <HabitStat label="Best times" value={profile.preferredTimeWindows[0] ?? '—'} />
            <HabitStat label="Top areas" value={profile.preferredAreas.slice(0, 2).join(', ')} />
            <HabitStat label="Avg turnout" value={profile.avgTurnout != null ? `${Math.round(profile.avgTurnout * 100)}%` : '—'} />
          </div>
          <p className="text-xs text-neutral-400">Confidence: {profile.confidence}</p>
        </div>
      )}

      {/* Active sessions */}
      {activeSessions.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
            <Calendar size={15} aria-hidden />
            Active sessions
          </h2>
          <div className="space-y-2">
            {activeSessions.map(s => (
              <SessionCard key={s.id} session={s} />
            ))}
          </div>
        </section>
      )}

      {/* Recent sessions */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-neutral-700">Recent sessions</h2>
          {sessions.length > 0 && (
            <button
              type="button"
              className="text-xs text-primary-500 hover:text-primary-600 font-medium"
            >
              View all
            </button>
          )}
        </div>

        {sessionsLoading ? (
          <SkeletonCard count={3} />
        ) : recentSessions.length === 0 ? (
          <EmptyState
            icon={<Calendar size={24} />}
            title="No sessions yet"
            description="Create your first planning session to get started."
            action={{ label: 'New session', onClick: () => setModalOpen(true) }}
          />
        ) : (
          <div className="space-y-2">
            {recentSessions.map(s => (
              <SessionCard key={s.id} session={s} />
            ))}
          </div>
        )}
      </section>

      <NewSessionModal
        groupId={groupId}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}

function HabitStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-neutral-50 rounded-lg p-2.5 space-y-0.5">
      <p className="text-xs text-neutral-400 font-medium">{label}</p>
      <p className="text-sm font-semibold text-neutral-800 leading-snug">{value}</p>
    </div>
  )
}
