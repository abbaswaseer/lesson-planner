import { describe, expect, it } from 'vitest';
import { EXAMPLE_PLAN } from './fixtures/examplePlan.js';
import { planFileName, planHeader } from './planFiles.js';

describe('planFiles', () => {
  it('names files and headers', () => {
    expect(planFileName(EXAMPLE_PLAN)).toBe('O1-day5-week9.json');
    expect(planHeader({ classLabel: 'O1', dayId: '5', date: '16/10/2026', duration: 60 })).toBe('O1 · Friday 16/10/2026 · 60 min');
  });
});
