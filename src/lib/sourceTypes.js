// Which files can be uploaded as sources, and which source types each file may be.

/** Source types from CLAUDE.md Section 5, with names a teacher understands. */
export const SOURCE_TYPES = [
  { value: 'textbook', label: 'Textbook' },
  { value: 'sow', label: 'Scheme of work' },
  { value: 'calendar', label: 'Academic calendar' },
  { value: 'timetable', label: 'Timetable' },
  { value: 'template', label: 'Lesson plan template (Word)' },
  { value: 'other', label: 'Other' },
];

/** For the file picker's accept attribute. */
export const ACCEPTED_FILES = '.pdf,.jpg,.jpeg,.png,.docx';

/**
 * What kind of file this is, by extension (browsers do not always fill in `type`).
 * @param {{ name: string }} file
 * @returns {'pdf' | 'image' | 'docx' | null} null if the file cannot be used.
 */
export function fileKind(file) {
  const extension = /\.([a-z0-9]+)$/i.exec(String(file?.name ?? ''))?.[1].toLowerCase();
  if (extension === 'pdf') return 'pdf';
  if (['jpg', 'jpeg', 'png'].includes(extension)) return 'image';
  if (extension === 'docx') return 'docx';
  return null;
}

/**
 * Source types allowed for a kind of file. A Word file can only be the template;
 * the template must be a Word file, so it cannot be a PDF or an image.
 * @param {'pdf' | 'image' | 'docx'} kind
 * @returns {Array<{ value: string, label: string }>}
 */
export function typesForKind(kind) {
  if (kind === 'docx') return SOURCE_TYPES.filter((type) => type.value === 'template');
  return SOURCE_TYPES.filter((type) => type.value !== 'template');
}

/**
 * A sensible starting type from the file name, so most teachers just press Save.
 * @param {string} fileName
 * @param {'pdf' | 'image' | 'docx'} kind
 * @returns {string} A source type value.
 */
export function guessType(fileName, kind) {
  if (kind === 'docx') return 'template';
  const name = String(fileName).toLowerCase();
  if (/scheme|\bsow\b|sow[\s_-]/.test(name)) return 'sow';
  if (/calend[ae]r/.test(name)) return 'calendar';
  if (/time ?table/.test(name)) return 'timetable';
  return kind === 'image' ? 'timetable' : 'textbook';
}

/**
 * The label for a source type value.
 * @param {string} value
 * @returns {string}
 */
export function sourceTypeLabel(value) {
  return SOURCE_TYPES.find((type) => type.value === value)?.label ?? value;
}
