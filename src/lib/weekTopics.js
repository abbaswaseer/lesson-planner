// Topics for the weekly notification: from saved plans where they exist, otherwise chosen
// by the AI in one call (topics only, no full plans).
import { db } from '../db/db.js';
import { generateJson } from '../ai/index.js';
import { weekTopicsPrompt } from '../ai/prompts.js';
import { WEEK_TOPICS_SCHEMA } from '../ai/schema.js';
import { sowText } from './generate.js';

/**
 * The newest saved plan for each lesson (class + day) of a week.
 * @param {object[]} saved Rows from the plans table.
 * @param {object} lesson From buildLessons.
 * @returns {object | undefined}
 */
function savedPlanFor(saved, lesson) {
  return saved
    .filter((row) => row.classLabel === lesson.classLabel && row.dayId === lesson.dayId && row.data?.topic)
    .sort((a, b) => b.createdAt - a.createdAt)[0];
}

/**
 * One topic per lesson of the week, in lesson order.
 * @param {{ profile: object, lessons: object[], lastTopics?: Record<string, string>, notes?: string }} input
 *   All lessons are from one week.
 * @param {object} [options] Passed to generateJson.
 * @returns {Promise<{ items: Array<{ classLabel: string, topic: string }>, usedAi: boolean }>}
 * @throws {import('../ai/errors.js').AiError}
 */
export async function weekTopics({ profile, lessons, lastTopics = {}, notes = '' }, options) {
  if (lessons.length === 0) return { items: [], usedAi: false };
  const weekNo = lessons[0].weekNo;
  const saved = await db.plans.where('profileId').equals(profile.id).filter((row) => row.weekNo === weekNo).toArray();
  const topics = lessons.map((lesson) => savedPlanFor(saved, lesson)?.data.topic ?? null);

  const missing = lessons.filter((_, i) => topics[i] === null);
  if (missing.length > 0) {
    const labels = [...new Set(missing.map((lesson) => lesson.classLabel))];
    const prompts = weekTopicsPrompt({
      subjectName: profile.subjectName,
      classes: labels.map((label) => ({
        classLabel: label,
        displayName: missing.find((lesson) => lesson.classLabel === label).class.displayName,
        lessonCount: missing.filter((lesson) => lesson.classLabel === label).length,
        lastTopic: lastTopics[label] ?? '',
      })),
      sowText: await sowText(profile.id, `week ${weekNo} ${labels.map((label) => lastTopics[label] ?? '').join(' ')}`),
      notes,
      from: lessons[0].from,
      till: lessons[0].till,
    });
    const { data } = await generateJson(profile, { ...prompts, schema: WEEK_TOPICS_SCHEMA }, options);
    const chosen = new Map((data?.classes ?? []).map((entry) => [entry.classLabel, (entry.topics ?? []).map(String)]));
    const used = new Map();
    lessons.forEach((lesson, i) => {
      if (topics[i] !== null) return;
      const list = chosen.get(lesson.classLabel) ?? [];
      const n = used.get(lesson.classLabel) ?? 0;
      used.set(lesson.classLabel, n + 1);
      topics[i] = list[n] ?? list.at(-1) ?? '';
    });
  }

  return {
    items: lessons.map((lesson, i) => ({ classLabel: lesson.classLabel, topic: topics[i] })).filter((item) => item.topic),
    usedAi: missing.length > 0,
  };
}
