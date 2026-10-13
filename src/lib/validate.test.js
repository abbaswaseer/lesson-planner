import { describe, expect, it } from 'vitest';
import { EXAMPLE_LESSON, EXAMPLE_PLAN } from './fixtures/examplePlan.js';
import { autoFixPlan, PLAN_FIELDS, validatePlans } from './validate.js';

/** A deep copy of the example plan with one change applied. */
function broken(change) {
  const plan = structuredClone(EXAMPLE_PLAN);
  change(plan);
  return plan;
}

const errorsFor = (plan, lesson = EXAMPLE_LESSON) => validatePlans([plan], lesson);

describe('validatePlans', () => {
  it('accepts the approved example plan', () => {
    expect(validatePlans([EXAMPLE_PLAN], EXAMPLE_LESSON)).toEqual([]);
    expect(validatePlans([EXAMPLE_PLAN])).toEqual([]);
  });

  it('1. needs an array with every field in order', () => {
    expect(validatePlans(EXAMPLE_PLAN)).toEqual(['The output must be a JSON array of plans.']);
    expect(validatePlans([])).toEqual(['The output array is empty.']);
    expect(errorsFor(broken((p) => delete p.book_ref))).toEqual(['Missing fields: book_ref.']);
    expect(errorsFor(broken((p) => (p.notes = 'x')))).toEqual(['Unexpected fields: notes.']);
    const { label, ...rest } = EXAMPLE_PLAN;
    expect(errorsFor({ ...rest, label })[0]).toMatch(/^Fields are in the wrong order/);
  });

  it('2. needs string IDs and whole-number minutes', () => {
    expect(errorsFor(broken((p) => (p.class_id = 16)))).toEqual(['class_id must be a non-empty text value, like "18".']);
    expect(errorsFor(broken((p) => (p.section_ids = [3])))).toEqual(['section_ids must be a list of text IDs, like ["3"].']);
    expect(errorsFor(broken((p) => (p.duration = '60')))).toEqual(['duration must be a whole number of minutes, like 80.']);
    expect(errorsFor(broken((p) => (p.activities[0].students[0].time = 0)))).toEqual([
      'Activity 1: time must be a whole number of minutes, like 10.',
    ]);
  });

  it('3. needs dd/mm/yyyy dates', () => {
    expect(errorsFor(broken((p) => (p.week_from = '2026-10-12')))).toEqual([
      'week_from must be a real date written dd/mm/yyyy.',
    ]);
  });

  it('4. needs 3–4 activities with 1–2 plain-text student entries', () => {
    expect(errorsFor(broken((p) => p.activities.splice(1, 2)))).toEqual([
      'activities must be a list of 3 or 4 teacher activities.',
    ]);
    expect(errorsFor(broken((p) => (p.activities[1].students = [])))).toEqual([
      'Activity 2: students must have 1 or 2 student activities.',
    ]);
    expect(errorsFor(broken((p) => (p.activities[2].content_teacher_activity = '<b>Practice</b>')))).toEqual([
      'Activity 3: content_teacher_activity must be plain text, without HTML.',
    ]);
  });

  it('5. needs times that add up to the duration', () => {
    expect(errorsFor(broken((p) => (p.activities[3].students[0].time = 15)))).toEqual([
      'The activity times add up to 65 minutes, but the lesson is 60 minutes. They must add up exactly.',
    ]);
  });

  it('6. needs <p> attainment targets and the three learning outcome labels', () => {
    expect(errorsFor(broken((p) => (p.attainment_targets_html = '1.3.2 Calculate file size')))[0]).toMatch(
      /^attainment_targets_html needs at least one <p>/
    );
    const noAttitudes = broken((p) => (p.learning_outcomes_html = p.learning_outcomes_html.replace('<em>Attitudes:</em>', '')));
    expect(errorsFor(noAttitudes)[0]).toMatch(/^learning_outcomes_html must be exactly three <p>/);
  });

  it('7. needs day_id 1–5 matching the lesson, and cycle_id matching the week', () => {
    expect(errorsFor(broken((p) => (p.cycle_id = '8')))).toEqual(['cycle_id must be "9" (the week number).']);
    expect(errorsFor(broken((p) => (p.day_id = '6')), {})).toEqual(['day_id must be "1" (Monday) to "5" (Friday).']);
    const wrongDay = broken((p) => {
      p.day_id = '4';
      p.label = 'O1 Day 4 - Calculating file sizes';
    });
    expect(errorsFor(wrongDay)).toEqual(['day_id must be "5" for this lesson.']);
  });

  it('8. needs the label prefix', () => {
    expect(errorsFor(broken((p) => (p.label = 'Calculating file sizes')))).toEqual([
      'label must start with "O1 Day 5 - " followed by a short topic.',
    ]);
    expect(errorsFor(broken((p) => (p.label = 'O2 Day 5 - Calculating file sizes')))).toEqual([
      'label must start with "O1 Day 5 - " followed by a short topic.',
    ]);
  });

  it('numbers errors by plan when there are several plans', () => {
    const errors = validatePlans([EXAMPLE_PLAN, broken((p) => (p.topic = ''))], EXAMPLE_LESSON);
    expect(errors).toEqual(['Plan 2: topic must not be empty.']);
  });
});

describe('autoFixPlan', () => {
  it('trims text and fixes number types without changing times', () => {
    const messy = broken((p) => {
      p.topic = '  1.3 Data storage  ';
      p.class_id = 16;
      p.collaboration_team = [102558];
      p.duration = '60';
      p.activities[0].students[0].time = '10';
    });
    const fixed = autoFixPlan(messy);
    expect(fixed.topic).toBe('1.3 Data storage');
    expect(fixed.class_id).toBe('16');
    expect(fixed.collaboration_team).toEqual(['102558']);
    expect(fixed.duration).toBe(60);
    expect(fixed.activities[0].students[0].time).toBe(10);
    expect(Object.keys(fixed)).toEqual(PLAN_FIELDS);
    expect(validatePlans([fixed], EXAMPLE_LESSON)).toEqual([]);
    expect(messy.class_id).toBe(16); // the original is not changed
  });
});
