import { NavLink, useParams } from 'react-router-dom'
import { cn } from '@/lib/cn'

const SESSION_TABS = [
  { path: 'overview', label: 'Overview' },
  { path: 'context', label: 'Context' },
  { path: 'constraints', label: 'Constraints' },
  { path: 'poll-builder', label: 'Poll Builder' },
  { path: 'poll-share', label: 'Share' },
  { path: 'votes', label: 'Votes' },
  { path: 'summary', label: 'Summary' },
  { path: 'finalize', label: 'Finalize' },
]

export function SessionTabBar() {
  const { groupId, sessionId } = useParams()

  return (
    <nav
      aria-label="Session tabs"
      className="border-b border-neutral-200 bg-white overflow-x-auto"
    >
      <div className="flex items-center px-4 h-12 min-w-max gap-1">
        {SESSION_TABS.map(tab => (
          <NavLink
            key={tab.path}
            to={`/app/${groupId}/sessions/${sessionId}/${tab.path}`}
            className={({ isActive }) =>
              cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ease-ui whitespace-nowrap',
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100'
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
