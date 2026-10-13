// generateJson(): one AI call with retries and fallback to other free providers
// (CLAUDE.md Section 8), so planning keeps working when one service is busy.
import { AiError } from './errors.js';
import { callGemini, defaultGeminiModel, listGeminiModels } from './providers/gemini.js';
import { callGroq, listGroqModels } from './providers/groq.js';
import { callOpenRouter, listOpenRouterModels } from './providers/openrouter.js';

/** In fallback order. */
export const PROVIDERS = [
  { id: 'gemini', name: 'Gemini', call: callGemini, listModels: listGeminiModels, pickDefault: defaultGeminiModel },
  { id: 'groq', name: 'Groq', call: callGroq, listModels: listGroqModels, pickDefault: (models) => models[0] ?? '' },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    call: callOpenRouter,
    listModels: listOpenRouterModels,
    pickDefault: (models) => models[0] ?? '',
  },
];

/** Waits before each retry: the first try, then up to 3 retries. */
export const RETRY_DELAYS_MS = [2000, 5000, 10000];

// Worth waiting for: the service is busy or the connection dropped. Anything else
// (bad key, bad request, unusable answer) will not get better by retrying.
const RETRYABLE = new Set(['RATE_LIMIT', 'SERVER', 'NETWORK']);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Ask the AI for JSON. Tries each provider that has a key, in order, retrying busy errors.
 * @param {object} profile Uses profile.keys and profile.models.
 * @param {{ system: string, user: string, schema?: object }} request
 * @param {{ sleep?: (ms: number) => Promise<void>, onRetry?: (info: { provider: string, attempt: number, waitMs: number }) => void }} [options]
 *   `sleep` is replaceable for tests; `onRetry` lets the page show "Gemini is busy, trying again…".
 * @returns {Promise<{ data: any, provider: string, model: string }>}
 * @throws {AiError} A friendly summary if every provider failed.
 */
export async function generateJson(profile, request, { sleep = wait, onRetry } = {}) {
  const available = PROVIDERS.filter((provider) => profile?.keys?.[provider.id]?.trim());
  if (available.length === 0) {
    throw new AiError('BAD_KEY', 'No AI key is set. Add your free Gemini key on the Setup page.');
  }

  const failures = [];
  for (const provider of available) {
    const key = profile.keys[provider.id].trim();
    try {
      const model = profile.models?.[provider.id] || provider.pickDefault(await provider.listModels(key));
      if (!model) throw new AiError('BAD_KEY', `${provider.name} has no models available for this key.`);
      const data = await callWithRetries(provider, { ...request, key, model }, sleep, onRetry);
      return { data, provider: provider.name, model };
    } catch (error) {
      failures.push({ provider: provider.name, error });
    }
  }
  throw allFailed(failures);
}

async function callWithRetries(provider, request, sleep, onRetry) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await provider.call(request);
    } catch (error) {
      const retryable = error instanceof AiError && RETRYABLE.has(error.code);
      if (!retryable || attempt >= RETRY_DELAYS_MS.length) throw error;
      const waitMs = RETRY_DELAYS_MS[attempt];
      onRetry?.({ provider: provider.name, attempt: attempt + 1, waitMs });
      await sleep(waitMs);
    }
  }
}

// What failed, and what the teacher can do about it.
function allFailed(failures) {
  const lines = failures.map(({ provider, error }) =>
    error instanceof AiError ? error.message : `${provider} failed unexpectedly.`
  );
  const codes = failures.map(({ error }) => error?.code);
  const busy = codes.some((code) => RETRYABLE.has(code));
  const advice = busy
    ? 'Wait a minute and try again. Adding a backup key (Groq or OpenRouter) on the Setup page also helps.'
    : 'Check your keys on the Setup page (use the Test button), then try again.';
  const last = failures.at(-1)?.error;
  return new AiError(last?.code ?? 'SERVER', `The plan could not be made.\n${lines.join('\n')}\n${advice}`, {
    provider: failures.at(-1)?.provider,
  });
}
