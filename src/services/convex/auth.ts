import { useSyncExternalStore } from 'react'
import { AUTH_USER_KEY } from '@/lib/constants'

export type AuthUser = {
  id: string
  email: string
  name: string
  createdAt: number
}

let authUserStore: AuthUser | null = (() => {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
})()

const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function snapshot() {
  return authUserStore
}

function persist(next: AuthUser | null) {
  authUserStore = next
  try {
    if (next) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(next))
    } else {
      localStorage.removeItem(AUTH_USER_KEY)
    }
  } catch {
    // ignore storage write failures
  }
  emit()
}

export function useAuthUser(): { user: AuthUser | null; isAuthenticated: boolean } {
  const user = useSyncExternalStore(subscribe, snapshot, snapshot)
  return { user, isAuthenticated: !!user }
}

export function useLogin(): {
  login: (email: string) => Promise<AuthUser>
  logout: () => void
} {
  return {
    login: async (email: string) => {
      await new Promise((r) => setTimeout(r, 250))
      const name = email.split('@')[0]?.replace(/[._-]/g, ' ') || 'Planner user'
      const user: AuthUser = {
        id: `user-${Date.now()}`,
        email,
        name,
        createdAt: Date.now(),
      }
      persist(user)
      return user
    },
    logout: () => persist(null),
  }
}
