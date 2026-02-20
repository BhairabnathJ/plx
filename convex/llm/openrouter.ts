const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// Only free models are permitted — no paid-model fallback allowed
const PRIMARY_MODEL = "meta-llama/llama-3.3-70b-instruct:free";
const FALLBACK_MODELS = [
  "meta-llama/llama-3.1-8b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
];
const FREE_MODELS = [PRIMARY_MODEL, ...FALLBACK_MODELS];
const DEFAULT_MODEL = PRIMARY_MODEL;

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };
type HttpError = Error & { status?: number };

export type OpenRouterResult<T> = {
  data: T;
  model: string;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
};

export type OpenRouterCallArgs = {
  apiKey: string;
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  retries?: number;
};

function pickFreeModel(model?: string): string {
  if (!model) return DEFAULT_MODEL;
  if (FREE_MODELS.includes(model)) return model;
  // Reject non-free models and fall back to default
  console.warn(
    `[openrouter] Requested model "${model}" is not in the approved free-model list. Falling back to ${DEFAULT_MODEL}.`,
  );
  return DEFAULT_MODEL;
}

function buildModelRoute(requestedModel?: string): string[] {
  const preferred = pickFreeModel(requestedModel);
  return [preferred, ...FALLBACK_MODELS].filter(
    (model, index, arr) => arr.indexOf(model) === index,
  );
}

function isRetryable(error: Error): boolean {
  const httpError = error as HttpError;
  if (httpError.status === 429) return true;
  if (httpError.status === 404) return true;
  if ((httpError.status ?? 0) >= 500) return true;

  const message = error.message.toLowerCase();
  if (message.includes("fetch failed")) return true;
  if (message.includes("timed out")) return true;
  if (message.includes("temporarily")) return true;
  return false;
}

async function callSingleModel<T>(
  args: OpenRouterCallArgs,
  model: string,
  retries: number,
): Promise<OpenRouterResult<T>> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const attemptStart = Date.now();
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
          "HTTP-Referer": "https://plannerbot.app",
          "X-Title": "PlannerBot",
        },
        body: JSON.stringify({
          model,
          temperature: args.temperature ?? 0.2,
          max_tokens: args.maxTokens ?? 1200,
          response_format: { type: "json_object" },
          messages,
        }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        const error = new Error(
          `OpenRouter HTTP ${res.status}: ${body.slice(0, 200)}`,
        ) as HttpError;
        error.status = res.status;
        throw error;
      }

      const payload = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
        model?: string;
        usage?: { prompt_tokens?: number; completion_tokens?: number };
      };

      const content = payload.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("OpenRouter response missing content field");
      }

      let parsed: T;
      try {
        parsed = JSON.parse(content) as T;
      } catch {
        throw new Error(
          `OpenRouter returned non-JSON content: ${content.slice(0, 200)}`,
        );
      }

      return {
        data: parsed,
        model: payload.model ?? model,
        promptTokens: payload.usage?.prompt_tokens ?? 0,
        completionTokens: payload.usage?.completion_tokens ?? 0,
        latencyMs: Date.now() - attemptStart,
      };
    } catch (error) {
      lastError = error as Error;
      if (attempt < retries) {
        const backoff = 400 * Math.pow(2, attempt);
        console.warn(
          `[openrouter] Model ${model} attempt ${attempt + 1} failed: ${lastError.message}. Retrying in ${backoff}ms.`,
        );
        await new Promise((resolve) => setTimeout(resolve, backoff));
      }
    }
  }

  throw lastError ?? new Error(`OpenRouter call failed for model ${model}`);
}

export async function callOpenRouterJSON<T>(
  args: OpenRouterCallArgs,
): Promise<OpenRouterResult<T>> {
  // retries=1 means 2 attempts/model (attempt 1 + 1 retry)
  const retries = args.retries ?? 1;
  const route = buildModelRoute(args.model);
  let lastError: Error | null = null;

  for (let i = 0; i < route.length; i += 1) {
    const model = route[i]!;
    try {
      return await callSingleModel<T>(args, model, retries);
    } catch (error) {
      lastError = error as Error;
      const hasFallback = i < route.length - 1;
      if (hasFallback && isRetryable(lastError)) {
        console.warn(
          `[openrouter] Model ${model} exhausted with retryable failure: ${lastError.message}. Falling back to ${route[i + 1]}.`,
        );
        continue;
      }
      throw lastError;
    }
  }

  throw lastError ?? new Error("OpenRouter call failed after all retries");
}
