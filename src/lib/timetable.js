// Timetable helpers: grid ↔ saved timetable, lesson durations. Request → lessons comes in T-27 to T-29.

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
