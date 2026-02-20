# PlannerBot Audit Delivery Plan (Claude Backend + Codex Frontend/Integration)

- Timestamp: 2026-02-20
- Repo: `/Users/theri/Documents/trials/planner-bot`
- Worktrees:
  - Claude: `/Users/theri/Documents/trials/planner-bot/wt-claude-code`
  - Codex: `/Users/theri/Documents/trials/planner-bot/wt-codex`

## Ownership Contract
- Claude owns backend/data/auth/LLM/security:
  - OpenRouter runtime/fallback/envelopes/observability
  - Convex contracts/schema/migrations/indexes
  - Clerk backend identity/session enforcement
  - Poll token expiry/revoke/close/rate limiting checks
  - Status transition guards and reminder scheduler backend
  - History analytics aggregation jobs
- Codex owns frontend/UI/UX/navigation/accessibility/integration/merge:
  - Auth UX and onboarding flow
  - TopNav/profile/group switcher/logout UI
  - Settings persistence UX + destructive flow UX
  - Session IA refactor to Hub + Stage Cards
  - Constraints provenance/confidence UX
  - Poll builder/share/respond UX and accessibility
  - Votes explainability and summary/finalize UX
  - Error boundaries/loading/error states/code splitting
  - Integration merges and final push to `main`

## Branch Plan
### Claude backend branches
1. `codex/feat-backend-ai-runtime-hardening-secrets`
2. `codex/feat-backend-ai-contracts-observability`
3. `codex/feat-backend-auth-clerk-identity-enforcement`
4. `codex/feat-backend-data-defixture-route-integrity`
5. `codex/feat-backend-poll-token-security-lifecycle`
6. `codex/feat-backend-finalize-datetime-reminder-scheduler`
7. `codex/feat-backend-session-status-guardrails`
8. `codex/feat-backend-history-analytics-aggregations`

### Codex frontend + integration branches
9. `codex/feat-frontend-auth-ux-onboarding`
10. `codex/feat-frontend-topnav-profile-group-switcher`
11. `codex/feat-frontend-settings-persistence-account-actions`
12. `codex/feat-frontend-session-hub-stage-navigation`
13. `codex/feat-frontend-constraints-provenance-confidence`
14. `codex/feat-frontend-poll-builder-share-fixes`
15. `codex/feat-frontend-votes-summary-finalize-explainability`
16. `codex/feat-frontend-poll-respond-a11y-validation`
17. `codex/feat-frontend-history-trends-ui`
18. `codex/feat-frontend-global-error-boundary-loading`
19. `codex/feat-integration-merge-and-mainline-release`

## Merge Order (Strict)
1. Claude branches 1-2
2. Claude branch 3
3. Claude branches 4 and 7
4. Claude branches 5 and 6
5. Claude branch 8
6. Codex branches 9-18 (functional order)
7. Codex branch 19
8. Push `main`

