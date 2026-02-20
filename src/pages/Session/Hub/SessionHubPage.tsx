import { Link, useParams } from 'react-router-dom'
import { AlertCircle, CheckCircle2, ChevronRight, ClipboardList, MessageSquare, Share2, Vote, Wand2 } from 'lucide-react'
import { useSession } from '@/services/convex/sessions'
import { useConstraints } from '@/services/convex/constraints'
import { usePoll } from '@/services/convex/polls'
import { useSummary } from '@/services/convex/summaries'
import { cn } from '@/lib/cn'

type StageCard = {
  key: string
  title: string
  description: string
  icon: React.ReactNode
  to: string
  complete: boolean
  warning?: string
}

export function SessionHubPage() {
  const { groupId = '', sessionId = '' } = useParams()
  const { session } = useSession(sessionId)
  const { constraints } = useConstraints(sessionId)
  const { poll } = usePoll(sessionId)
  const { summary } = useSummary(sessionId)

  const hasContext = !!session?.contextText?.trim()
  const acceptedConstraints = constraints.filter((c) => c.state === 'accepted').length
  const hasSummary = !!summary?.finalText?.trim() || !!summary?.draftText?.trim()

  const stages: StageCard[] = [
    {
      key: 'context',
      title: 'Context',
      description: 'Import or paste conversation context.',
      icon: <MessageSquare size={16} />,
      to: 'context',
      complete: hasContext,
    },
    {
      key: 'constraints',
      title: 'Constraints',
      description: 'Review extracted constraints and preferences.',
      icon: <ClipboardList size={16} />,
      to: 'constraints',
      complete: acceptedConstraints > 0,
      warning: acceptedConstraints === 0 ? 'No accepted constraints yet.' : undefined,
    },
    {
      key: 'poll-builder',
      title: 'Poll Builder',
      description: 'Curate date, time, and vibe options.',
      icon: <Wand2 size={16} />,
      to: 'poll-builder',
      complete: !!poll,
    },
    {
      key: 'poll-share',
      title: 'Share Poll',
      description: 'Publish and distribute your poll link.',
      icon: <Share2 size={16} />,
      to: 'poll-share',
      complete: poll?.status === 'published',
    },
    {
      key: 'votes',
      title: 'Votes',
      description: 'Track response progress and best combo.',
      icon: <Vote size={16} />,
      to: 'votes',
      complete: session?.status === 'polling' || session?.status === 'summarized' || session?.status === 'finalized',
    },
    {
      key: 'summary',
      title: 'Summary',
      description: 'Generate and edit the recommendation message.',
      icon: <ClipboardList size={16} />,
      to: 'summary',
      complete: hasSummary,
    },
    {
      key: 'finalize',
      title: 'Finalize',
      description: 'Lock event details and reminders.',
      icon: <CheckCircle2 size={16} />,
      to: 'finalize',
      complete: session?.status === 'finalized',
    },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-neutral-900">Session Overview</h2>
        <p className="text-sm text-neutral-500">
          Jump to any stage. You are not locked into a linear wizard.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {stages.map((stage) => (
          <Link
            key={stage.key}
            to={`/app/${groupId}/sessions/${sessionId}/${stage.to}`}
            className={cn(
              'card p-4 rounded-xl border transition-colors',
              stage.complete ? 'border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50' : 'border-neutral-200 bg-white hover:bg-neutral-50'
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'h-8 w-8 rounded-lg flex items-center justify-center',
                  stage.complete ? 'bg-emerald-100 text-emerald-700' : 'bg-primary-50 text-primary-600'
                )}
              >
                {stage.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-neutral-900">{stage.title}</h3>
                  <ChevronRight size={14} className="text-neutral-400" />
                </div>
                <p className="text-xs text-neutral-500 mt-1">{stage.description}</p>
                {stage.warning && (
                  <p className="text-xs text-amber-700 mt-2 inline-flex items-center gap-1">
                    <AlertCircle size={12} />
                    {stage.warning}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
