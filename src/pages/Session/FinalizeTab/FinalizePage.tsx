import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle2, MapPin, Calendar, Clock, Users } from 'lucide-react'
import { Button } from '@/components/primitives/Button'
import { Input } from '@/components/primitives/Input'
import { ReminderChip } from '@/components/domain/ReminderChip'
import { useEvent, useAttendanceSnapshot, useFinalizeEvent } from '@/services/convex/events'
import { useSession, useUpdateSessionStatus } from '@/services/convex/sessions'
import { useBestCombos } from '@/services/convex/votes'
import { usePoll } from '@/services/convex/polls'
import { track } from '@/lib/telemetry'
import type { ReminderMode } from '@/types'

export function FinalizePage() {
  const { sessionId = '' } = useParams()
  const { session } = useSession(sessionId)
  const { event } = useEvent(sessionId)
  const { poll } = usePoll(sessionId)
  const { combo } = useBestCombos(poll?.id ?? '')
  const { snapshot } = useAttendanceSnapshot(event?.id ?? '')
  const { finalizeEvent, isLoading: finalizing } = useFinalizeEvent()
  const { updateStatus } = useUpdateSessionStatus()

  const topCombo = combo?.primary

  // Parse whenIso into separate date/time for form display
  const parseWhenIso = (iso: string) => {
    try {
      const d = new Date(iso)
      const date = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      return { date, time }
    } catch {
      return { date: '', time: '' }
    }
  }

  const eventParsed = event?.whenIso ? parseWhenIso(event.whenIso) : null

  const [venueName, setVenueName] = useState(event?.venueName ?? '')
  const [mapUrl, setMapUrl] = useState(event?.mapUrl ?? '')
  const [date, setDate] = useState(eventParsed?.date ?? topCombo?.date ?? '')
  const [time, setTime] = useState(eventParsed?.time ?? topCombo?.time ?? '')
  const [eventTitle, setEventTitle] = useState(event?.title ?? session?.title ?? '')
  const [reminderMode, setReminderMode] = useState<ReminderMode>(event?.reminderPolicy?.mode ?? 'day-before')
  const [finalized, setFinalized] = useState(session?.status === 'finalized')

  const handleFinalize = async () => {
    if (!venueName.trim() || !date || !time) return

    // Combine date + time into a simple ISO-ish string for the stub
    const whenIso = `${date}T${time}`

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
              {eventParsed?.date ?? date} at {eventParsed?.time ?? time}
            </p>
          </div>
          {snapshot && (
            <div className="w-full">
              <p className="text-sm font-medium text-neutral-600 mb-3">Attendance</p>
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
          Lock in the details. Once finalized, reminders can be sent.
        </p>
      </div>

      {/* Pre-fill from best combo */}
      {topCombo && (
        <div className="card p-3.5 bg-primary-50 border-primary-200 flex items-start gap-3">
          <div className="h-5 w-5 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs shrink-0 mt-0.5">★</div>
          <div>
            <p className="text-sm font-semibold text-primary-800">Pre-filled from top combo</p>
            <p className="text-xs text-primary-600">
              {[topCombo.date, topCombo.time, topCombo.place].filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>
      )}

      {/* Event details */}
      <div className="card p-4 space-y-4">
        <h3 className="text-sm font-semibold text-neutral-700">Event details</h3>
        <Input
          label="Event title"
          value={eventTitle}
          onChange={e => setEventTitle(e.target.value)}
          placeholder="Saturday Dinner Plans"
        />
        <div className="grid sm:grid-cols-2 gap-3">
          <Input
            label="Date"
            value={date}
            onChange={e => setDate(e.target.value)}
            placeholder="Sat, Feb 22"
            iconLeft={<Calendar size={15} />}
          />
          <Input
            label="Time"
            value={time}
            onChange={e => setTime(e.target.value)}
            placeholder="7:30 PM"
            iconLeft={<Clock size={15} />}
          />
        </div>
        <Input
          label="Venue name"
          value={venueName}
          onChange={e => setVenueName(e.target.value)}
          placeholder="Restaurant or location name"
          iconLeft={<MapPin size={15} />}
        />
        <Input
          label="Map link (optional)"
          value={mapUrl}
          onChange={e => setMapUrl(e.target.value)}
          placeholder="https://maps.google.com/..."
          hint="Makes it easy for attendees to navigate"
        />
      </div>

      {/* Attendance snapshot */}
      {snapshot && (
        <div className="card p-4 space-y-3">
          <h3 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
            <Users size={15} aria-hidden />
            Attendance so far
          </h3>
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

      {/* Reminder */}
      <div className="card p-4">
        <ReminderChip
          state={reminderMode}
          timezone={Intl.DateTimeFormat().resolvedOptions().timeZone}
          onStateChange={setReminderMode}
        />
      </div>

      {/* Finalize */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          size="lg"
          loading={finalizing}
          disabled={!venueName.trim() || !date || !time}
          iconLeft={<CheckCircle2 size={16} />}
          onClick={handleFinalize}
        >
          Finalize event
        </Button>
      </div>
    </div>
  )
}
