import { forwardRef } from 'react'
import { cn } from '@/lib/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, iconLeft, iconRight, className, id, ...props }, ref) => {
    const inputId = id ?? `input-${Math.random().toString(36).slice(2)}`
    const errorId = `${inputId}-error`
    const hintId = `${inputId}-hint`

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-neutral-700">
            {label}
          </label>
        )}
        <div className="relative">
          {iconLeft && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" aria-hidden>
              {iconLeft}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-describedby={[error ? errorId : '', hint ? hintId : ''].filter(Boolean).join(' ') || undefined}
            aria-invalid={error ? 'true' : undefined}
            className={cn(
              'w-full h-10 rounded-lg border bg-white text-sm text-neutral-900 placeholder-neutral-400',
              'transition-colors duration-150 ease-ui',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 focus:border-primary-400',
              iconLeft ? 'pl-9' : 'pl-3',
              iconRight ? 'pr-9' : 'pr-3',
              error
                ? 'border-red-400 focus:ring-red-400'
                : 'border-neutral-300 hover:border-neutral-400',
              className
            )}
            {...props}
          />
          {iconRight && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" aria-hidden>
              {iconRight}
            </span>
          )}
        </div>
        {hint && !error && (
          <p id={hintId} className="text-xs text-neutral-500">{hint}</p>
        )}
        {error && (
          <p id={errorId} role="alert" className="text-xs text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
