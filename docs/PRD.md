# PlannerBot Product Requirements Document (PRD)

## 1. Document Control
- Product: PlannerBot
- Version: 1.0
- Date: February 19, 2026
- Status: Draft for implementation kickoff
- Owner: Product + Engineering

## 2. Product Summary
PlannerBot is a web app and chat-integrated planning assistant that converts messy group discussion into a clear, vote-backed recommendation with backup options. The MVP is web-first, with manual chat import and shareable poll links, then expands to direct WhatsApp integration.

This PRD defines the full feature scope, implementation approach, architecture contracts, and rollout for a Vite + React + Tailwind frontend, Convex backend, and OpenRouter LLM service using `meta-llama/llama-3.3-70b-instruct:free` as default.

## 3. Problem Statement
Friend-group planning fails because:
- conversation context is noisy and contradictory,
- constraints are scattered and not explicit,
- polling is either too broad or too late,
- final decisions are unclear and unowned.

PlannerBot solves this by extracting constraints, generating compact polls, aggregating availability, and producing actionable summaries.

## 4. Goals and Non-Goals
### 4.1 Goals
- Reduce plan-to-decision time for small groups (4-15 people).
- Increase decision clarity with best combo + backup output.
- Preserve user control with editable AI outputs before publish.
- Provide full planning lifecycle: onboarding -> session -> polling -> summary -> finalized event -> history.
- Support dev experimentation via hidden in-app Live Chat mode (`Cmd+Shift+D`).

### 4.2 Non-Goals (MVP)
- Full WhatsApp API read/write integration in phase 1.
- Automatic venue booking.
- Calendar deep integrations (Google/Apple/Outlook) before phase 3+.
- Multi-language localization beyond English in phase 1.

## 5. Target Users and Personas
- Organizer: creates sessions, reviews constraints, publishes polls, sends summary.
- Participant: votes quickly from mobile, sees clear recommendation.
- Power User: wants trend/history and tuning visibility.

## 6. Success Metrics
### 6.1 North Star
- Session Decision Completion Rate: `% sessions reaching Finalized status within 72 hours`.

### 6.2 Product KPIs
- Median time from session creation to summarized recommendation.
- Poll participation rate (`votes / invited members`).
- Recommendation acceptance rate (`finalized combo == top recommendation`).
- No-response rate.
- Week-4 retained groups.

### 6.3 Quality KPIs
- Constraint extraction correction rate (manual edits per session).
- Invalid LLM response rate after schema validation.
- Reminder delivery success rate.

## 7. Scope and Feature Requirements

## 7.1 Group Onboarding and Connection
### Functional Requirements
- User can sign in via email/phone (final provider selectable during implementation).
- User can create a Group Profile with name, avatar, optional description.
- User can choose import mode:
  - Manual paste/import (MVP default).
  - WhatsApp connection placeholder CTA (phase 2+).
- Group dashboard shows group card and planning session history.

### Acceptance Criteria
- Creating a group persists `groups` and creator membership in `groupMembers`.
- Dashboard renders at least one card with member count and summary.

## 7.2 Group Learning / Habit Profile
### Functional Requirements
- User can run habit analysis over imported planning messages.
- System derives and stores:
  - common days,
  - common start-time windows,
  - common areas/place types,
  - lead-time pattern,
  - turnout pattern.
- Habits surface as editable bullets/chips with confidence metadata.

### Acceptance Criteria
- Habits appear in Group Habits panel.
- User edits override AI defaults and are tracked as manual provenance.

## 7.3 Planning Session Creation
### Functional Requirements
- User can create a session with title, timeframe, and activity type.
- Session can attach context text from pasted messages.
- Session lifecycle status starts at `Draft`.

### Acceptance Criteria
- Session card appears in group dashboard and session list.
- Status badge is visible and correct.

## 7.4 Constraint Extraction
### Functional Requirements
- User can trigger analysis from session context.
- NLP extraction returns:
  - hard constraints,
  - soft preferences,
  - explicit candidate mentions.
- UI allows add/edit/remove/toggle for each item.
- Provenance tags: `chat`, `habit`, `manual`.

### Acceptance Criteria
- Extracted constraints are editable before next step.
- Invalid or empty extraction shows actionable fallback (retry/manual).

## 7.5 Poll Option Generation
### Functional Requirements
- System proposes per-dimension options with limits:
  - dates: 3-5,
  - times: 3-5,
  - place options: 3-6,
  - before/after add-ons: 2-4.
- Proposals use constraints + group habits + mentions.
- User can rename/remove/add options.

### Acceptance Criteria
- Generated options honor hard constraints.
- Option counts stay within bounds unless user manually extends.

