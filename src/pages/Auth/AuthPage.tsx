import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/primitives/Button'
import { Input } from '@/components/primitives/Input'
import { useLogin } from '@/services/convex/auth'

type Mode = 'signin' | 'signup'

export function AuthPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState(params.get('email') ?? '')
  const [username, setUsername] = useState('')
  const [identifier, setIdentifier] = useState(params.get('email') ?? '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const { login, register } = useLogin()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
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
      if (!groupId) {
        setError('No group found for this account. Please create a new account.')
        return
      }
      navigate(`/app/${groupId}/dashboard`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-dvh bg-neutral-50 flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="card w-full max-w-md p-6 space-y-4">
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

        <div className="flex gap-2">
          <Button type="button" variant={mode === 'signin' ? 'primary' : 'secondary'} size="sm" onClick={() => setMode('signin')}>
            Sign in
          </Button>
          <Button type="button" variant={mode === 'signup' ? 'primary' : 'secondary'} size="sm" onClick={() => setMode('signup')}>
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
              required
            />
            <Input
              type="text"
              label="Username"
              placeholder="yourname"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
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
            autoComplete="username"
            required
          />
        )}

        <Input
          type="password"
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          required
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

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
