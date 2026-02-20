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
  const [lastGeneratedText, setLastGeneratedText] = useState<string | null>(null)
  const [manualMode, setManualMode] = useState(false)
  const [history, setHistory] = useState<Array<{ ts: number; tone: TonePreset; text: string; source: 'ai' | 'manual' }>>([])

  useEffect(() => {
    if (summary) {
      setText(summary.finalText ?? summary.draftText)
      setTone(summary.tone ?? 'friendly')
    }
  }, [summary])

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    setManualMode(false)
    try {
      const result = await generateSummary(sessionId, tone)
      setText(result.text)
      setLastGeneratedText(result.text)
      setHistory((previous) => [{ ts: Date.now(), tone, text: result.text, source: 'ai' as const }, ...previous].slice(0, 5))
      track.summaryGenerated(sessionId)
    } catch {
      setError('Failed to generate summary. Try again or edit manually.')
    } finally {
      setGenerating(false)
    }
  }

  const handleSave = async () => {
    await saveDraft(sessionId, text, tone)
    setHistory((previous) => [{ ts: Date.now(), tone, text, source: 'manual' as const }, ...previous].slice(0, 5))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const tones = (Object.keys(TONE_LABELS) as TonePreset[])
  const charCount = text.length
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const staleAfterFailure = !!error && !!lastGeneratedText

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
        <div className="space-y-2">
          <Textarea
            label="Draft message"
            value={text}
            onChange={e => setText(e.target.value)}
            rows={10}
            placeholder="Generate a summary or write your own message…"
            hint="All AI text is editable. Adjust the tone, facts, or wording before copying."
          />
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="text-neutral-500">
              {wordCount} words · {charCount} characters
            </div>
            <div className="inline-flex items-center gap-2">
              {manualMode ? (
                <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">Manual mode</span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-primary-50 text-primary-700">AI-assisted mode</span>
              )}
              {staleAfterFailure && (
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700">
                  Showing last generated draft
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <ErrorState
          title="Generation failed"
          description={error}
          onRetry={handleGenerate}
          onEditManually={() => {
            setError(null)
            setManualMode(true)
          }}
        />
      )}

      {history.length > 0 && (
        <div className="card p-3.5 space-y-2">
          <p className="text-sm font-medium text-neutral-700">Recent drafts</p>
          <div className="space-y-1.5">
            {history.map((item) => (
              <button
                key={item.ts}
                type="button"
                onClick={() => setText(item.text)}
                className="w-full text-left px-2.5 py-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
              >
                <p className="text-xs text-neutral-500">
                  {new Date(item.ts).toLocaleTimeString()} · {TONE_LABELS[item.tone] ?? item.tone} · {item.source}
                </p>
                <p className="text-sm text-neutral-700 truncate">{item.text}</p>
              </button>
            ))}
          </div>
        </div>
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
