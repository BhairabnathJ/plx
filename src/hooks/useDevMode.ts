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
let listenersBound = false

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

function bindGlobalListeners() {
  if (listenersBound) return
  listenersBound = true

  const keyHandler = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase()
    const isToggleKey = key === 'd' || key === 'k'
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

  window.addEventListener('keydown', keyHandler)
  window.addEventListener('storage', storageHandler)
}

export function useDevMode() {
  const devModeEnabled = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  useEffect(() => {
    bindGlobalListeners()
    return () => {
      // Keep global listeners bound for app lifetime.
    }
  }, [])

  return { devModeEnabled }
}
