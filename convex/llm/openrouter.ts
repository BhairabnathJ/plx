const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// Only free models are permitted — no paid-model fallback allowed
const FREE_MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
  "google/gemma-2-9b-it:free",
];
const DEFAULT_MODEL = FREE_MODELS[0]!;

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

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

export async function callOpenRouterJSON<T>(
  args: OpenRouterCallArgs,
): Promise<OpenRouterResult<T>> {
  const retries = args.retries ?? 1;
  const model = pickFreeModel(args.model);
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
        throw new Error(`OpenRouter HTTP ${res.status}: ${body.slice(0, 200)}`);
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
          `[openrouter] Attempt ${attempt + 1} failed: ${lastError.message}. Retrying in ${backoff}ms.`,
        );
        await new Promise((resolve) => setTimeout(resolve, backoff));
      }
    }
  }

  throw lastError ?? new Error("OpenRouter call failed after all retries");
}
