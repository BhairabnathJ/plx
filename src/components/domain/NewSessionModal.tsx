import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from '@/components/primitives/Modal'
import { Button } from '@/components/primitives/Button'
import { Input } from '@/components/primitives/Input'
import { Textarea } from '@/components/primitives/Textarea'
import { Chip } from '@/components/primitives/Chip'
import { ACTIVITY_TYPES, TIMEFRAME_OPTIONS } from '@/lib/constants'
import { useCreateSession } from '@/services/convex/sessions'
import { track } from '@/lib/telemetry'

interface NewSessionModalProps {
  groupId: string
  open: boolean
  onClose: () => void
}

export function NewSessionModal({ groupId, open, onClose }: NewSessionModalProps) {
  const navigate = useNavigate()
  const { createSession, isLoading } = useCreateSession()

  const [title, setTitle] = useState('')
  const [timeframe, setTimeframe] = useState<string>('this-week')
  const [activityType, setActivityType] = useState<string>('')
  const [contextText, setContextText] = useState('')
  const [errors, setErrors] = useState<{ title?: string; context?: string }>({})

  const validate = () => {
    const errs: typeof errors = {}
    if (!title.trim()) errs.title = 'Session title is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleCreate = async () => {
    if (!validate()) return
    const timeframeOption = TIMEFRAME_OPTIONS.find(o => o.value === timeframe)
    const id = await createSession({
      groupId,
      title: title.trim(),
      timeframe: timeframeOption?.label ?? 'Custom',
      activityType: activityType || undefined,
      contextText: contextText.trim() || undefined,
    })
    track.sessionCreated(id)
    onClose()
    navigate(`/app/${groupId}/sessions/${id}/context`)
  }

  const handleClose = () => {
    if (!isLoading) {
      setTitle('')
      setTimeframe('this-week')
      setActivityType('')
      setContextText('')
      setErrors({})
      onClose()
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="New planning session"
      description="Set up context to help the AI find the best options for your group."
    >
      <div className="space-y-5">
        {/* Title */}
        <Input
          label="Session title"
          placeholder="e.g. Saturday night plans, Beach day"
          value={title}
          onChange={e => { setTitle(e.target.value); setErrors(p => ({ ...p, title: undefined })) }}
          error={errors.title}
          autoComplete="off"
        />

        {/* Timeframe */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-neutral-700">Timeframe</p>
          <div className="flex flex-wrap gap-2">
            {TIMEFRAME_OPTIONS.map(opt => (
              <Chip
                key={opt.value}
                label={opt.label}
                selected={timeframe === opt.value}
                onClick={() => setTimeframe(opt.value)}
              />
            ))}
          </div>
        </div>

        {/* Activity type (single) */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-neutral-700">Activity type <span className="text-neutral-400 font-normal">(optional)</span></p>
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_TYPES.map(type => (
              <Chip
                key={type}
                label={type}
                selected={activityType === type}
                onClick={() => setActivityType(activityType === type ? '' : type)}
              />
            ))}
          </div>
        </div>

        {/* Context */}
        <Textarea
          label="Paste chat context"
          placeholder="Paste relevant messages from your group chat here. The AI will extract constraints and preferences."
          value={contextText}
          onChange={e => { setContextText(e.target.value); setErrors(p => ({ ...p, context: undefined })) }}
          error={errors.context}
          rows={5}
          hint="Paste WhatsApp or iMessage threads. The more context, the better the suggestions."
        />

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="ghost" size="md" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="md" loading={isLoading} onClick={handleCreate}>
            Create session
          </Button>
        </div>
      </div>
    </Modal>
  )
}
