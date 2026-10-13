// Match what a teacher types ("O3", "11C", "XI", "class 11") to one of the profile's classes.

const ROMAN_VALUES = { i: 1, v: 5, x: 10, l: 50 };

/**
 * Lower-case, tidy spaces and drop a leading "class" / "grade", so "Class  XI" → "xi".
 * @param {string} text
 * @returns {string}
 */
function clean(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/[.,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(class|grade)\s*/, '');
}

/** "xi" → 11. Returns null if the text is not a Roman numeral. */
function romanToNumber(text) {
  if (!/^[ivxl]+$/.test(text)) return null;
  let total = 0;
  for (let i = 0; i < text.length; i++) {
    const value = ROMAN_VALUES[text[i]];
    const next = ROMAN_VALUES[text[i + 1]] ?? 0;
    total += value < next ? -value : value;
  }
  return total;
}

/**
 * The grade number in a cleaned class name, ignoring a section letter:
 * "11c" → 11, "11 c" → 11, "xi" → 11, "xi c" → 11. Otherwise null.
 * A Roman numeral needs a space before its section letter, because "xic" is ambiguous.
 * @param {string} text Already cleaned.
 * @returns {number | null}
 */
function gradeOf(text) {
  const digits = text.match(/^(\d{1,2}) ?[a-z]?$/);
  if (digits) return Number(digits[1]);
  const roman = text.match(/^([ivxl]+)(?: [a-z])?$/);
  return roman ? romanToNumber(roman[1]) : null;
}

/**
 * Find the class the teacher means. Tries, in order: the short label ("O3"),
 * the display name ("XI"), then the grade number ("11C", "Class 11" → the class shown as XI).
 * @param {object} profile
 * @param {string} text
 * @returns {object | null} The matching entry from `profile.classes`, or null.
 */
export function findClass(profile, text) {
  const classes = profile?.classes ?? [];
  const wanted = clean(text);
  if (!wanted) return null;

  const byLabel = classes.find((c) => clean(c.label) === wanted);
  if (byLabel) return byLabel;

  const byName = classes.find((c) => c.displayName && clean(c.displayName) === wanted);
  if (byName) return byName;

  const grade = gradeOf(wanted);
  if (grade === null) return null;
  return classes.find((c) => c.displayName && gradeOf(clean(c.displayName)) === grade) ?? null;
}