## Issue Matrix (All Audit IDs Assigned)
| Audit ID | Issue | Severity | Owner | Branch | Acceptance Criteria | Dependencies |
|---|---|---|---|---|---|---|
| 1 | Auth mode toggles confusing | P1 | Codex | 9 | Proper auth tabs/segmented control with clear mode labels | 3 |
| 2 | Hidden persisted form values on mode switch | P0 | Codex | 9 | Mode switches reset or explicitly preserve visible fields only | 3 |
| 3 | No password strength/show toggle | P1 | Codex | 9 | Password meter + show/hide implemented | 3 |
| 4 | Weak auth field validation | P0 | Claude | 3 | Server-side validation with clear error codes | None |
| 5 | `defaultGroupId` error logic broken | P0 | Claude | 4 | Signup/login route to group chooser if no membership | 3 |
| 6 | Email/username login confusion/autofill mismatch | P1 | Codex | 9 | Auth copy and autofill attributes corrected | 3 |
| 7 | Raw technical auth errors surfaced | P1 | Codex | 18 | Friendly mapped errors + retry action | 3 |
| 8 | Missing reset/verification flow | P1 | Claude | 3 | Clerk reset/verify wired backend and exposed to UI | None |
| 9 | AuthGuard silent failure/blank redirect | P0 | Codex | 18 | Unauthorized/expired states show explicit screens | 3 |
| 10 | Auto-entry to wrong group on login | P0 | Claude | 4 | Membership-based routing only, no fallback group leakage | 3 |
| 11 | Profile and Settings buttons duplicate action | P1 | Codex | 10 | Profile menu distinct from settings route | None |
| 12 | No profile quick actions menu | P2 | Codex | 10 | Profile menu includes account, settings, logout | 3 |
| 13 | No group switch UI | P1 | Codex | 10 | Functional group switcher dropdown | 4 |
| 14 | Multi-group users forced to edit URL | P0 | Codex | 10 | Group switch updates route and data context safely | 4 |
| 15 | Settings fake save timeout | P0 | Claude | 4 | Real Convex mutations replace fake delay | None |
| 16 | Display name not persisted | P0 | Claude | 4 | User profile updates persist and rehydrate | None |
| 17 | Group rename fake/no permissions | P0 | Claude | 4 | Role-gated rename mutation and validation | None |
| 18 | Notification toggles fake | P1 | Claude | 4 | Persisted notification prefs with read/write | None |
| 19 | Delete account button no-op | P0 | Claude | 3 | Account deletion mutation + session invalidation | None |
| 20 | Fixture `CURRENT_USER` used in settings | P0 | Claude | 4 | Runtime uses live auth user only | None |
| 21 | Hardcoded `group-1` defaults in UI/routes | P0 | Claude | 4 | Hardcoded fallback removed from runtime paths | None |
| 22 | Decorative/dead session actions | P1 | Codex | 12 | All action buttons have working handlers/routes | 4 |
| 23 | Habit profile is mock only | P1 | Claude | 8 | Habits computed from persisted history | None |
| 24 | Habit confidence displayed without meaning | P2 | Codex | 17 | Confidence legend/tooltips added | 8 |
| 25 | Context viewer cramped/inflexible | P2 | Codex | 12 | Expandable/fullscreen context inspection UI | None |
| 26 | Re-analyze can overwrite without warning | P1 | Codex | 13 | Confirm modal with overwrite warning | 2 |
| 27 | No extracted preview after analyze | P1 | Codex | 13 | Inline extraction preview before tab change | 2 |
| 28 | No provenance badges in constraints UI | P1 | Codex | 13 | Provenance tags rendered per constraint | 2 |
| 29 | No confidence filter controls | P2 | Codex | 13 | Filter chips by confidence/provenance | 2 |
| 30 | No bulk accept/reject | P1 | Codex | 13 | Bulk controls with count feedback | 2 |
| 31 | No undo for bulk changes | P2 | Codex | 13 | Undo last bulk action supported | 2 |
| 32 | Provenance/confidence schema not reflected in UX | P1 | Claude | 2 | Contracts expose fields consistently to frontend | None |
| 33 | PollBuilder hardcoded `session-1` gating | P0 | Claude | 4 | Options load for all valid sessions/polls | None |
| 34 | Generate options is fake timeout | P0 | Claude | 1 | Generate calls real AI action and returns data | None |
| 35 | Option limits only client-side warning | P1 | Claude | 2 | Backend validates/enforces dimension caps | None |
| 36 | `selectedIds` selection semantics broken/decorative | P1 | Codex | 14 | Selection has functional include/exclude publish meaning | 2 |
| 37 | Over-limit not blocking publish | P1 | Claude | 5 | Publish blocked on invalid option bundle | 2 |
| 38 | Poll share URL hardcoded `group-1` | P0 | Codex | 14 | Poll URL built from actual route/group context | 4 |
| 39 | No revoke/unpublish lifecycle | P1 | Claude | 5 | Publish, close, revoke flows implemented | None |
| 40 | No poll view/completion analytics | P2 | Claude | 8 | Poll funnel metrics available in backend | None |
| 41 | Poll token fallback (`abc123xyz`) bypass | P0 | Claude | 5 | Missing token rejected with explicit error | None |
| 42 | Poll tokens never expire | P0 | Claude | 5 | Token TTL/expiry validation enforced | None |
| 43 | No rate limiting for responses | P1 | Claude | 5 | Basic per-token/IP guardrails in place | None |
| 44 | Vote edit audit trail missing | P2 | Claude | 5 | Vote revisions timestamped/versioned | None |
| 45 | “Edit until poll closes” but no close behavior | P1 | Claude | 5 | Poll close state enforced in API and UI behavior | None |
| 46 | Poll respond accessibility semantics incomplete | P1 | Codex | 16 | Proper radio/checkbox roles + aria-live updates | None |
| 47 | Combo score unexplained in votes | P1 | Claude | 2 | Explainability metadata returned with combos | None |
| 48 | Combo select buttons no-op | P1 | Codex | 15 | Combo select pre-fills finalize flow | 2 |
| 49 | Arbitrary “top option” highlight rule | P2 | Claude | 2 | Ranking rationale data drives highlighting | None |
| 50 | Tone selection not reliably applied in summary | P1 | Claude | 2 | Tone enforced in summary action contract | None |
| 51 | Summary failure leaves stale generated text context | P1 | Codex | 15 | Stale/failure state explicitly marked in UI | 2 |
| 52 | “Edit manually” behavior unclear | P2 | Codex | 15 | Explicit manual mode switch and status indicator | 2 |
| 53 | No summary version history | P2 | Claude | 4 | Draft/history records persisted and retrievable | None |
| 54 | Finalize builds invalid datetime string | P0 | Claude | 6 | Canonical timezone-aware ISO stored | None |
| 55 | Free text date/time input unreliable | P1 | Codex | 15 | Structured date/time inputs only | 6 |
| 56 | Map URL not validated | P2 | Claude | 6 | URL validation and normalization applied | None |
| 57 | Attendance snapshot origin unclear | P2 | Codex | 15 | Source + last updated shown | 8 |
| 58 | Reminder logic not implemented | P1 | Claude | 6 | Reminder scheduling and execution path implemented | None |
| 59 | Finalized events not truly locked | P1 | Claude | 7 | Guarded mutability policy enforced by backend | None |
| 60 | Missing/unclear top-level Polls IA | P2 | Codex | 12 | IA finalized: explicit Polls route or clear alternative | None |
| 61 | Excessive nested tab/wizard complexity | P1 | Codex | 12 | Session Hub + Stage Cards implemented | None |
| 62 | Weak location awareness (“where am I?”) | P2 | Codex | 12 | Breadcrumb/context headers added | None |
| 63 | No route-level lazy loading | P2 | Codex | 18 | React lazy loading for major routes | None |
| 64 | Inefficient query patterns (load-all/filter client) | P1 | Claude | 4 | Server-side filtered/paginated queries | None |
| 65 | Missing optimistic updates | P2 | Codex | 18 | Optimistic UX for key mutations | 4 |
| 66 | Poll privacy/access policy unclear | P1 | Claude | 5 | Access policy documented and enforced | None |
| 67 | Legacy auth session expiry concerns | P1 | Claude | 3 | Clerk-based session enforcement active | None |
| 68 | CSRF/session hardening concerns | P1 | Claude | 3 | Clerk/session best practices enforced | None |
| 69 | Telemetry likely no-op in UI | P2 | Codex | 18 | Real telemetry adapter integration in frontend | 8 |
| 70 | Inconsistent typing/null contracts | P1 | Claude | 2 | Shared typed contracts with runtime validation | None |
| 71 | No app-level error boundaries | P1 | Codex | 18 | Route/app boundaries render fallback UI | None |
| 72 | Generic non-actionable error messages | P2 | Codex | 18 | Error classes mapped to actionable copy | 2 |
| 73 | Real habit extraction flow missing | P1 | Claude | 8 | Habit extraction pipeline operational | None |
| 74 | Cmd+Shift+D dev toggle behavior mismatch | P1 | Codex | 12 | Keyboard toggle reliably controls dev surfaces | None |
| 75 | History page trend summaries incomplete | P2 | Codex | 17 | History UI consumes real trend aggregates | 8 |
| 76 | Reminder scheduling backend missing | P1 | Claude | 6 | Reminder jobs implemented and tested | None |

