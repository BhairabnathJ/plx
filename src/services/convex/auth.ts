import { useSyncExternalStore } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { AUTH_SESSION_KEY } from '@/lib/constants'

type ApiAny = any

type AuthUser = {
  id: string
  email?: string
  username?: string
  name?: string
}

let sessionTokenStore: string | null = (() => {
  try {
    return localStorage.getItem(AUTH_SESSION_KEY)
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
  return sessionTokenStore
}

function persistToken(next: string | null) {
  sessionTokenStore = next
  try {
    if (next) {
      localStorage.setItem(AUTH_SESSION_KEY, next)
    } else {
      localStorage.removeItem(AUTH_SESSION_KEY)
    }
  } catch {
    // ignore storage issues
  }
  emit()
}

export function useAuthSessionToken(): string | null {
  return useSyncExternalStore(subscribe, snapshot, snapshot)
}

export function useAuthUser(): { user: AuthUser | null; isAuthenticated: boolean; isLoading: boolean } {
  const sessionToken = useAuthSessionToken()

  const session = useQuery(
    (api as ApiAny).authLocal.getSession,
    sessionToken ? { sessionToken } : 'skip',
  ) as { user: AuthUser } | null | undefined

  if (sessionToken && session === null) {
    persistToken(null)
  }

  return {
    user: session?.user ?? null,
    isAuthenticated: !!session?.user,
    isLoading: sessionToken ? session === undefined : false,
  }
}

export function useLogin(): {
  register: (args: { email: string; username: string; password: string }) => Promise<{ defaultGroupId: string | null }>
  login: (args: { identifier: string; password: string }) => Promise<{ defaultGroupId: string | null }>
  logout: () => Promise<void>
} {
  const registerMutation = useMutation((api as ApiAny).authLocal.register)
  const loginMutation = useMutation((api as ApiAny).authLocal.login)
  const logoutMutation = useMutation((api as ApiAny).authLocal.logout)
  const sessionToken = useAuthSessionToken()

  return {
    register: async ({ email, username, password }) => {
      const result = await registerMutation({ email, username, password })
      persistToken(result.sessionToken)
      return { defaultGroupId: result.defaultGroupId ?? null }
    },
    login: async ({ identifier, password }) => {
      const result = await loginMutation({ identifier, password })
      persistToken(result.sessionToken)
      return { defaultGroupId: result.defaultGroupId ?? null }
    },
    logout: async () => {
      if (sessionToken) {
        try {
          await logoutMutation({ sessionToken })
        } catch {
          // still clear local token
        }
      }
      persistToken(null)
    },
  }
}
