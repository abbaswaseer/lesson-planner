// Request → { day, classLabel, week }: code first, the AI only when code cannot read it
// (CLAUDE.md Section 7, step 1).
import { findClass } from '../lib/classMatch.js';
import { parseRequest } from '../lib/request.js';
import { generateJson } from './index.js';
import { requestPrompt } from './prompts.js';
import { REQUEST_SCHEMA } from './schema.js';

/**
 * Check what the AI returned, so a made-up class or day never reaches the timetable.
 * @param {any} data
 * @param {object} profile
 * @returns {{ day: number | null, classLabel: string | null, week: number } | null}
 */
export function checkAiRequest(data, profile) {
  const week = Number(data?.week);
  if (!Number.isInteger(week) || week < 1) return null;
  const day = data?.day == null ? null : Number(data.day);
  if (day !== null && !(Number.isInteger(day) && day >= 1 && day <= 5)) return null;
  let classLabel = null;
  if (data?.classLabel) {
    classLabel = findClass(profile, String(data.classLabel))?.label ?? null;
    if (!classLabel) return null;
  }
  return { day, classLabel, week };
}

/**
 * Understand a typed request.
 * @param {object} profile
 * @param {string} text
 * @param {object} [options] Passed to generateJson (e.g. onRetry).
 * @returns {Promise<{ parsed: { day: number | null, classLabel: string | null, week: number } | null, byAi: boolean }>}
 *   parsed is null if even the AI could not make sense of it.
 * @throws {import('./errors.js').AiError} If the AI could not be reached.
 */
export async function understandRequest(profile, text, options) {
  const parsed = parseRequest(text, profile);
  if (parsed) return { parsed, byAi: false };
  const { system, user } = requestPrompt(text, profile.classes ?? []);
  const { data } = await generateJson(profile, { system, user, schema: REQUEST_SCHEMA }, options);
  return { parsed: checkAiRequest(data, profile), byAi: true };
}
