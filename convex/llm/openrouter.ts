const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "meta-llama/llama-3.3-70b-instruct:free";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function callOpenRouterJSON<T>(args: {
  apiKey: string;
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  retries?: number;
}): Promise<{ data: T; model: string }> {
  const retries = args.retries ?? 1;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
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
          model: args.model ?? DEFAULT_MODEL,
          temperature: args.temperature ?? 0.2,
          max_tokens: args.maxTokens ?? 1200,
          response_format: { type: "json_object" },
          messages,
        }),
      });

      if (!res.ok) {
        throw new Error(`OpenRouter request failed with status ${res.status}`);
      }

      const payload = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
        model?: string;
      };

      const content = payload.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("OpenRouter response missing content");
      }

      return {
        data: JSON.parse(content) as T,
        model: payload.model ?? args.model ?? DEFAULT_MODEL,
      };
    } catch (error) {
      lastError = error as Error;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
      }
    }
  }

  throw lastError ?? new Error("OpenRouter call failed");
}
