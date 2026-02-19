import { Zap } from 'lucide-react'

export function DevModeBanner() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-amber-400 text-amber-900 flex items-center justify-center gap-2 py-1.5 px-4 text-xs font-semibold"
    >
      <Zap size={12} aria-hidden />
      Dev / Experimental Mode Active — Press Cmd+Shift+D to exit
    </div>
  )
}
