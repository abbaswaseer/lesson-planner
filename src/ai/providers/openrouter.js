// OpenRouter provider. Key check and model listing (T-23); the generate call is added in T-41.
import { fetchJson } from '../errors.js';

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
