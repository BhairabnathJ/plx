PlannerBot UI Implementation Plan

     Context                                                                                        
   
     PlannerBot is a web app for converting messy group chats into structured polls and event       
     recommendations. The frontend is being built from scratch (Vite + React + TypeScript +
     Tailwind CSS + React Router v6). The Convex backend and OpenRouter LLM integration are
     being set up in parallel by the user. This plan covers the full UI layer with stub-pattern
     service integration so every screen renders immediately with mock data, ready to swap for
     real Convex hooks.

     ---
     Phase 0: Scaffold and Foundations

     0.1 Project Initialization

     npm create vite@latest . -- --template react-ts
     npm install tailwindcss @tailwindcss/vite postcss
     npm install react-router-dom convex
     npm install -D @types/react @types/react-dom

     0.2 Config Files

     - vite.config.ts — basic Vite + React config
     - tailwind.config.ts — full design token system (see tokens section)
     - tsconfig.app.json — strict mode + noUncheckedIndexedAccess
     - postcss.config.js
     - index.html
     - .env.example — VITE_CONVEX_URL, VITE_APP_ENV

     0.3 TypeScript Types (src/types/)

     Write canonical types before any component. Files in order:
     1. user.ts, group.ts
     2. session.ts — includes SessionStatus union: 'draft' | 'analyzed' | 'polling' |
     'summarized' | 'finalized'
     3. constraint.ts — ProvenanceTag, ConfidenceLevel, ConstraintState
     4. poll.ts — PollDimension, PollOption, PollOptionBundle
     5. vote.ts — VoteMatrix, VoteType, BestComboResult
     6. summary.ts, event.ts, habit.ts
     7. llm.ts — ConstraintExtractionResult, PollOptionBundle, SummaryMessageDraft,
     ConsensusInsight
     8. index.ts — barrel re-export

     0.4 Constants and Utilities (src/lib/)

     - constants.ts — DEV_MODE_KEY, POLL_OPTION_LIMITS, SESSION_STATUSES
     - session-machine.ts — pure canTransition(from, to) and nextStatus(current) functions
     - formatting.ts — date/time/timezone helpers
     - telemetry.ts — no-op stubs for all 9 UX events from spec section 13
     - validators.ts — schema validation helpers for LLM outputs

     0.5 Service Stubs (src/services/ + src/fixtures/)

     Every service hook exports a stable signature. Stub bodies return fixture data. Real Convex
      hooks replace the bodies — never the signatures.

     Stub pattern example:
     // src/services/convex/sessions.ts
     export function useSessions(groupId: string): { sessions: Session[]; isLoading: boolean;
     error: Error | null }
     export function useCreateSession(): { createSession: (input) => Promise<string>; isLoading:
      boolean }

     Fixture files in src/fixtures/: users, groups, sessions (one per status), constraints,
     poll-options, votes, summaries, events, habits

     Service files:
     - src/services/convex/ — groups, sessions, constraints, polls, votes, summaries, events,
     habits
     - src/services/api/session.ts — analyzeSession(), generateOptions() (simulate 1.5-2s
     latency)
     - src/services/api/summary.ts — generateSummary()
     - src/services/api/live-chat.ts — analyzeConsensus()

     0.6 Router Setup (src/App.tsx)

     Use createBrowserRouter + RouterProvider. Full nested route tree:
     /                                  → LandingPage
     /app/:groupId/dashboard            → DashboardPage (in AppShell)
     /app/:groupId/sessions             → SessionsPage (in AppShell)
     /app/:groupId/sessions/:sessionId  → SessionLayout (in AppShell)
       context | constraints | poll-builder | votes | summary | finalize
     /app/:groupId/polls/:pollId        → PollRespondPage (in PublicShell)
     /app/:groupId/history              → HistoryPage (in AppShell)
     /app/:groupId/settings             → SettingsPage (in AppShell)
     /app/:groupId/live-chat            → LiveChatPage guarded by DevModeGuard (in AppShell)

     0.7 Dev Mode Hook (src/hooks/useDevMode.ts)

     - Listen for Cmd+Shift+D globally
     - Toggle and persist to localStorage key plannerbot.devModeEnabled
     - Return { devModeEnabled: boolean }

     ---
     Phase 1: Layout Shell

     Build in dependency order. Nothing renders until the shell exists.

     1. Primitive components (src/components/primitives/):
       - Spinner, SkeletonBlock, SkeletonCard (needed for every loading state)
       - Button — variants: primary, secondary, ghost, destructive; sizes: sm/md/lg
       - Badge, Chip
       - Input, Textarea, Select
       - Modal — with focus trap, focus-return-on-close
       - Tooltip, ProgressBar, Divider
     2. Layout components (src/components/layout/):
       - TopNav — group switcher, profile, optional status indicator
       - GroupSwitcher
       - TabBar — reads useDevMode, conditionally renders Live Chat tab
       - DevModeBanner — persistent strip when dev mode active
       - AppShell — composes nav + tabs + <Outlet>
       - SessionStatusBar — Draft→Analyzed→Polling→Summarized→Finalized; always visible in
     session detail
       - SessionTabBar — Context/Constraints/Poll Builder/Votes/Summary/Finalize tabs
       - SessionShell — status bar + session tab bar + <Outlet>
       - PublicShell — minimal shell for poll respond page
     3. Feedback components (src/components/feedback/):
       - ErrorState — Retry + Edit Manually + Back (all three buttons optional per context)
       - EmptyState
       - LoadingState

     ---
     Phase 2: Domain Components (src/components/domain/)

     Build per spec section 7. Each component is fully self-contained and demoed in isolation.


     Component: OptionPill
     States/Variants: default, hover, active, selected, disabled
     Key constraints: min-h-[44px]; optional onRemove/onRename
     ────────────────────────────────────────
     Component: ConstraintRow
     States/Variants: detected, accepted, edited, removed
     Key constraints: Inline edit with save/cancel; provenance badge + confidence
     ────────────────────────────────────────
     Component: VoteBadge
     States/Variants: yes, no, maybe, no-response
     Key constraints: Always icon + text + color (never icon-only)
     ────────────────────────────────────────
     Component: ComboCard
     States/Variants: primary, backup, low-confidence
     Key constraints: voter coverage %, ranking reason, select action
     ────────────────────────────────────────
     Component: MessageItem
     States/Variants: user, bot, system
     Key constraints: markdown-lite; bot typing indicator
     ────────────────────────────────────────
     Component: ReminderChip
     States/Variants: off, day-before, same-day, custom
     Key constraints: timezone-aware display

     Also build:
     - SessionStatusBadge — colored chip per status
     - SessionCard — used in dashboard + sessions list
     - NewSessionModal — title, timeframe chips, activity type chips, context textarea

     ---
     Phase 3: Core Organizer Flow

     Build in session lifecycle order. All screens wired to service stubs.

     1. Landing (/) — hero + email/phone auth CTAs
     2. Dashboard — group card, habits snapshot, New Session CTA (opens modal), recent sessions
     list
     3. Sessions List — filterable list of session cards
     4. Context Tab — snippet list, add-more-text panel, Analyze button with 2s simulated
     loading
     5. Constraints Tab — three sections (hard/soft/mentions), ConstraintRow per item, add form,
      confidence levels
     6. Poll Builder Tab — four DimensionCards (dates/times/place/before-after), OptionPills,
     count labels (3/5 used), add/remove/rename
     7. Poll Share Tab — URL display, Copy Link, Copy WhatsApp Text, Publish Poll action
     8. Votes Tab — per-option tallies, quorum indicator, BestComboSection with primary + 1-2
     backups + explainability
     9. Summary Tab — draft textarea pre-filled from AI, tone preset chips
     (friendly/default/concise), Copy Message + Save Draft
     10. Finalize Tab — venue name, map link, attendance states, reminder schedule
     (ReminderChips), Finalize Event → final event card

     AI output pattern (applied consistently across all tabs):
     - AI result stored as draftValue in local state
     - Always show a controlled editor (never read-only display)
     - Save/publish sends current draftValue (AI or edited)
     - On failure: ErrorState with Retry / Edit Manually / Back

     ---
     Phase 4: Participant Flow + Secondary Pages

     1. Poll Respond (/app/:groupId/polls/:pollId) — no auth required; single-column stacked
     QuestionCards; multi-select for date/time, single-select for place; large tap targets (min
     44px); Submit Vote → confirmation state with edit-until-close
     2. History Tab — session/event cards, trend chips (top days/times/vibes), outcome tags,
     filter by date range + activity type
     3. Settings Tab — profile, group settings, reminder defaults

     ---
     Phase 5: Dev-Only Live Chat

     Only after DevModeGuard is proven working.

     - LiveChatPage — same AppShell, DevModeBanner visible
     - MessageStream — scrollable message history
     - ChatComposer — text input + send button
     - Analyze action buttons: "What do you think?", "Suggest Polls"
     - InsightPanel — structured result from analyzeConsensus() stub
     - Label: "Dev / Experimental" throughout

     ---
     Phase 6: Polish Pass

     - Skeleton loading on every list/card surface (animate-pulse)
     - Error and empty states on every async path
     - Transition classes: duration-[150ms] selection feedback, duration-200 modals,
     duration-250 page transitions; timing: ease-[cubic-bezier(0.2,0,0,1)]
     - WCAG 2.2 AA: focus rings on all interactive elements, correct ARIA roles for
     toggles/radios/multi-select, screen-reader labels for icon-only actions, focus trap in
     modals
     - Telemetry: wire all 9 track.* calls at correct action points (currently no-ops)
     - Mobile-first from 320px; tablet: one-column voting flows; desktop: two-pane for editing
     screens

     ---
     Design Tokens (Tailwind)

     Colors

     primary: { 500: '#4a5af0', 600: '#3a46d4', ... }   // brand accent
     neutral: { 50: '#f8f9fb', 100: '#f0f2f6', ... 900: '#111827' }
     status:  { draft: '#9aa4b3', analyzed: '#f59e0b', polling: '#3b82f6', summarized:
     '#8b5cf6', finalized: '#10b981' }
     vote:    { yes: '#10b981', no: '#ef4444', maybe: '#f59e0b', noResponse: '#9aa4b3' }
     provenance: { chat: '#3b82f6', habit: '#8b5cf6', manual: '#6b7689' }
     confidence: { high: '#10b981', medium: '#f59e0b', low: '#ef4444' }

     Sizing

     - min-h-[44px] for all tap targets (WCAG)
     - Nav height: h-14 (56px), tab bar: h-12 (48px), status bar: h-9 (36px)

     Shadows

     - Cards: subtle shadow-sm; primary combo card: blue glow
     shadow-[0_4px_16px_0_rgb(74_90_240/0.16)]

     ---
     Directory Structure

     src/
     ├── main.tsx
     ├── App.tsx                    # Router root
     ├── types/                     # Canonical shared types (write first)
     ├── lib/                       # Pure utilities, no React
     ├── fixtures/                  # Mock data for all entities
     ├── services/
     │   ├── convex/                # Stub hooks → swap for real Convex queries
     │   └── api/                   # LLM API call stubs
     ├── hooks/                     # useDevMode, useSessionStatus, useClipboard, etc.
     ├── components/
     │   ├── primitives/            # Button, Badge, Modal, Skeleton, etc.
     │   ├── domain/                # OptionPill, ConstraintRow, VoteBadge, etc.
     │   ├── layout/                # AppShell, SessionShell, TopNav, TabBar
     │   └── feedback/              # ErrorState, EmptyState, LoadingState
     └── pages/
         ├── Landing/
         ├── Dashboard/
         ├── Sessions/
         ├── Session/               # All 6 sub-tab pages
         ├── PollRespond/
         ├── History/
         ├── Settings/
         └── LiveChat/

     ---
     Critical Files (in order of creation)

     1. package.json, vite.config.ts, tailwind.config.ts, tsconfig.app.json
     2. src/types/index.ts — single most load-bearing file; everything derives from it
     3. src/lib/constants.ts, src/lib/session-machine.ts
     4. src/fixtures/*.ts + src/services/convex/*.ts + src/services/api/*.ts
     5. src/hooks/useDevMode.ts
     6. src/App.tsx (router)
     7. src/components/primitives/ (Button, Modal, Skeleton first)
     8. src/components/layout/AppShell.tsx
     9. src/components/domain/ (all 6 spec section 7 components)
     10. All page files (dashboard → finalize → poll respond → history → live chat)

     ---
     Convex Integration Points

     When the Convex backend is ready, swap stub bodies in src/services/convex/*.ts one file at
     a time. Signatures never change. Example:
     // Before (stub)
     export function useSessions(groupId: string) {
       return { sessions: MOCK_SESSIONS, isLoading: false, error: null }
     }
     // After (real)
     export function useSessions(groupId: string) {
       return useQuery(api.sessions.listByGroup, { groupId })
     }

     LLM calls (src/services/api/) go through Convex Actions server-side — never directly from
     the browser. The OPENROUTER_API_KEY is server-only and must never be in VITE_* env vars.

     ---
     Verification

     - All routes render without errors with mock data
     - Cmd+Shift+D toggles Live Chat tab; state persists across refresh
     - Session status bar updates correctly as status progresses
     - Poll Respond page completes on mobile viewport (375px) with one-thumb interaction
     - All AI output fields are editable before any save/publish action
     - Keyboard-only navigation completes the full organizer flow
     - WCAG contrast check passes on all status/vote/provenance colors
