import { useParams } from 'react-router-dom'
import { SkeletonCard } from '@/components/primitives/Skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { VoteBadge } from '@/components/domain/VoteBadge'
import { ComboCard } from '@/components/domain/ComboCard'
import { ProgressBar } from '@/components/primitives/ProgressBar'
import { useVoteMatrix, useBestCombos } from '@/services/convex/votes'
import { usePoll } from '@/services/convex/polls'
import { BarChart2, Users, Trophy } from 'lucide-react'
import { cn } from '@/lib/cn'

export function VotesPage() {
  const { sessionId = '' } = useParams()
  const { poll } = usePoll(sessionId)
  const { matrix, isLoading: matrixLoading } = useVoteMatrix(poll?.id ?? '')
  const { combos, isLoading: combosLoading } = useBestCombos(poll?.id ?? '')

  const isLoading = matrixLoading || combosLoading

  if (isLoading) return <div className="p-6"><SkeletonCard count={3} /></div>

  if (!poll) {
    return (
      <EmptyState
        icon={<BarChart2 size={24} />}
        title="Poll not published yet"
        description="Publish the poll and collect votes first."
      />
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Votes</h2>
          <p className="text-sm text-neutral-500 mt-1">
            Live results updating in real time.
          </p>
        </div>

        {/* Quorum indicator */}
        {matrix && (
          <div className="text-right">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-neutral-700">
              <Users size={15} aria-hidden />
              {matrix.respondedVoters}/{matrix.totalVoters} responded
            </div>
            <ProgressBar
              value={matrix.respondedVoters}
              max={matrix.totalVoters}
              variant={matrix.respondedVoters >= matrix.totalVoters * 0.7 ? 'success' : 'default'}
              size="sm"
              className="mt-1 w-28"
            />
          </div>
        )}
      </div>

      {/* Best combo section */}
      {combos.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
            <Trophy size={15} className="text-amber-500" aria-hidden />
            Recommended combinations
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {combos.map((combo, i) => (
              <ComboCard
                key={i}
                {...combo}
                variant={i === 0 ? 'primary' : combo.voterCoverage < 0.5 ? 'low-confidence' : 'backup'}
                onSelect={() => {
                  // Navigate to finalize with this combo pre-filled
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Tally breakdown */}
      {matrix && (
        <section>
          <h3 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
            <BarChart2 size={15} aria-hidden />
            Full tally
          </h3>
          <div className="card divide-y divide-neutral-100">
            {matrix.tallies.map(tally => (
              <TallyRow key={tally.optionId} tally={tally} totalVoters={matrix.totalVoters} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

interface TallyRowProps {
  tally: {
    optionId: string
    label: string
    yes: number
    no: number
    maybe: number
    noResponse: number
    total: number
  }
  totalVoters: number
}

function TallyRow({ tally, totalVoters }: TallyRowProps) {
  const yesPct = tally.yes / totalVoters
  const isTopOption = yesPct >= 0.5

  return (
    <div className={cn('px-4 py-3 space-y-2', isTopOption && 'bg-emerald-50/40')}>
      <div className="flex items-center justify-between gap-2">
        <span className={cn('text-sm font-medium', isTopOption ? 'text-emerald-800' : 'text-neutral-800')}>
          {tally.label}
        </span>
        <div className="flex items-center gap-1.5">
          <VoteBadge type="yes" count={tally.yes} size="sm" />
          {tally.maybe > 0 && <VoteBadge type="maybe" count={tally.maybe} size="sm" />}
          {tally.no > 0 && <VoteBadge type="no" count={tally.no} size="sm" />}
          {tally.noResponse > 0 && <VoteBadge type="no-response" count={tally.noResponse} size="sm" />}
        </div>
      </div>
      <ProgressBar
        value={tally.yes}
        max={totalVoters}
        variant={yesPct >= 0.7 ? 'success' : yesPct >= 0.4 ? 'default' : 'warning'}
        size="sm"
      />
    </div>
  )
}
