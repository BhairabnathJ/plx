import { useParams } from 'react-router-dom'
import { Calendar, TrendingUp, Users, MapPin } from 'lucide-react'
import { SkeletonCard } from '@/components/primitives/Skeleton'
import { SessionStatusBadge } from '@/components/domain/SessionStatusBadge'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useSessions } from '@/services/convex/sessions'
import { useHabitProfile } from '@/services/convex/habits'
import { formatRelative } from '@/lib/formatting'

export function HistoryPage() {
  const { groupId = 'group-1' } = useParams()
  const { sessions, isLoading } = useSessions(groupId)
  const { profile } = useHabitProfile(groupId)

  const finalized = sessions.filter(s => s.status === 'finalized')
  const all = sessions

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold text-neutral-900">History</h1>

      {/* Trends */}
      {profile && (
        <div className="card p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
            <TrendingUp size={16} className="text-primary-500" aria-hidden />
            Group trends
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.preferredDays.map(d => (
              <TrendChip key={d} icon={<Calendar size={12} />} label={d} />
            ))}
            {profile.preferredTimeWindows.map(t => (
              <TrendChip key={t} icon={<Calendar size={12} />} label={t} />
            ))}
            {profile.preferredAreas.map(a => (
              <TrendChip key={a} icon={<MapPin size={12} />} label={a} />
            ))}
          </div>
          {profile.avgTurnout != null && (
            <p className="text-xs text-neutral-500 flex items-center gap-1">
              <Users size={12} aria-hidden />
              Avg turnout: {Math.round(profile.avgTurnout * 100)}%
            </p>
          )}
        </div>
      )}

      {/* Finalized events */}
      <section>
        <h2 className="text-sm font-semibold text-neutral-700 mb-3">Finalized events</h2>
        {isLoading ? (
          <SkeletonCard count={2} />
        ) : finalized.length === 0 ? (
          <EmptyState
            icon={<Calendar size={24} />}
            title="No finalized plans yet"
            description="Once you finalize a session, it'll appear here."
          />
        ) : (
          <div className="space-y-2">
            {finalized.map(s => (
              <div key={s.id} className="card p-4 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-neutral-900">{s.title}</p>
                  {s.activityType && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded font-medium">{s.activityType}</span>
                    </div>
                  )}
                  <p className="text-xs text-neutral-400">{formatRelative(s.updatedAt)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <SessionStatusBadge status={s.status} />
                  <span className="text-xs text-emerald-600 font-medium">High turnout</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* All sessions */}
      <section>
        <h2 className="text-sm font-semibold text-neutral-700 mb-3">All sessions</h2>
        {isLoading ? (
          <SkeletonCard count={3} />
        ) : all.length === 0 ? (
          <EmptyState title="No sessions" />
        ) : (
          <div className="space-y-2">
            {all.map(s => (
              <div key={s.id} className="card p-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-800 truncate">{s.title}</p>
                  <p className="text-xs text-neutral-400">{s.timeframe}</p>
                </div>
                <SessionStatusBadge status={s.status} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function TrendChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded-pill text-xs font-medium">
      <span className="text-neutral-400" aria-hidden>{icon}</span>
      {label}
    </span>
  )
}