## 7.6 Poll Creation and Distribution
### Functional Requirements
- MVP: create shareable web poll page URL.
- Also produce WhatsApp-ready text template for manual posting.
- Poll supports mixed response patterns:
  - multi-select for date/time,
  - single-select default for place vibe (configurable).

### Acceptance Criteria
- Poll link opens mobile-first page and accepts votes.
- Link token is secure and tied to session poll set.

## 7.7 Vote Aggregation and Best Combo Computation
### Functional Requirements
- Realtime vote tallies for each option.
- Compute:
  - primary best combo,
  - one or two backups,
  - support counts (`can/cannot/no-response`).
- Provide concise explainability note for ranking.

### Acceptance Criteria
- Results update live without refresh.
- Algorithm output is deterministic for same vote matrix.

## 7.8 Bot-Style Summary Messages
### Functional Requirements
- Generate short, friendly recommendation message.
- Include winner combo, backup, and attendance summary.
- User can edit before final copy/send.

### Acceptance Criteria
- Copy action provides channel-ready message in one click.
- Edits persist to `summaries`.

## 7.9 Event Pinning and Reminders
### Functional Requirements
- User can finalize event details (date/time/venue/map link).
- Attendance states tracked (`going`, `maybe`, `unknown`).
- Reminder schedule configurable: off/day-before/same-day/custom.

### Acceptance Criteria
- Event card stores final details in `events`.
- Reminder jobs are scheduled and status-tracked.

## 7.10 “What do you think?” (Dev Live Chat Mode)
### Functional Requirements
- Hidden Live Chat tab is toggled via `Cmd+Shift+D`.
- Dev mode state persists in local storage.
- Live Chat reads latest thread context and returns:
  - consensus signals,
  - conflicts,
  - suggested next poll set.
- This feature ships as internal/dev-only initially.

### Acceptance Criteria
- Shortcut reliably toggles tab visibility.
- Analysis returns structured insight and suggested actions.

## 7.11 History and Preference Tuning
### Functional Requirements
- History tab lists past sessions and finalized events.
- Trend summaries: top days/times/areas and turnout outcomes.
- Option-generation engine reweights defaults using history uplift/downrank signals.

### Acceptance Criteria
- History cards show turnout and one-line notes.
- Future poll defaults reflect stored preference tuning.

## 8. Information Architecture and Navigation
- App shell: global nav, group switcher, profile, hidden dev hook.
- Primary tabs: Dashboard, Sessions, Polls, History, Settings.
- Session detail tabs: Context, Constraints, Poll Builder, Votes, Summary, Finalize.
- Dev-only tab (when enabled): Live Chat.

## 9. Technical Architecture
## 9.1 Frontend
- Vite + React + TypeScript + Tailwind CSS.
- React Router for app and nested session routes.
- Local UI state for editable drafts.
- Convex subscriptions for server truth and realtime updates.

## 9.2 Backend (Convex)
### Core entities
- `users`
- `groups`
- `groupMembers`
- `sessions`
- `sessionMessages`
- `constraints`
- `polls`
- `pollOptions`
- `votes`
- `summaries`
- `events`
- `attendanceSnapshots`
- `habitProfiles`

### Jobs
- Habit extraction refresh.
- Reminder dispatch.
- Analytics aggregation.

## 9.3 LLM Service Layer (OpenRouter)
- Endpoint: `https://openrouter.ai/api/v1/chat/completions`
- Default model: `meta-llama/llama-3.3-70b-instruct:free`
- Context target: up to published 128k window, but requests are chunked and bounded in app policy.
- Contract-first prompts for:
  - constraint extraction,
  - option generation,
  - summary generation,
  - consensus analysis.
- Strict JSON schema validation and repair pass before storage.

## 9.4 Reliability and Fallback
- Retry strategy:
  1. retry same model/provider with backoff,
  2. route to configured backup model,
  3. degrade to guided manual mode if still failing.
- Every AI output remains user-editable.

## 10. API Contracts (Application Layer)
- `POST /api/session/analyze` -> `ConstraintExtractionResult`
- `POST /api/session/options` -> `PollOptionBundle`
- `POST /api/session/summary` -> `SummaryMessageDraft`
- `POST /api/live-chat/analyze` -> `ConsensusInsight`

### Shared Types (canonical)
- `Constraint`
- `PollDimension`
- `VoteMatrix`
- `BestComboResult`
- `ReminderPolicy`
- `HabitProfile`

## 11. Security, Privacy, and Compliance Requirements
- Secrets only in server env (no client exposure).
- Imported chat content is group-scoped and access-controlled.
- Audit fields on AI-generated and user-edited artifacts.
- Data minimization for imported text; retention policy configurable.
- Explicit user indication when dev-only Live Chat mode is active.

