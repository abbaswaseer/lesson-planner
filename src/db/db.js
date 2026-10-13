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

export default db;
