const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
export const PRIMARY_MODEL = "meta-llama/llama-3.3-70b-instruct:free";
export const FALLBACK_MODELS = [
  "meta-llama/llama-3.1-8b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
] as const;

function assertFreeModel(model: string) {
  if (!model.endsWith(":free")) {
    throw new Error(`Non-free model configured in free-only mode: ${model}`);
  }
}

assertFreeModel(PRIMARY_MODEL);
for (const model of FALLBACK_MODELS) assertFreeModel(model);

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type OpenRouterCallSuccess<T> = {
  data: T;
  model: string;
  attempts: number;
  latencyMs: number;
};

export class OpenRouterError extends Error {
  code: "config_error" | "rate_limited" | "provider_unavailable" | "malformed_response" | "request_failed";
  retryable: boolean;

  constructor(
    code: OpenRouterError["code"],
    message: string,
    retryable: boolean,
  ) {
    super(message);
    this.code = code;
    this.retryable = retryable;
  }
}

function mapStatus(status: number): OpenRouterError {
  if (status === 401 || status === 403) {
    return new OpenRouterError("config_error", `OpenRouter auth failed (${status})`, false);
  }
  if (status === 429) {
    return new OpenRouterError("rate_limited", "OpenRouter rate limited", true);
  }
  if (status >= 500) {
    return new OpenRouterError("provider_unavailable", `OpenRouter provider error (${status})`, true);
  }
  return new OpenRouterError("request_failed", `OpenRouter request failed (${status})`, false);
}

async function callSingleModel<T>(args: {
  apiKey: string;
  systemPrompt: string;
  userPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  retries: number;
}): Promise<OpenRouterCallSuccess<T>> {
  assertFreeModel(args.model);

  const started = Date.now();
  let lastError: OpenRouterError | null = null;

  for (let attempt = 0; attempt <= args.retries; attempt += 1) {
    try {
      const messages: ChatMessage[] = [
        { role: "system", content: args.systemPrompt },
        { role: "user", content: args.userPrompt },
      ];

      const res = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${args.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: args.model,
          temperature: args.temperature,
          max_tokens: args.maxTokens,
          response_format: { type: "json_object" },
          messages,
        }),
      });

      if (!res.ok) {
        throw mapStatus(res.status);
      }

      const payload = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
        model?: string;
      };

      const content = payload.choices?.[0]?.message?.content;
      if (!content) {
        throw new OpenRouterError("malformed_response", "OpenRouter response missing content", true);
      }

      let parsed: T;
      try {
        parsed = JSON.parse(content) as T;
      } catch {
        throw new OpenRouterError("malformed_response", "OpenRouter returned invalid JSON", true);
      }

      return {
        data: parsed,
        model: payload.model ?? args.model,
        attempts: attempt + 1,
        latencyMs: Date.now() - started,
      };
    } catch (error) {
      const mapped =
        error instanceof OpenRouterError
          ? error
          : new OpenRouterError("request_failed", (error as Error).message, false);
      lastError = mapped;

      if (attempt < args.retries && mapped.retryable) {
        await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
        continue;
      }
      break;
    }
  }

  throw (
    lastError ??
    new OpenRouterError("request_failed", "OpenRouter call failed", false)
  );
}

export async function callOpenRouterWithFallback<T>(args: {
  apiKey: string;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  retries?: number;
}): Promise<OpenRouterCallSuccess<T>> {
  const models = [PRIMARY_MODEL, ...FALLBACK_MODELS];
  let lastError: OpenRouterError | null = null;

  for (const model of models) {
    try {
      return await callSingleModel<T>({
        ...args,
        model,
        temperature: args.temperature ?? 0.2,
        maxTokens: args.maxTokens ?? 1200,
        retries: args.retries ?? 1,
      });
    } catch (error) {
      lastError = error as OpenRouterError;
      if (!lastError.retryable) break;
    }
  }

  throw (
    lastError ??
    new OpenRouterError("request_failed", "All free-model routes failed", true)
  );
}