## 12. Non-Functional Requirements
- Mobile-first performance for poll pages (<2.5s LCP target on mid-tier mobile).
- Realtime vote update latency target: <1.5s p95.
- Availability target for core voting/summarization paths: 99.5% monthly.
- WCAG 2.2 AA for key workflows.

## 13. Testing Strategy
### Unit
- Option cap logic.
- Constraint normalization/dedupe.
- Best-combo scoring engine.

### Integration
- Session creation -> analysis -> option generation -> polling -> summarization.
- Reminder scheduling from finalized event.

### Contract
- LLM response schema validation and repair behavior.

### Realtime
- Concurrent voting and tally consistency.

### E2E
- Mobile poll completion.
- Session progression.
- Live Chat toggle via `Cmd+Shift+D`.

### Accessibility
- Keyboard nav and focus order.
- Contrast and assistive labels.

### Failure-Mode
- OpenRouter timeout/rate-limit.
- Invalid model output.
- Empty turnout.
- Reminder job failure.

## 14. Rollout Plan
### Phase 0: Foundations
- App shell, auth, group/session CRUD, Convex schema, environment and observability baseline.

### Phase 1: Core Planning MVP
- Constraint extraction, option generation, web poll, vote aggregation, summary generation.

### Phase 2: Finalization and Learning
- Event pinning/reminders, history analytics, preference tuning.

### Phase 3: WhatsApp Integration
- Channel-native poll and posting integration via provider.

### Phase 4: Production Hardening
- Reliability, cost controls, moderation/safety refinements, expanded integrations.

## 15. Risks and Mitigations
- LLM inconsistency: enforce schemas and manual edit gates.
- Free-model volatility/rate limits: fallback route and queued retries.
- Poll fatigue: strict option limits and concise UX copy.
- Data trust concerns: transparent provenance and editable constraints.
- Scope creep from WhatsApp integration: keep strict phase boundary.

## 16. Assumptions and Defaults
- “Codex for database” is implemented as Convex backend.
- MVP is web-first with no direct WhatsApp API dependency.
- Dev Live Chat is hidden and keyboard-gated.
- JSON/TOML config artifacts are canonical for MCP tooling.
- OpenRouter free Llama 3.3 70B is default model with fallback policy required.

## 17. Implementation Readiness Checklist
- [ ] Frontend scaffold created and routed tab structure defined.
- [ ] Convex schema and indexes finalized.
- [ ] API type contracts generated and shared across client/server.
- [ ] OpenRouter client module with retries + fallback implemented.
- [ ] Session status transitions and guardrails enforced.
- [ ] Dev shortcut and Live Chat gating implemented.
- [ ] E2E test baseline green for core poll flow.

## 18. MCP Setup and Operational Guide
This project will document MCP integration for Context7 and Figma. Installation is documented, not auto-executed in this PRD.

### 18.1 Codex MCP Configuration (TOML)
- Use `/Users/theri/Documents/trials/planner-bot/docs/config/mcp.codex.example.toml`.
- Merge desired blocks into `~/.codex/config.toml`.

### 18.2 Claude Code / Claude Desktop MCP Examples (JSON)
- Use `/Users/theri/Documents/trials/planner-bot/docs/config/mcp.claude-desktop.example.json`.
- Register remote MCP where applicable:
```bash
claude mcp add --transport http context7 https://mcp.context7.com/mcp
claude mcp add --transport http figma https://mcp.figma.com/mcp
```
- Optional local Context7 process pattern:
```bash
npx -y @upstash/context7-mcp --api-key "$CONTEXT7_API_KEY"
```

### 18.3 Cursor MCP Example (JSON)
- Use `/Users/theri/Documents/trials/planner-bot/docs/config/mcp.cursor.example.json`.

### 18.4 Verification Checklist
- [ ] MCP server entries appear in target client config.
- [ ] Client lists both Context7 and Figma MCP servers.
- [ ] Test call to Context7 succeeds.
- [ ] Test call to Figma succeeds (remote or desktop endpoint).
- [ ] Auth and required env vars are loaded in the client runtime.

### 18.5 Troubleshooting Matrix
| Symptom | Probable Cause | Resolution |
|---|---|---|
| Server not listed | Config path mismatch | Confirm exact config file location for your client |
| Connection refused (127.0.0.1:3845) | Figma desktop MCP bridge not running | Start Figma desktop bridge or use remote endpoint |
| Unauthorized | Missing API key or expired token | Re-export env var and restart client |
| Timeout errors | Network/proxy restrictions | Validate outbound access to MCP endpoint |
| Tool call fails intermittently | Remote instability | Add retry and fallback to alternate endpoint |
