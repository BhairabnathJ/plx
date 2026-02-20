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

export type LlmErrorCode =
  | "config_error"
  | "rate_limited"
  | "provider_unavailable"
  | "malformed_response"
  | "request_failed";

export type LlmSuccess<T> = {
  ok: true;
  data: T;
  meta: {
    model: string;
    latencyMs: number;
    attempts: number;
  };
};

export type LlmFailure = {
  ok: false;
  code: LlmErrorCode;
  message: string;
  retryable: boolean;
};

export type LlmResult<T> = LlmSuccess<T> | LlmFailure;
