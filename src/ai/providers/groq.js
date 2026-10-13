// Groq provider (OpenAI-compatible): model listing and JSON generation.
import { fetchJson } from '../errors.js';
import { callChatJson } from './openaiCompatible.js';

const NAME = 'Groq';
const MODELS_URL = 'https://api.groq.com/openai/v1/models';

// Speech and safety-filter models cannot write lesson plans.
const NOT_FOR_TEXT = /whisper|tts|playai|guard/i;

/**
 * Groq chat models this key can use, sorted by name.
 * Doubles as the key test: it only works with a valid key and uses no generation quota.
 * @param {string} key
 * @returns {Promise<string[]>}
 * @throws {import('../errors.js').AiError}
 */
export async function listGroqModels(key) {
  const body = await fetchJson(MODELS_URL, { headers: { Authorization: `Bearer ${key}` } }, NAME);
  return (body.data ?? [])
    .filter((model) => model.active !== false)
    .map((model) => String(model.id ?? ''))
    .filter((id) => id && !NOT_FOR_TEXT.test(id))
    .sort();
}

/**
 * Ask Groq for JSON; the schema is described in the prompt (JSON mode has no schema option).
 * @param {{ key: string, model: string, system: string, user: string, schema?: object }} request
 * @returns {Promise<any>}
 * @throws {import('../errors.js').AiError}
 */
export function callGroq(request) {
  return callChatJson({ ...request, url: 'https://api.groq.com/openai/v1/chat/completions', providerName: NAME });
}
