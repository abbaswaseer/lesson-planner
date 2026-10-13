// Week number ↔ dates. More helpers (getWeek, dateForDay, …) are added in T-25.

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
