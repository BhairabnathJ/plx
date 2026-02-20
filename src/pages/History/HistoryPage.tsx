import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Calendar, Clock3, MapPin, TrendingUp, Users } from 'lucide-react'
import { SkeletonCard } from '@/components/primitives/Skeleton'
import { SessionStatusBadge } from '@/components/domain/SessionStatusBadge'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useSessions } from '@/services/convex/sessions'
import { useHabitProfile } from '@/services/convex/habits'
import { formatRelative } from '@/lib/formatting'

export function HistoryPage() {
  const { groupId = '' } = useParams()
  const { sessions, isLoading } = useSessions(groupId)
  const { profile } = useHabitProfile(groupId)

  const finalized = useMemo(() => sessions.filter((session) => session.status === 'finalized'), [sessions])
  const active = useMemo(() => sessions.filter((session) => session.status !== 'finalized'), [sessions])

  const topActivities = useMemo(() => {
    const counter = new Map<string, number>()
    sessions.forEach((session) => {
      const key = session.activityType?.trim()
      if (!key) return
      counter.set(key, (counter.get(key) ?? 0) + 1)
    })
    return [...counter.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3)
  }, [sessions])

  if (!groupId) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="card p-5 text-sm text-neutral-600">Select a group to view history.</div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-neutral-900">History</h1>
        <p className="text-sm text-neutral-500">Past sessions, outcome patterns, and recurring timing signals.</p>
      </div>

      <section className="grid sm:grid-cols-3 gap-3">
        <TrendStat icon={<Calendar size={16} />} label="Total sessions" value={String(sessions.length)} />
        <TrendStat icon={<Users size={16} />} label="Finalized events" value={String(finalized.length)} />
        <TrendStat icon={<TrendingUp size={16} />} label="In-progress sessions" value={String(active.length)} />
      </section>

      {(profile || topActivities.length > 0) && (
        <section className="card p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
            <TrendingUp size={16} className="text-primary-500" aria-hidden />
            Trend signals
          </div>

          {profile && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {profile.preferredDays.map((day) => (
                  <TrendChip key={day} icon={<Calendar size={12} />} label={day} />
                ))}
                {profile.preferredTimeWindows.map((window) => (
                  <TrendChip key={window} icon={<Clock3 size={12} />} label={window} />
                ))}
                {profile.preferredAreas.map((area) => (
                  <TrendChip key={area} icon={<MapPin size={12} />} label={area} />
                ))}
              </div>
              {profile.avgTurnout != null && (
                <p className="text-xs text-neutral-500">Average turnout signal: {Math.round(profile.avgTurnout * 100)}%</p>
              )}
            </div>
          )}

          {topActivities.length > 0 && (
            <div className="pt-1">
              <p className="text-xs text-neutral-500 mb-2">Top activity types</p>
              <div className="flex flex-wrap gap-2">
                {topActivities.map(([activity, count]) => (
                  <span key={activity} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded-pill text-xs font-medium">
                    {activity}
                    <span className="text-neutral-400">({count})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <section>
        <h2 className="text-sm font-semibold text-neutral-700 mb-3">Finalized events</h2>
        {isLoading ? (
          <SkeletonCard count={2} />
        ) : finalized.length === 0 ? (
          <EmptyState
            icon={<Calendar size={24} />}
            title="No finalized plans yet"
            description="Once a session is finalized, it appears here with outcome context."
          />
        ) : (
          <div className="space-y-2">
            {finalized.map((session) => (
              <Link
                key={session.id}
                to={`/app/${groupId}/sessions/${session.id}/overview`}
                className="card p-4 flex items-start justify-between gap-3 hover:bg-neutral-50 transition-colors"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-neutral-900">{session.title}</p>
                  {session.activityType && (
                    <span className="inline-flex text-xs px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded font-medium">
                      {session.activityType}
                    </span>
                  )}
                  <p className="text-xs text-neutral-400">{formatRelative(session.updatedAt)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <SessionStatusBadge status={session.status} />
                  <span className="text-xs text-emerald-600 font-medium">Completed</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-neutral-700 mb-3">All sessions</h2>
        {isLoading ? (
          <SkeletonCard count={3} />
        ) : sessions.length === 0 ? (
          <EmptyState title="No sessions yet" description="Start a session and it will appear in this timeline." />
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <Link
                key={session.id}
                to={`/app/${groupId}/sessions/${session.id}/overview`}
                className="card p-3.5 flex items-center justify-between gap-3 hover:bg-neutral-50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-800 truncate">{session.title}</p>
                  <p className="text-xs text-neutral-400">{session.timeframe || 'No timeframe set'}</p>
                </div>
                <SessionStatusBadge status={session.status} />
              </Link>
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

function TrendStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="card p-3.5">
      <p className="text-xs text-neutral-500 inline-flex items-center gap-1.5">{icon}{label}</p>
      <p className="text-xl font-bold text-neutral-900 mt-1">{value}</p>
    </div>
  )
}
