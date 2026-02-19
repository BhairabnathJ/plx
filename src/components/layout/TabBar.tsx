import { NavLink, useParams } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, BarChart2, History, Settings, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useDevMode } from '@/hooks/useDevMode'

interface TabItem {
  to: string
  label: string
  icon: React.ReactNode
  devOnly?: boolean
}

export function TabBar() {
  const { groupId = 'group-1' } = useParams()
  const { devModeEnabled } = useDevMode()

  const tabs: TabItem[] = [
    { to: `/app/${groupId}/dashboard`, label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: `/app/${groupId}/sessions`, label: 'Sessions', icon: <CalendarDays size={18} /> },
    { to: `/app/${groupId}/history`, label: 'History', icon: <History size={18} /> },
    { to: `/app/${groupId}/settings`, label: 'Settings', icon: <Settings size={18} /> },
    { to: `/app/${groupId}/live-chat`, label: 'Live Chat', icon: <MessageSquare size={18} />, devOnly: true },
  ]

  const visibleTabs = tabs.filter(t => !t.devOnly || devModeEnabled)

  return (
    <nav
      aria-label="Primary navigation"
      className="border-b border-neutral-200 bg-white overflow-x-auto"
    >
      <div className="flex items-center px-2 h-tabbar min-w-max">
        {visibleTabs.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 px-3.5 h-full text-sm font-medium',
                'border-b-2 transition-all duration-150 ease-ui whitespace-nowrap',
                isActive
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300',
                tab.devOnly && 'text-amber-600 hover:text-amber-700'
              )
            }
          >
            <span aria-hidden="true">{tab.icon}</span>
            {tab.label}
            {tab.devOnly && (
              <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                DEV
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
