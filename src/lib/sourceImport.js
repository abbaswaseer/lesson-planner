// Turn an uploaded file into a saved source (and its pages), whatever kind of file it is.
import { addSource } from '../db/db.js';
import { friendlyError, readPdfPages } from './pdf.js';

/**
 * Read and save one uploaded file as a source of the active profile.
 * @param {object} profile The active profile.
 * @param {{ file: File, kind: 'pdf' | 'image' | 'docx', type: string }} item From the pending list.
 * @param {(message: string, fraction: number) => void} [onProgress] e.g. ("Reading page 120 of 380", 0.32).
 * @returns {Promise<{ sourceId: number, pageCount: number }>}
 * @throws {Error} A friendlyError (message safe to show).
 */
export async function importSource(profile, item, onProgress) {
  const source = { type: item.type, name: item.file.name };
  if (item.kind === 'pdf') {
    onProgress?.('Opening PDF…', 0);
    const pages = await readPdfPages(item.file, (done, total) =>
      onProgress?.(`Reading page ${done} of ${total}`, done / total)
    );
    onProgress?.('Saving…', 1);
    const sourceId = await save(profile.id, source, pages);
    return { sourceId, pageCount: pages.length };
  }
  throw friendlyError('This kind of file cannot be saved yet.');
}

async function save(profileId, source, pages) {
  try {
    return await addSource(profileId, source, pages);
  } catch (error) {
    if (error?.name === 'QuotaExceededError' || error?.inner?.name === 'QuotaExceededError') {
      throw friendlyError('Your browser has run out of storage space. Delete sources you no longer need and try again.');
    }
    throw friendlyError('Could not save this file in your browser. Please try again.');
  }
}
