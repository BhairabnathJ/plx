import { Outlet, useParams } from 'react-router-dom'
import { SessionStatusBar } from './SessionStatusBar'
import { SessionTabBar } from './SessionTabBar'
import { useSession } from '@/services/convex/sessions'
import { SkeletonBlock } from '@/components/primitives/Skeleton'

export function SessionShell() {
  const { sessionId = '' } = useParams()
  const { session, isLoading } = useSession(sessionId)

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <div className="h-statusbar border-b border-neutral-200 bg-white px-4 flex items-center">
          <SkeletonBlock className="h-4 w-48" />
        </div>
        <div className="h-12 border-b border-neutral-200 bg-white px-4 flex items-center gap-2">
          {[1,2,3,4,5,6].map(i => <SkeletonBlock key={i} className="h-7 w-20" />)}
        </div>
        <main className="flex-1 p-6">
          <SkeletonBlock className="h-64 w-full" />
        </main>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="card p-5 text-sm text-neutral-600">
          Session not found or no longer available.
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-0">
      <SessionStatusBar currentStatus={session.status} sessionTitle={session.title} />
      <SessionTabBar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
