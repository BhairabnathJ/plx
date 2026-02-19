import { Outlet } from 'react-router-dom'

export function PublicShell() {
  return (
    <div className="min-h-dvh bg-neutral-50 flex flex-col">
      <header className="py-4 px-4 flex items-center justify-center border-b border-neutral-200 bg-white">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">P</span>
          </div>
          <span className="font-semibold text-neutral-900 text-sm">PlannerBot</span>
        </div>
      </header>
      <main className="flex-1 flex flex-col max-w-lg mx-auto w-full px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
