import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  db,
  createProfile,
  getProfile,
  updateProfile,
  deleteProfile,
  listProfiles,
  addSource,
  deleteSource,
  listSources,
} from './db.js';

beforeEach(async () => {
  await Promise.all(db.tables.map((table) => table.clear()));
});

describe('profile helpers', () => {
  it('creates a profile and gets it back', async () => {
    const id = await createProfile({ name: 'Ghulam Abbas — Computer Science', periodMinutes: 40 });
    const profile = await getProfile(id);
    expect(profile).toMatchObject({ id, name: 'Ghulam Abbas — Computer Science', periodMinutes: 40 });
  });

  it('gives an unnamed profile a default name', async () => {
    const id = await createProfile({ name: '   ' });
    expect((await getProfile(id)).name).toBe('New profile');
  });

  it('returns undefined for a missing profile', async () => {
    expect(await getProfile(999)).toBeUndefined();
  });

  it('updates only the given fields', async () => {
    const id = await createProfile({ name: 'A', teacherName: 'Old', periodMinutes: 40 });
    expect(await updateProfile(id, { teacherName: 'New' })).toBe(true);
    expect(await getProfile(id)).toMatchObject({ name: 'A', teacherName: 'New', periodMinutes: 40 });
  });

  it('reports false when updating a missing profile', async () => {
    expect(await updateProfile(999, { name: 'X' })).toBe(false);
  });

  it('lists profiles sorted by name', async () => {
    await createProfile({ name: 'Zara — Maths' });
    await createProfile({ name: 'Ali — English' });
    const names = (await listProfiles()).map((profile) => profile.name);
    expect(names).toEqual(['Ali — English', 'Zara — Maths']);
  });

  it('deletes a profile with its sources, pages, plans and progress only', async () => {
    const keep = await createProfile({ name: 'Keep' });
    const remove = await createProfile({ name: 'Remove' });

    for (const profileId of [keep, remove]) {
      const sourceId = await db.sources.add({ profileId, type: 'textbook', name: 'Book.pdf', addedAt: 1 });
      await db.pages.add({ profileId, sourceId, pageNo: 1, text: 'page one' });
      await db.plans.add({ profileId, classLabel: 'O1', weekNo: 9, dayId: '5', createdAt: 1 });
      await db.progress.put({ profileId, classLabel: 'O1', lastTopic: '1.3.2', updatedAt: 1 });
    }

    await deleteProfile(remove);

    expect(await getProfile(remove)).toBeUndefined();
    for (const table of [db.sources, db.pages, db.plans, db.progress]) {
      expect(await table.where('profileId').equals(remove).count()).toBe(0);
      expect(await table.where('profileId').equals(keep).count()).toBe(1);
    }
    expect(await getProfile(keep)).toBeDefined();
  });
});

describe('source helpers', () => {
  it('saves a source with its pages, lists newest first, and deletes both', async () => {
    const profileId = await createProfile({ name: 'P' });
    const bookId = await addSource(profileId, { type: 'textbook', name: 'Book.pdf' }, [
      { pageNo: 1, text: 'one' },
      { pageNo: 2, text: 'two' },
    ]);
    await new Promise((resolve) => setTimeout(resolve, 5)); // distinct addedAt
    const sowId = await addSource(profileId, { type: 'sow', name: 'SOW.pdf' }, [{ pageNo: 1, text: 'sow' }]);

    expect((await listSources(profileId)).map((s) => s.id)).toEqual([sowId, bookId]);
    expect(await db.sources.get(bookId)).toMatchObject({ profileId, type: 'textbook', pageCount: 2 });
    const pages = await db.pages.where('sourceId').equals(bookId).sortBy('pageNo');
    expect(pages.map((p) => [p.profileId, p.pageNo, p.text])).toEqual([[profileId, 1, 'one'], [profileId, 2, 'two']]);

    await deleteSource(bookId);
    expect(await db.sources.get(bookId)).toBeUndefined();
    expect(await db.pages.where('sourceId').equals(bookId).count()).toBe(0);
    expect(await db.pages.where('sourceId').equals(sowId).count()).toBe(1);
  });
});
