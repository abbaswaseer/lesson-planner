import { describe, expect, it } from 'vitest';
import { EXAMPLE_PLAN } from '../lib/fixtures/examplePlan.js';
import { PLAN_FIELDS } from '../lib/validate.js';
import { PLAN_AI_SCHEMA } from './schema.js';

describe('PLAN_AI_SCHEMA', () => {
  it('asks only for AI-owned fields, all required, in a fixed order', () => {
    const fields = Object.keys(PLAN_AI_SCHEMA.properties);
    expect(fields).toEqual(PLAN_AI_SCHEMA.required);
    expect(fields).toEqual(PLAN_AI_SCHEMA.propertyOrdering);
    for (const codeField of ['class_id', 'duration', 'day_id', 'cycle_id', 'week_from', 'label', 'book_ref']) {
      expect(fields).not.toContain(codeField);
    }
  });

  it('activity fields match the BEAMS activity shape', () => {
    const teacher = PLAN_AI_SCHEMA.properties.activities.items;
    expect(Object.keys(teacher.properties)).toEqual(Object.keys(EXAMPLE_PLAN.activities[0]));
    expect(Object.keys(teacher.properties.students.items.properties)).toEqual(
      Object.keys(EXAMPLE_PLAN.activities[0].students[0])
    );
    expect(PLAN_FIELDS).toContain('activities');
  });
});
