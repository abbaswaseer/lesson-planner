// OpenRouter provider (OpenAI-compatible): key check, free model listing and JSON generation.
import { fetchJson } from '../errors.js';
import { callChatJson } from './openaiCompatible.js';

const NAME = 'OpenRouter';
const API = 'https://openrouter.ai/api/v1';

/**
 * Check the key works. The models list is public, so it cannot tell us that.
 * @param {string} key
 * @returns {Promise<void>}
 * @throws {import('../errors.js').AiError}
 */
export async function checkOpenRouterKey(key) {
  await fetchJson(`${API}/key`, { headers: { Authorization: `Bearer ${key}` } }, NAME);
}

/**
 * Free OpenRouter models (ids ending in ":free"), sorted by name. The app is free forever,
 * so paid models are not offered.
 * @param {string} key
 * @returns {Promise<string[]>}
 * @throws {import('../errors.js').AiError}
 */
export async function listOpenRouterModels(key) {
  await checkOpenRouterKey(key);
  const body = await fetchJson(`${API}/models`, { headers: { Authorization: `Bearer ${key}` } }, NAME);
  return (body.data ?? [])
    .map((model) => String(model.id ?? ''))
    .filter((id) => id.endsWith(':free'))
    .sort();
}

/**
 * Ask OpenRouter for JSON; the schema is described in the prompt.
 * @param {{ key: string, model: string, system: string, user: string, schema?: object }} request
 * @returns {Promise<any>}
 * @throws {import('../errors.js').AiError}
 */
export function callOpenRouter(request) {
  return callChatJson({
    ...request,
    url: `${API}/chat/completions`,
    providerName: NAME,
    // Optional: names the app on the teacher's OpenRouter activity page.
    headers: { 'X-Title': 'Lesson Planner' },
  });
}
