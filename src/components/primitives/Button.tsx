import { forwardRef } from 'react'
import { cn } from '@/lib/cn'
import { Spinner } from './Spinner'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
  fullWidth?: boolean
}

const variantMap: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: [
    'bg-primary-500 text-white',
    'hover:bg-primary-600 active:bg-primary-700',
    'disabled:bg-neutral-200 disabled:text-neutral-400',
    'shadow-sm',
  ].join(' '),
  secondary: [
    'bg-neutral-100 text-neutral-700',
    'hover:bg-neutral-200 active:bg-neutral-300',
    'disabled:opacity-40',
  ].join(' '),
  outline: [
    'border border-neutral-300 bg-white text-neutral-700',
    'hover:bg-neutral-50 active:bg-neutral-100',
    'disabled:opacity-40',
  ].join(' '),
  ghost: [
    'bg-transparent text-neutral-600',
    'hover:bg-neutral-100 active:bg-neutral-200',
    'disabled:opacity-40',
  ].join(' '),
  destructive: [
    'bg-red-50 text-red-600 border border-red-200',
    'hover:bg-red-100 active:bg-red-200',
    'disabled:opacity-40',
  ].join(' '),
}

const sizeMap: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-8 px-3 text-sm rounded-lg gap-1.5',
  md: 'h-10 px-4 text-sm rounded-lg gap-2',
  lg: 'h-11 px-5 text-base rounded-xl gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      iconLeft,
      iconRight,
      fullWidth = false,
      disabled,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-150 ease-ui',
          'select-none cursor-pointer disabled:cursor-not-allowed',
          variantMap[variant],
          sizeMap[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? (
          <Spinner size="sm" />
        ) : (
          iconLeft && <span aria-hidden="true">{iconLeft}</span>
        )}
        {children}
        {!loading && iconRight && <span aria-hidden="true">{iconRight}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'
