// Plan validation (CLAUDE.md Section 9). Errors are plain English: they are shown to the
// teacher and also sent back to the AI to fix.

import { parseDate } from './weeks.js';

/** Every BEAMS field, in the exact order BEAMS expects (CLAUDE.md Section 6). */
export const PLAN_FIELDS = [
  'label', 'class_id', 'section_ids', 'subject_id', 'lp_type', 'acad_year_id', 'topic',
  'week_from', 'week_till', 'attainment_targets_html', 'book_ref', 'duration', 'day_id',
  'learning_outcomes_html', 'term_id', 'cycle_id', 'collaboration_team', 'activities',
];

const ID_FIELDS = ['class_id', 'subject_id', 'lp_type', 'acad_year_id', 'day_id', 'term_id', 'cycle_id'];
const ID_LIST_FIELDS = ['section_ids', 'collaboration_team'];
const TEXT_FIELDS = ['label', 'topic', 'book_ref'];
const STUDENT_TEXT_FIELDS = ['student_activity', 'resources', 'assessment'];
const HTML_TAG = /<\/?[a-z!][^>]*>/i;
const LESSON_NUMBER = /^[1-9]\d*$/;
const OUTCOME_LABELS = ['Knowledge:', 'Skills:', 'Attitudes:'];

const isNonEmptyString = (value) => typeof value === 'string' && value.trim() !== '';
const isPositiveInteger = (value) => Number.isInteger(value) && value > 0;
const count = (text, needle) => String(text).split(needle).length - 1;

/**
 * Check a BEAMS output against every rule in CLAUDE.md Section 9.
 * @param {unknown} output Should be an array of plan objects.
 * @param {{ classLabel?: string, sequenceId?: string, weekNo?: number }} [lesson]
 *   The lesson the plans are for; when given, day_id, cycle_id and the label are checked against it.
 * @returns {string[]} Plain-English errors; empty means valid.
 */
export function validatePlans(output, lesson = {}) {
  if (!Array.isArray(output)) return ['The output must be a JSON array of plans.'];
  if (output.length === 0) return ['The output array is empty.'];
  const many = output.length > 1;
  return output.flatMap((plan, i) =>
    validatePlan(plan, lesson).map((error) => (many ? `Plan ${i + 1}: ${error}` : error))
  );
}

/**
 * Check one plan object. See validatePlans.
 * @param {unknown} plan
 * @param {{ classLabel?: string, sequenceId?: string, weekNo?: number }} [lesson]
 * @returns {string[]}
 */
export function validatePlan(plan, lesson = {}) {
  if (!plan || typeof plan !== 'object' || Array.isArray(plan)) return ['Each plan must be a JSON object.'];
  return [
    ...checkFields(plan),
    ...checkValues(plan),
    ...checkHtml(plan),
    ...checkActivities(plan),
    ...checkLesson(plan, lesson),
  ];
}

function checkFields(plan) {
  const errors = [];
  const keys = Object.keys(plan);
  const missing = PLAN_FIELDS.filter((field) => !(field in plan));
  const extra = keys.filter((key) => !PLAN_FIELDS.includes(key));
  if (missing.length) errors.push(`Missing fields: ${missing.join(', ')}.`);
  if (extra.length) errors.push(`Unexpected fields: ${extra.join(', ')}.`);
  const known = keys.filter((key) => PLAN_FIELDS.includes(key));
  if (!missing.length && known.some((key, i) => key !== PLAN_FIELDS[i])) {
    errors.push(`Fields are in the wrong order. The order must be: ${PLAN_FIELDS.join(', ')}.`);
  }
  return errors;
}

function checkValues(plan) {
  const errors = [];
  for (const field of ID_FIELDS) {
    if (field in plan && !isNonEmptyString(plan[field])) errors.push(`${field} must be a non-empty text value, like "18".`);
  }
  for (const field of ID_LIST_FIELDS) {
    if (!(field in plan)) continue;
    const list = plan[field];
    // A lesson always has a section; a collaboration team may be empty.
    const ok = Array.isArray(list) && list.every(isNonEmptyString) && (field !== 'section_ids' || list.length > 0);
    if (!ok) errors.push(`${field} must be a list of text IDs, like ["3"].`);
  }
  for (const field of TEXT_FIELDS) {
    if (field in plan && !isNonEmptyString(plan[field])) errors.push(`${field} must not be empty.`);
  }
  if ('duration' in plan && !isPositiveInteger(plan.duration)) {
    errors.push('duration must be a whole number of minutes, like 80.');
  }
  for (const field of ['week_from', 'week_till']) {
    if (field in plan && !parseDate(plan[field])) errors.push(`${field} must be a real date written dd/mm/yyyy.`);
  }
  if (isNonEmptyString(plan.day_id) && !LESSON_NUMBER.test(plan.day_id)) {
    errors.push('day_id must be the lesson number for that class that week, as text, like "2".');
  }
  return errors;
}

