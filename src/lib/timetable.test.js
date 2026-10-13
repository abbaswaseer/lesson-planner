import { describe, expect, it } from 'vitest';
import { SAMPLE_PROFILE } from '../db/sampleProfile.js';
import { gridFromTimetable, lessonDuration, periodMinutesForDay, timetableFromGrid } from './timetable.js';

describe('gridFromTimetable', () => {
  it('puts each class in its periods', () => {
    const grid = gridFromTimetable(SAMPLE_PROFILE.timetable);
    expect(grid[1]).toEqual({ 1: 'O1', 2: 'O1', 3: 'O3', 4: 'O3' });
    expect(grid[3]).toEqual({ 3: 'O3', 7: 'O2' });
    expect(grid[5]).toEqual({ 2: 'O1', 3: 'O1', 7: 'O2', 8: 'O2' });
  });

  it('handles a missing timetable', () => {
    expect(gridFromTimetable(undefined)).toEqual({});
  });
});

describe('timetableFromGrid', () => {
  it('rebuilds the sample timetable exactly', () => {
    const grid = gridFromTimetable(SAMPLE_PROFILE.timetable);
    expect(timetableFromGrid(grid)).toEqual(SAMPLE_PROFILE.timetable);
  });

  it('joins back-to-back periods of the same class', () => {
    expect(timetableFromGrid({ 4: { 1: 'O2', 2: 'O2' } })).toEqual([
      { day: 4, classLabel: 'O2', periods: [1, 2] },
    ]);
  });

  it('splits the same class when there is a gap', () => {
    expect(timetableFromGrid({ 2: { 1: 'O1', 2: 'O1', 5: 'O1' } })).toEqual([
      { day: 2, classLabel: 'O1', periods: [1, 2] },
      { day: 2, classLabel: 'O1', periods: [5] },
    ]);
  });

  it('splits when a different class is in between', () => {
    expect(timetableFromGrid({ 1: { 1: 'O1', 2: 'O2', 3: 'O1' } })).toEqual([
      { day: 1, classLabel: 'O1', periods: [1] },
      { day: 1, classLabel: 'O2', periods: [2] },
      { day: 1, classLabel: 'O1', periods: [3] },
    ]);
  });

  it('ignores empty cells and orders by day then period', () => {
    expect(timetableFromGrid({ 5: { 8: 'O2', 3: '' }, 1: { 4: 'O3' } })).toEqual([
      { day: 1, classLabel: 'O3', periods: [4] },
      { day: 5, classLabel: 'O2', periods: [8] },
    ]);
  });
});

describe('lessonDuration', () => {
  const entry = (day, classLabel) =>
    SAMPLE_PROFILE.timetable.find((e) => e.day === day && e.classLabel === classLabel);

  it('Monday O1 (2 × 40) = 80', () => {
    expect(lessonDuration(SAMPLE_PROFILE, entry(1, 'O1'))).toBe(80);
  });

  it('Wednesday O3 (1 × 40) = 40', () => {
    expect(lessonDuration(SAMPLE_PROFILE, entry(3, 'O3'))).toBe(40);
  });

  it('Friday O1 uses the 30-minute override (2 × 30) = 60', () => {
    expect(lessonDuration(SAMPLE_PROFILE, entry(5, 'O1'))).toBe(60);
  });

  it('returns null when no period length is set', () => {
    expect(lessonDuration({}, { day: 1, periods: [1, 2] })).toBeNull();
  });
});

describe('periodMinutesForDay', () => {
  it('uses the override only on that day', () => {
    expect(periodMinutesForDay(SAMPLE_PROFILE, 5)).toBe(30);
    expect(periodMinutesForDay(SAMPLE_PROFILE, '5')).toBe(30);
    expect(periodMinutesForDay(SAMPLE_PROFILE, 4)).toBe(40);
  });
});
