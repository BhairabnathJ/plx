import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/primitives/Button'
import { Input } from '@/components/primitives/Input'
import { useLogin } from '@/services/convex/auth'
import { useCreateGroup, useGroups } from '@/services/convex/groups'

export function AuthPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const initialEmail = params.get('email') ?? ''

  const [email, setEmail] = useState(initialEmail)
  const [submitting, setSubmitting] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState<string>('')

  const { login } = useLogin()
  const { groups } = useGroups()
  const { createGroup, isLoading: creatingGroup } = useCreateGroup()

  const availableGroups = useMemo(() => groups, [groups])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setSubmitting(true)
    const user = await login(email.trim().toLowerCase())

    let targetGroupId = selectedGroupId
    if (!targetGroupId) {
      targetGroupId = availableGroups[0]?.id ?? ''
    }

    if (!targetGroupId) {
      targetGroupId = await createGroup({
        name: 'My Group',
        description: 'New PlannerBot group',
        createdBy: user.id,
      })
    }

    setSubmitting(false)
    navigate(`/app/${targetGroupId}/dashboard`)
  }

  return (
    <div className="min-h-dvh bg-neutral-50 flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="card w-full max-w-md p-6 space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-neutral-900">Sign in</h1>
          <p className="text-sm text-neutral-500">Log in and choose which group dashboard to open.</p>
        </div>

        <Input
          type="email"
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-700" htmlFor="group-select">
            Open group (optional)
          </label>
          <select
            id="group-select"
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="w-full h-11 rounded-xl border border-neutral-300 bg-white px-3 text-sm"
          >
            <option value="">Auto-select first available group</option>
            {availableGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" variant="primary" size="md" loading={submitting || creatingGroup} className="w-full">
          Continue
        </Button>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full text-sm text-neutral-500 hover:text-neutral-700"
        >
          Back
        </button>
      </form>
    </div>
  )
}
