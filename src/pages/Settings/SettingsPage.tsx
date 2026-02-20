import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Bell, ShieldCheck, User, Users } from 'lucide-react'
import { Button } from '@/components/primitives/Button'
import { Input } from '@/components/primitives/Input'
import { useAuthUser, useLogin } from '@/services/convex/auth'
import { useGroup } from '@/services/convex/groups'
import {
  useNotificationPrefs,
  useUpdateNotificationPrefs,
  useUpdateProfile,
  useDeleteAccount,
  useUpdateGroupSettings,
} from '@/services/convex/settings'

export function SettingsPage() {
  const navigate = useNavigate()
  const { groupId = '' } = useParams()
  const { group } = useGroup(groupId)
  const { user } = useAuthUser()
  const { logout } = useLogin()

  const { prefs: remotePrefs } = useNotificationPrefs()
  const { updatePrefs } = useUpdateNotificationPrefs()
  const { updateProfile } = useUpdateProfile()
  const { deleteAccount } = useDeleteAccount()
  const { updateGroup } = useUpdateGroupSettings()

  const [displayName, setDisplayName] = useState(user?.name ?? '')
  const [groupName, setGroupName] = useState(group?.name ?? '')
  const [reminders, setReminders] = useState(remotePrefs?.reminders ?? true)
  const [pollVotes, setPollVotes] = useState(remotePrefs?.pollVotes ?? true)
  const [sessionFinalized, setSessionFinalized] = useState(remotePrefs?.sessionFinalized ?? true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Sync remote prefs when they load
  useEffect(() => {
    if (remotePrefs) {
      setReminders(remotePrefs.reminders)
      setPollVotes(remotePrefs.pollVotes)
      setSessionFinalized(remotePrefs.sessionFinalized)
    }
  }, [remotePrefs])

  useEffect(() => {
    setDisplayName(user?.name ?? '')
  }, [user?.name])

  useEffect(() => {
    setGroupName(group?.name ?? '')
  }, [group?.name])

  const isDirty = useMemo(() => {
    const nameDirty = (user?.name ?? '') !== displayName
    const groupNameDirty = (group?.name ?? '') !== groupName
    const prefsDirty =
      reminders !== (remotePrefs?.reminders ?? true) ||
      pollVotes !== (remotePrefs?.pollVotes ?? true) ||
      sessionFinalized !== (remotePrefs?.sessionFinalized ?? true)
    return nameDirty || groupNameDirty || prefsDirty
  }, [displayName, groupName, reminders, pollVotes, sessionFinalized, user?.name, group?.name, remotePrefs])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    setError(null)
    try {
      const saves: Promise<void>[] = []

      if ((user?.name ?? '') !== displayName) {
        saves.push(updateProfile(displayName))
      }
      if ((group?.name ?? '') !== groupName && groupName.trim()) {
        saves.push(updateGroup(groupId, { name: groupName.trim() }))
      }

      const prefsDirty =
        reminders !== (remotePrefs?.reminders ?? true) ||
        pollVotes !== (remotePrefs?.pollVotes ?? true) ||
        sessionFinalized !== (remotePrefs?.sessionFinalized ?? true)
      if (prefsDirty) {
        saves.push(updatePrefs({ reminders, pollVotes, sessionFinalized }))
      }

      await Promise.all(saves)
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
      await deleteAccount()
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
        />
        <Input label="Email" value={user?.email ?? ''} readOnly disabled />
      </div>

      <div className="card p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
          <span className="text-primary-500" aria-hidden><Users size={16} /></span>
          Group
        </div>
        <Input
          label="Group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          hint="Only group owners can rename the group."
        />
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
              checked={reminders}
              onChange={(e) => setReminders(e.target.checked)}
              className="h-4 w-4 rounded accent-primary-500"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-neutral-700">New poll votes</span>
            <input
              type="checkbox"
              checked={pollVotes}
              onChange={(e) => setPollVotes(e.target.checked)}
              className="h-4 w-4 rounded accent-primary-500"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-neutral-700">Session finalized</span>
            <input
              type="checkbox"
              checked={sessionFinalized}
              onChange={(e) => setSessionFinalized(e.target.checked)}
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
              This permanently deletes your account, all session data, group memberships, and vote history.
              This action cannot be undone.
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
