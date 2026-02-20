import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/primitives/Button'
import { Input } from '@/components/primitives/Input'
import { useAuthUser, useLogin } from '@/services/convex/auth'
import { useCreateGroup, useGroups } from '@/services/convex/groups'

type Mode = 'signin' | 'signup'
type Field = 'email' | 'username' | 'identifier' | 'password'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_RE = /^[a-z0-9_]{3,20}$/

function asMode(value: string | null): Mode {
  return value === 'signup' ? 'signup' : 'signin'
}

function friendlyAuthError(error: unknown): string {
  if (!(error instanceof Error)) return 'Authentication failed. Please try again.'
  const message = error.message.toLowerCase()
  if (message.includes('invalid credentials')) return 'Email/username or password is incorrect.'
  if (message.includes('email already registered')) return 'This email is already registered. Try signing in.'
  if (message.includes('username already taken')) return 'That username is unavailable. Try another one.'
  if (message.includes('unauthorized')) return 'Your session expired. Please sign in again.'
  return error.message
}

function passwordStrength(password: string): { label: 'Weak' | 'Medium' | 'Strong'; className: string } {
  let score = 0
  if (password.length >= 8) score += 1
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  if (score >= 4) return { label: 'Strong', className: 'text-emerald-700' }
  if (score >= 2) return { label: 'Medium', className: 'text-amber-700' }
  return { label: 'Weak', className: 'text-red-700' }
}

function suggestedGroupName(username: string, email: string, userName?: string) {
  if (userName?.trim()) return `${userName.trim()}'s Group`
  if (username.trim()) return `${username.trim()}'s Group`
  const prefix = email.split('@')[0]?.trim()
  return prefix ? `${prefix}'s Group` : 'My Group'
}

