export type SessionStatus = "draft" | "analyzed" | "polling" | "summarized" | "finalized";
export type ConstraintKind = "hard" | "soft" | "mention";
export type ConstraintState = "detected" | "accepted" | "edited" | "removed";
export type ProvenanceTag = "chat" | "habit" | "manual";
export type ConfidenceLevel = "high" | "medium" | "low";

export type PollDimension = "date" | "time" | "place" | "before" | "after";

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

export type BestComboResult = {
  primary: { date?: string; time?: string; place?: string; score: number };
  backups: Array<{ date?: string; time?: string; place?: string; score: number }>;
};

export type SummaryMessageDraft = {
  text: string;
  model: string;
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
