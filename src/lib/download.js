// File download helpers.
import { saveAs } from 'file-saver';

/**
 * Save data as a pretty-printed .json file on the teacher's computer.
 * @param {string} fileName e.g. "plan.json"
 * @param {unknown} data Anything JSON.stringify can handle.
 */
export function downloadJson(fileName, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  saveAs(blob, fileName);
}

/**
 * Save text that is already formatted (e.g. pretty JSON) as a file.
 * @param {string} fileName
 * @param {string} text
 * @param {string} [type] Media type; JSON by default.
 */
export function downloadText(fileName, text, type = 'application/json') {
  saveAs(new Blob([text], { type }), fileName);
}

/**
 * Save a Blob (e.g. a Word file) on the teacher's computer.
 * @param {string} fileName
 * @param {Blob} blob
 */
export function downloadBlob(fileName, blob) {
  saveAs(blob, fileName);
}
