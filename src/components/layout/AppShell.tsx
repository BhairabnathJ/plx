import { Outlet } from 'react-router-dom'
import { TopNav } from './TopNav'
import { TabBar } from './TabBar'
import { DevModeBanner } from './DevModeBanner'
import { useDevMode } from '@/hooks/useDevMode'

export function AppShell() {
  const { devModeEnabled } = useDevMode()

  return (
    <div className="flex flex-col min-h-dvh bg-neutral-50">
      {devModeEnabled && <DevModeBanner />}
      <TopNav />
      <TabBar />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  )
}
