import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Link2, MessageSquare, Send, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/primitives/Button'
import { usePoll, usePublishPoll } from '@/services/convex/polls'
import { useSession } from '@/services/convex/sessions'
import { useClipboard } from '@/hooks/useClipboard'
import { track } from '@/lib/telemetry'

export function PollSharePage() {
  const { sessionId = '' } = useParams()
  const { session } = useSession(sessionId)
  const { poll } = usePoll(sessionId)
  const { publishPoll, isLoading: publishing } = usePublishPoll()
  const { copy: copyLink, copied: linkCopied } = useClipboard()
  const { copy: copyWA, copied: waCopied } = useClipboard()

  const [pollUrl, setPollUrl] = useState<string | null>(
    poll?.status === 'published'
      ? `${window.location.origin}/app/group-1/polls/${poll.id}?token=${poll.publishToken}`
      : null
  )

  const handlePublish = async () => {
    if (!poll) return
    const url = await publishPoll(poll.id)
    setPollUrl(url)
    track.pollPublished(poll.id)
  }

  const waText = pollUrl
    ? `Hey everyone! 👋\n\n${session?.title ?? 'Planning session'} — quick vote needed:\n\n${pollUrl}\n\nTakes 30 seconds, vote before we lose momentum! 🙏`
    : ''

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div>
        <h2 className="text-lg font-bold text-neutral-900">Share Poll</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Publish the poll and share the link with your group.
        </p>
      </div>

      {!pollUrl ? (
        <div className="card p-6 flex flex-col items-center gap-4 text-center">
          <div className="h-14 w-14 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-500">
            <Send size={26} />
          </div>
          <div>
            <p className="text-base font-semibold text-neutral-900">Ready to publish?</p>
            <p className="text-sm text-neutral-500 mt-1">
              Publishing creates a shareable mobile-friendly poll link.
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            loading={publishing}
            iconLeft={<Send size={16} />}
            onClick={handlePublish}
          >
            Publish poll
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Published status */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
            <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0" aria-hidden />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-emerald-800">Poll is live</p>
              <p className="text-xs text-emerald-600 truncate">{pollUrl}</p>
            </div>
          </div>

          {/* Copy link */}
          <div className="card p-4 space-y-3">
            <h3 className="text-sm font-semibold text-neutral-800 flex items-center gap-2">
              <Link2 size={15} aria-hidden />
              Poll link
            </h3>
            <div className="flex items-center gap-2 bg-neutral-50 rounded-lg px-3 py-2">
              <code className="flex-1 text-xs text-neutral-600 truncate">{pollUrl}</code>
            </div>
            <Button
              variant={linkCopied ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => copyLink(pollUrl)}
              fullWidth
              iconLeft={linkCopied ? <CheckCircle2 size={15} /> : <Link2 size={15} />}
            >
              {linkCopied ? 'Copied!' : 'Copy link'}
            </Button>
          </div>

          {/* WhatsApp text */}
          <div className="card p-4 space-y-3">
            <h3 className="text-sm font-semibold text-neutral-800 flex items-center gap-2">
              <MessageSquare size={15} aria-hidden />
              WhatsApp-ready message
            </h3>
            <div className="bg-neutral-50 rounded-lg p-3">
              <pre className="text-sm text-neutral-700 whitespace-pre-wrap font-sans leading-relaxed">
                {waText}
              </pre>
            </div>
            <Button
              variant={waCopied ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => copyWA(waText)}
              fullWidth
              iconLeft={waCopied ? <CheckCircle2 size={15} /> : <MessageSquare size={15} />}
            >
              {waCopied ? 'Copied!' : 'Copy WhatsApp text'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
