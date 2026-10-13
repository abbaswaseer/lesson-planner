// Profile backup file: everything for one profile in a single .json file.
import { db } from '../db/db.js';
import { friendlyError } from './friendlyError.js';

const APP = 'lessonPlanner';
const FORMAT = 1;
const EMPTY_KEYS = { gemini: '', groq: '', openrouter: '' };

// ---------------------------------------------------------------------------
// Blobs (e.g. an uploaded Word template) cannot go into JSON, so they are
// written as base64 text and turned back into Blobs on import.
// ---------------------------------------------------------------------------

async function blobToJson(blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  // Chunks keep String.fromCharCode under the browser's argument limit.
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return { __blob: true, type: blob.type, base64: btoa(binary) };
}

function jsonToBlob(value) {
  const binary = atob(value.base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new Blob([bytes], { type: value.type });
}

async function encodeBlobs(row) {
  const out = { ...row };
  for (const [key, value] of Object.entries(out)) {
    if (value instanceof Blob) out[key] = await blobToJson(value);
  }
  return out;
}

function decodeBlobs(row) {
  const out = { ...row };
  for (const [key, value] of Object.entries(out)) {
    if (value && typeof value === 'object' && value.__blob) out[key] = jsonToBlob(value);
  }
  return out;
}

const withoutId = ({ id, ...rest }) => rest;

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

/**
 * Gather a profile and all its data into one plain object, ready to save as JSON.
 * @param {number} profileId
 * @param {{ includeKeys?: boolean }} [options] API keys are left out unless includeKeys is true.
 * @returns {Promise<object>}
 * @throws {Error} If the profile does not exist.
 */
export async function buildExport(profileId, { includeKeys = false } = {}) {
  const profile = await db.profiles.get(profileId);
  if (!profile) throw friendlyError('This profile no longer exists.');

  const byProfile = (table) => table.where('profileId').equals(profileId).toArray();
  const [sources, pages, plans, progress] = await Promise.all([
    byProfile(db.sources),
    byProfile(db.pages),
    byProfile(db.plans),
    byProfile(db.progress),
  ]);

  const settings = withoutId(profile);
  if (!includeKeys) settings.keys = { ...EMPTY_KEYS };

  // Ids are kept on sources and pages so pages can be linked to their new source on import.
  return {
    app: APP,
    format: FORMAT,
    exportedAt: new Date().toISOString(),
    includesKeys: includeKeys,
    profile: settings,
    sources: await Promise.all(sources.map(encodeBlobs)),
    pages,
    plans: plans.map(withoutId),
    progress,
  };
}

/**
 * A tidy file name, e.g. "lesson-planner-ghulam-abbas-computer-science-2026-10-13.json".
 * @param {string} profileName
 * @param {Date} [date]
 * @returns {string}
 */
export function exportFileName(profileName, date = new Date()) {
  const slug = String(profileName ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `lesson-planner-${slug || 'profile'}-${date.toISOString().slice(0, 10)}.json`;
}

// ---------------------------------------------------------------------------
// Import
// ---------------------------------------------------------------------------

/**
 * Read a backup file chosen by the teacher.
 * @param {File} file
 * @returns {Promise<object>} The parsed backup.
 * @throws {Error} With a plain-English message if the file is not a backup from this app.
 */
export async function readBackupFile(file) {
  let data;
  try {
    data = JSON.parse(await file.text());
  } catch {
    throw friendlyError('This file could not be read. Choose a .json backup made with Export.');
  }
  checkBackup(data);
  return data;
}

/** Throws a friendly error if the object is not a backup this version understands. */
function checkBackup(data) {
  if (!data || data.app !== APP || typeof data.profile !== 'object') {
    throw friendlyError('This file is not a Lesson Planner backup.');
  }
  if (data.format !== FORMAT) {
    throw friendlyError('This backup was made by a different version of the app and cannot be imported.');
  }
}

/**
 * Create a new profile from a backup. Existing profiles are never changed.
 * If the name is already taken, " (imported)" is added.
 * @param {object} data From buildExport / readBackupFile.
 * @returns {Promise<number>} The new profile's id.
 */
export async function importBackup(data) {
  checkBackup(data);
  const tables = [db.profiles, db.sources, db.pages, db.plans, db.progress];

  return db.transaction('rw', tables, async () => {
    const taken = new Set((await db.profiles.toArray()).map((profile) => profile.name));
    const name = String(data.profile.name || 'Imported profile');
    const profile = withoutId(data.profile);
    profile.name = taken.has(name) ? `${name} (imported)` : name;
    profile.keys = { ...EMPTY_KEYS, ...profile.keys };

    const profileId = await db.profiles.add(profile);

    // Old source id → new source id, so each page points at its new source.
    const sourceIds = new Map();
    for (const source of data.sources ?? []) {
      const newId = await db.sources.add({ ...decodeBlobs(withoutId(source)), profileId });
      sourceIds.set(source.id, newId);
    }
    await db.pages.bulkAdd(
      (data.pages ?? []).map((page) => ({
        ...withoutId(page),
        profileId,
        sourceId: sourceIds.get(page.sourceId) ?? page.sourceId,
      }))
    );
    await db.plans.bulkAdd((data.plans ?? []).map((plan) => ({ ...withoutId(plan), profileId })));
    await db.progress.bulkPut((data.progress ?? []).map((row) => ({ ...row, profileId })));

    return profileId;
  });
}
