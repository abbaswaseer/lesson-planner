import Dexie from 'dexie';

/**
 * The app's database, stored in the teacher's own browser (IndexedDB).
 * Schema: CLAUDE.md Section 5. Only indexed fields are listed here; every
 * other field on a row is stored as well, just not searchable by index.
 */
export const db = new Dexie('lessonPlanner');

db.version(1).stores({
  profiles: '++id, name',
  sources: '++id, profileId, type, name, addedAt',
  pages: '++id, profileId, sourceId, pageNo',
  plans: '++id, profileId, classLabel, weekNo, dayId, createdAt',
  // One row per class per profile, so the key is the pair.
  progress: '[profileId+classLabel], profileId',
});


// ---------------------------------------------------------------------------
// Profile helpers
// ---------------------------------------------------------------------------

/**
 * Add a new profile.
 * @param {object} profile Profile fields (see CLAUDE.md Section 5). `name` defaults to "New profile".
 * @returns {Promise<number>} The new profile's id.
 */
export function createProfile(profile = {}) {
  const name = (profile.name ?? '').trim() || 'New profile';
  return db.profiles.add({ ...profile, name });
}

/**
 * Get one profile by id.
 * @param {number} id
 * @returns {Promise<object | undefined>} The profile, or undefined if it does not exist.
 */
export function getProfile(id) {
  return db.profiles.get(id);
}

/**
 * Change some fields of a profile; fields not listed are kept.
 * @param {number} id
 * @param {object} changes e.g. `{ teacherName: 'Ghulam Abbas' }`
 * @returns {Promise<boolean>} true if the profile existed and was updated.
 */
export async function updateProfile(id, changes) {
  const updated = await db.profiles.update(id, changes);
  return updated === 1;
}

/**
 * Delete a profile and everything that belongs to it
 * (sources, pages, plans, progress). All or nothing.
 * @param {number} id
 * @returns {Promise<void>}
 */
export function deleteProfile(id) {
  return db.transaction('rw', [db.profiles, db.sources, db.pages, db.plans, db.progress], async () => {
    await db.sources.where('profileId').equals(id).delete();
    await db.pages.where('profileId').equals(id).delete();
    await db.plans.where('profileId').equals(id).delete();
    await db.progress.where('profileId').equals(id).delete();
    await db.profiles.delete(id);
  });
}

/**
 * All profiles, sorted by name.
 * @returns {Promise<object[]>}
 */
export function listProfiles() {
  return db.profiles.orderBy('name').toArray();
}

// ---------------------------------------------------------------------------
// Source helpers
// ---------------------------------------------------------------------------

/**
 * Save a source and its pages together: all or nothing, so a failed upload
 * never leaves a source without its text.
 * @param {number} profileId
 * @param {{ type: string, name: string, file?: Blob }} source `file` is kept only for the Word template.
 * @param {Array<{ pageNo: number, text: string }>} pages
 * @returns {Promise<number>} The new source's id.
 */
export function addSource(profileId, source, pages = []) {
  return db.transaction('rw', [db.sources, db.pages], async () => {
    const sourceId = await db.sources.add({ ...source, profileId, pageCount: pages.length, addedAt: Date.now() });
    await db.pages.bulkAdd(pages.map((page) => ({ profileId, sourceId, pageNo: page.pageNo, text: page.text })));
    return sourceId;
  });
}

/**
 * Delete a source and all of its pages.
 * @param {number} sourceId
 * @returns {Promise<void>}
 */
export function deleteSource(sourceId) {
  return db.transaction('rw', [db.sources, db.pages], async () => {
    await db.pages.where('sourceId').equals(sourceId).delete();
    await db.sources.delete(sourceId);
  });
}

/**
 * A profile's sources, newest first.
 * @param {number} profileId
 * @returns {Promise<object[]>}
 */
export async function listSources(profileId) {
  const sources = await db.sources.where('profileId').equals(profileId).sortBy('addedAt');
  return sources.reverse();
}

// ---------------------------------------------------------------------------
// Progress helpers: the last topic covered per class
// ---------------------------------------------------------------------------

/**
 * Last covered topic for each class of a profile.
 * @param {number} profileId
 * @returns {Promise<Record<string, string>>} classLabel → lastTopic
 */
export async function getLastTopics(profileId) {
  const rows = await db.progress.where('profileId').equals(profileId).toArray();
  return Object.fromEntries(rows.map((row) => [row.classLabel, row.lastTopic ?? '']));
}

/**
 * Save the last covered topic of one class.
 * @param {number} profileId
 * @param {string} classLabel
 * @param {string} lastTopic
 * @returns {Promise<void>}
 */
export async function setLastTopic(profileId, classLabel, lastTopic) {
  await db.progress.put({ profileId, classLabel, lastTopic, updatedAt: Date.now() });
}

export default db;
