export type ConstraintExtractionResult = {
  hard: Array<{ text: string }>;
  soft: Array<{ text: string }>;
  mentions: Array<{ text: string }>;
};

export type PollOptionBundle = {
  dates: string[];
  times: string[];
  places: string[];
  before: string[];
  after: string[];
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
