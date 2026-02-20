export type SessionStatus = "draft" | "analyzed" | "polling" | "summarized" | "finalized";
export type ConstraintKind = "hard" | "soft" | "mention";
export type ConstraintState = "detected" | "accepted" | "edited" | "removed";
export type ProvenanceTag = "chat" | "habit" | "manual";
export type ConfidenceLevel = "high" | "medium" | "low";

export type PollDimension = "date" | "time" | "place" | "before" | "after";
export const POLL_DIMENSION_LIMITS: Record<PollDimension, number> = {
  date: 5,
  time: 5,
  place: 5,
  before: 3,
  after: 3,
};

export type Constraint = {
  kind: ConstraintKind;
  text: string;
  state: ConstraintState;
  provenance: ProvenanceTag;
  confidence: ConfidenceLevel;
};

export type ConstraintExtractionResult = {
  hard: Constraint[];
  soft: Constraint[];
  mentions: Constraint[];
};

export type PollOption = {
  dimension: PollDimension;
  label: string;
  rank: number;
  isActive: boolean;
};

export type PollOptionBundle = {
  dates: PollOption[];
  times: PollOption[];
  places: PollOption[];
  before: PollOption[];
  after: PollOption[];
};

export type VoteMatrix = {
  participant: string;
  selectedOptionIds: string[];
};

/** Explainability metadata for a combo ranking. */
export type ComboRankingReason = {
  factor: "turnout" | "balance" | "preference" | "constraint";
  description: string;
};

export type BestComboEntry = {
  date?: string;
  time?: string;
  place?: string;
  score: number;
  /** Number of voters who can attend this combo. */
  voterCount: number;
  /** Percentage of total voters who can attend. */
  coveragePct: number;
  /** Human-readable ranking reasons for explainability. */
  reasons: ComboRankingReason[];
};

export type BestComboResult = {
  primary: BestComboEntry;
  backups: BestComboEntry[];
};

export type SummaryTone = "friendly" | "default" | "concise";

export type SummaryMessageDraft = {
  text: string;
  model: string;
  tone: SummaryTone;
};

export type ConsensusInsight = {
  consensusPoints: string[];
  conflicts: string[];
  nextStep: string;
};

export type ReminderPolicy = {
  mode: "off" | "day-before" | "same-day" | "custom";
  customMinutesBefore?: number;
};

export type HabitProfile = {
  preferredDays: string[];
  preferredTimeWindows: string[];
  preferredAreas: string[];
  preferredVibes: string[];
  avgTurnout?: number;
  confidence: ConfidenceLevel;
};

// ─── Observability ───────────────────────────────────────────────────────────

export type LLMCallRecord = {
  action: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
  success: boolean;
  errorMessage?: string;
  timestamp: number;
};
