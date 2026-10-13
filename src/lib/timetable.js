// Timetable helpers: grid ↔ saved timetable, lesson durations, request → list of lessons.

import { findClass } from './classMatch.js';
import { dateForDay, dayName, getWeek } from './weeks.js';

/**
 * Saved timetable → grid lookup: grid[day][period] = class label.
 * @param {Array<{ day: number, classLabel: string, periods: number[] }> | undefined} timetable
 * @returns {Record<number, Record<number, string>>}
 */
export function gridFromTimetable(timetable) {
  const grid = {};
  for (const entry of timetable ?? []) {
    grid[entry.day] ??= {};
    for (const period of entry.periods) grid[entry.day][period] = entry.classLabel;
  }
  return grid;
}

/**
 * Grid → saved timetable. Back-to-back periods of the same class on the same day
 * become one lesson (e.g. periods [1, 2]); a gap starts a new lesson.
 * Ordered by day, then first period.
 * @param {Record<number, Record<number, string>>} grid
 * @returns {Array<{ day: number, classLabel: string, periods: number[] }>}
 */
export function timetableFromGrid(grid) {
  const timetable = [];
  const days = Object.keys(grid).map(Number).sort((a, b) => a - b);
  for (const day of days) {
    const periods = Object.keys(grid[day])
      .map(Number)
      .filter((period) => grid[day][period])
      .sort((a, b) => a - b);
    let current = null;
    for (const period of periods) {
      const classLabel = grid[day][period];
      const continues =
        current && current.classLabel === classLabel && period === current.periods.at(-1) + 1;
      if (continues) {
        current.periods.push(period);
      } else {
        current = { day, classLabel, periods: [period] };
        timetable.push(current);
      }
    }
  }
  return timetable;
}

/**
 * Period length on a given day: that day's override if set, else the usual length.
 * @param {object} profile
 * @param {number | string} day 1 = Monday … 5 = Friday.
 * @returns {number | null} Minutes, or null if no valid length is set.
 */
export function periodMinutesForDay(profile, day) {
  const minutes = profile?.dayOverrides?.[day]?.periodMinutes ?? profile?.periodMinutes;
  return Number.isInteger(minutes) && minutes > 0 ? minutes : null;
}

/**
 * Lesson duration in minutes = number of periods × period length for that day
 * (CLAUDE.md Section 5). Worked out in code, never by the AI.
 * @param {object} profile
 * @param {{ day: number, periods: number[] }} entry One timetable entry.
 * @returns {number | null} null if the period length is not set.
 */
export function lessonDuration(profile, entry) {
  const minutes = periodMinutesForDay(profile, entry.day);
  return minutes === null ? null : entry.periods.length * minutes;
}

/**
 * Every lesson a parsed request asks for, worked out from the timetable and week table
 * (CLAUDE.md Section 7, step 2). Ordered by day, then first period.
 * @param {object} profile
 * @param {{ day: number | null, classLabel: string | null, week: number }} parsed From parseRequest.
 * @returns {Array<{ classLabel: string, class: object, dayId: string, dayName: string, date: string,
 *   weekNo: number, from: string, till: string, duration: number | null, periods: number[] }>}
 *   Empty if the week is not in the week table or no lesson matches.
 */
export function buildLessons(profile, parsed) {
  const week = getWeek(profile, parsed?.week);
  if (!week) return [];
  // parseRequest usually gives the label already; this also accepts "11C" or "XI".
  const wantedLabel = parsed.classLabel ? findClass(profile, parsed.classLabel)?.label : null;
  if (parsed.classLabel && !wantedLabel) return [];

  return (profile.timetable ?? [])
    .filter((entry) => parsed.day == null || entry.day === Number(parsed.day))
    .filter((entry) => !wantedLabel || entry.classLabel === wantedLabel)
    .map((entry) => ({ entry, cls: profile.classes?.find((c) => c.label === entry.classLabel) }))
    // A timetable slot for a class that was since removed cannot be planned (no class_id).
    .filter(({ cls }) => cls)
    .sort((a, b) => a.entry.day - b.entry.day || a.entry.periods[0] - b.entry.periods[0])
    .map(({ entry, cls }) => ({
      classLabel: entry.classLabel,
      class: cls,
      dayId: String(entry.day),
      dayName: dayName(entry.day),
      date: dateForDay(week, entry.day),
      weekNo: week.number,
      from: week.from,
      till: week.till,
      duration: lessonDuration(profile, entry),
      periods: [...entry.periods],
    }));
}
