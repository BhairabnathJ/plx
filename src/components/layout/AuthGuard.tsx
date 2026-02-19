import { Navigate, useLocation } from 'react-router-dom'
import { useAuthUser } from '@/services/convex/auth'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated } = useAuthUser()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
