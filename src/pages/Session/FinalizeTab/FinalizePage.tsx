import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle2, MapPin, Calendar, Clock } from 'lucide-react'
import { Button } from '@/components/primitives/Button'
import { Input } from '@/components/primitives/Input'
import { ReminderChip } from '@/components/domain/ReminderChip'
import { useEvent, useAttendance, useFinalizeEvent } from '@/services/convex/events'
import { useSession, useUpdateSessionStatus } from '@/services/convex/sessions'
import { useBestCombos } from '@/services/convex/votes'
import { usePoll } from '@/services/convex/polls'
import { track } from '@/lib/telemetry'
import type { ReminderState, AttendanceState } from '@/types'
import { cn } from '@/lib/cn'

const ATTENDANCE_CONFIG: Record<AttendanceState, { label: string; color: string }> = {
  going:   { label: 'Going ✓', color: 'bg-emerald-50 border-emerald-300 text-emerald-700' },
  maybe:   { label: 'Maybe', color: 'bg-amber-50 border-amber-300 text-amber-700' },
  unknown: { label: 'TBD', color: 'bg-neutral-100 border-neutral-300 text-neutral-500' },
}

export function FinalizePage() {
  const { sessionId = '' } = useParams()
  const { session } = useSession(sessionId)
  const { event } = useEvent(sessionId)
  const { poll } = usePoll(sessionId)
  const { combos } = useBestCombos(poll?.id ?? '')
  const { attendance } = useAttendance(event?.id ?? '')
  const { finalizeEvent, isLoading: finalizing } = useFinalizeEvent()
  const { updateStatus } = useUpdateSessionStatus()

  const topCombo = combos[0]

  const [venueName, setVenueName] = useState(event?.venueName ?? '')
  const [mapLink, setMapLink] = useState(event?.mapLink ?? '')
  const [date, setDate] = useState(event?.finalDate ?? topCombo?.date ?? '')
  const [time, setTime] = useState(event?.finalTime ?? topCombo?.time ?? '')
  const [reminderState, setReminderState] = useState<ReminderState>(event?.reminderPolicy?.state ?? 'day-before')
  const [finalized, setFinalized] = useState(session?.status === 'finalized')

  const handleFinalize = async () => {
    if (!venueName.trim() || !date || !time) return

    const id = await finalizeEvent({
      sessionId,
      venueName: venueName.trim(),
      mapLink: mapLink.trim() || undefined,
      finalDate: date,
      finalTime: time,
      reminderPolicy: {
        state: reminderState,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
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
              {event?.finalDate ?? date} at {event?.finalTime ?? time}
            </p>
          </div>
          {attendance.length > 0 && (
            <div className="w-full space-y-2">
              <p className="text-sm font-medium text-neutral-600">Attendance</p>
              <div className="flex flex-wrap justify-center gap-2">
                {attendance.map(a => {
                  const cfg = ATTENDANCE_CONFIG[a.state]
                  return (
                    <span key={a.id} className={cn('px-3 py-1 rounded-pill border text-sm font-medium', cfg.color)}>
                      {a.displayName ?? 'Member'} — {cfg.label}
                    </span>
                  )
                })}
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
            <p className="text-xs text-primary-600">{topCombo.date} · {topCombo.time} · {topCombo.place}</p>
          </div>
        </div>
      )}

      {/* Event details */}
      <div className="card p-4 space-y-4">
        <h3 className="text-sm font-semibold text-neutral-700">Event details</h3>
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
          value={mapLink}
          onChange={e => setMapLink(e.target.value)}
          placeholder="https://maps.google.com/..."
          hint="Makes it easy for attendees to navigate"
        />
      </div>

      {/* Attendance */}
      {attendance.length > 0 && (
        <div className="card p-4 space-y-3">
          <h3 className="text-sm font-semibold text-neutral-700">Attendance</h3>
          <div className="space-y-2">
            {attendance.map(a => {
              const cfg = ATTENDANCE_CONFIG[a.state]
              return (
                <div key={a.id} className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700">{a.displayName ?? 'Member'}</span>
                  <span className={cn('px-2.5 py-0.5 rounded-pill border text-xs font-medium', cfg.color)}>
                    {cfg.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Reminder */}
      <div className="card p-4">
        <ReminderChip
          state={reminderState}
          timezone={Intl.DateTimeFormat().resolvedOptions().timeZone}
          onStateChange={setReminderState}
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