## Worktree Execution SOP
1. Worktree scope:
  - Claude writes backend only in `/Users/theri/Documents/trials/planner-bot/wt-claude-code`.
  - Codex writes frontend/integration only in `/Users/theri/Documents/trials/planner-bot/wt-codex`.
2. Branch discipline:
  - Start each feature branch from latest `main`.
  - One feature branch = one commit scope = one PR.
3. Required per branch:
  - `git status` clean check before edits.
  - Build/tests for changed surface.
  - Stage only intended files.
  - Commit with scoped message.
  - Push `-u origin <branch>`.
4. Integration:
  - Codex merges backend branches into `main` in strict order.
  - Codex rebases frontend branches on updated `main`.
  - Resolve conflicts once in integration branch.
  - Merge integration branch to `main`.
  - Push `main`.

## Done Definition
- All audit IDs 1-76 marked complete (no open P0/P1).
- No runtime hardcoded `group-1`, `session-1`, or `abc123xyz`.
- Clerk auth fully usable (including logout).
- AI routes live with free-model fallback only.
- Poll token required, expiring, and closable.
- Finalize stores valid timezone-aware ISO timestamps.
- Session flow is Hub + Stage Cards.
- History and habit insights sourced from live backend data.

## Release Checklist
1. Smoke test auth, group routing, session lifecycle, poll response, summary, finalize.
2. Verify Convex env secrets set (OpenRouter, Clerk).
3. Verify telemetry and error boundaries fire in failure scenarios.
4. Confirm branch merge order compliance.
5. Tag release notes with resolved audit IDs.
