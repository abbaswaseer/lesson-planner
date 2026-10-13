/**
 * Turn a comma-separated box like "3, 4," into a clean list of ID strings: ["3", "4"].
 * Blanks and repeats are dropped; order is kept.
 * @param {string} text
 * @returns {string[]}
 */
export function parseIdList(text) {
  const ids = String(text ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  return [...new Set(ids)];
}

/**
 * Show a list of IDs in a text box: ["3", "4"] → "3, 4".
 * @param {string[] | undefined} ids
 * @returns {string}
 */
export function formatIdList(ids) {
  return (ids ?? []).join(', ');
}
