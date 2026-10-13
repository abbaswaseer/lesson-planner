import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { addSource, createProfile, db } from '../db/db.js';
import { SAMPLE_PROFILE } from '../db/sampleProfile.js';
import { EXAMPLE_PLAN } from './fixtures/examplePlan.js';
import { buildLessons } from './timetable.js';

const generateJson = vi.fn();
vi.mock('../ai/index.js', () => ({ generateJson: (...args) => generateJson(...args) }));
const { chooseTopics, fitPages, generateLessonPlan, sowText } = await import('./generate.js');

const AI_FIELDS = {
  shortTopic: 'Calculating file sizes',
  topic: EXAMPLE_PLAN.topic,
  chapterNumber: 1,
  chapterTitle: 'Data representation',
  attainment_targets_html: EXAMPLE_PLAN.attainment_targets_html,
  learning_outcomes_html: EXAMPLE_PLAN.learning_outcomes_html,
  activities: EXAMPLE_PLAN.activities,
};
const answer = (data) => ({ data, provider: 'Gemini', model: 'g-flash' });

let profile;
let friday;

beforeEach(async () => {
  await Promise.all(db.tables.map((table) => table.clear()));
  generateJson.mockReset();
  const id = await createProfile({ ...SAMPLE_PROFILE, keys: { gemini: 'k' } });
  profile = await db.profiles.get(id);
  [friday] = buildLessons(profile, { day: 5, classLabel: 'O1', week: 9 });
  await addSource(id, { type: 'textbook', name: 'Book.pdf' }, [
    { pageNo: 30, text: 'Calculation of file size. Activity 1.16' },
    { pageNo: 31, text: 'Unrelated page about networks' },
  ]);
  await addSource(id, { type: 'sow', name: 'SOW.pdf' }, [{ pageNo: 1, text: 'Week 9: 1.3.2 file sizes' }]);
});

describe('generateLessonPlan', () => {
  it('returns a valid plan from one AI call, using the book pages and SOW', async () => {
    generateJson.mockResolvedValue(answer(AI_FIELDS));
    const result = await generateLessonPlan({ profile, lesson: friday, topic: 'calculation of file size' });
    expect(result.errors).toEqual([]);
    expect(JSON.stringify(result.plan)).toBe(JSON.stringify(EXAMPLE_PLAN));
    expect(result.provider).toBe('Gemini');
    expect(generateJson).toHaveBeenCalledTimes(1);
    const { user, system, schema } = generateJson.mock.calls[0][1];
    expect(user).toContain('[Book page 30]\nCalculation of file size. Activity 1.16');
    expect(user).toContain('Week 9: 1.3.2 file sizes');
    expect(system).toContain('Computer Science (2210)');
    expect(schema.properties).toHaveProperty('activities');
  });

  it('sends errors back once and returns the fixed plan', async () => {
    const wrongTimes = structuredClone(AI_FIELDS);
    wrongTimes.activities[3].students[0].time = 15;
    generateJson.mockResolvedValueOnce(answer(wrongTimes)).mockResolvedValueOnce(answer(AI_FIELDS));
    const result = await generateLessonPlan({ profile, lesson: friday, topic: 'file size' });
    expect(result.errors).toEqual([]);
    expect(generateJson).toHaveBeenCalledTimes(2);
    expect(generateJson.mock.calls[1][1].user).toContain('- The activity times add up to 65 minutes');
  });

  it('returns the plan with its errors if the fix also fails', async () => {
    const wrongTimes = structuredClone(AI_FIELDS);
    wrongTimes.activities[0].students[0].time = 30;
    generateJson.mockResolvedValue(answer(wrongTimes));
    const result = await generateLessonPlan({ profile, lesson: friday, topic: 'file size' });
    expect(result.errors).toHaveLength(1);
    expect(result.plan.activities[0].students[0].time).toBe(30);
    expect(generateJson).toHaveBeenCalledTimes(2);
  });

  it('fixes number strings from the AI without bothering it', async () => {
    const stringTimes = structuredClone(AI_FIELDS);
    stringTimes.activities.forEach((a) => a.students.forEach((s) => (s.time = String(s.time))));
    generateJson.mockResolvedValue(answer(stringTimes));
    const result = await generateLessonPlan({ profile, lesson: friday, topic: 'file size' });
    expect(result.errors).toEqual([]);
    expect(generateJson).toHaveBeenCalledTimes(1);
  });
});

describe('chooseTopics', () => {
  it('asks for one topic per lesson, in order', async () => {
    const lessons = buildLessons(profile, { day: null, classLabel: 'O3', week: 9 });
    generateJson.mockResolvedValue(answer({ topics: ['2.1 a', '2.1 b', '2.2 c'] }));
    const topics = await chooseTopics({ profile, lessons, lastTopic: '1.3 compression' });
    expect(topics).toEqual(['2.1 a', '2.1 b', '2.2 c', '2.2 c']);
    const { user } = generateJson.mock.calls[0][1];
    expect(user).toContain('Number of lessons: 4');
    expect(user).toContain('Last topic covered: 1.3 compression');
  });
});

describe('fitPages and sowText', () => {
  it('keeps whole pages within the budget', () => {
    const pages = [{ text: 'a'.repeat(6000) }, { text: 'b'.repeat(5000) }, { text: 'c'.repeat(2000) }];
    expect(fitPages(pages, 12000).map((p) => p.text.length)).toEqual([6000, 5000]);
    expect(fitPages([{ text: 'x'.repeat(20000) }], 12000)[0].text).toHaveLength(12000);
  });

  it('sends a short SOW whole', async () => {
    expect(await sowText(profile.id, 'anything')).toBe('Week 9: 1.3.2 file sizes');
  });
});
