// UX telemetry stubs — swap bodies for real analytics (PostHog, Amplitude, etc.)
const isDev = import.meta.env['VITE_APP_ENV'] === 'development'

function emit(event: string, props?: Record<string, unknown>) {
  if (isDev) {
    console.debug('[telemetry]', event, props)
  }
  // TODO: replace with analytics.track(event, props)
}

export const track = {
  sessionCreated: (id: string) => emit('session_created', { id }),
  analysisTriggered: (sessionId: string) => emit('analysis_triggered', { sessionId }),
  constraintsEdited: (sessionId: string, editCount: number) =>
    emit('constraints_edited', { sessionId, editCount }),
  pollPublished: (pollId: string) => emit('poll_published', { pollId }),
  voteSubmitted: (pollId: string) => emit('vote_submitted', { pollId }),
  summaryGenerated: (sessionId: string) => emit('summary_generated', { sessionId }),
  eventFinalized: (eventId: string) => emit('event_finalized', { eventId }),
  devModeToggled: (enabled: boolean) => emit('dev_mode_toggled', { enabled }),
  liveChatAnalysisTriggered: () => emit('live_chat_analysis_triggered'),
}
