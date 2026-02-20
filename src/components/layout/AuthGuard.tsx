import { Navigate, useLocation } from 'react-router-dom'
import { useAuthUser } from '@/services/convex/auth'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuthUser()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center text-sm text-neutral-500">
        Checking session…
      </div>
    )
  }

  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}`
    return <Navigate to={`/auth?mode=signin&returnTo=${encodeURIComponent(returnTo)}`} replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
