import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Wand2, Copy, Save, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/primitives/Button'
import { Textarea } from '@/components/primitives/Textarea'
import { Chip } from '@/components/primitives/Chip'
import { SkeletonBlock } from '@/components/primitives/Skeleton'
import { ErrorState } from '@/components/feedback/ErrorState'
import { useSummary, useSaveSummaryDraft } from '@/services/convex/summaries'
import { generateSummary } from '@/services/api/summary'
import { formatLlmError } from '@/services/api/llmClient'
import { useClipboard } from '@/hooks/useClipboard'
import { track } from '@/lib/telemetry'
import type { TonePreset } from '@/types'
import { TONE_LABELS } from '@/lib/constants'

export function SummaryPage() {
  const { sessionId = '' } = useParams()
  const { summary } = useSummary(sessionId)
  const { saveDraft, isLoading: saving } = useSaveSummaryDraft()
  const { copy, copied } = useClipboard()

  const [text, setText] = useState(summary?.finalText ?? summary?.draftText ?? '')
  const [tone, setTone] = useState<TonePreset>(summary?.tone ?? 'friendly')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (summary) {
      setText(summary.finalText ?? summary.draftText)
      setTone(summary.tone ?? 'friendly')
    }
  }, [summary])

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    try {
      const result = await generateSummary(sessionId, tone)
      setText(result.text)
      track.summaryGenerated(sessionId)
    } catch (err) {
      setError(formatLlmError(err))
    } finally {
      setGenerating(false)
    }
  }

  const handleSave = async () => {
    await saveDraft(sessionId, text, tone)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const tones = (Object.keys(TONE_LABELS) as TonePreset[])

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div>
        <h2 className="text-lg font-bold text-neutral-900">Summary</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Generate a channel-ready message. Edit it before copying to your group.
        </p>
      </div>

      {/* Tone selector */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-neutral-700">Tone</p>
        <div className="flex gap-2">
          {tones.map(t => (
            <Chip
              key={t}
              label={TONE_LABELS[t] ?? t}
              selected={tone === t}
              onClick={() => setTone(t)}
            />
          ))}
        </div>
      </div>

      {/* Draft editor */}
      {generating ? (
        <div className="card p-4 space-y-2">
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-5/6" />
          <SkeletonBlock className="h-4 w-4/5" />
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-3/4" />
        </div>
      ) : (
        <Textarea
          label="Draft message"
          value={text}
          onChange={e => setText(e.target.value)}
          rows={10}
          placeholder="Generate a summary or write your own message…"
          hint="All AI text is editable. Adjust the tone, facts, or wording before copying."
        />
      )}

      {/* Error */}
      {error && (
        <ErrorState
          title="Generation failed"
          description={error}
          onRetry={handleGenerate}
          onEditManually={() => setError(null)}
        />
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          iconLeft={<Wand2 size={15} />}
          onClick={handleGenerate}
          loading={generating}
        >
          {summary ? 'Regenerate' : 'Generate draft'}
        </Button>

        <div className="flex-1" />

        <Button
          variant={saved ? 'secondary' : 'ghost'}
          size="sm"
          iconLeft={saved ? <CheckCircle2 size={15} /> : <Save size={15} />}
          onClick={handleSave}
          loading={saving}
          disabled={!text.trim()}
        >
          {saved ? 'Saved!' : 'Save draft'}
        </Button>

        <Button
          variant={copied ? 'secondary' : 'primary'}
          size="sm"
          iconLeft={copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
          onClick={() => copy(text)}
          disabled={!text.trim()}
        >
          {copied ? 'Copied!' : 'Copy message'}
        </Button>
      </div>
    </div>
  )
}
