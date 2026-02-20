import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronDown, LogOut, Settings, User } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useGroups } from '@/services/convex/groups'
import { useAuthUser, useLogin } from '@/services/convex/auth'

export function TopNav() {
  const navigate = useNavigate()
  const { groupId: routeGroupId } = useParams()
  const { groups } = useGroups()
  const { user } = useAuthUser()
  const { logout } = useLogin()

  const [groupMenuOpen, setGroupMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const groupMenuRef = useRef<HTMLDivElement>(null)
  const profileMenuRef = useRef<HTMLDivElement>(null)

  const activeGroup = groups.find((group) => group.id === routeGroupId) ?? groups[0] ?? null
  const activeGroupId = activeGroup?.id ?? routeGroupId ?? ''

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (groupMenuRef.current && !groupMenuRef.current.contains(event.target as Node)) {
        setGroupMenuOpen(false)
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false)
      }
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setGroupMenuOpen(false)
        setProfileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onEscape)
    }
  }, [])

  return (
    <header className="h-nav border-b border-neutral-200 bg-white/90 backdrop-blur-sm flex items-center px-4 gap-3 sticky top-0 z-30">
      <Link
        to={activeGroupId ? `/app/${activeGroupId}/dashboard` : '/'}
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

      {activeGroup ? (
        <div className="relative" ref={groupMenuRef}>
          <button
            type="button"
            onClick={() => {
              setGroupMenuOpen((current) => !current)
              setProfileMenuOpen(false)
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 text-sm font-medium text-neutral-700 min-w-0 hover:bg-neutral-200 transition-colors"
            aria-haspopup="menu"
            aria-expanded={groupMenuOpen}
          >
            <div className="h-5 w-5 rounded-md bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-bold flex-shrink-0">
              {activeGroup.name[0]}
            </div>
            <span className="truncate max-w-[120px]">{activeGroup.name}</span>
            <ChevronDown size={14} className={cn('transition-transform', groupMenuOpen && 'rotate-180')} />
          </button>

          {groupMenuOpen && (
            <div
              role="menu"
              className="absolute top-full mt-2 left-0 w-64 rounded-xl border border-neutral-200 bg-white shadow-lg p-1.5 z-40"
            >
              {groups.map((group) => {
                const isActive = group.id === activeGroupId
                return (
                  <button
                    key={group.id}
                    role="menuitem"
                    type="button"
                    onClick={() => {
                      setGroupMenuOpen(false)
                      if (group.id !== activeGroupId) {
                        navigate(`/app/${group.id}/dashboard`)
                      }
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    )}
                  >
                    <div className="font-medium truncate">{group.name}</div>
                    <div className="text-xs text-neutral-500">{group.memberCount ?? 0} members</div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          className="px-3 py-1.5 rounded-lg bg-neutral-100 text-sm font-medium text-neutral-700 hover:bg-neutral-200 transition-colors"
          onClick={() => navigate('/auth?mode=signin')}
        >
          Choose group
        </button>
      )}

      <div className="flex-1" />

      <nav className="flex items-center gap-1" aria-label="User actions">
        <Link
          to={activeGroupId ? `/app/${activeGroupId}/settings` : '/auth?mode=signin'}
          aria-label="Settings"
          className="h-9 w-9 flex items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors duration-150"
        >
          <Settings size={18} />
        </Link>

        <div className="relative" ref={profileMenuRef}>
          <button
            type="button"
            aria-label="Profile"
            aria-haspopup="menu"
            aria-expanded={profileMenuOpen}
            title={user ? `${user.email ?? user.username ?? 'Account'} profile` : 'Profile'}
            onClick={() => {
              setProfileMenuOpen((current) => !current)
              setGroupMenuOpen(false)
            }}
            className="h-9 w-9 flex items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors duration-150"
          >
            {user?.name ? (
              <span className="text-xs font-semibold uppercase">{user.name.slice(0, 1)}</span>
            ) : (
              <User size={18} />
            )}
          </button>

          {profileMenuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-neutral-200 bg-white shadow-lg p-1.5 z-40"
            >
              <div className="px-2.5 py-2 border-b border-neutral-100">
                <p className="text-sm font-medium text-neutral-900 truncate">{user?.name ?? 'Account'}</p>
                <p className="text-xs text-neutral-500 truncate">{user?.email ?? user?.username ?? ''}</p>
              </div>
              <button
                role="menuitem"
                type="button"
                onClick={() => {
                  setProfileMenuOpen(false)
                  navigate(activeGroupId ? `/app/${activeGroupId}/settings` : '/auth?mode=signin')
                }}
                className="w-full mt-1 text-left px-3 py-2 rounded-lg text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                Account settings
              </button>
              <button
                role="menuitem"
                type="button"
                onClick={async () => {
                  setProfileMenuOpen(false)
                  await logout()
                  navigate('/auth?mode=signin', { replace: true })
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-700 hover:bg-red-50 transition-colors inline-flex items-center gap-2"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}
