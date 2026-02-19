import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { User, Users, Bell, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/primitives/Button'
import { Input } from '@/components/primitives/Input'
import { useGroup } from '@/services/convex/groups'
import { CURRENT_USER } from '@/fixtures'

export function SettingsPage() {
  const { groupId = 'group-1' } = useParams()
  const { group } = useGroup(groupId)

  const [displayName, setDisplayName] = useState(CURRENT_USER.displayName)
  const [groupName, setGroupName] = useState(group?.name ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const sections = [
    {
      icon: <User size={16} />,
      title: 'Profile',
      content: (
        <Input
          label="Display name"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
        />
      ),
    },
    {
      icon: <Users size={16} />,
      title: 'Group',
      content: (
        <Input
          label="Group name"
          value={groupName}
          onChange={e => setGroupName(e.target.value)}
        />
      ),
    },
    {
      icon: <Bell size={16} />,
      title: 'Notifications',
      content: (
        <div className="space-y-3">
          {[
            { label: 'Reminder notifications', id: 'notif-reminders' },
            { label: 'New poll votes', id: 'notif-votes' },
            { label: 'Session finalized', id: 'notif-finalized' },
          ].map(item => (
            <label key={item.id} className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-neutral-700">{item.label}</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-primary-500" />
            </label>
          ))}
        </div>
      ),
    },
    {
      icon: <ShieldCheck size={16} />,
      title: 'Privacy',
      content: (
        <div className="text-sm text-neutral-500 space-y-2">
          <p>Chat context is stored only for your group and is never shared externally.</p>
          <p>Data retention: imported text is deleted when you delete the session.</p>
          <button type="button" className="text-red-500 hover:text-red-600 text-sm font-medium mt-2">
            Delete account and data
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <h1 className="text-xl font-bold text-neutral-900">Settings</h1>

      {sections.map(s => (
        <div key={s.title} className="card p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
            <span className="text-primary-500" aria-hidden>{s.icon}</span>
            {s.title}
          </div>
          {s.content}
        </div>
      ))}

      <div className="flex justify-end">
        <Button
          variant="primary"
          size="md"
          onClick={handleSave}
          loading={saving}
        >
          {saved ? 'Saved!' : 'Save changes'}
        </Button>
      </div>
    </div>
  )
}
