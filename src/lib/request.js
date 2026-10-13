// Teacher's typed request ("Thursday, week 9", "11C week 9") → { day, classLabel, week }.
// If this returns null, the caller asks the AI to convert the request instead (CLAUDE.md Section 7).

import { findClass } from './classMatch.js';

const DAY_WORDS = {
  monday: 1, mon: 1,
  tuesday: 2, tues: 2, tue: 2,
  wednesday: 3, wed: 3,
  thursday: 4, thurs: 4, thur: 4, thu: 4,
  friday: 5, fri: 5,
};

// Words teachers often add that carry no meaning here ("plans for O3 on Monday").
const FILLER_WORDS = new Set(['for', 'on', 'of', 'the', 'in', 'plan', 'plans', 'lesson', 'lessons']);

const WEEK_PATTERN = /\b(?:week|wk|w)\s*(\d{1,2})\b/i;

/**
 * Read a request in one of the supported forms:
 * by day ("Monday, week 9"), by class ("O3, week 9", "11C week 9"),
 * or single ("O2, week 9, Thursday"). Short forms like "thursday wk 9" also work.
 * @param {string} text
 * @param {object} [profile] If given, the class text must match one of its classes,
 *   and `classLabel` is that class's label ("11C" → "O3"). Without it, the class text is returned as typed.
 * @returns {{ day: number | null, classLabel: string | null, week: number } | null}
 *   null if the week, or both the day and the class, cannot be found.
 */
export function parseRequest(text, profile) {
  const source = String(text ?? '');
  const weekMatch = WEEK_PATTERN.exec(source);
  if (!weekMatch) return null;
  const week = Number(weekMatch[1]);
  if (week < 1) return null;

  const words = source
    .replace(weekMatch[0], ' ')
    .split(/[\s,;]+/)
    .filter(Boolean);

  let day = null;
  const classWords = [];
  for (const word of words) {
    const lower = word.toLowerCase();
    const dayId = DAY_WORDS[lower];
    if (dayId) {
      if (day !== null && day !== dayId) return null; // two different days: leave it to the AI
      day = dayId;
    } else if (!FILLER_WORDS.has(lower)) {
      classWords.push(word);
    }
  }

  let classLabel = classWords.length ? classWords.join(' ') : null;
  if (classLabel && profile) {
    const match = findClass(profile, classLabel);
    if (!match) return null;
    classLabel = match.label;
  }

  if (day === null && classLabel === null) return null;
  return { day, classLabel, week };
}
