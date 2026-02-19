/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as authLocal from "../authLocal.js";
import type * as contracts_llm from "../contracts/llm.js";
import type * as contracts_types from "../contracts/types.js";
import type * as features_auth_onboarding from "../features/auth_onboarding.js";
import type * as features_chats from "../features/chats.js";
import type * as features_constraint_extraction_review from "../features/constraint_extraction_review.js";
import type * as features_event_finalize_reminders from "../features/event_finalize_reminders.js";
import type * as features_group_habits_profile_learning from "../features/group_habits_profile_learning.js";
import type * as features_history_analytics_tuning from "../features/history_analytics_tuning.js";
import type * as features_live_chat_dev_mode from "../features/live_chat_dev_mode.js";
import type * as features_poll_option_generation from "../features/poll_option_generation.js";
import type * as features_poll_publish_and_web_response from "../features/poll_publish_and_web_response.js";
import type * as features_session_creation_context_ingest from "../features/session_creation_context_ingest.js";
import type * as features_summary_composer from "../features/summary_composer.js";
import type * as features_ui_shell_routing_foundation from "../features/ui_shell_routing_foundation.js";
import type * as features_vote_aggregation_best_combo from "../features/vote_aggregation_best_combo.js";
import type * as groups from "../groups.js";
import type * as lib_status from "../lib/status.js";
import type * as llm_actions from "../llm/actions.js";
import type * as llm_openrouter from "../llm/openrouter.js";
import type * as sessions from "../sessions.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  authLocal: typeof authLocal;
  "contracts/llm": typeof contracts_llm;
  "contracts/types": typeof contracts_types;
  "features/auth_onboarding": typeof features_auth_onboarding;
  "features/chats": typeof features_chats;
  "features/constraint_extraction_review": typeof features_constraint_extraction_review;
  "features/event_finalize_reminders": typeof features_event_finalize_reminders;
  "features/group_habits_profile_learning": typeof features_group_habits_profile_learning;
  "features/history_analytics_tuning": typeof features_history_analytics_tuning;
  "features/live_chat_dev_mode": typeof features_live_chat_dev_mode;
  "features/poll_option_generation": typeof features_poll_option_generation;
  "features/poll_publish_and_web_response": typeof features_poll_publish_and_web_response;
  "features/session_creation_context_ingest": typeof features_session_creation_context_ingest;
  "features/summary_composer": typeof features_summary_composer;
  "features/ui_shell_routing_foundation": typeof features_ui_shell_routing_foundation;
  "features/vote_aggregation_best_combo": typeof features_vote_aggregation_best_combo;
  groups: typeof groups;
  "lib/status": typeof lib_status;
  "llm/actions": typeof llm_actions;
  "llm/openrouter": typeof llm_openrouter;
  sessions: typeof sessions;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
