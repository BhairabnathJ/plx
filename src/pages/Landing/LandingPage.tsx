import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CalendarCheck, MessageCircle, Users, Zap } from 'lucide-react'
import { Button } from '@/components/primitives/Button'
import { Input } from '@/components/primitives/Input'

export function LandingPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams({ mode: 'signup' })
    if (email.trim()) params.set('email', email.trim().toLowerCase())
    navigate(`/auth?${params.toString()}`)
  }

  const features = [
    { icon: <MessageCircle size={18} />, title: 'Paste your group chat', desc: 'Drop in any chat thread. We extract who can/can\'t make it and what everyone wants.' },
    { icon: <CalendarCheck size={18} />, title: 'Smart polls in seconds', desc: 'AI builds a tight, focused poll — no option overload. Your group votes fast on mobile.' },
    { icon: <Zap size={18} />, title: 'Clear decision, every time', desc: 'See the best date, time, and vibe combo with backup options. Copy the summary and send.' },
  ]

  return (
    <div className="min-h-dvh bg-white flex flex-col overflow-hidden">
      {/* Ambient gradient */}
      <div className="fixed inset-0 bg-gradient-hero pointer-events-none" aria-hidden />

      {/* Grid texture */}
      <div
        className="fixed inset-0 bg-grid-subtle pointer-events-none opacity-60"
        style={{ backgroundSize: '24px 24px' }}
        aria-hidden
      />

      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-primary-500 flex items-center justify-center shadow-sm">
            <span className="text-white text-sm font-bold">P</span>
          </div>
          <span className="font-bold text-neutral-900">PlannerBot</span>
        </div>
        <button
          type="button"
          onClick={() => navigate('/auth?mode=signin')}
          className="text-sm font-medium text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          Sign in
        </button>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-10 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-200 bg-primary-50 text-primary-600 text-xs font-semibold mb-8 animate-fade-in">
          <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
          Plan with your group — not against it
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-neutral-900 leading-tight mb-5 max-w-2xl animate-slide-up">
          Turn group chat chaos{' '}
          <span className="text-primary-500">into a plan everyone agrees on</span>
        </h1>

        <p className="text-lg text-neutral-500 max-w-md mb-10 animate-slide-up" style={{ animationDelay: '50ms' }}>
          Paste your WhatsApp thread. Get a smart poll. Lock in the plan. Done in minutes.
        </p>

        {/* Auth form */}
        <form
          onSubmit={handleAuth}
          className="w-full max-w-sm animate-slide-up"
          style={{ animationDelay: '100ms' }}
        >
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex-1"
              aria-label="Email address"
              autoComplete="email"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              iconRight={<ArrowRight size={16} />}
            >
              Get started
            </Button>
          </div>
          <p className="text-xs text-neutral-400 mt-2 text-center">
            No credit card. Manual import in MVP — WhatsApp coming soon.
          </p>
        </form>

        {/* Demo bypass */}
        <button
          type="button"
          onClick={() => navigate('/auth?mode=signin')}
          className="mt-4 text-sm text-neutral-400 hover:text-neutral-600 underline underline-offset-2 transition-colors"
        >
          Preview the app →
        </button>

        {/* Features */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full mt-16 animate-slide-up"
          style={{ animationDelay: '150ms' }}
        >
          {features.map(f => (
            <div key={f.title} className="card p-4 text-left space-y-2">
              <div className="h-9 w-9 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                {f.icon}
              </div>
              <h3 className="text-sm font-semibold text-neutral-900">{f.title}</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div className="flex items-center gap-2 mt-8 text-sm text-neutral-400">
          <div className="flex -space-x-2">
            {['alex', 'sam', 'jordan', 'morgan'].map(seed => (
              <img
                key={seed}
                src={`https://api.dicebear.com/9.x/notionists/svg?seed=${seed}`}
                alt={seed}
                className="h-7 w-7 rounded-full border-2 border-white bg-neutral-100"
              />
            ))}
          </div>
          <span>Used by <strong className="text-neutral-600">200+ groups</strong> this week</span>
          <Users size={14} />
        </div>
      </main>
    </div>
  )
}
