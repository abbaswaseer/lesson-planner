import { describe, expect, it } from 'vitest';
import { SAMPLE_PROFILE } from '../db/sampleProfile.js';
import { describeLessons, noLessonsMessage } from './lessonPreview.js';
import { buildLessons } from './timetable.js';

describe('describeLessons', () => {
  it('groups by day', () => {
    expect(describeLessons(buildLessons(SAMPLE_PROFILE, { day: 4, classLabel: null, week: 9 }))).toEqual([
      { day: 'Thursday 15/10/2026', classes: 'O2 (80 min), O3 (80 min)' },
    ]);
    expect(describeLessons(buildLessons(SAMPLE_PROFILE, { day: null, classLabel: 'O3', week: 9 }))).toHaveLength(4);
  });
});

describe('noLessonsMessage', () => {
  it('explains the problem', () => {
    expect(noLessonsMessage(SAMPLE_PROFILE, null)).toMatch(/^Not understood yet/);
    expect(noLessonsMessage(SAMPLE_PROFILE, { day: 1, classLabel: null, week: 30 })).toBe(
      'Week 30 is not in your week table. Add it on the Setup page.'
    );
    expect(noLessonsMessage(SAMPLE_PROFILE, { day: 2, classLabel: 'O1', week: 9 })).toBe(
      'O1 has no lessons on Tuesday in your timetable.'
    );
  });
});
