import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db, getProfile } from './db.js';
import { SAMPLE_PROFILE, createSampleProfile } from './sampleProfile.js';

beforeEach(async () => {
  await Promise.all(db.tables.map((table) => table.clear()));
});

describe('createSampleProfile', () => {
  it('saves the sample profile exactly', async () => {
    const id = await createSampleProfile();
    const { id: savedId, ...saved } = await getProfile(id);
    expect(savedId).toBe(id);
    expect(saved).toEqual(SAMPLE_PROFILE);
  });

  it('keeps IDs as strings and the Friday override at 30 minutes', async () => {
    const profile = await getProfile(await createSampleProfile());
    expect(profile.subject_id).toBe('97');
    expect(profile.classes[2].class_id).toBe('18');
    expect(profile.dayOverrides[5].periodMinutes).toBe(30);
  });

  it('creates a separate profile each time', async () => {
    const first = await createSampleProfile();
    const second = await createSampleProfile();
    expect(second).not.toBe(first);
    expect(await db.profiles.count()).toBe(2);
  });
});
