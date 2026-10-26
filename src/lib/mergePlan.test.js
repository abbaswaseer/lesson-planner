import { describe, expect, it } from 'vitest';
import { SAMPLE_PROFILE } from '../db/sampleProfile.js';
import { EXAMPLE_PLAN } from './fixtures/examplePlan.js';
import { bookReference, mergePlan } from './mergePlan.js';
import { buildLessons } from './timetable.js';
import { validatePlans } from './validate.js';

const [FRIDAY_O1] = buildLessons(SAMPLE_PROFILE, { day: 5, classLabel: 'O1', week: 9 });

/** What the AI would return for the example plan, with keys in a jumbled order. */
const AI_FIELDS = {
  activities: EXAMPLE_PLAN.activities.map(({ content_teacher_activity, students }) => ({
    students: students.map(({ student_activity, time, resources, assessment }) => ({
      assessment, resources, time, student_activity,
    })),
    content_teacher_activity,
  })),
  learning_outcomes_html: EXAMPLE_PLAN.learning_outcomes_html,
  attainment_targets_html: EXAMPLE_PLAN.attainment_targets_html,
  chapterTitle: 'Data representation',
  chapterNumber: 1,
  topic: EXAMPLE_PLAN.topic,
  shortTopic: 'Calculating file sizes',
};

describe('mergePlan', () => {
  it('rebuilds the example plan exactly, in the same key order', () => {
    const plan = mergePlan(FRIDAY_O1, SAMPLE_PROFILE, AI_FIELDS);
    expect(JSON.stringify(plan)).toBe(JSON.stringify(EXAMPLE_PLAN));
    expect(validatePlans([plan], FRIDAY_O1)).toEqual([]);
  });

  it('takes IDs and timing from code, not from the AI', () => {
    const plan = mergePlan(FRIDAY_O1, SAMPLE_PROFILE, { ...AI_FIELDS, duration: 999, class_id: '1', day_id: '1' });
    expect(plan.duration).toBe(60);
    expect(plan.class_id).toBe('16');
    // Friday is O1's second lesson that week, so BEAMS day_id is "2".
    expect(plan.day_id).toBe('2');
    expect(plan.label).toBe('O1 Day 2 - Calculating file sizes');
  });

  it('does not share arrays with the profile', () => {
    const plan = mergePlan(FRIDAY_O1, SAMPLE_PROFILE, AI_FIELDS);
    plan.collaboration_team.push('x');
    plan.section_ids.push('x');
    expect(SAMPLE_PROFILE.collaboration_team).toEqual(['102558']);
    expect(SAMPLE_PROFILE.classes[0].section_ids).toEqual(['3']);
  });
});

describe('bookReference', () => {
  it('adds the chapter when known', () => {
    expect(bookReference('Book', 2, 'Data transmission')).toBe('Book, Ch 2 Data transmission');
    expect(bookReference('Book', '', 'Data transmission')).toBe('Book, Data transmission');
    expect(bookReference('Book')).toBe('Book');
  });
});
