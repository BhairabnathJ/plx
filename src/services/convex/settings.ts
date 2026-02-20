import { useMutation, useQuery } from 'convex/react'
import { useAuthSessionToken } from './auth'
import { api } from '../../../convex/_generated/api'

type ApiAny = any

export type NotificationPrefs = {
  reminders: boolean
  pollVotes: boolean
  sessionFinalized: boolean
}

// ─── Notification prefs ───────────────────────────────────────────────────────

export function useNotificationPrefs(): { prefs: NotificationPrefs | null; isLoading: boolean } {
  const sessionToken = useAuthSessionToken()
  const prefs = useQuery(
    (api as ApiAny)['features/settings'].getNotificationPrefs,
    sessionToken ? { sessionToken } : 'skip',
  ) as NotificationPrefs | null | undefined

  return {
    prefs: prefs ?? null,
    isLoading: !!sessionToken && prefs === undefined,
  }
}

export function useUpdateNotificationPrefs(): {
  updatePrefs: (prefs: Partial<NotificationPrefs>) => Promise<void>
} {
  const sessionToken = useAuthSessionToken()
  const updateMutation = useMutation((api as ApiAny)['features/settings'].updateNotificationPrefs)

  return {
    updatePrefs: async (prefs) => {
      if (!sessionToken) throw new Error('Not authenticated')
      await updateMutation({
        sessionToken,
        reminders: prefs.reminders,
        pollVotes: prefs.pollVotes,
        sessionFinalized: prefs.sessionFinalized,
      })
    },
  }
}

// ─── Profile updates ──────────────────────────────────────────────────────────

export function useUpdateProfile(): {
  updateProfile: (name: string) => Promise<void>
} {
  const sessionToken = useAuthSessionToken()
  const updateMutation = useMutation((api as ApiAny).authLocal.updateProfile)

  return {
    updateProfile: async (name) => {
      if (!sessionToken) throw new Error('Not authenticated')
      await updateMutation({ sessionToken, name })
    },
  }
}

export function useDeleteAccount(): {
  deleteAccount: () => Promise<void>
} {
  const sessionToken = useAuthSessionToken()
  const deleteMutation = useMutation((api as ApiAny).authLocal.deleteAccount)

  return {
    deleteAccount: async () => {
      if (!sessionToken) throw new Error('Not authenticated')
      await deleteMutation({ sessionToken })
    },
  }
}

// ─── Group settings ───────────────────────────────────────────────────────────

export function useUpdateGroupSettings(): {
  updateGroup: (groupId: string, updates: { name?: string; description?: string }) => Promise<void>
} {
  const sessionToken = useAuthSessionToken()
  const updateMutation = useMutation((api as ApiAny)['features/settings'].updateGroupSettings)

  return {
    updateGroup: async (groupId, updates) => {
      if (!sessionToken) throw new Error('Not authenticated')
      await updateMutation({ sessionToken, groupId, ...updates })
    },
  }
}
