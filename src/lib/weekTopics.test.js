import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createProfile, db } from '../db/db.js';
import { savePlan } from '../db/plans.js';
import { SAMPLE_PROFILE } from '../db/sampleProfile.js';
import { buildLessons } from './timetable.js';

const generateJson = vi.fn();
vi.mock('../ai/index.js', () => ({ generateJson: (...args) => generateJson(...args) }));
const { weekTopics } = await import('./weekTopics.js');

let profile;
let lessons;

beforeEach(async () => {
  await Promise.all(db.tables.map((table) => table.clear()));
  generateJson.mockReset();
  profile = await db.profiles.get(await createProfile({ ...SAMPLE_PROFILE, keys: { gemini: 'k' } }));
  lessons = buildLessons(profile, { day: null, classLabel: null, week: 9 });
});

const save = (lesson, topic) =>
  savePlan(profile.id, { lesson, plan: { topic }, topic }, { request: 'r', outputType: 'beamsJson' });

describe('weekTopics', () => {
  it('uses saved plans without calling the AI when every lesson has one', async () => {
    for (const lesson of lessons) await save(lesson, `${lesson.classLabel} day ${lesson.dayId}`);
    const { items, usedAi } = await weekTopics({ profile, lessons });
    expect(usedAi).toBe(false);
    expect(generateJson).not.toHaveBeenCalled();
    expect(items).toHaveLength(lessons.length);
    expect(items[0]).toEqual({ classLabel: 'O1', topic: 'O1 day 1' });
  });

  it('asks the AI once for the lessons without plans', async () => {
    const o1 = lessons.filter((lesson) => lesson.classLabel === 'O1');
    for (const lesson of o1) await save(lesson, `saved ${lesson.dayId}`);
    generateJson.mockResolvedValue({
      data: {
        classes: [
          { classLabel: 'O2', topics: ['2.1 a', '2.1 b', '2.2 c'] },
          { classLabel: 'O3', topics: ['3.1 a', '3.1 b', '3.2 c', '3.3 d'] },
        ],
      },
    });
    const { items, usedAi } = await weekTopics({ profile, lessons, lastTopics: { O3: '2.9' } });
    expect(usedAi).toBe(true);
    expect(generateJson).toHaveBeenCalledTimes(1);
    const { user } = generateJson.mock.calls[0][1];
    expect(user).toContain('Class O3 (Class XI): 4 lessons; last topic covered: 2.9');
    expect(user).not.toContain('Class O1');
    expect(items.filter((i) => i.classLabel === 'O3').map((i) => i.topic)).toEqual(['3.1 a', '3.1 b', '3.2 c', '3.3 d']);
    expect(items.filter((i) => i.classLabel === 'O1').map((i) => i.topic)).toEqual(['saved 1', 'saved 5']);
  });
});
