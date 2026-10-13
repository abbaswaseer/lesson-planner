import { useRef, useState } from 'react';
import { understandRequest } from '../../ai/understandRequest.js';
import { savePlan } from '../../db/plans.js';
import { userMessage } from '../../lib/friendlyError.js';
import { generateLessonPlan } from '../../lib/generate.js';
import { runRequest } from '../../lib/runRequest.js';
import { buildLessons } from '../../lib/timetable.js';
import { noLessonsMessage } from '../../lib/lessonPreview.js';
import { weekTopics } from '../../lib/weekTopics.js';
import { notificationText } from '../../outputs/notification.js';

const friendly = (error) => userMessage(error, 'Something went wrong while generating. Please try again.');

/**
 * State and actions for running a request on Generate: results, progress, Cancel and Regenerate.
 * Each finished plan is saved and moves its class's progress on.
 * @param {object} profile
 * @returns {{ results: object[], notice: string, running: boolean, progress: object | null, error: string, retryNote: string,
 *   start: Function, cancel: Function, regenerate: Function, regeneratingKey: string | null }}
 */
export function useGeneration(profile) {
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');
  const [retryNote, setRetryNote] = useState('');
  const [regeneratingKey, setRegeneratingKey] = useState(null);
  const [notice, setNotice] = useState('');
  const controllerRef = useRef(null);

  const onRetry = ({ provider, waitMs }) =>
    setRetryNote(`${provider} is busy. Trying again in ${Math.round(waitMs / 1000)} seconds…`);

  /**
   * @param {{ request: string, notes: string, outputType: string, parsed: object | null, lastTopics: Record<string, string> }} input
   */
  const start = async ({ request, notes, outputType, parsed, lastTopics }) => {
    const controller = new AbortController();
    controllerRef.current = controller;
    setResults([]);
    setNotice('');
    setError('');
    setRetryNote('');
    setRunning(true);
    setProgress({ done: 0, total: 0, message: 'Starting…' });
    try {
      let understood = parsed;
      if (!understood) {
        setProgress({ done: 0, total: 0, message: 'Reading your request…' });
        understood = (await understandRequest(profile, request, { onRetry })).parsed;
      }
      const lessons = understood ? buildLessons(profile, understood) : [];
      if (lessons.length === 0) {
        setError(noLessonsMessage(profile, understood));
        return;
      }
      if (outputType === 'notification') {
        // Topics only: from saved plans, or one AI call for the rest. No full plans are made.
        setProgress({ done: 0, total: 1, message: 'Finding the topics for the week…' });
        const { items } = await weekTopics({ profile, lessons, lastTopics, notes }, { onRetry });
        setNotice(notificationText(items, profile, lessons[0]));
        return;
      }
      await runRequest({
        profile,
        lessons,
        lastTopics,
        notes,
        signal: controller.signal,
        onRetry,
        onProgress: (next) => {
          setRetryNote('');
          setProgress(next);
        },
        onResult: async (result) => {
          const planId = await savePlan(profile.id, result, { request, outputType }).catch(() => null);
          const key = `${result.lesson.dayId}-${result.lesson.classLabel}-${result.lesson.periods[0]}`;
          setResults((current) => [...current, { ...result, key, planId, notes, request, outputType }]);
        },
      });
    } catch (caught) {
      setError(friendly(caught));
    } finally {
      setRunning(false);
      setProgress(null);
      setRetryNote('');
    }
  };

  const cancel = () => {
    controllerRef.current?.abort();
    setProgress((current) => current && { ...current, message: 'Stopping after this lesson…' });
  };

  /** Plan one card again with the same topic, plus an optional short instruction. */
  const regenerate = async (key, instruction = '') => {
    const old = results.find((result) => result.key === key);
    if (!old) return;
    setRegeneratingKey(key);
    setError('');
    try {
      const notes = [old.notes, instruction.trim()].filter(Boolean).join('\n');
      const fresh = await generateLessonPlan(
        { profile, lesson: old.lesson, topic: old.topic, lastTopic: old.lastTopic, notes },
        { onRetry }
      );
      const result = { ...old, ...fresh };
      const planId = await savePlan(profile.id, result, {
        request: old.request,
        outputType: old.outputType,
        planId: old.planId ?? undefined,
      }).catch(() => old.planId);
      setResults((current) => current.map((item) => (item.key === key ? { ...result, planId } : item)));
    } catch (caught) {
      setError(friendly(caught));
    } finally {
      setRegeneratingKey(null);
      setRetryNote('');
    }
  };

  return { results, notice, running, progress, error, retryNote, start, cancel, regenerate, regeneratingKey };
}
