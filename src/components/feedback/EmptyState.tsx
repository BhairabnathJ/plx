import { Button } from '@/components/primitives/Button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-14 px-4 text-center">
      {icon && (
        <div className="h-14 w-14 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400">
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
        {description && (
          <p className="text-sm text-neutral-500 max-w-xs">{description}</p>
        )}
      </div>
      {action && (
        <Button variant="primary" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
