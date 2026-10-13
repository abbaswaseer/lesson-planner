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

export default db;
