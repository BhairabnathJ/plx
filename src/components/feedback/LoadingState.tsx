import { Spinner } from '@/components/primitives/Spinner'

interface LoadingStateProps {
  label?: string
}

export function LoadingState({ label = 'Loading…' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14">
      <Spinner size="lg" />
      <p className="text-sm text-neutral-500">{label}</p>
    </div>
  )
}
