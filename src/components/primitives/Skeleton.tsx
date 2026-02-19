import { cn } from '@/lib/cn'

interface SkeletonBlockProps {
  className?: string
  width?: string
  height?: string
}

export function SkeletonBlock({ className, width, height }: SkeletonBlockProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('skeleton', className)}
      style={{ width, height }}
    />
  )
}

interface SkeletonCardProps {
  count?: number
  className?: string
}

export function SkeletonCard({ count = 1, className }: SkeletonCardProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn('card p-4 space-y-3', className)}>
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-9 w-9 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <SkeletonBlock className="h-4 w-3/4" />
              <SkeletonBlock className="h-3 w-1/2" />
            </div>
          </div>
          <SkeletonBlock className="h-3 w-full" />
          <SkeletonBlock className="h-3 w-5/6" />
        </div>
      ))}
    </>
  )
}
