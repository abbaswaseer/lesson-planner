// Gemini provider. Model listing (T-23); the generate call is added in T-39.
import { fetchJson } from '../errors.js';

const NAME = 'Gemini';
const MODELS_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// Models that cannot write lesson plans (speech, images, live audio, embeddings).
const NOT_FOR_TEXT = /tts|image|live|audio|embedding|aqa/i;
// Variants that are less reliable as a default.
const NOT_DEFAULT = /lite|preview|exp|thinking/i;

/**
 * Gemini models this key can use for text, newest names first.
 * Doubles as the key test: it only works with a valid key and uses no generation quota.
 * @param {string} key
 * @returns {Promise<string[]>} Model ids like "gemini-2.5-flash".
 * @throws {import('../errors.js').AiError}
 */
export async function listGeminiModels(key) {
  const ids = [];
  let pageToken = '';
  do {
    const params = new URLSearchParams({ pageSize: '1000' });
    if (pageToken) params.set('pageToken', pageToken);
    const body = await fetchJson(
      `${MODELS_URL}?${params}`,
      { headers: { 'x-goog-api-key': key } },
      NAME
    );
    for (const model of body.models ?? []) {
      const id = String(model.name ?? '').replace(/^models\//, '');
      const canGenerate = (model.supportedGenerationMethods ?? []).includes('generateContent');
      if (id && canGenerate && !NOT_FOR_TEXT.test(id)) ids.push(id);
    }
    pageToken = body.nextPageToken ?? '';
  } while (pageToken);
  return [...new Set(ids)].sort().reverse();
}

/**
 * Default Gemini model: the first "flash" model, preferring stable full versions
 * (CLAUDE.md Section 8: never hard-code a model name).
 * @param {string[]} models From listGeminiModels.
 * @returns {string} '' if the list is empty.
 */
export function defaultGeminiModel(models) {
  const flash = models.filter((id) => id.includes('flash'));
  return flash.find((id) => !NOT_DEFAULT.test(id)) ?? flash[0] ?? models[0] ?? '';
}
