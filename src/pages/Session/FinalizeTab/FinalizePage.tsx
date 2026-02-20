import { useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Calendar, CheckCircle2, Clock, MapPin, Users } from 'lucide-react'
import { Button } from '@/components/primitives/Button'
import { Input } from '@/components/primitives/Input'
import { ReminderChip } from '@/components/domain/ReminderChip'
import { useAttendanceSnapshot, useEvent, useFinalizeEvent } from '@/services/convex/events'
import { useSession, useUpdateSessionStatus } from '@/services/convex/sessions'
import { useBestCombos } from '@/services/convex/votes'
import { usePoll } from '@/services/convex/polls'
import { track } from '@/lib/telemetry'
import type { ReminderMode } from '@/types'

function toDateInputValue(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function toTimeInputValue(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function combineLocalDateTime(date: string, time: string) {
  const candidate = new Date(`${date}T${time}`)
  if (Number.isNaN(candidate.getTime())) return null
  return candidate.toISOString()
}

function isValidUrl(value: string) {
  if (!value.trim()) return true
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function reminderLabel(mode: ReminderMode) {
  if (mode === 'day-before') return 'Reminder will send the day before.'
  if (mode === 'same-day') return 'Reminder will send on event day.'
  if (mode === 'custom') return 'Custom reminder schedule selected.'
  return 'Reminders disabled.'
}

export function FinalizePage() {
  const { sessionId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const { session } = useSession(sessionId)
  const { event } = useEvent(sessionId)
  const { poll } = usePoll(sessionId)
  const { combo } = useBestCombos(poll?.id ?? '')
  const { snapshot } = useAttendanceSnapshot(event?.id ?? '')
  const { finalizeEvent, isLoading: finalizing } = useFinalizeEvent()
  const { updateStatus } = useUpdateSessionStatus()

  const topCombo = combo?.primary
  const queryDate = searchParams.get('date') ?? ''
  const queryTime = searchParams.get('time') ?? ''
  const queryPlace = searchParams.get('place') ?? ''

  const [venueName, setVenueName] = useState(event?.venueName ?? queryPlace ?? '')
  const [mapUrl, setMapUrl] = useState(event?.mapUrl ?? '')
  const [date, setDate] = useState(event?.whenIso ? toDateInputValue(event.whenIso) : '')
  const [time, setTime] = useState(event?.whenIso ? toTimeInputValue(event.whenIso) : '')
  const [eventTitle, setEventTitle] = useState(event?.title ?? session?.title ?? '')
  const [reminderMode, setReminderMode] = useState<ReminderMode>(event?.reminderPolicy?.mode ?? 'day-before')
  const [finalized, setFinalized] = useState(session?.status === 'finalized')
  const [error, setError] = useState<string | null>(null)

  const whenIso = useMemo(() => combineLocalDateTime(date, time), [date, time])
  const invalidMapUrl = !isValidUrl(mapUrl)

  const handleFinalize = async () => {
    setError(null)
    if (!venueName.trim() || !date || !time || !whenIso) {
      setError('Enter a valid date, time, and venue before finalizing.')
      return
    }
    if (invalidMapUrl) {
      setError('Map link must be a valid http(s) URL.')
      return
    }

    const id = await finalizeEvent({
      sessionId,
      title: eventTitle.trim() || session?.title || 'Event',
      whenIso,
      venueName: venueName.trim(),
      mapUrl: mapUrl.trim() || undefined,
      status: 'locked',
      createdBy: 'user-1',
      reminderPolicy: { mode: reminderMode },
    })
    await updateStatus(sessionId, 'finalized')
    track.eventFinalized(id)
    setFinalized(true)
  }

  if (finalized || session?.status === 'finalized') {
    const finalizedDate = event?.whenIso ? new Date(event.whenIso) : null
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div className="card p-6 flex flex-col items-center gap-4 text-center">
          <div className="h-16 w-16 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 size={32} className="text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Event finalized! 🎉</h2>
            <p className="text-sm text-neutral-500 mt-1">{event?.venueName ?? venueName}</p>
            <p className="text-sm font-semibold text-neutral-800 mt-2">
              {finalizedDate ? finalizedDate.toLocaleString() : `${date} ${time}`}
            </p>
          </div>
          {snapshot && (
            <div className="w-full">
              <p className="text-sm font-medium text-neutral-600 mb-3">Attendance snapshot (from vote tallies)</p>
              <div className="flex justify-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">{snapshot.goingCount}</p>
                  <p className="text-xs text-neutral-500">Going</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-500">{snapshot.maybeCount}</p>
                  <p className="text-xs text-neutral-500">Maybe</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-neutral-400">{snapshot.noResponseCount}</p>
                  <p className="text-xs text-neutral-500">No response</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div>
        <h2 className="text-lg font-bold text-neutral-900">Finalize Event</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Lock in date/time/location. Values are saved as a timezone-aware ISO timestamp.
        </p>
      </div>

      {(topCombo || queryDate || queryTime || queryPlace) && (
        <div className="card p-3.5 bg-primary-50 border-primary-200 flex items-start gap-3">
          <div className="h-5 w-5 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs shrink-0 mt-0.5">★</div>
          <div>
            <p className="text-sm font-semibold text-primary-800">Suggested from votes</p>
            <p className="text-xs text-primary-600">
              {[queryDate || topCombo?.date, queryTime || topCombo?.time, queryPlace || topCombo?.place].filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>
      )}

      <div className="card p-4 space-y-4">
        <h3 className="text-sm font-semibold text-neutral-700">Event details</h3>
        <Input
          label="Event title"
          value={eventTitle}
          onChange={(e) => setEventTitle(e.target.value)}
          placeholder="Saturday Dinner Plans"
        />
        <div className="grid sm:grid-cols-2 gap-3">
          <Input
            type="date"
            label="Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            iconLeft={<Calendar size={15} />}
          />
          <Input
            type="time"
            label="Time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            iconLeft={<Clock size={15} />}
          />
        </div>
        <Input
          label="Venue name"
          value={venueName}
          onChange={(e) => setVenueName(e.target.value)}
          placeholder="Restaurant or location name"
          iconLeft={<MapPin size={15} />}
        />
        <Input
          label="Map link (optional)"
          value={mapUrl}
          onChange={(e) => setMapUrl(e.target.value)}
          placeholder="https://maps.google.com/..."
          error={invalidMapUrl ? 'Enter a valid URL starting with http:// or https://' : undefined}
          hint="Share a maps URL so attendees can navigate quickly."
        />
      </div>

      {snapshot && (
        <div className="card p-4 space-y-3">
          <h3 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
            <Users size={15} aria-hidden />
            Attendance so far
          </h3>
          <p className="text-xs text-neutral-500">Derived from current poll responses.</p>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-xl font-bold text-emerald-600">{snapshot.goingCount}</p>
              <p className="text-xs text-neutral-500">Going</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-amber-500">{snapshot.maybeCount}</p>
              <p className="text-xs text-neutral-500">Maybe</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-neutral-400">{snapshot.noResponseCount}</p>
              <p className="text-xs text-neutral-500">No response</p>
            </div>
          </div>
        </div>
      )}

      <div className="card p-4 space-y-2">
        <ReminderChip
          state={reminderMode}
          timezone={Intl.DateTimeFormat().resolvedOptions().timeZone}
          onStateChange={setReminderMode}
        />
        <p className="text-xs text-neutral-500">{reminderLabel(reminderMode)}</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end">
        <Button
          variant="primary"
          size="lg"
          loading={finalizing}
          disabled={!venueName.trim() || !date || !time || !whenIso || invalidMapUrl}
          iconLeft={<CheckCircle2 size={16} />}
          onClick={handleFinalize}
        >
          Finalize event
        </Button>
      </div>
    </div>
  )
}
