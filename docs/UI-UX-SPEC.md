# PlannerBot UI/UX Specification

## 1. Document Scope
This document defines the complete UI and UX behavior for PlannerBot from onboarding through final event lock-in, including dev-only Live Chat mode (`Cmd+Shift+D`). It is implementation-ready for design and engineering.

## 2. Design Principles
- Fast decisions over endless discussion.
- One primary action per screen.
- AI assistive, never authoritative.
- Mobile-first ergonomics and clear tap feedback.
- Explicit state progression with no hidden transitions.

## 3. Information Architecture
## 3.1 App Shell
- Top navigation with:
  - Group switcher,
  - primary tabs,
  - profile/settings,
  - optional status indicator for background jobs.
- Hidden dev hook for Live Chat tab.

## 3.2 Primary Tabs
- Dashboard
- Sessions
- Polls
- History
- Settings
- Live Chat (dev-only; hidden until shortcut toggle)

## 3.3 Session Detail Sub-Tabs
- Context
- Constraints
- Poll Builder
- Votes
- Summary
- Finalize

## 4. Global Interaction Rules
1. `Cmd+Shift+D` toggles dev mode and reveals/hides Live Chat tab.
2. Dev mode persisted in local storage key: `plannerbot.devModeEnabled`.
3. Session status bar always visible in session detail header:
   - Draft -> Analyzed -> Polling -> Summarized -> Finalized.
4. Any AI-generated text/option must be editable before publish.
5. Error states must provide `Retry`, `Edit Manually`, and `Back` options.

## 5. Navigation and Routing Blueprint
- `/` -> landing/auth
- `/app/:groupId/dashboard`
- `/app/:groupId/sessions`
- `/app/:groupId/sessions/:sessionId/context`
- `/app/:groupId/sessions/:sessionId/constraints`
- `/app/:groupId/sessions/:sessionId/poll-builder`
- `/app/:groupId/sessions/:sessionId/votes`
- `/app/:groupId/sessions/:sessionId/summary`
- `/app/:groupId/sessions/:sessionId/finalize`
- `/app/:groupId/polls/:pollId`
- `/app/:groupId/history`
- `/app/:groupId/settings`
- `/app/:groupId/live-chat` (guarded by dev mode)

## 6. Screen Specifications

## 6.1 Landing/Auth
### Purpose
- Fast entry for organizers.

### Layout
- Hero area with concise value proposition.
- Two auth CTAs: email and phone.
- Secondary text: manual import available in MVP.

### Primary Action
- `Get Started`

### Empty/Error States
- Auth failure inline alert + retry.

## 6.2 Group Dashboard
### Purpose
- Group command center and entry to planning sessions.

### Key Components
- Group card (avatar, name, member count, summary line).
- Group Habits snapshot.
- `New Planning Session` CTA.
- Recent sessions list.

### States
- Empty: no sessions yet -> onboarding hints.
- Populated: quick status chips per session.

## 6.3 New Session Modal/Page
### Purpose
- Create structured planning context.

### Inputs
- Session title.
- Timeframe (preset chips + custom range).
- Activity type chips.
- Context input (paste chat snippets).

### Actions
- `Create Session` (primary)
- `Cancel`

### Validation
- Requires title + one context source.

## 6.4 Context Tab
### Purpose
- Review imported text and prep analysis.

### Components
- Imported snippets list.
- Add-more-text panel.
- Analyze button.

### Actions
- `Analyze Conversation`

## 6.5 Constraints Tab
### Purpose
- Human-in-the-loop constraint verification.

### Components
- Hard constraints list.
- Soft preferences list.
- Mentioned candidates list.
- Add custom constraint form.

### Interaction
- Row-level actions: accept/edit/remove.
- Provenance badge: `Chat`, `Habit`, `Manual`.

### Output Quality Cues
- Confidence level displayed as Low/Med/High.

## 6.6 Poll Builder Tab
### Purpose
- Curate compact, high-signal option sets.

### Structure
- Cards by dimension:
  - Dates,
  - Times,
  - Place vibe,
  - Before/After.

### Controls
- Option pills with selection state.
- Add option input.
- Rename and remove controls.
- Count labels (`3/5 used`).

### Rules
- Enforce recommended option range visually.
- Warn if option overload likely to reduce responses.

## 6.7 Poll Share Tab
### Purpose
- Publish voting experience.

### Components
- Shareable poll URL output.
- Copy link action.
- WhatsApp-ready text preview.
- Publish status badge.

### Actions
- `Publish Poll`
- `Copy Link`
- `Copy WhatsApp Text`

## 6.8 Poll Respond Screen (Public/Mobile-first)
### Purpose
- Fast voting with low friction.

### Layout
- Single-column stacked question cards.
- Question title + helper text.
- Option controls with large tap targets.

### Selection Behavior
- Date/time: multi-select with `N selected` counter.
- Place vibe: single-select radio-like behavior by default.

