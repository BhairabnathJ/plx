import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Bell, ShieldCheck, User, Users } from 'lucide-react'
import { Button } from '@/components/primitives/Button'
import { Input } from '@/components/primitives/Input'
import { useAuthUser, useLogin } from '@/services/convex/auth'
import { useGroup } from '@/services/convex/groups'

type NotificationPrefs = {
  reminders: boolean
  votes: boolean
  finalized: boolean
}

const PREFS_KEY = 'plannerbot.settings.notifications'

function loadPrefs(): NotificationPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) {
      return { reminders: true, votes: true, finalized: true }
    }
    const parsed = JSON.parse(raw) as Partial<NotificationPrefs>
    return {
      reminders: parsed.reminders ?? true,
      votes: parsed.votes ?? true,
      finalized: parsed.finalized ?? true,
    }
  } catch {
    return { reminders: true, votes: true, finalized: true }
  }
}

function savePrefs(prefs: NotificationPrefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
}

export function SettingsPage() {
  const navigate = useNavigate()
  const { groupId = '' } = useParams()
  const { group } = useGroup(groupId)
  const { user } = useAuthUser()
  const { logout } = useLogin()

  const [displayName, setDisplayName] = useState(user?.name ?? '')
  const [prefs, setPrefs] = useState<NotificationPrefs>(() => loadPrefs())
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setDisplayName(user?.name ?? '')
  }, [user?.name])

  const isDirty = useMemo(() => {
    const nameDirty = (user?.name ?? '') !== displayName
    const stored = loadPrefs()
    return (
      nameDirty ||
      stored.reminders !== prefs.reminders ||
      stored.votes !== prefs.votes ||
      stored.finalized !== prefs.finalized
    )
  }, [displayName, prefs, user?.name])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    setError(null)
    try {
      // Backend profile mutation will be wired in Claude backend lane.
      // Persist notification preferences immediately so this page is no longer fake.
      savePrefs(prefs)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    setError(null)
    try {
      localStorage.removeItem(PREFS_KEY)
      await logout()
      navigate('/auth?mode=signin', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete account right now')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <h1 className="text-xl font-bold text-neutral-900">Settings</h1>

      <div className="card p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
          <span className="text-primary-500" aria-hidden><User size={16} /></span>
          Profile
        </div>
        <Input
          label="Display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          hint="Profile persistence to backend is part of backend contract work."
        />
        <Input label="Email" value={user?.email ?? ''} readOnly disabled />
      </div>

      <div className="card p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
          <span className="text-primary-500" aria-hidden><Users size={16} /></span>
          Group
        </div>
        <Input label="Current group" value={group?.name ?? 'No group selected'} readOnly disabled />
        <p className="text-xs text-neutral-500">
          Group rename permissions and persistence are enforced by backend ownership checks.
        </p>
      </div>

      <div className="card p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
          <span className="text-primary-500" aria-hidden><Bell size={16} /></span>
          Notifications
        </div>
        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-neutral-700">Reminder notifications</span>
            <input
              type="checkbox"
              checked={prefs.reminders}
              onChange={(e) => setPrefs((current) => ({ ...current, reminders: e.target.checked }))}
              className="h-4 w-4 rounded accent-primary-500"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-neutral-700">New poll votes</span>
            <input
              type="checkbox"
              checked={prefs.votes}
              onChange={(e) => setPrefs((current) => ({ ...current, votes: e.target.checked }))}
              className="h-4 w-4 rounded accent-primary-500"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-neutral-700">Session finalized</span>
            <input
              type="checkbox"
              checked={prefs.finalized}
              onChange={(e) => setPrefs((current) => ({ ...current, finalized: e.target.checked }))}
              className="h-4 w-4 rounded accent-primary-500"
            />
          </label>
        </div>
      </div>

      <div className="card p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
          <span className="text-primary-500" aria-hidden><ShieldCheck size={16} /></span>
          Account actions
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={async () => {
              await logout()
              navigate('/auth?mode=signin', { replace: true })
            }}
          >
            Sign out
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => setConfirmDelete((current) => !current)}
          >
            Delete account and data
          </Button>
        </div>

        {confirmDelete && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 space-y-2">
            <p className="text-sm text-red-800 font-medium">Confirm account deletion</p>
            <p className="text-xs text-red-700">
              This signs you out immediately and clears local settings on this device.
              Full backend record deletion is handled by backend ownership flow.
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                loading={deleting}
                onClick={handleDeleteAccount}
              >
                Confirm delete
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end">
        <Button
          variant="primary"
          size="md"
          onClick={handleSave}
          loading={saving}
          disabled={!isDirty || saving}
        >
          {saved ? 'Saved!' : 'Save changes'}
        </Button>
      </div>
    </div>
  )
}
