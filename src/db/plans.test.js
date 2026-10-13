import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { EXAMPLE_PLAN } from '../lib/fixtures/examplePlan.js';
import { createProfile, db, getLastTopics } from './db.js';
import { deletePlan, listPlans, savePlan } from './plans.js';

const lesson = { classLabel: 'O1', weekNo: 9, dayId: '5', date: '16/10/2026' };
const result = { lesson, plan: EXAMPLE_PLAN, errors: [], provider: 'Gemini', model: 'g', topic: 'file sizes' };

beforeEach(async () => {
  await Promise.all(db.tables.map((table) => table.clear()));
});

describe('plans', () => {
  it('saves a plan and updates the class progress', async () => {
    const profileId = await createProfile({ name: 'P' });
    const id = await savePlan(profileId, result, { request: 'Friday, week 9', outputType: 'beamsJson' });
    expect(await db.plans.get(id)).toMatchObject({
      profileId, classLabel: 'O1', weekNo: 9, dayId: '5', date: '16/10/2026',
      request: 'Friday, week 9', outputType: 'beamsJson', data: EXAMPLE_PLAN, provider: 'Gemini',
    });
    expect(await getLastTopics(profileId)).toEqual({ O1: EXAMPLE_PLAN.topic });
  });

  it('replaces a plan after Regenerate, lists newest first and deletes', async () => {
    const profileId = await createProfile({ name: 'P' });
    const first = await savePlan(profileId, result, { request: 'r', outputType: 'beamsJson' });
    await new Promise((resolve) => setTimeout(resolve, 5));
    const second = await savePlan(profileId, result, { request: 'r', outputType: 'beamsJson' });
    const changed = { ...result, plan: { ...EXAMPLE_PLAN, topic: 'New topic' } };
    expect(await savePlan(profileId, changed, { request: 'r', outputType: 'beamsJson', planId: first })).toBe(first);
    expect(await db.plans.count()).toBe(2);
    expect((await listPlans(profileId)).map((p) => p.id)).toEqual([first, second]);
    expect(await getLastTopics(profileId)).toEqual({ O1: 'New topic' });
    await deletePlan(second);
    expect(await db.plans.count()).toBe(1);
  });
});
