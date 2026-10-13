import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db, deleteProfile, getProfile } from '../db/db.js';
import { createSampleProfile } from '../db/sampleProfile.js';
import { buildExport, exportFileName, importBackup, readBackupFile } from './exportImport.js';

beforeEach(async () => {
  await Promise.all(db.tables.map((table) => table.clear()));
});

/** A sample profile with one row in every table, a real key and a Word template. */
async function makeFullProfile() {
  const profileId = await createSampleProfile();
  await db.profiles.update(profileId, { keys: { gemini: 'AIza-secret', groq: '', openrouter: '' } });
  const bookId = await db.sources.add({ profileId, type: 'textbook', name: 'Book.pdf', addedAt: 1 });
  const templateId = await db.sources.add({
    profileId,
    type: 'template',
    name: 'Template.docx',
    addedAt: 2,
    file: new Blob(['word bytes'], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
  });
  await db.pages.bulkAdd([
    { profileId, sourceId: bookId, pageNo: 1, text: 'ASCII and Unicode' },
    { profileId, sourceId: bookId, pageNo: 2, text: 'File sizes' },
  ]);
  await db.plans.add({ profileId, classLabel: 'O1', weekNo: 9, dayId: '5', createdAt: 3, data: { topic: 'x' } });
  await db.progress.put({ profileId, classLabel: 'O1', lastTopic: '1.3.2', updatedAt: 3 });
  return { profileId, templateId };
}

/** Same as the teacher saving the file and opening it again. */
const roundTrip = (data) => JSON.parse(JSON.stringify(data));

describe('export → delete → import', () => {
  it('restores everything', async () => {
    const { profileId } = await makeFullProfile();
    const before = await getProfile(profileId);

    const file = roundTrip(await buildExport(profileId, { includeKeys: true }));
    await deleteProfile(profileId);
    const newId = await importBackup(file);

    const { id, ...restored } = await getProfile(newId);
    const { id: oldId, ...original } = before;
    expect(restored).toEqual(original);

    const count = (table) => table.where('profileId').equals(newId).count();
    expect(await count(db.sources)).toBe(2);
    expect(await count(db.pages)).toBe(2);
    expect(await count(db.plans)).toBe(1);
    expect(await count(db.progress)).toBe(1);

    // Pages must point at the new textbook source, not the deleted one.
    const book = await db.sources.where({ profileId: newId, type: 'textbook' }).first();
    const pages = await db.pages.where('profileId').equals(newId).toArray();
    expect(pages.every((page) => page.sourceId === book.id)).toBe(true);

    const template = await db.sources.where({ profileId: newId, type: 'template' }).first();
    expect(template.file).toBeInstanceOf(Blob);
    expect(await template.file.text()).toBe('word bytes');
  });
});

describe('buildExport', () => {
  it('leaves API keys out by default', async () => {
    const { profileId } = await makeFullProfile();
    const data = await buildExport(profileId);
    expect(data.includesKeys).toBe(false);
    expect(data.profile.keys).toEqual({ gemini: '', groq: '', openrouter: '' });
    expect(JSON.stringify(data)).not.toContain('AIza-secret');
  });

  it('includes keys only when asked', async () => {
    const { profileId } = await makeFullProfile();
    const data = await buildExport(profileId, { includeKeys: true });
    expect(data.profile.keys.gemini).toBe('AIza-secret');
  });
});

describe('importBackup', () => {
  it('adds "(imported)" when the name is taken and leaves the original alone', async () => {
    const { profileId } = await makeFullProfile();
    const data = roundTrip(await buildExport(profileId));
    const newId = await importBackup(data);
    expect((await getProfile(newId)).name).toBe('Ghulam Abbas — Computer Science (imported)');
    expect(await db.pages.where('profileId').equals(profileId).count()).toBe(2);
  });
});

describe('readBackupFile', () => {
  const file = (text) => ({ text: async () => text });

  it('accepts a backup', async () => {
    const data = await readBackupFile(file(JSON.stringify({ app: 'lessonPlanner', format: 1, profile: {} })));
    expect(data.app).toBe('lessonPlanner');
  });

  it('rejects files that are not backups, with a friendly message', async () => {
    await expect(readBackupFile(file('not json'))).rejects.toThrow(/could not be read/);
    await expect(readBackupFile(file('{"hello":1}'))).rejects.toThrow(/not a Lesson Planner backup/);
    await expect(
      readBackupFile(file(JSON.stringify({ app: 'lessonPlanner', format: 99, profile: {} })))
    ).rejects.toThrow(/different version/);
  });
});

describe('exportFileName', () => {
  it('makes a safe, dated name', () => {
    expect(exportFileName('Ghulam Abbas — Computer Science', new Date('2026-10-13T09:00:00Z'))).toBe(
      'lesson-planner-ghulam-abbas-computer-science-2026-10-13.json'
    );
  });
});
