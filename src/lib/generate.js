// The generation pipeline for lessons (CLAUDE.md Section 7, steps 3–7):
// choose topic → find book pages → ask the AI → merge → validate → one fix attempt.
import { db } from '../db/db.js';
import { generateJson } from '../ai/index.js';
import { fixPrompt, planSystemPrompt, planUserPrompt, topicPrompt } from '../ai/prompts.js';
import { PLAN_AI_SCHEMA, TOPICS_SCHEMA } from '../ai/schema.js';
import { mergePlan } from './mergePlan.js';
import { searchPages } from './search.js';
import { autoFixPlan, validatePlans } from './validate.js';

/** Most source text sent with one prompt (CLAUDE.md Section 7, step 4). */
export const MAX_SOURCE_CHARS = 12000;
const MAX_BOOK_PAGES = 5;

/**
 * Keep whole pages, best first, until the character budget is used up.
 * @param {Array<{ text: string }>} pages
 * @param {number} maxChars
 * @returns {Array<{ text: string }>}
 */
export function fitPages(pages, maxChars) {
  const kept = [];
  let used = 0;
  for (const page of pages) {
    if (used + page.text.length > maxChars) {
      // Always send something useful: cut the first page if it alone is too long.
      if (kept.length === 0) kept.push({ ...page, text: page.text.slice(0, maxChars) });
      break;
    }
    kept.push(page);
    used += page.text.length;
  }
  return kept;
}

/**
 * Scheme of work text: all of it if it is short, otherwise the pages that best match.
 * @param {number} profileId
 * @param {string} query
 * @returns {Promise<string>}
 */
export async function sowText(profileId, query) {
  const sowIds = (await db.sources.where('profileId').equals(profileId).toArray())
    .filter((source) => source.type === 'sow')
    .map((source) => source.id);
  if (sowIds.length === 0) return '';
  const pages = (await db.pages.where('sourceId').anyOf(sowIds).toArray()).sort(
    (a, b) => a.sourceId - b.sourceId || a.pageNo - b.pageNo
  );
  const all = pages.map((page) => page.text).join('\n\n');
  if (all.length <= MAX_SOURCE_CHARS) return all;
  const found = await searchPages(profileId, query, { type: 'sow', limit: 4 });
  return fitPages(found, MAX_SOURCE_CHARS).map((page) => page.text).join('\n\n');
}

/**
 * Choose consecutive topics for one class's lessons from the scheme of work.
 * @param {{ profile: object, lessons: object[], lastTopic?: string, notes?: string }} input
 *   All lessons belong to the same class, in order.
 * @returns {Promise<string[]>} One topic per lesson.
 * @throws {import('../ai/errors.js').AiError}
 */
export async function chooseTopics({ profile, lessons, lastTopic = '', notes = '' }, options) {
  const [first] = lessons;
  const query = [lastTopic, `week ${first.weekNo}`, first.class.displayName].filter(Boolean).join(' ');
  const prompts = topicPrompt({
    subjectName: profile.subjectName,
    classLabel: first.classLabel,
    displayName: first.class.displayName,
    lessonCount: lessons.length,
    lessonDates: lessons.map((lesson) => `${lesson.dayName} ${lesson.date}`),
    lastTopic,
    sowText: await sowText(profile.id, query),
    notes,
  });
  const { data } = await generateJson(profile, { ...prompts, schema: TOPICS_SCHEMA }, options);
  const topics = (Array.isArray(data?.topics) ? data.topics : []).map((topic) => String(topic).trim()).filter(Boolean);
  // If the AI gave too few, the last topic carries on rather than failing the whole request.
  return lessons.map((_, i) => topics[i] ?? topics.at(-1) ?? lastTopic ?? '');
}

/**
 * Generate one lesson's plan for a topic that is already chosen.
 * @param {{ profile: object, lesson: object, topic: string, lastTopic?: string, notes?: string,
 *   previousTopics?: string[] }} input
 * @param {object} [options] Passed to generateJson (e.g. onRetry).
 * @returns {Promise<{ plan: object, errors: string[], provider: string, model: string }>}
 *   `errors` is empty when the plan is valid; otherwise the plan is still returned so it can be shown.
 * @throws {import('../ai/errors.js').AiError} If no AI provider could answer.
 */
export async function generateLessonPlan({ profile, lesson, topic, lastTopic = '', notes = '', previousTopics = [] }, options) {
  const found = await searchPages(profile.id, topic, { type: 'textbook', limit: MAX_BOOK_PAGES });
  const user = planUserPrompt({
    lesson,
    topic,
    lastTopic,
    notes,
    sowText: await sowText(profile.id, topic),
    bookPages: fitPages(found, MAX_SOURCE_CHARS),
    previousTopicsThisRequest: previousTopics,
  });
  const system = planSystemPrompt(profile);

  const first = await generateJson(profile, { system, user, schema: PLAN_AI_SCHEMA }, options);
  let result = check(first, lesson, profile);
  if (result.errors.length === 0) return result;

  // One fix attempt: send the problems back, keeping the full context.
  const second = await generateJson(
    profile,
    { system, user: `${user}\n\n${fixPrompt(first.data, result.errors)}`, schema: PLAN_AI_SCHEMA },
    options
  );
  result = check(second, lesson, profile);
  return result;
}

function check({ data, provider, model }, lesson, profile) {
  const plan = autoFixPlan(mergePlan(lesson, profile, autoFixPlan(data ?? {})));
  return { plan, errors: validatePlans([plan], lesson), provider, model };
}
