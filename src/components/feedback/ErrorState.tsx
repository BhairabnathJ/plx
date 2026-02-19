import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/primitives/Button'

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  onEditManually?: () => void
  onBack?: () => void
}

export function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry,
  onEditManually,
  onBack,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-12 px-4 text-center">
      <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center">
        <AlertTriangle size={24} className="text-red-500" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
        {description && (
          <p className="text-sm text-neutral-500 max-w-xs">{description}</p>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {onRetry && (
          <Button variant="primary" size="sm" onClick={onRetry}>
            Try again
          </Button>
        )}
        {onEditManually && (
          <Button variant="outline" size="sm" onClick={onEditManually}>
            Edit manually
          </Button>
        )}
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            Go back
          </Button>
        )}
      </div>
    </div>
  )
}
