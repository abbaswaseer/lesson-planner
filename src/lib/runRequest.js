// Generate every lesson of a request, one at a time (free rate limits), with progress and Cancel.
import { chooseTopics, generateLessonPlan } from './generate.js';

/**
 * Run a whole request. Topics are chosen once per class, so a class's lessons in this request
 * follow on from each other; then each lesson is planned in timetable order.
 * @param {{ profile: object, lessons: object[], lastTopics?: Record<string, string>, notes?: string,
 *   signal?: AbortSignal, onProgress?: (progress: { done: number, total: number, message: string }) => void,
 *   onResult?: (result: object) => void | Promise<void>, onRetry?: Function }} input
 *   `onResult` gets `{ lesson, topic, lastTopic, plan, errors, provider, model }` after each lesson.
 * @returns {Promise<{ cancelled: boolean }>}
 * @throws {import('../ai/errors.js').AiError} If the AI cannot be reached; lessons done so far were already reported.
 */
export async function runRequest({ profile, lessons, lastTopics = {}, notes = '', signal, onProgress, onResult, onRetry }) {
  const total = lessons.length;
  const topicsByClass = new Map();
  const doneByClass = new Map();

  for (const [i, lesson] of lessons.entries()) {
    if (signal?.aborted) return { cancelled: true };
    const label = lesson.classLabel;
    const lastTopic = lastTopics[label] ?? '';

    if (!topicsByClass.has(label)) {
      onProgress?.({ done: i, total, message: `Choosing topics for ${label}…` });
      const classLessons = lessons.filter((other) => other.classLabel === label);
      topicsByClass.set(label, await chooseTopics({ profile, lessons: classLessons, lastTopic, notes }, { onRetry }));
      doneByClass.set(label, []);
      if (signal?.aborted) return { cancelled: true };
    }

    const previousTopics = doneByClass.get(label);
    const topic = topicsByClass.get(label)[previousTopics.length];
    onProgress?.({ done: i, total, message: `Generating ${i + 1} of ${total}…` });
    const result = await generateLessonPlan(
      { profile, lesson, topic, lastTopic, notes, previousTopics: [...previousTopics] },
      { onRetry }
    );
    previousTopics.push(topic);
    await onResult?.({ lesson, topic, lastTopic, ...result });
  }
  onProgress?.({ done: total, total, message: 'Done' });
  return { cancelled: false };
}
