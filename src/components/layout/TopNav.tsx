import { Link, useNavigate, useParams } from 'react-router-dom'
import { Settings, User } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useGroup } from '@/services/convex/groups'
import { useAuthUser } from '@/services/convex/auth'

export function TopNav() {
  const navigate = useNavigate()
  const { groupId = 'group-1' } = useParams()
  const { group } = useGroup(groupId)
  const { user } = useAuthUser()

  return (
    <header className="h-nav border-b border-neutral-200 bg-white/90 backdrop-blur-sm flex items-center px-4 gap-3 sticky top-0 z-30">
      {/* Logo / Brand */}
      <Link
        to={`/app/${groupId}/dashboard`}
        className="flex items-center gap-2 mr-2 group"
        aria-label="PlannerBot home"
      >
        <div className={cn(
          'h-7 w-7 rounded-lg bg-primary-500 flex items-center justify-center',
          'shadow-sm group-hover:bg-primary-600 transition-colors duration-150'
        )}>
          <span className="text-white text-xs font-bold">P</span>
        </div>
        <span className="font-semibold text-neutral-900 hidden sm:block text-sm">PlannerBot</span>
      </Link>

      {/* Group name */}
      {group && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 text-sm font-medium text-neutral-700 min-w-0">
          <div className="h-5 w-5 rounded-md bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-bold flex-shrink-0">
            {group.name[0]}
          </div>
          <span className="truncate max-w-[120px]">{group.name}</span>
        </div>
      )}

      <div className="flex-1" />

      {/* Actions */}
      <nav className="flex items-center gap-1" aria-label="User actions">
        <Link
          to={`/app/${groupId}/settings`}
          aria-label="Settings"
          className="h-9 w-9 flex items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors duration-150"
        >
          <Settings size={18} />
        </Link>
        <button
          type="button"
          aria-label="Profile"
          title={user ? `${user.email} profile` : 'Profile'}
          onClick={() => {
            navigate(`/app/${groupId}/settings`)
          }}
          className="h-9 w-9 flex items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors duration-150"
        >
          {user?.name ? (
            <span className="text-xs font-semibold uppercase">
              {user.name.slice(0, 1)}
            </span>
          ) : (
            <User size={18} />
          )}
        </button>
      </nav>
    </header>
  )
}
