// Turn an uploaded file into a saved source (and its pages), whatever kind of file it is.
import { addSource } from '../db/db.js';
import { AiError } from '../ai/errors.js';
import { imageTranscriptionPrompt } from '../ai/prompts.js';
import { defaultGeminiModel, listGeminiModels, transcribeImageGemini } from '../ai/providers/gemini.js';
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
  if (item.kind === 'image') {
    onProgress?.('Reading the image with Gemini…', 0.5);
    const text = await transcribeImage(profile, item);
    onProgress?.('Saving…', 1);
    const sourceId = await save(profile.id, source, [{ pageNo: 1, text }]);
    return { sourceId, pageCount: 1 };
  }
  throw friendlyError('This kind of file cannot be saved yet.');
}

/**
 * Images have no text layer, so Gemini reads them once and the text is stored as one page.
 * Only the image goes to Gemini (no student data).
 */
async function transcribeImage(profile, item) {
  const key = profile.keys?.gemini?.trim();
  if (!key) throw friendlyError('Reading an image needs a Gemini key. Add one on the Setup page, then try again.');
  try {
    const model = profile.models?.gemini || defaultGeminiModel(await listGeminiModels(key));
    if (!model) throw friendlyError('No Gemini model is available for this key. Check the key on the Setup page.');
    const text = await transcribeImageGemini({
      key,
      model,
      mimeType: imageMimeType(item.file),
      base64: await fileToBase64(item.file),
      prompt: imageTranscriptionPrompt(item.type),
    });
    return text;
  } catch (error) {
    if (error.friendly) throw error;
    if (error instanceof AiError) throw friendlyError(error.message);
    throw friendlyError('Could not read this image. Please try again.');
  }
}

function imageMimeType(file) {
  if (file.type) return file.type;
  return /\.png$/i.test(file.name) ? 'image/png' : 'image/jpeg';
}

async function fileToBase64(file) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = '';
  // Chunks keep String.fromCharCode under the browser's argument limit.
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
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
