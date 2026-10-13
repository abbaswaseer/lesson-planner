// Week number ↔ dates. All dates are dd/mm/yyyy strings, as BEAMS uses.

const DATE_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Read a dd/mm/yyyy date. Uses UTC so adding days is never thrown off by clock changes.
 * @param {string} text e.g. "12/10/2026"
 * @returns {Date | null} null if the text is not a real date in that format.
 */
export function parseDate(text) {
  const match = DATE_PATTERN.exec(String(text ?? '').trim());
  if (!match) return null;
  const [, dd, mm, yyyy] = match.map(Number);
  const date = new Date(Date.UTC(yyyy, mm - 1, dd));
  // Rejects dates like 31/02/2026, which Date would quietly roll into March.
  const real = date.getUTCDate() === dd && date.getUTCMonth() === mm - 1 && date.getUTCFullYear() === yyyy;
  return real ? date : null;
}

/**
 * Write a date as dd/mm/yyyy.
 * @param {Date} date A date from parseDate (UTC).
 * @returns {string}
 */
export function formatDate(date) {
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${date.getUTCFullYear()}`;
}

/**
 * Move a dd/mm/yyyy date by a number of days.
 * @param {string} text
 * @param {number} days
 * @returns {string | null} null if the starting date is not valid.
 */
export function addDays(text, days) {
  const date = parseDate(text);
  return date ? formatDate(new Date(date.getTime() + days * DAY_MS)) : null;
}

/**
 * The week after this one: next number, dates moved on by 7 days.
 * @param {{ number: number, from: string, till: string }} week
 * @returns {{ number: number, from: string, till: string } | null} null if the week has a bad number or date.
 */
export function nextWeek(week) {
  const from = addDays(week?.from, 7);
  const till = addDays(week?.till, 7);
  if (!Number.isInteger(week?.number) || !from || !till) return null;
  return { number: week.number + 1, from, till };
}

const DAY_NAMES = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday' };

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Find a week in the profile's week table.
 * @param {object} profile
 * @param {number | string} number Week number, e.g. 9 or "9".
 * @returns {{ number: number, from: string, till: string } | null}
 *   null if the week is missing or its dates are not valid dd/mm/yyyy.
 */
export function getWeek(profile, number) {
  const wanted = Number(number);
  const week = (profile?.weeks ?? []).find((w) => w.number === wanted);
  if (!week || !parseDate(week.from) || !parseDate(week.till)) return null;
  return week;
}

/**
 * The date of a weekday in a week, counting from the week's "from" date (Monday).
 * @param {{ from: string }} week
 * @param {number | string} dayId 1 = Monday … 5 = Friday.
 * @returns {string | null} dd/mm/yyyy, or null if the day or week is not valid.
 */
export function dateForDay(week, dayId) {
  const day = Number(dayId);
  if (!DAY_NAMES[day]) return null;
  return addDays(week?.from, day - 1);
}

/**
 * @param {number | string} dayId 1 = Monday … 5 = Friday.
 * @returns {string} e.g. "Thursday", or '' if not a school day.
 */
export function dayName(dayId) {
  return DAY_NAMES[Number(dayId)] ?? '';
}

/**
 * 1 → "1st", 2 → "2nd", 11 → "11th", 22 → "22nd".
 * @param {number} n
 * @returns {string}
 */
export function ordinal(n) {
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return `${n}th`;
  const suffix = { 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] ?? 'th';
  return `${n}${suffix}`;
}

/**
 * Write a date the way the weekly message uses it.
 * @param {string} text dd/mm/yyyy, e.g. "12/10/2026"
 * @param {{ year?: boolean }} [options] year: false gives "12th October".
 * @returns {string | null} e.g. "12th October 2026", or null if the date is not valid.
 */
export function formatLongDate(text, { year = true } = {}) {
  const date = parseDate(text);
  if (!date) return null;
  const words = `${ordinal(date.getUTCDate())} ${MONTH_NAMES[date.getUTCMonth()]}`;
  return year ? `${words} ${date.getUTCFullYear()}` : words;
}