### Actions
- `Submit Vote`
- `Skip` (clearly marks no response)

### Post-submit
- Confirmation state with ability to edit until poll closes.

## 6.9 Votes Tab
### Purpose
- Decision support and overlap visibility.

### Components
- Per-option tallies.
- Quorum indicator.
- Best combo card + backups.
- Explainability snippet.

### Visual Pattern
- Use consistent semantic colors for `yes`, `no`, `no response`.

## 6.10 Summary Tab
### Purpose
- Convert vote data into channel-ready message.

### Components
- Draft message editor.
- Tone presets (friendly/default/concise).
- Dynamic field tokens for date/time/place/attendance.

### Actions
- `Generate Draft`
- `Copy Message`
- `Save Draft`

## 6.11 Finalize Tab
### Purpose
- Lock event details and reminders.

### Inputs
- Venue name.
- Map link.
- Attendance states.
- Reminder schedule.

### Actions
- `Finalize Event`
- `Send Final Details`

### Result State
- Final event card + reminder schedule summary.

## 6.12 History Tab
### Purpose
- Show planning outcomes and improve defaults.

### Components
- Session/event history cards.
- Trend chips (top days/times/vibes).
- Outcome tags (high turnout, weak turnout).

### Actions
- Filter by date range and activity type.

## 6.13 Live Chat Tab (Dev-only)
### Access
- Appears only when `Cmd+Shift+D` toggles dev mode on.

### Purpose
- Simulate real-time chat analysis workflow before direct WhatsApp integration.

### Components
- Message stream panel.
- Input composer.
- Analyze action buttons (`What do you think?`, `Suggest Polls`).
- Structured insight panel.

### Behavior
- Same app shell and navigation context.
- Clearly labeled as Dev/Experimental.

## 7. Component Specification

## 7.1 Option Pill
- States: default, hover, active, selected, disabled.
- Minimum size: 44px height.
- Selected state includes icon + text cue.

## 7.2 Constraint Row
- States: detected, accepted, edited, removed.
- Inline edit with save/cancel.
- Provenance + confidence metadata.

## 7.3 Vote Badge
- Types: yes, no, maybe, no-response.
- Uses icon + text + color for accessibility.

## 7.4 Combo Card
- Variants: primary, backup, low-confidence.
- Includes ranking reason and voter coverage metrics.

## 7.5 Message Item (Live Chat)
- Variants: user, bot, system.
- Supports markdown-lite formatting.

## 7.6 Reminder Chip
- States: off, day-before, same-day, custom.
- Timezone-aware display.

## 8. UX Copy Patterns
## 8.1 Tone
- Friendly, concise, neutral.
- No command-like language.

## 8.2 Canonical Message Types
- Constraint summary
- Poll suggestions
- Results summary
- Final event summary
- Mid-thread analysis (“what do you think?”)

## 8.3 Copy Rules
- Keep bot responses scannable with bullets.
- Bold only decisive items (winner combo, backup).
- Include confidence/participation context when needed.

## 9. Responsive Behavior
- Mobile-first from 320px.
- Tablet: preserve one-column in voting flows; optional two-column for admin views.
- Desktop: two-pane layouts allowed for heavy editing screens.
- No horizontal scrolling in poll participation flow.

## 10. Accessibility Requirements
- WCAG 2.2 AA contrast ratios.
- Full keyboard navigation and visible focus rings.
- Correct ARIA semantics for toggles, radios, multi-select controls.
- Screen-reader labels for icon actions.
- Focus trap in modal dialogs; focus return on close.

## 11. Error, Empty, and Loading States
## 11.1 Loading
- Use skeletons for list/card surfaces.
- Use inline spinners for scoped actions.

## 11.2 Error
- Message includes cause category and next action.
- Always expose retry and manual fallback.

## 11.3 Empty
- Dashboard no sessions: guided CTA and short checklist.
- History empty: “No finalized plans yet” with link to start session.

## 12. Motion and Feedback
- Short transition durations (150-250ms).
- Selection feedback immediate (<100ms).
- Avoid decorative motion in dense decision screens.

## 13. Telemetry and UX Events
Track events for UX quality and funnel diagnostics:
- `session_created`
- `analysis_triggered`
- `constraints_edited`
- `poll_published`
- `vote_submitted`
- `summary_generated`
- `event_finalized`
- `dev_mode_toggled`
- `live_chat_analysis_triggered`

## 14. UI Acceptance Criteria
- User can move from Draft to Finalized without leaving app shell.
- Live Chat tab only appears after shortcut activation and persists for user.
- Poll responder can complete all questions on mobile with one-thumb interaction.
- All AI outputs are editable before publish.
- Keyboard-only user can complete full organizer flow.

## 15. Implementation Notes for Engineering
- Build reusable component library for pills, chips, cards, and status badges first.
- Enforce central status machine for session lifecycle.
- Use schema-validated server payloads for every LLM-dependent view.
- Keep dev mode feature-flagged in production builds.