export function AuthPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const seededEmail = useMemo(() => (params.get('email') ?? '').trim().toLowerCase(), [params])
  const safeReturnTo = useMemo(() => {
    const value = params.get('returnTo')
    return value && value.startsWith('/app/') ? value : null
  }, [params])

  const [mode, setMode] = useState<Mode>(asMode(params.get('mode')))
  const [email, setEmail] = useState(seededEmail)
  const [username, setUsername] = useState('')
  const [identifier, setIdentifier] = useState(seededEmail)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<Field, string>>>({})
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [groupSetupRequired, setGroupSetupRequired] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [creatingGroup, setCreatingGroup] = useState(false)

  const { login, register, logout } = useLogin()
  const { user, isAuthenticated, isLoading: authLoading } = useAuthUser()
  const { groups, isLoading: groupsLoading } = useGroups()
  const { createGroup } = useCreateGroup()

  useEffect(() => {
    const firstGroup = groups[0]
    if (!authLoading && isAuthenticated && !groupsLoading && firstGroup && !groupSetupRequired) {
      navigate(safeReturnTo ?? `/app/${firstGroup.id}/dashboard`, { replace: true })
    }
  }, [authLoading, groups, groupsLoading, groupSetupRequired, isAuthenticated, navigate, safeReturnTo])

  useEffect(() => {
    if (!authLoading && isAuthenticated && !groupsLoading && groups.length === 0) {
      setGroupSetupRequired(true)
      setGroupName((current) => current || suggestedGroupName(username, email, user?.name))
    }
  }, [authLoading, email, groups.length, groupsLoading, isAuthenticated, user?.name, username])

  const switchMode = (nextMode: Mode) => {
    if (nextMode === mode) return
    setMode(nextMode)
    setPassword('')
    setShowPassword(false)
    setError(null)
    setFieldErrors({})

    if (nextMode === 'signin') {
      const value = (email || identifier).trim().toLowerCase()
      setIdentifier(value)
    } else if (identifier.includes('@') && !email) {
      setEmail(identifier.trim().toLowerCase())
    }
  }

  const validate = (): Partial<Record<Field, string>> => {
    const errors: Partial<Record<Field, string>> = {}
    if (mode === 'signup') {
      if (!EMAIL_RE.test(email.trim().toLowerCase())) {
        errors.email = 'Enter a valid email address.'
      }
      if (!USERNAME_RE.test(username.trim().toLowerCase())) {
        errors.username = 'Use 3-20 chars: lowercase letters, numbers, underscore.'
      }
      if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
        errors.password = 'Use at least 8 characters with at least 1 letter and 1 number.'
      }
      return errors
    }

    if (!identifier.trim()) {
      errors.identifier = 'Enter your email or username.'
    }
    if (!password.trim()) {
      errors.password = 'Enter your password.'
    }
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const nextErrors = validate()
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)

    try {
      const result =
        mode === 'signup'
          ? await register({
              email: email.trim().toLowerCase(),
              username: username.trim().toLowerCase(),
              password,
            })
          : await login({ identifier: identifier.trim().toLowerCase(), password })

      const groupId = result.defaultGroupId
      if (groupId) {
        navigate(safeReturnTo ?? `/app/${groupId}/dashboard`, { replace: true })
        return
      }

      setGroupSetupRequired(true)
      setGroupName(suggestedGroupName(username, email, user?.name))
      setError('You are signed in. Create your first group to continue.')
    } catch (err) {
      setError(friendlyAuthError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!groupName.trim()) {
      setError('Enter a group name to continue.')
      return
    }

    setCreatingGroup(true)
    try {
      const groupId = await createGroup({ name: groupName.trim() })
      navigate(`/app/${groupId}/dashboard`, { replace: true })
    } catch (err) {
      setError(friendlyAuthError(err))
    } finally {
      setCreatingGroup(false)
    }
  }

  if (authLoading || (isAuthenticated && groupsLoading)) {
    return (
      <div className="min-h-dvh bg-neutral-50 flex items-center justify-center px-4">
        <div className="card w-full max-w-md p-6 text-sm text-neutral-500">Checking your session…</div>
      </div>
    )
  }

  if (groupSetupRequired) {
    return (
      <div className="min-h-dvh bg-neutral-50 flex items-center justify-center px-4">
        <form onSubmit={handleCreateGroup} className="card w-full max-w-md p-6 space-y-4">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-neutral-900">Create your first group</h1>
            <p className="text-sm text-neutral-500">
              You are signed in. Add a group profile to continue into PlannerBot.
            </p>
          </div>

          <Input
            label="Group name"
            placeholder="Friday Crew"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            autoFocus
            required
          />

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" variant="primary" size="md" loading={creatingGroup} className="w-full">
            Continue
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={async () => {
              await logout()
              setGroupSetupRequired(false)
              setGroupName('')
              setPassword('')
            }}
          >
            Sign out and use another account
          </Button>
        </form>
      </div>
    )
  }

  const strength = passwordStrength(password)

  return (
    <div className="min-h-dvh bg-neutral-50 flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="card w-full max-w-md p-6 space-y-4" noValidate>
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-neutral-900">
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </h1>
          <p className="text-sm text-neutral-500">
            {mode === 'signin'
              ? 'Use email or username with password.'
              : 'Create an account with email, username, and password.'}
          </p>
        </div>

        <div role="tablist" aria-label="Authentication mode" className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 rounded-xl">
          <Button
            type="button"
            role="tab"
            aria-selected={mode === 'signin'}
            variant={mode === 'signin' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => switchMode('signin')}
            className="w-full"
          >
            Sign in
          </Button>
          <Button
            type="button"
            role="tab"
            aria-selected={mode === 'signup'}
            variant={mode === 'signup' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => switchMode('signup')}
            className="w-full"
          >
            Sign up
          </Button>
        </div>

        {mode === 'signup' ? (
          <>
            <Input
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              error={fieldErrors.email}
              required
            />
            <Input
              type="text"
              label="Username"
              placeholder="yourname"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              error={fieldErrors.username}
              hint="3-20 chars, lowercase letters, numbers, underscore."
              required
            />
          </>
        ) : (
          <Input
            type="text"
            label="Email or username"
            placeholder="you@example.com or yourname"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete="username email"
            error={fieldErrors.identifier}
            required
          />
        )}

        <div className="space-y-1">
          <Input
            type={showPassword ? 'text' : 'password'}
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            error={fieldErrors.password}
            minLength={8}
            required
          />
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              {showPassword ? 'Hide password' : 'Show password'}
            </button>
            {mode === 'signup' && password ? (
              <span className={`text-xs font-medium ${strength.className}`}>Strength: {strength.label}</span>
            ) : null}
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button type="submit" variant="primary" size="md" loading={submitting} className="w-full">
          {mode === 'signin' ? 'Continue' : 'Create account'}
        </Button>

        <button type="button" onClick={() => navigate('/')} className="w-full text-sm text-neutral-500 hover:text-neutral-700">
          Back
        </button>
      </form>
    </div>
  )
}