function checkHtml(plan) {
  const errors = [];
  if ('attainment_targets_html' in plan && count(plan.attainment_targets_html, '<p>') < 1) {
    errors.push('attainment_targets_html needs at least one <p> paragraph, each starting with its syllabus reference number.');
  }
  if ('learning_outcomes_html' in plan) {
    const html = String(plan.learning_outcomes_html);
    const tags = OUTCOME_LABELS.map((label) => `<em>${label}</em>`);
    const positions = tags.map((tag) => html.indexOf(tag));
    const eachOnce = tags.every((tag) => count(html, tag) === 1);
    const inOrder = positions.every((pos, i) => i === 0 || pos > positions[i - 1]);
    if (count(html, '<p>') !== 3 || count(html, '<em>') !== 3 || !eachOnce || !inOrder) {
      errors.push(
        'learning_outcomes_html must be exactly three <p> paragraphs starting with <em>Knowledge:</em>, <em>Skills:</em> and <em>Attitudes:</em>, in that order.'
      );
    }
  }
  return errors;
}

function checkActivities(plan) {
  if (!('activities' in plan)) return [];
  const { activities } = plan;
  if (!Array.isArray(activities) || activities.length < 3 || activities.length > 4) {
    return ['activities must be a list of 3 or 4 teacher activities.'];
  }
  const errors = [];
  let total = 0;
  let allTimesValid = true;
  activities.forEach((activity, i) => {
    const name = `Activity ${i + 1}`;
    const teacherText = activity?.content_teacher_activity;
    if (!isNonEmptyString(teacherText)) errors.push(`${name}: content_teacher_activity must not be empty.`);
    else if (HTML_TAG.test(teacherText)) errors.push(`${name}: content_teacher_activity must be plain text, without HTML.`);

    const students = activity?.students;
    if (!Array.isArray(students) || students.length < 1 || students.length > 2) {
      errors.push(`${name}: students must have 1 or 2 student activities.`);
      allTimesValid = false;
      return;
    }
    students.forEach((student, j) => {
      const where = students.length > 1 ? `${name}, student activity ${j + 1}` : name;
      if (!isNonEmptyString(student?.student_activity)) errors.push(`${where}: student_activity must not be empty.`);
      for (const field of STUDENT_TEXT_FIELDS) {
        if (typeof student?.[field] !== 'string') errors.push(`${where}: ${field} must be text.`);
        else if (HTML_TAG.test(student[field])) errors.push(`${where}: ${field} must be plain text, without HTML.`);
      }
      if (isPositiveInteger(student?.time)) {
        total += student.time;
      } else {
        errors.push(`${where}: time must be a whole number of minutes, like 10.`);
        allTimesValid = false;
      }
    });
  });
  // Only compare the total when every time is a real number, so one bad value gives one error.
  if (allTimesValid && isPositiveInteger(plan.duration) && total !== plan.duration) {
    errors.push(
      `The activity times add up to ${total} minutes, but the lesson is ${plan.duration} minutes. They must add up exactly.`
    );
  }
  return errors;
}

function checkLesson(plan, lesson) {
  const errors = [];
  if (lesson.sequenceId != null && 'day_id' in plan && plan.day_id !== String(lesson.sequenceId)) {
    errors.push(`day_id must be "${lesson.sequenceId}" for this lesson.`);
  }
  if (lesson.weekNo != null && 'cycle_id' in plan && plan.cycle_id !== String(lesson.weekNo)) {
    errors.push(`cycle_id must be "${lesson.weekNo}" (the week number).`);
  }
  // A bad day_id is already reported; checking the label against it would only add noise.
  if (isNonEmptyString(plan.label) && isNonEmptyString(plan.day_id) && LESSON_NUMBER.test(plan.day_id)) {
    const classPart = lesson.classLabel ? escapeRegExp(lesson.classLabel) : '\\S+';
    const prefix = new RegExp(`^${classPart} Day ${escapeRegExp(String(plan.day_id))} - \\S`);
    if (!prefix.test(plan.label)) {
      errors.push(`label must start with "${lesson.classLabel ?? '<class>'} Day ${plan.day_id} - " followed by a short topic.`);
    }
  }
  return errors;
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Fix only safe things: trim text, number strings → numbers for duration and time,
 * numbers → strings for IDs. Never changes a time value itself (CLAUDE.md Section 9).
 * Returns a new object with the same field order.
 * @param {object} plan
 * @returns {object}
 */
export function autoFixPlan(plan) {
  if (!plan || typeof plan !== 'object' || Array.isArray(plan)) return plan;
  const fixed = trimDeep(plan);
  for (const field of ID_FIELDS) {
    if (typeof fixed[field] === 'number') fixed[field] = String(fixed[field]);
  }
  for (const field of ID_LIST_FIELDS) {
    if (Array.isArray(fixed[field])) fixed[field] = fixed[field].map((id) => (typeof id === 'number' ? String(id) : id));
  }
  if ('duration' in fixed) fixed.duration = toNumber(fixed.duration);
  for (const activity of Array.isArray(fixed.activities) ? fixed.activities : []) {
    for (const student of Array.isArray(activity?.students) ? activity.students : []) {
      if (student && 'time' in student) student.time = toNumber(student.time);
    }
  }
  return fixed;
}

function toNumber(value) {
  return typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value;
}

function trimDeep(value) {
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) return value.map(trimDeep);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, trimDeep(inner)]));
  }
  return value;
}
