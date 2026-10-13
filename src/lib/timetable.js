// Timetable helpers. Request → list of lessons is added in T-26 to T-29.

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
