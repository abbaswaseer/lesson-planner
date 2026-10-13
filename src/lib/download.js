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
