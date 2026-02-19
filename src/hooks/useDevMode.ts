import { useEffect, useSyncExternalStore } from 'react'
import { DEV_MODE_KEY } from '@/lib/constants'
import { track } from '@/lib/telemetry'

let devModeValue = (() => {
  try {
    return localStorage.getItem(DEV_MODE_KEY) === 'true'
  } catch {
    return false
  }
})()

const subscribers = new Set<() => void>()

function publish(next: boolean) {
  devModeValue = next
  try {
    localStorage.setItem(DEV_MODE_KEY, String(next))
  } catch {
    // storage unavailable
  }
  subscribers.forEach((fn) => fn())
}

function subscribe(onStoreChange: () => void) {
  subscribers.add(onStoreChange)
  return () => subscribers.delete(onStoreChange)
}

function getSnapshot() {
  return devModeValue
}

export function useDevMode() {
  const devModeEnabled = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isToggleKey = e.key.toLowerCase() === 'd'
      const hasModifier = e.metaKey || e.ctrlKey
      if (hasModifier && e.shiftKey && isToggleKey) {
        e.preventDefault()
        const next = !devModeValue
        publish(next)
        track.devModeToggled(next)
      }
    }

    const storageHandler = (event: StorageEvent) => {
      if (event.key === DEV_MODE_KEY) {
        publish(event.newValue === 'true')
      }
    }

    window.addEventListener('keydown', handler)
    window.addEventListener('storage', storageHandler)
    return () => {
      window.removeEventListener('keydown', handler)
      window.removeEventListener('storage', storageHandler)
    }
  }, [])

  return { devModeEnabled }
}
