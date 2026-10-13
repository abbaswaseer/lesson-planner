// Text for the live lesson preview on Generate.
import { getWeek } from './weeks.js';

/**
 * Group lessons by day: [{ day: "Thursday 15/10/2026", classes: "O2 (80 min), O3 (80 min)" }].
 * @param {Array<{ dayName: string, date: string, classLabel: string, duration: number | null }>} lessons From buildLessons.
 * @returns {Array<{ day: string, classes: string }>}
 */
export function describeLessons(lessons) {
  const days = [];
  for (const lesson of lessons) {
    const day = `${lesson.dayName} ${lesson.date}`;
    const text = `${lesson.classLabel} (${lesson.duration ?? '?'} min)`;
    const last = days.at(-1);
    if (last?.day === day) last.classes += `, ${text}`;
    else days.push({ day, classes: text });
  }
  return days;
}

/**
 * Why a request gives no lessons, in plain English.
 * @param {object} profile
 * @param {{ day: number | null, classLabel: string | null, week: number } | null} parsed
 * @returns {string}
 */
export function noLessonsMessage(profile, parsed) {
  if (!parsed) {
    return 'Not understood yet. Try "Thursday, week 9" or "O3, week 9" — or press Generate and the AI will try to read it.';
  }
  if (!getWeek(profile, parsed.week)) {
    return `Week ${parsed.week} is not in your week table. Add it on the Setup page.`;
  }
  const dayNames = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday' };
  const who = parsed.classLabel ? `${parsed.classLabel} has no lessons` : 'You have no lessons';
  const when = parsed.day ? ` on ${dayNames[parsed.day]}` : '';
  return `${who}${when} in your timetable.`;
}
