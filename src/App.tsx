import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { PublicShell } from '@/components/layout/PublicShell'
import { SessionShell } from '@/components/layout/SessionShell'
import { DevModeGuard } from '@/components/layout/DevModeGuard'
import { LandingPage } from '@/pages/Landing/LandingPage'
import { DashboardPage } from '@/pages/Dashboard/DashboardPage'
import { SessionsPage } from '@/pages/Sessions/SessionsPage'
import { ContextPage } from '@/pages/Session/ContextTab/ContextPage'
import { ConstraintsPage } from '@/pages/Session/ConstraintsTab/ConstraintsPage'
import { PollBuilderPage } from '@/pages/Session/PollBuilderTab/PollBuilderPage'
import { PollSharePage } from '@/pages/Session/PollShareTab/PollSharePage'
import { VotesPage } from '@/pages/Session/VotesTab/VotesPage'
import { SummaryPage } from '@/pages/Session/SummaryTab/SummaryPage'
import { FinalizePage } from '@/pages/Session/FinalizeTab/FinalizePage'
import { PollRespondPage } from '@/pages/PollRespond/PollRespondPage'
import { HistoryPage } from '@/pages/History/HistoryPage'
import { SettingsPage } from '@/pages/Settings/SettingsPage'
import { LiveChatPage } from '@/pages/LiveChat/LiveChatPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
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
        element: <DashboardPage />,
      },
      {
        path: 'sessions',
        element: <SessionsPage />,
      },
      {
        path: 'sessions/:sessionId',
        element: <SessionShell />,
        children: [
          {
            index: true,
            element: <Navigate to="context" replace />,
          },
          { path: 'context', element: <ContextPage /> },
          { path: 'constraints', element: <ConstraintsPage /> },
          { path: 'poll-builder', element: <PollBuilderPage /> },
          { path: 'poll-share', element: <PollSharePage /> },
          { path: 'votes', element: <VotesPage /> },
          { path: 'summary', element: <SummaryPage /> },
          { path: 'finalize', element: <FinalizePage /> },
        ],
      },
      {
        path: 'history',
        element: <HistoryPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'live-chat',
        element: (
          <DevModeGuard>
            <LiveChatPage />
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
        element: <PollRespondPage />,
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
