import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SAMPLE_PROFILE } from '../db/sampleProfile.js';
import { buildLessons } from './timetable.js';

const chooseTopics = vi.fn();
const generateLessonPlan = vi.fn();
vi.mock('./generate.js', () => ({
  chooseTopics: (...args) => chooseTopics(...args),
  generateLessonPlan: (...args) => generateLessonPlan(...args),
}));
const { runRequest } = await import('./runRequest.js');

beforeEach(() => {
  chooseTopics.mockReset();
  generateLessonPlan.mockReset();
  generateLessonPlan.mockImplementation(async ({ topic }) => ({ plan: { topic }, errors: [], provider: 'Gemini', model: 'm' }));
});

describe('runRequest', () => {
  it('"O3, week 9" gives 4 consecutive topics, one lesson at a time', async () => {
    const lessons = buildLessons(SAMPLE_PROFILE, { day: null, classLabel: 'O3', week: 9 });
    chooseTopics.mockResolvedValue(['2.1 a', '2.1 b', '2.2 c', '2.3 d']);
    const results = [];
    const progress = [];
    await runRequest({
      profile: SAMPLE_PROFILE,
      lessons,
      lastTopics: { O3: '1.3' },
      onResult: (r) => results.push(r),
      onProgress: (p) => progress.push(p.message),
    });
    expect(chooseTopics).toHaveBeenCalledTimes(1);
    expect(results.map((r) => r.topic)).toEqual(['2.1 a', '2.1 b', '2.2 c', '2.3 d']);
    expect(generateLessonPlan.mock.calls[2][0].previousTopics).toEqual(['2.1 a', '2.1 b']);
    expect(generateLessonPlan.mock.calls[0][0].lastTopic).toBe('1.3');
    expect(progress).toContain('Generating 2 of 4…');
  });

  it('chooses topics per class for a day request', async () => {
    const lessons = buildLessons(SAMPLE_PROFILE, { day: 4, classLabel: null, week: 9 });
    chooseTopics.mockImplementation(async ({ lessons: classLessons }) => [`${classLessons[0].classLabel} topic`]);
    const results = [];
    await runRequest({ profile: SAMPLE_PROFILE, lessons, onResult: (r) => results.push(r) });
    expect(results.map((r) => `${r.lesson.classLabel}: ${r.topic}`)).toEqual(['O2: O2 topic', 'O3: O3 topic']);
  });

  it('stops between lessons when cancelled', async () => {
    const lessons = buildLessons(SAMPLE_PROFILE, { day: null, classLabel: 'O3', week: 9 });
    chooseTopics.mockResolvedValue(['a', 'b', 'c', 'd']);
    const controller = new AbortController();
    const results = [];
    const outcome = await runRequest({
      profile: SAMPLE_PROFILE,
      lessons,
      signal: controller.signal,
      onResult: (r) => {
        results.push(r);
        if (results.length === 2) controller.abort();
      },
    });
    expect(outcome).toEqual({ cancelled: true });
    expect(results).toHaveLength(2);
  });
});
