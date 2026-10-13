/**
 * Read a minutes box. Only whole numbers from 1 to 180 count; anything else is null.
 * @param {string | number} text
 * @returns {number | null}
 */
export function parseMinutes(text) {
  const value = String(text ?? '').trim();
  if (!/^\d+$/.test(value)) return null;
  const minutes = Number(value);
  return minutes >= 1 && minutes <= 180 ? minutes : null;
}

/**
 * Per-day boxes → the profile's dayOverrides: { "5": { periodMinutes: 30 } }.
 * Blank or invalid boxes mean "use the default", so they are left out.
 * @param {Record<string, string>} inputsByDay e.g. { 1: '', 5: '30' }
 * @returns {Record<string, { periodMinutes: number }>}
 */
export function overridesFromInputs(inputsByDay) {
  const overrides = {};
  for (const [day, text] of Object.entries(inputsByDay)) {
    const minutes = parseMinutes(text);
    if (minutes !== null) overrides[day] = { periodMinutes: minutes };
  }
  return overrides;
}

/**
 * The profile's dayOverrides → per-day box text for days 1–5 ('' when no override).
 * @param {Record<string, { periodMinutes: number }> | undefined} overrides
 * @returns {Record<string, string>}
 */
export function inputsFromOverrides(overrides) {
  const inputs = {};
  for (const day of ['1', '2', '3', '4', '5']) {
    const minutes = overrides?.[day]?.periodMinutes;
    inputs[day] = minutes ? String(minutes) : '';
  }
  return inputs;
}
