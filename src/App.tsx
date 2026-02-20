import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { AppErrorBoundary } from '@/components/feedback/AppErrorBoundary'
import { AppShell } from '@/components/layout/AppShell'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { DevModeGuard } from '@/components/layout/DevModeGuard'
import { PublicShell } from '@/components/layout/PublicShell'
import { SessionShell } from '@/components/layout/SessionShell'

const LandingPage = lazy(() => import('@/pages/Landing/LandingPage').then((m) => ({ default: m.LandingPage })))
const AuthPage = lazy(() => import('@/pages/Auth/AuthPage').then((m) => ({ default: m.AuthPage })))
const DashboardPage = lazy(() => import('@/pages/Dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const SessionsPage = lazy(() => import('@/pages/Sessions/SessionsPage').then((m) => ({ default: m.SessionsPage })))
const SessionHubPage = lazy(() => import('@/pages/Session/Hub/SessionHubPage').then((m) => ({ default: m.SessionHubPage })))
const ContextPage = lazy(() => import('@/pages/Session/ContextTab/ContextPage').then((m) => ({ default: m.ContextPage })))
const ConstraintsPage = lazy(() => import('@/pages/Session/ConstraintsTab/ConstraintsPage').then((m) => ({ default: m.ConstraintsPage })))
const PollBuilderPage = lazy(() => import('@/pages/Session/PollBuilderTab/PollBuilderPage').then((m) => ({ default: m.PollBuilderPage })))
const PollSharePage = lazy(() => import('@/pages/Session/PollShareTab/PollSharePage').then((m) => ({ default: m.PollSharePage })))
const VotesPage = lazy(() => import('@/pages/Session/VotesTab/VotesPage').then((m) => ({ default: m.VotesPage })))
const SummaryPage = lazy(() => import('@/pages/Session/SummaryTab/SummaryPage').then((m) => ({ default: m.SummaryPage })))
const FinalizePage = lazy(() => import('@/pages/Session/FinalizeTab/FinalizePage').then((m) => ({ default: m.FinalizePage })))
const PollRespondPage = lazy(() => import('@/pages/PollRespond/PollRespondPage').then((m) => ({ default: m.PollRespondPage })))
const HistoryPage = lazy(() => import('@/pages/History/HistoryPage').then((m) => ({ default: m.HistoryPage })))
const SettingsPage = lazy(() => import('@/pages/Settings/SettingsPage').then((m) => ({ default: m.SettingsPage })))
const LiveChatPage = lazy(() => import('@/pages/LiveChat/LiveChatPage').then((m) => ({ default: m.LiveChatPage })))

function RouteFrame({ children }: { children: React.ReactNode }) {
  return (
    <AppErrorBoundary>
      <Suspense
        fallback={
          <div className="min-h-[30vh] flex items-center justify-center text-sm text-neutral-500">
            Loading screen…
          </div>
        }
      >
        {children}
      </Suspense>
    </AppErrorBoundary>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RouteFrame><LandingPage /></RouteFrame>,
  },
  {
    path: '/auth',
    element: <RouteFrame><AuthPage /></RouteFrame>,
  },
  {
    path: '/app/:groupId',
    element: (
      <AuthGuard>
        <AppShell />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <RouteFrame><DashboardPage /></RouteFrame>,
      },
      {
        path: 'sessions',
        element: <RouteFrame><SessionsPage /></RouteFrame>,
      },
      {
        path: 'sessions/:sessionId',
        element: <SessionShell />,
        children: [
          {
            index: true,
            element: <RouteFrame><SessionHubPage /></RouteFrame>,
          },
          { path: 'overview', element: <RouteFrame><SessionHubPage /></RouteFrame> },
          { path: 'context', element: <RouteFrame><ContextPage /></RouteFrame> },
          { path: 'constraints', element: <RouteFrame><ConstraintsPage /></RouteFrame> },
          { path: 'poll-builder', element: <RouteFrame><PollBuilderPage /></RouteFrame> },
          { path: 'poll-share', element: <RouteFrame><PollSharePage /></RouteFrame> },
          { path: 'votes', element: <RouteFrame><VotesPage /></RouteFrame> },
          { path: 'summary', element: <RouteFrame><SummaryPage /></RouteFrame> },
          { path: 'finalize', element: <RouteFrame><FinalizePage /></RouteFrame> },
        ],
      },
      {
        path: 'history',
        element: <RouteFrame><HistoryPage /></RouteFrame>,
      },
      {
        path: 'settings',
        element: <RouteFrame><SettingsPage /></RouteFrame>,
      },
      {
        path: 'live-chat',
        element: (
          <DevModeGuard>
            <RouteFrame><LiveChatPage /></RouteFrame>
          </DevModeGuard>
        ),
      },
    ],
  },
  {
    path: '/app/:groupId/polls/:pollId',
    element: <PublicShell />,
    children: [
      {
        index: true,
        element: <RouteFrame><PollRespondPage /></RouteFrame>,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
