import { describe, expect, it } from 'vitest';
import { filterPlans, planFilterOptions } from './history.js';

const plans = [
  { id: 1, classLabel: 'O3', weekNo: 9 },
  { id: 2, classLabel: 'O1', weekNo: 9 },
  { id: 3, classLabel: 'O3', weekNo: 8 },
];

describe('history filters', () => {
  it('lists classes and weeks (newest week first)', () => {
    expect(planFilterOptions(plans)).toEqual({ classes: ['O1', 'O3'], weeks: [9, 8] });
  });

  it('filters by class and week', () => {
    expect(filterPlans(plans, { classLabel: 'O3', weekNo: '' }).map((p) => p.id)).toEqual([1, 3]);
    expect(filterPlans(plans, { classLabel: '', weekNo: '9' }).map((p) => p.id)).toEqual([1, 2]);
    expect(filterPlans(plans, { classLabel: 'O3', weekNo: '8' }).map((p) => p.id)).toEqual([3]);
    expect(filterPlans(plans, { classLabel: '', weekNo: '' })).toHaveLength(3);
  });
});
