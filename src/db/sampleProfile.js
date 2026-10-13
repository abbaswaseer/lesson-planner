import { createProfile } from './db.js';

/**
 * The author's real profile from CLAUDE.md Section 5, used as a worked example.
 * Keys are left empty on purpose: each teacher adds their own.
 */
export const SAMPLE_PROFILE = {
  name: 'Ghulam Abbas — Computer Science',
  teacherName: 'Ghulam Abbas',
  subjectName: 'Computer Science (2210)',
  subject_id: '97',
  lp_type: '1',
  acad_year_id: '35',
  term_id: '1',
  collaboration_team: ['102558'],
  bookRef: 'Cambridge IGCSE and O Level Computer Science (2nd Ed.), Williams & Watson',
  periodMinutes: 40,
  dayOverrides: { 5: { periodMinutes: 30 } },
  classes: [
    { label: 'O1', displayName: 'IX', class_id: '16', section_ids: ['3'] },
    { label: 'O2', displayName: 'X', class_id: '17', section_ids: ['3'] },
    { label: 'O3', displayName: 'XI', class_id: '18', section_ids: ['3'] },
  ],
  timetable: [
    { day: 1, classLabel: 'O1', periods: [1, 2] },
    { day: 1, classLabel: 'O3', periods: [3, 4] },
    { day: 2, classLabel: 'O3', periods: [3, 4] },
    { day: 3, classLabel: 'O3', periods: [3] },
    { day: 3, classLabel: 'O2', periods: [7] },
    { day: 4, classLabel: 'O2', periods: [1, 2] },
    { day: 4, classLabel: 'O3', periods: [3, 4] },
    { day: 5, classLabel: 'O1', periods: [2, 3] },
    { day: 5, classLabel: 'O2', periods: [7, 8] },
  ],
  weeks: [
    { number: 8, from: '05/10/2026', till: '09/10/2026' },
    { number: 9, from: '12/10/2026', till: '16/10/2026' },
  ],
  keys: { gemini: '', groq: '', openrouter: '' },
  models: { gemini: '', groq: '', openrouter: '' },
  assessmentMethods: ['Oral questioning', 'Textbook activity solved and checked', 'Google Form quiz (sometimes)'],
  activityStyle:
    'Simple classroom activities: board explanation with worked examples, notebook work, textbook activities, think-pair-share, exit question. No apps or worksheets.',
  notificationTemplate: 'The following topics are planned for *{subject}* from {from} to {till}:\n\n{classes}',
};

/**
 * Save a fresh copy of the sample profile.
 * @returns {Promise<number>} The new profile's id.
 */
export function createSampleProfile() {
  // Copy so later edits to the saved profile can never change the constant.
  return createProfile(structuredClone(SAMPLE_PROFILE));
}
