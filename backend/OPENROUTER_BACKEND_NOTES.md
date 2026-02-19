# OpenRouter Backend Notes

- OpenRouter calls run only in Convex actions.
- Required env var: `OPENROUTER_API_KEY`.
- Endpoint: `https://openrouter.ai/api/v1/chat/completions`.
- Default model: `meta-llama/llama-3.3-70b-instruct:free`.
- Client/UI should call Convex actions, never OpenRouter directly.
