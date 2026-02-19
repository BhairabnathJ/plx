import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { MessageSquarePlus, Sparkles, FileText } from 'lucide-react'
import { Button } from '@/components/primitives/Button'
import { Textarea } from '@/components/primitives/Textarea'
import { ErrorState } from '@/components/feedback/ErrorState'
import { useSession, useUpdateSessionStatus } from '@/services/convex/sessions'
import { analyzeSession } from '@/services/api/session'
import { track } from '@/lib/telemetry'

export function ContextPage() {
  const { sessionId = '' } = useParams()
  const { session } = useSession(sessionId)
  const { updateStatus } = useUpdateSessionStatus()
  const [additionalText, setAdditionalText] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!session) return null

  const handleAnalyze = async () => {
    const contextText = [session.contextText ?? '', additionalText].filter(Boolean).join('\n\n')
    if (!contextText.trim()) return

    setAnalyzing(true)
    setError(null)

    try {
      await analyzeSession(session.id, contextText)
      await updateStatus(session.id, 'analyzed')
      track.analysisTriggered(session.id)
    } catch {
      setError('Analysis failed. Check your connection and try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  const hasContext = !!(session.contextText?.trim()) || !!additionalText.trim()
  const isAlreadyAnalyzed = session.status !== 'draft'

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div>
        <h2 className="text-lg font-bold text-neutral-900">Context</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Review the imported conversation, add more if needed, then run analysis.
        </p>
      </div>

      {/* Imported snippets */}
      {session.contextText && (
        <div className="card p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
            <FileText size={13} aria-hidden />
            Imported context
          </div>
          <pre className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed font-sans bg-neutral-50 rounded-lg p-3 max-h-48 overflow-y-auto">
            {session.contextText}
          </pre>
        </div>
      )}

      {/* Add more */}
      <div className="space-y-3">
        <Textarea
          label="Add more context"
          placeholder="Paste additional messages, add notes, or specify extra constraints…"
          value={additionalText}
          onChange={e => setAdditionalText(e.target.value)}
          rows={4}
          iconLeft={<MessageSquarePlus size={15} />}
        />
      </div>

      {/* Error */}
      {error && (
        <ErrorState
          title="Analysis failed"
          description={error}
          onRetry={handleAnalyze}
          onEditManually={() => setError(null)}
        />
      )}

      {/* Analyze CTA */}
      {isAlreadyAnalyzed ? (
        <div className="card p-4 flex items-center gap-3 bg-emerald-50 border-emerald-200">
          <Sparkles size={18} className="text-emerald-600" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-emerald-800">Analysis complete</p>
            <p className="text-xs text-emerald-600">Constraints have been extracted. Review them in the Constraints tab.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAnalyze}
            loading={analyzing}
            className="ml-auto"
          >
            Re-analyze
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-neutral-400">
            Analysis extracts constraints, preferences, and venue mentions from your context.
          </p>
          <Button
            variant="primary"
            size="md"
            loading={analyzing}
            disabled={!hasContext}
            iconLeft={<Sparkles size={16} />}
            onClick={handleAnalyze}
          >
            {analyzing ? 'Analyzing…' : 'Analyze conversation'}
          </Button>
        </div>
      )}
    </div>
  )
}
