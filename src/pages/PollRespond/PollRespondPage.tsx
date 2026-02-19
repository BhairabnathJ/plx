import { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { CheckCircle2, ChevronRight } from 'lucide-react'
import { Button } from '@/components/primitives/Button'
import { SkeletonCard } from '@/components/primitives/Skeleton'
import { ErrorState } from '@/components/feedback/ErrorState'
import { usePollByToken, usePollOptions } from '@/services/convex/polls'
import { useSubmitVote } from '@/services/convex/votes'
import type { VoteType, PollOption, PollDimension } from '@/types'
import { track } from '@/lib/telemetry'
import { cn } from '@/lib/cn'
import { Calendar, Clock, MapPin, Sparkles } from 'lucide-react'

const DIMENSION_CONFIG: Record<PollDimension, { label: string; icon: React.ReactNode; isMulti: boolean }> = {
  date:   { label: 'Which dates work?',       icon: <Calendar size={18} />, isMulti: true },
  time:   { label: 'What time works?',        icon: <Clock size={18} />,    isMulti: true },
  place:  { label: 'What vibe are you feeling?', icon: <MapPin size={18} />, isMulti: false },
  before: { label: 'Meet up before?',         icon: <Sparkles size={18} />, isMulti: true },
  after:  { label: 'Any add-ons after?',      icon: <Sparkles size={18} />, isMulti: true },
}

export function PollRespondPage() {
  const { pollId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? 'abc123xyz'

  const { poll, isLoading: pollLoading } = usePollByToken(token)
  const { bundle, isLoading: optionsLoading } = usePollOptions(poll?.id ?? pollId)
  const { submitVote, isLoading: submitting } = useSubmitVote()

  const [votes, setVotes] = useState<Record<string, VoteType>>({})
  const [submitted, setSubmitted] = useState(false)

  const isLoading = pollLoading || optionsLoading

  const toggleVote = (optionId: string, value: VoteType, isMulti: boolean) => {
    setVotes(prev => {
      const next = { ...prev }
      if (isMulti) {
        if (next[optionId] === value) {
          delete next[optionId]
        } else {
          next[optionId] = value
        }
      } else {
        // For single-select: clear all options in same dimension, then set
        if (bundle) {
          const dimOptions = bundle.places
          dimOptions.forEach(o => { if (o.id !== optionId) delete next[o.id] })
        }
        if (next[optionId] === value) {
          delete next[optionId]
        } else {
          next[optionId] = value
        }
      }
      return next
    })
  }

  const handleSubmit = async () => {
    if (!poll) return
    await submitVote(poll.id, votes)
    track.voteSubmitted(poll.id)
    setSubmitted(true)
  }

  if (isLoading) return <SkeletonCard count={3} className="my-4" />

  if (!poll || !bundle) {
    return (
      <ErrorState
        title="Poll not found"
        description="This link may be expired or invalid."
      />
    )
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-5 py-12 text-center">
        <div className="h-20 w-20 rounded-3xl bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 size={40} className="text-emerald-600" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-neutral-900">Vote submitted! 🎉</h2>
          <p className="text-sm text-neutral-500">
            You voted on {Object.keys(votes).length} options. Results are live.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
          Edit my vote
        </Button>
      </div>
    )
  }

  const dimensionEntries: Array<[PollDimension, PollOption[]]> = [
    ['date', bundle.dates],
    ['time', bundle.times],
    ['place', bundle.places],
    ['before', bundle.before],
    ['after', bundle.after],
  ]
  const dimensions = dimensionEntries
    .filter(([, opts]) => opts.length > 0)
    .map(([dim, options]) => ({ dim, options }))

  const totalAnswered = Object.keys(votes).length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-xl font-bold text-neutral-900">Vote on the plan</h1>
        <p className="text-sm text-neutral-500 mt-1">Quick tap on what works for you.</p>
      </div>

      {/* Questions */}
      {dimensions.map(({ dim, options }) => {
        const cfg = DIMENSION_CONFIG[dim]
        const selectedCount = options.filter(o => votes[o.id]).length

        return (
          <section key={dim} className="card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-primary-500" aria-hidden>{cfg.icon}</span>
              <div className="flex-1">
                <h2 className="text-base font-semibold text-neutral-900">{cfg.label}</h2>
                <p className="text-xs text-neutral-400">
                  {cfg.isMulti ? 'Select all that work' : 'Pick one'} · {selectedCount} selected
                </p>
              </div>
            </div>

            <div className="space-y-2" role="group" aria-label={cfg.label}>
              {options.map(opt => {
                const selected = votes[opt.id] === 'yes'
                return (
                  <VoteOptionButton
                    key={opt.id}
                    label={opt.label}
                    selected={selected}
                    onSelect={() => toggleVote(opt.id, 'yes', cfg.isMulti)}
                  />
                )
              })}
            </div>
          </section>
        )
      })}

      {/* Submit */}
      <div className="sticky bottom-4 pt-2">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={submitting}
          onClick={handleSubmit}
          iconRight={<ChevronRight size={18} />}
        >
          Submit vote {totalAnswered > 0 && `(${totalAnswered} answered)`}
        </Button>
        <p className="text-xs text-neutral-400 text-center mt-2">
          You can edit your vote until the poll closes.
        </p>
      </div>
    </div>
  )
}

interface VoteOptionButtonProps {
  label: string
  selected: boolean
  onSelect: () => void
}

function VoteOptionButton({ label, selected, onSelect }: VoteOptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'w-full min-h-tap flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left',
        'transition-all duration-150 ease-ui',
        selected
          ? 'bg-primary-50 border-primary-400 text-primary-800'
          : 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50'
      )}
    >
      <div className={cn(
        'h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
        selected ? 'bg-primary-500 border-primary-500 text-white' : 'border-neutral-300'
      )}>
        {selected && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden>
            <path d="M1 4L3.5 6.5L9 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </button>
  )
}
