import { Navigate, useParams } from 'react-router-dom'
import { useDevMode } from '@/hooks/useDevMode'

interface DevModeGuardProps {
  children: React.ReactNode
}

export function DevModeGuard({ children }: DevModeGuardProps) {
  const { devModeEnabled } = useDevMode()
  const { groupId = 'group-1' } = useParams()

  if (!devModeEnabled) {
    return <Navigate to={`/app/${groupId}/dashboard`} replace />
  }

  return <>{children}</>
}
