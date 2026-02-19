import { useState, useEffect } from 'react'
import { DEV_MODE_KEY } from '@/lib/constants'
import { track } from '@/lib/telemetry'

export function useDevMode() {
  const [devModeEnabled, setDevModeEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem(DEV_MODE_KEY) === 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey && e.shiftKey && e.key === 'D') {
        e.preventDefault()
        setDevModeEnabled(prev => {
          const next = !prev
          try {
            localStorage.setItem(DEV_MODE_KEY, String(next))
          } catch {
            // storage unavailable
          }
          track.devModeToggled(next)
          return next
        })
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return { devModeEnabled }
}
